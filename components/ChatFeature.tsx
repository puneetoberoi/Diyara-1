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

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim()) return;

    // 1. Add User Message
    const newUserMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInputText('');
    setIsTyping(true);

    // 2. Simulate AI Response (Replace this with Bytez API later)
    // TODO: Call your Bytez/OpenAI API here
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: `I heard you say "${newUserMessage.text}"! I am currently a demo, but soon I will be smart!`,
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
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
              <p className="leading-relaxed">{msg.text}</p>
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
            {/* Send Icon */}
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
