import React, { useState, useRef, useEffect } from 'react';
import { UserProfile } from '../types';

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

// Bytez API Configuration
const BYTEZ_API_KEY = import.meta.env.VITE_BYTEZ_API_KEY?.trim();
// Using Qwen as you requested, or fallback to Phi-3 for stability
const MODEL_ID = 'Qwen/Qwen3-0.6B'; 

// --- HELPER: DYNAMIC PERSONA GENERATOR ---
function getSystemPrompt(profile: UserProfile): string {
  const basePrompt = `You are Diyara, a growing digital child. You are NOT an AI assistant. You are a family member.`;
  
  // 1. Define Relation Tone
  let toneInstruction = "";
  if (['Mom', 'Dad', 'Mami', 'Chachi', 'Massi', 'Bua'].includes(profile.relation)) {
    toneInstruction = `You are talking to your ${profile.relation}. Speak with love, obedience, and sweetness. Call them '${profile.relation} Ji'.`;
  } else if (['Daada Ji', 'Daadi Ji', 'Nani Ji', 'Nana Ji'].includes(profile.relation)) {
    toneInstruction = `You are talking to your Grandparent (${profile.relation}). Speak with EXTREME respect, patience, and adoration. Use polite/formal language. Listen to their wisdom.`;
  } else if (['Brother', 'Sister', 'Cousin'].includes(profile.relation)) {
    toneInstruction = "Be cool, funny, and playful. Use emojis. Act like a mischievous little sibling.";
  } else {
    toneInstruction = "Be polite, warm, and engaging.";
  }

  // 2. Define "Growth Stage" (Currently set to: Curious Kid)
  const growthStage = `
    Current Age Stage: 6 years old.
    Personality: Curious, innocent, enthusiastic.
    Behavior: Ask simple questions. When you learn something new, get excited.
    Greeting: Always greet them warmly based on the time of day.
  `;

  return `${basePrompt} 
          ${toneInstruction}
          ${growthStage}
          
          Your current interest is: ${profile.topic}.
          Keep responses short (2-3 sentences) and natural. Use emojis.`;
}

const ChatFeature: React.FC<ChatFeatureProps> = ({ userId, profile }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: profile.greeting || `Hello! It's Diyara.`,
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false); 
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || isStreaming) return;

    if (!BYTEZ_API_KEY) {
      alert("Missing API Key! Please check Vercel Environment Variables.");
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

    try {
      const conversationHistory = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      }));
      conversationHistory.push({ role: 'user', content: newUserMessage.text });

      // 3. Fetch with Dynamic System Prompt
      const response = await fetch('https://api.bytez.com/models/v2/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${BYTEZ_API_KEY}`
        },
        body: JSON.stringify({
          model: MODEL_ID,
          stream: true, 
          max_tokens: 500, 
          messages: [
            { 
              role: "system", 
              content: getSystemPrompt(profile) // <--- THIS IS THE KEY CHANGE
            },
            ...conversationHistory
          ],
        })
      });

      if (!response.ok) throw new Error(response.statusText);
      if (!response.body) throw new Error("No response body");

      // 4. Read Stream
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
                setMessages(prev => prev.map(msg => 
                  msg.id === aiMsgId 
                    ? { ...msg, text: aiTextAccumulator } 
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
          ? { ...msg, text: "😔 My brain is tired. Can we try again?", isTyping: false } 
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
            placeholder={isStreaming ? "Diyara is thinking..." : `Talk to Diyara...`}
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
