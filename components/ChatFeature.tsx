import React, { useState, useRef, useEffect } from 'react';
import { UserProfile } from '../types';
import { db } from '../supabase'; // Ensure this import points to your supabase client file
import { supabase } from '../supabase'; // We need the raw client for custom inserts

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
const MODEL_ID = 'meta-llama/Meta-Llama-3-8B-Instruct'; 

// --- MEMORY HELPER FUNCTIONS ---

// 1. Generate the System Prompt with Memories included
function getSystemPrompt(profile: UserProfile, memories: string[]): string {
  // Convert memories array to a text block
  const memoryBlock = memories.length > 0 
    ? `THINGS YOU HAVE LEARNED IN THE PAST:\n${memories.map(m => `- ${m}`).join('\n')}`
    : "You are learning new things every day.";

  const basePrompt = `
    IMPORTANT IDENTITY RULES:
    1. You are Diyara, a 6-year-old digital child.
    2. The USER is '${profile.name}' (your ${profile.relation}). Call them '${profile.relation} Ji'.
    3. You are NOT an AI assistant. You are a family member growing up.
  `;
  
  let toneInstruction = "";
  if (['Daada Ji', 'Daadi Ji', 'Nani Ji', 'Nana Ji'].includes(profile.relation)) {
    toneInstruction = `Speak with EXTREME respect and love. You look up to them for wisdom.`;
  } else {
    toneInstruction = `Speak with sweetness, curiosity, and love.`;
  }

  return `${basePrompt} 
          ${toneInstruction}
          
          ${memoryBlock}

          INSTRUCTION: If the user asks what you know or have learned, refer to the 'THINGS YOU HAVE LEARNED' list above.
          CONSTRAINT: Keep answers short (under 3 sentences).`;
}

// 2. Check if message is a "Lesson" and save it
async function extractAndSaveMemory(text: string, profile: UserProfile, userId: string) {
  if (!BYTEZ_API_KEY) return;

  // We ask a "Shadow AI" if this message contains a fact worth remembering
  try {
    const response = await fetch('https://api.bytez.com/models/v2/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${BYTEZ_API_KEY}` },
      body: JSON.stringify({
        model: MODEL_ID,
        messages: [
          { role: "system", content: "Analyze the user's message. If it contains advice, a fact, a story, or a lesson for a child, output JUST the lesson. If it is just 'hello' or 'how are you', output NOTHING." },
          { role: "user", content: text }
        ]
      })
    });

    const data = await response.json();
    const memory = data.choices?.[0]?.message?.content?.trim();

    // If the AI found a lesson (and it's not empty or "NOTHING")
    if (memory && memory.length > 5 && !memory.includes("NOTHING")) {
      console.log("💡 Learned a new memory:", memory);
      
      // Save to Supabase
      await supabase.from('memories').insert({
        user_id: userId,
        taught_by: profile.relation,
        memory_text: memory
      });
    }
  } catch (e) {
    console.error("Memory extraction failed", e);
  }
}

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
  const [isStreaming, setIsStreaming] = useState(false); 
  const [memories, setMemories] = useState<string[]>([]); // Local state for memories
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load Memories on Mount
  useEffect(() => {
    const fetchMemories = async () => {
      const { data } = await supabase
        .from('memories')
        .select('memory_text')
        .eq('user_id', userId)
        .limit(5); // Get top 5 recent memories to keep context light

      if (data) {
        setMemories(data.map(m => m.memory_text));
      }
    };
    fetchMemories();
  }, [userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || isStreaming) return;

    if (!BYTEZ_API_KEY) {
      alert("Missing API Key!");
      return;
    }

    // 1. Add User Message
    const userMsgId = Date.now().toString();
    const newUserMessage: Message = {
      id: userMsgId,
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
    };

    // 2. Placeholder for AI
    const aiMsgId = (Date.now() + 1).toString();
    const newAiMessage: Message = {
      id: aiMsgId,
      text: "", 
      sender: 'ai',
      timestamp: new Date(),
      isTyping: true
    };

    setMessages((prev) => [...prev, newUserMessage, newAiMessage]);
    setInputText('');
    setIsStreaming(true);

    // 3. Fire-and-forget Memory Extraction (Don't wait for it)
    extractAndSaveMemory(inputText, profile, userId);

    try {
      const conversationHistory = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      }));
      conversationHistory.push({ role: 'user', content: newUserMessage.text });

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
            { 
              role: "system", 
              // FIX: Pass loaded memories into the prompt
              content: getSystemPrompt(profile, memories) 
            },
            ...conversationHistory
          ],
        })
      });

      if (!response.ok) throw new Error(response.statusText);
      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let aiTextAccumulator = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").filter(line => line.trim() !== "");
        
        for (const line of lines) {
          if (line.includes("[DONE]")) return;
          
          if (line.startsWith("data: ")) {
            try {
              const jsonStr = line.replace("data: ", "");
              const data = JSON.parse(jsonStr);
              const content = data.choices[0]?.delta?.content || "";
              
              if (content) {
                aiTextAccumulator += content;
                
                // Clean up Thinking tags
                const cleanText = aiTextAccumulator
                  .replace(/<think>[\s\S]*?<\/think>/g, "") 
                  .replace(/<think>[\s\S]*/g, "") 
                  .trim();

                setMessages(prev => prev.map(msg => 
                  msg.id === aiMsgId 
                    ? { ...msg, text: cleanText } 
                    : msg
                ));
              }
            } catch (e) {
              console.error("Error parsing stream chunk", e);
            }
          }
        }
      }

    } catch (error: any) {
      console.error('[ChatFeature] Error:', error);
      setMessages(prev => prev.map(msg => 
        msg.id === aiMsgId 
          ? { ...msg, text: "😔 My brain is tired...", isTyping: false } 
          : msg
      ));
    } finally {
      setIsStreaming(false);
      setMessages(prev => prev.map(msg => 
        msg.id === aiMsgId ? { ...msg, isTyping: false } : msg
      ));
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 relative">
      {/* Chat Header */}
      <div className="bg-slate-800/80 backdrop-blur-md p-4 border-b border-white/10 flex items-center gap-4 sticky top-0 z-10">
        <div className="relative">
          <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-2xl border-2 border-purple-400">
            {profile.avatar}
          </div>
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

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl p-4 ${
                msg.sender === 'user'
                  ? 'bg-purple-600 text-white rounded-tr-sm'
                  : 'bg-slate-800 border border-slate-700 text-gray-100 rounded-tl-sm'
              }`}
            >
              <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
              {msg.isTyping && (
                 <span className="inline-block w-2 h-4 ml-1 bg-purple-400 animate-pulse">|</span>
              )}
              <p className={`text-[10px] mt-2 opacity-50 ${msg.sender === 'user' ? 'text-purple-200' : 'text-slate-400'}`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/90 to-transparent p-4 pb-6">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2 bg-slate-800/90 backdrop-blur-lg border border-slate-700 rounded-full p-2 pr-3 shadow-2xl">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={isStreaming ? "Diyara is answering..." : `Teach Diyara something...`}
            disabled={isStreaming}
            className="flex-1 bg-transparent text-white px-4 py-2 focus:outline-none placeholder-slate-500 disabled:opacity-50"
          />
          <button type="submit" disabled={!inputText.trim() || isStreaming} className="p-3 bg-purple-600 rounded-full text-white disabled:bg-slate-700 disabled:cursor-not-allowed transition-all">
             {isStreaming ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "🚀"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatFeature;
