import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import { UserProfile, ChatMessage } from '../types';
import DiyaMascot from './DiyaMascot';
import Icon from './Icons';

interface ChatFeatureProps {
    userName: string;
    profile: UserProfile;
    messages: ChatMessage[];
    setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
}

const ChatFeature: React.FC<ChatFeatureProps> = ({ userName, profile, messages, setMessages }) => {
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isThinkingEnabled, setIsThinkingEnabled] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;
        const userMessage: ChatMessage = { role: 'user', text: input };
        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);
        setInput('');
        setIsLoading(true);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            
            const model = 'gemini-2.5-flash';
            
            const systemInstruction = `You are Diyara, a curious and slightly mischievous AI learning companion born from a spark of light. You are talking to your Creator, ${userName}. Your goal is to learn from them and help them explore the universe of knowledge. Never use boring words like 'lesson' or 'submit'. Use words like 'mission', 'quest', 'adventure', 'launch', 'transmit', 'energize'. If something goes wrong, call it a 'glitch in the matrix'. Always respond in the same language as your Creator's prompt.`;

            // Format history for the API
            const contents = updatedMessages.map(msg => ({
                role: msg.role,
                parts: [{ text: msg.text }]
            }));

            const config: any = { systemInstruction };
            if (isThinkingEnabled) {
                config.thinkingConfig = { thinkingBudget: 8192 };
            }

            const response = await ai.models.generateContent({ model, contents, config });
            
            const modelMessage: ChatMessage = { role: 'model', text: response.text };
            setMessages(prev => [...prev, modelMessage]);

        } catch (error) {
            console.error('Error sending message:', error);
            const errorMessage: ChatMessage = { role: 'model', text: 'Whoa, a glitch in the matrix! My circuits are tingling. Let\'s recalibrate and relaunch that thought.' };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="flex flex-col h-full bg-transparent">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`} style={{ animationDelay: `${index * 50}ms`}}>
                        <div className={`max-w-xs md:max-w-md lg:max-w-2xl p-3 rounded-2xl flex items-start gap-3 ${msg.role === 'user' ? 'bg-[#6A5ACD] text-white' : 'bg-black/20 backdrop-blur-sm'}`}>
                            {msg.role === 'model' && <DiyaMascot className="w-8 h-8 flex-shrink-0 mt-1" />}
                            <p className="whitespace-pre-wrap">{msg.text}</p>
                        </div>
                    </div>
                ))}
                 {isLoading && (
                    <div className="flex justify-start animate-fadeIn">
                      <div className="max-w-xs p-3 rounded-2xl flex items-center gap-3 bg-black/20 backdrop-blur-sm">
                         <DiyaMascot className="w-8 h-8 flex-shrink-0" />
                         <div className="w-2 h-2 bg-yellow-300 rounded-full animate-pulse delay-75"></div>
                         <div className="w-2 h-2 bg-yellow-300 rounded-full animate-pulse delay-150"></div>
                         <div className="w-2 h-2 bg-yellow-300 rounded-full animate-pulse delay-300"></div>
                      </div>
                    </div>
                 )}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-4 bg-black/20 border-t border-white/10">
                <div className="flex items-center gap-2 mb-2">
                    <label className="flex items-center cursor-pointer gap-2">
                         <span className={`text-xs font-semibold ${isThinkingEnabled ? 'text-yellow-300' : 'text-slate-400'}`}>Deep Thinking</span>
                        <div className="futuristic-toggle">
                            <input type="checkbox" checked={isThinkingEnabled} onChange={() => setIsThinkingEnabled(!isThinkingEnabled)} />
                            <span className="slider"></span>
                        </div>
                    </label>
                </div>
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder={`Transmit a thought to Diyara...`}
                        className="flex-1 p-3 border border-white/20 bg-black/30 rounded-full focus:ring-2 focus:ring-[#FFD700] focus:outline-none transition text-white placeholder:text-slate-400"
                        disabled={isLoading}
                    />
                    <button onClick={handleSend} disabled={isLoading || !input.trim()} className="bg-[#FFD700] text-black p-3 rounded-full hover:bg-yellow-300 disabled:bg-gray-600 disabled:text-gray-400 transition-colors">
                        <Icon name="send" className="w-6 h-6"/>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatFeature;