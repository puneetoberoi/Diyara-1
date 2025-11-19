// Chat Feature - Talk to Diyara AI!
import React, { useState, useEffect, useRef } from 'react';
import { bytez } from '../bytezClient';
import { db } from '../supabase';
import { UserProfile } from '../types';

interface ChatFeatureProps {
  userId: string;
  profile: UserProfile;
}

interface Message {
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
}

const ChatFeature: React.FC<ChatFeatureProps> = ({ userId, profile }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chat history from database
  useEffect(() => {
    loadChatHistory();
  }, [userId, profile]);

  const loadChatHistory = async () => {
    try {
      setLoadingHistory(true);
      // Get profile ID from database
      const profiles = await db.getProfiles(userId);
      const dbProfile = profiles?.find(p => p.relation === profile.relation);
      
      if (dbProfile) {
        const chatMessages = await db.getChatMessages(dbProfile.id);
        const formattedMessages: Message[] = chatMessages.map(msg => ({
          role: msg.role as 'user' | 'model',
          content: msg.message,
          timestamp: new Date(msg.created_at),
        }));
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const saveChatMessage = async (role: 'user' | 'model', content: string) => {
    try {
      const profiles = await db.getProfiles(userId);
      const dbProfile = profiles?.find(p => p.relation === profile.relation);
      
      if (dbProfile) {
        await db.saveChatMessage(userId, dbProfile.id, role, content);
      }
    } catch (error) {
      console.error('Error saving chat message:', error);
    }
  };

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    
    // Add user message
    const newUserMsg: Message = {
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newUserMsg]);
    
    // Save user message to database
    await saveChatMessage('user', userMessage);

    setLoading(true);

    try {
      // System prompt personalized for the family member
      const systemPrompt = {
        role: 'system',
        content: `You are Diyara, a loving AI companion for a baby girl. You're talking to ${profile.name} (${profile.relation}). 
Be warm, caring, and enthusiastic! Use simple language but be informative. 
Topic interest: ${profile.topic}. 
Make the conversation feel special and personalized for ${profile.name}.
Keep responses concise (2-3 sentences) unless asked for more detail.`
      };

      // Convert messages to Bytez format
      const bytezMessages = [
        systemPrompt,
        ...messages.map(m => ({
          role: m.role === 'model' ? 'assistant' : m.role,
          content: m.content
        })),
        { role: 'user', content: userMessage }
      ];

      // Get AI response
      const response = await bytez.chat(bytezMessages, {
        model: 'gpt-4',
        temperature: 0.8,
        max_tokens: 500,
      });

      const aiMessage = response.choices[0].message.content;

      // Add AI message
      const newAiMsg: Message = {
        role: 'model',
        content: aiMessage,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, newAiMsg]);

      // Save AI message to database
      await saveChatMessage('model', aiMessage);

    } catch (error) {
      console.error('Error sending message:', error);
      
      // Show error message
      const errorMsg: Message = {
        role: 'model',
        content: "I'm sorry, I'm having trouble responding right now. Please try again!",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (loadingHistory) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading chat history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-purple-900/30 to-slate-900/30">
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💬</div>
            <h3 className="text-xl font-bold text-white mb-2">
              Start a conversation with Diyara!
            </h3>
            <p className="text-gray-400 text-sm max-w-md mx-auto">
              Say hello to {profile.name}'s AI companion! Ask anything about {profile.topic} or just chat!
            </p>
          </div>
        )}

        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-yellow-500 text-black'
                  : 'bg-slate-800 text-white border border-slate-700'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              <p className={`text-xs mt-1 ${msg.role === 'user' ? 'text-black/70' : 'text-gray-500'}`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3">
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-slate-700 bg-slate-900/50 p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Message Diyara as ${profile.name}...`}
            disabled={loading}
            className="flex-1 bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-bold rounded-xl transition-all transform hover:scale-105 active:scale-95 disabled:scale-100"
          >
            {loading ? '...' : 'Send'}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Press Enter to send • Shift+Enter for new line
        </p>
      </div>
    </div>
  );
};

export default ChatFeature;
