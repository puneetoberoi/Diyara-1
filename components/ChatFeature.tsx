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
const BYTEZ_API_KEY = import.meta.env.VITE_BYTEZ_API_KEY;
const MODEL_ID = 'meta-llama/Meta-Llama-3-8B-Instruct'; // You can change this model later

const ChatFeature: React.FC<ChatFeatureProps> = ({ userId, profile }) => {
  // Initial greeting message
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

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);
  
  // Add this inside ChatFeature component
  console.log("DEBUG: API Key is:", import.meta.env.VITE_BYTEZ_API_KEY ? "Present" : "MISSING");

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim()) return;

    if (!BYTEZ_API_KEY) {
      alert("Missing API Key! Please add VITE_BYTEZ_API_KEY to your .env file.");
      return;
    }

    // 1. Add User Message to UI immediately
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
      // 2. Prepare Context for AI (Previous messages + New message)
      // We format it exactly how OpenAI/Bytez expects it: { role: "user" | "assistant", content: "..." }
      const conversationHistory = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      }));
      
      // Add the new message we just typed
      conversationHistory.push({ role: 'user', content: newUserMessage.text });

      // 3. Call Bytez API
      const response = await fetch('https://api.bytez.com/models/v2/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': BYTEZ_API_KEY // Bytez uses the raw key in Authorization header
        },
        body: JSON.stringify({
          model: MODEL_ID,
          messages: [
            // System prompt to give the AI a personality
            { 
              role: "system", 
              content: `You are acting as ${profile.name}, who is the user's ${profile.relation}. 
                        Your personality is: ${profile.topic}. 
                        Keep responses short, warm, and encouraging. 
                        Use emojis occasionally.` 
            },
            ...conversationHistory
          ],
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to get response from Bytez');
      }

      // 4. Handle AI Response
      const aiText = data.choices?.[0]?.message?.content || "I didn't catch that, could you say it again?";
      
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: aiText,
        sender: 'ai',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiResponse]);

    } catch (error) {
      console.error('[ChatFeature] Error calling API:', error);
      // Show error in chat bubble so user knows it failed
      setMessages((prev) => [...prev, {
        id: Date.now().toString(),
        text: "😔 Oops! I'm having trouble connecting to my brain right now. Please try again.",
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

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start animate-pulse">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-tl-sm p-4 flex gap-1 items-center">
              <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/90 to-transparent p-4 pb-6">
        <form
          onSubmit={handleSendMessage}
          className="flex items-center gap-2 bg-slate-800/90 backdrop-blur-lg border border-slate-700 rounded-full p-2 pr-3 shadow-2xl"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Ask ${profile.name} something...`}
            className="flex-1 bg-transparent text-white px-4 py-2 focus:outline-none placeholder-slate-500"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isTyping}
            className={`p-3 rounded-full transition-all duration-200 ${
              inputText.trim() && !isTyping
                ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/30 transform hover:scale-105'
                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatFeature;
