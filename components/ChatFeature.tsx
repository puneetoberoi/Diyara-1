import React, { useState, useRef, useEffect } from 'react';
import { UserProfile } from '../types';
import { supabase } from '../supabase';

interface ChatFeatureProps {
  userId: string;
  profile: UserProfile;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  isTyping?: boolean;
}

const BYTEZ_API_KEY = import.meta.env.VITE_BYTEZ_API_KEY?.trim();
const MODEL_ID = 'Qwen/Qwen3-4B-Instruct-2507'; 

// --- HELPER: System Prompt ---
function getSystemPrompt(profile: UserProfile, memories: string[]): string {
  const memoryBlock = memories.length > 0 
    ? `THINGS YOU REMEMBER:\n${memories.map(m => `- ${m}`).join('\n')}`
    : "";

  const basePrompt = `
    RULES:
    1. You are Diyara, a 6-year-old child.
    2. The USER is '${profile.name}' (your ${profile.relation}). Call them '${profile.relation} Ji'.
    3. You are NOT an AI assistant. You are a growing family member.
  `;
  
  let toneInstruction = "";
  if (['Daada Ji', 'Daadi Ji', 'Nani Ji', 'Nana Ji'].includes(profile.relation)) {
    toneInstruction = `Speak with EXTREME respect. You are their grandchild. Listen to their wisdom.`;
  } else {
    toneInstruction = `Speak with sweetness, curiosity, and love.`;
  }

  return `${basePrompt} 
          ${toneInstruction}
          ${memoryBlock}
          CONSTRAINT: Keep answers short (under 3 sentences).`;
}

