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
}

// Bytez API Configuration
// FIX 1: usage of .trim() to remove accidental spaces from Vercel
const BYTEZ_API_KEY = import.meta.env.VITE_BYTEZ_API_KEY?.trim();
const MODEL_ID = 'microsoft/Phi-3-mini-4k-instruct';

const ChatFeature: React.FC<ChatFeatureProps> = ({ userId, profile }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: profile.greeting || `Hello! I am ${profile.name}. Let's chat!`,
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);
  
  // Debug Log
  useEffect(() => {
     console.log("DEBUG CHECK:");
     console.log("1. Key exists?", !!BYTEZ_API_KEY);
     // Don't log the full key, just the start to verify it's not "undefined"
     console.log("2. Key starts with:", BYTEZ_API_KEY?.substring(0, 3) + "..."); 
  }, []);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim()) return;

    if (!BYTEZ_API_KEY) {
      alert("Missing API Key! Please check Vercel Environment Variables.");
      return;
    }

    const userMsgId = Date.now().toString();
    const newUserMessage: Message = {
      id: userMsgId,
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      const conversationHistory = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      }));
      
      conversationHistory.push({ role: 'user', content: newUserMessage.text });

      console.log("Sending request to Bytez..."); // Debug log

      const response = await fetch('https://api.bytez.com/models/v2/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${BYTEZ_API_KEY}`
        },
        body: JSON.stringify({
          model: MODEL_ID,
          messages: [
            { 
              role: "system", 
              content: `You are acting as ${profile.name}, who is the user's ${profile.relation}. 
                        Your personality is: ${profile.topic}. 
                        Keep responses short, warm, and encouraging.` 
            },
            ...conversationHistory
          ],
        })
      });

      const data = await response.json();

      // FIX 2: Log the ACTUAL error from the server
      if (!response.ok) {
        console.error("Server Error Details:", data); // <--- THIS IS KEY
        throw new Error(data.error?.message || `Server error: ${response.status}`);
      }

      const aiText = data.choices?.[0]?.message?.content || "I didn't catch that.";
      
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        text: aiText,
        sender: 'ai',
        timestamp: new Date(),
      }]);

    } catch (error: any) {
      console.error('[ChatFeature] Detailed Error:', error);
      setMessages((prev) => [...prev, {
        id: Date.now().toString(),
        text: `Error: ${error.message}. Check console for details.`,
        sender: 'ai',
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
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
            <span>{profile.topicIcon}</span> Chatting about {profile.topic}
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
              <p className={`text-[10px] mt-2 opacity-50 ${msg.sender === 'user' ? 'text-purple-200' : 'text-slate-400'}`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start animate-pulse">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-tl-sm p-4">
               <span className="text-slate-400 text-xs">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/90 to-transparent p-4 pb-6">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2 bg-slate-800/90 backdrop-blur-lg border border-slate-700 rounded-full p-2 pr-3 shadow-2xl">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Ask ${profile.name} something...`}
            className="flex-1 bg-transparent text-white px-4 py-2 focus:outline-none placeholder-slate-500"
          />
          <button type="submit" disabled={!inputText.trim() || isTyping} className="p-3 bg-purple-600 rounded-full text-white disabled:opacity-50">
             🚀
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatFeature;