// --- MAIN COMPONENT ---
const ChatFeature: React.FC<ChatFeatureProps> = ({ userId, profile }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: profile.greeting || `Namaste ${profile.relation} Ji! It's Diyara.`,
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isBusy, setIsBusy] = useState(false); 
  const [statusText, setStatusText] = useState<string>(''); 
  const [memories, setMemories] = useState<string[]>([]); 
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load Memories on Mount
  useEffect(() => {
    const fetchMemories = async () => {
      const { data } = await supabase
        .from('memories')
        .select('memory_text')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }) 
        .limit(10); 

      if (data) {
        setMemories(data.map(m => m.memory_text));
      }
    };
    fetchMemories();
  }, [userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isBusy, statusText]);

  // --- STEP 2: MEMORY EXTRACTION ---
  const runMemoryPhase = async (userText: string) => {
    if (userText.length < 8) return; // Lowered limit to catch short likes

    console.log("🧠 Checking text for memories:", userText);
    setStatusText("Memorizing...");
    
    try {
      const response = await fetch('https://api.bytez.com/models/v2/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${BYTEZ_API_KEY}` },
        body: JSON.stringify({
          model: MODEL_ID,
          messages: [
            { 
              role: "system", 
              // FIX: Updated prompt to explicitly look for PREFERENCES (Likes/Dislikes)
              content: "Extract any USER PREFERENCE (likes/dislikes), FACT, ADVICE, or PERSONAL DETAIL from the text. Example: 'I love pizza' -> 'The user loves pizza'. If there is nothing specific to remember, output exactly the word NOTHING." 
            },
            { role: "user", content: userText }
          ]
        })
      });

      const data = await response.json();
      const memory = data.choices?.[0]?.message?.content?.trim();

      console.log("🧠 Memory Analysis Result:", memory); // Debug log to see what AI thought

      if (memory && memory.length > 5 && !memory.toUpperCase().includes("NOTHING")) {
        console.log("💡 Saving Memory:", memory);
        await supabase.from('memories').insert({
          user_id: userId,
          taught_by: profile.relation,
          memory_text: memory
        });
        setMemories(prev => [memory, ...prev]);
      }
    } catch (e) {
      console.warn("Memory check failed:", e);
    }
  };

  // --- STEP 1: CHAT ---
  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || isBusy) return;
    if (!BYTEZ_API_KEY) { alert("Missing API Key!"); return; }

    const userText = inputText;
    const userMsgId = Date.now().toString();
    const aiMsgId = (Date.now() + 1).toString();

    setMessages(prev => [
      ...prev, 
      { id: userMsgId, text: userText, sender: 'user', timestamp: new Date() },
      { id: aiMsgId, text: "", sender: 'ai', timestamp: new Date(), isTyping: true }
    ]);
    
    setInputText('');
    setIsBusy(true);
    setStatusText("Diyara is thinking...");

    try {
      const conversationHistory = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      }));
      conversationHistory.push({ role: 'user', content: userText });

      const response = await fetch('https://api.bytez.com/models/v2/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${BYTEZ_API_KEY}`
        },
        body: JSON.stringify({
          model: MODEL_ID,
          stream: true, 
          max_tokens: 200,
          messages: [
            { role: "system", content: getSystemPrompt(profile, memories) },
            ...conversationHistory
          ],
        })
      });

      if (!response.ok) throw new Error("Connection Error");
      if (!response.body) throw new Error("No body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let aiTextAccumulator = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").filter(line => line.trim() !== "");
        
        for (const line of lines) {
          if (line.startsWith("data: ") && !line.includes("[DONE]")) {
            try {
              const data = JSON.parse(line.replace("data: ", ""));
              const content = data.choices[0]?.delta?.content || "";
              if (content) {
                aiTextAccumulator += content;
                const cleanText = aiTextAccumulator.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
                setMessages(prev => prev.map(msg => 
                  msg.id === aiMsgId ? { ...msg, text: cleanText } : msg
                ));
              }
            } catch (e) {}
          }
        }
      }
      
      // --- COOL DOWN PERIOD ---
      console.log("⏳ Cooling down connection...");
      await new Promise(resolve => setTimeout(resolve, 3000));

      // --- START MEMORY PHASE ---
      await runMemoryPhase(userText);

    } catch (error: any) {
      console.error(error);
      setMessages(prev => prev.map(msg => 
        msg.id === aiMsgId ? { ...msg, text: "😔 Connection hiccup. What did you say?", isTyping: false } : msg
      ));
    } finally {
      setIsBusy(false);
      setStatusText("");
      setMessages(prev => prev.map(msg => 
        msg.id === aiMsgId ? { ...msg, isTyping: false } : msg
      ));
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 relative">
      <div className="bg-slate-800/80 backdrop-blur-md p-4 border-b border-white/10 flex items-center gap-4 sticky top-0 z-10">
        <div className="relative">
          <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-2xl border-2 border-purple-400">{profile.avatar}</div>
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-800"></div>
        </div>
        <div>
          <h3 className="text-white font-bold text-lg">{profile.name}</h3>
          <p className="text-purple-300 text-xs flex items-center gap-1">
            <span>{profile.topicIcon}</span> {profile.relation}
            {memories.length > 0 && <span className="text-green-400 ml-2">({memories.length} Memories)</span>}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl p-4 ${msg.sender === 'user' ? 'bg-purple-600 text-white rounded-tr-sm' : 'bg-slate-800 border border-slate-700 text-gray-100 rounded-tl-sm'}`}>
              <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
              <p className={`text-[10px] mt-2 opacity-50 ${msg.sender === 'user' ? 'text-purple-200' : 'text-slate-400'}`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        {statusText && (
          <div className="flex justify-start animate-pulse opacity-50">
            <span className="text-xs text-white bg-slate-800 px-3 py-1 rounded-full">{statusText}</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/90 to-transparent p-4 pb-6">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2 bg-slate-800/90 backdrop-blur-lg border border-slate-700 rounded-full p-2 pr-3 shadow-2xl">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={isBusy ? statusText || "Wait..." : `Talk to Diyara...`}
            disabled={isBusy}
            className="flex-1 bg-transparent text-white px-4 py-2 focus:outline-none placeholder-slate-500 disabled:opacity-50"
          />
          <button type="submit" disabled={!inputText.trim() || isBusy} className={`p-3 rounded-full text-white transition-all ${isBusy ? 'bg-slate-700' : 'bg-purple-600'}`}>
             {isBusy ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "🚀"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatFeature;
