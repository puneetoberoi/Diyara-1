import React, { useState, useEffect, useRef } from 'react';
import { UserProfile } from '../types';

interface LiveTalkProps {
  userId: string;
  profile: UserProfile;
}

const BYTEZ_API_KEY = import.meta.env.VITE_BYTEZ_API_KEY?.trim();
const MODEL_ID = 'meta-llama/Meta-Llama-3-8B-Instruct';

const LiveTalkFeature: React.FC<LiveTalkProps> = ({ profile }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("Press the mic to start talking...");
  const [aiResponse, setAiResponse] = useState("");
  const [language, setLanguage] = useState<'en-US' | 'hi-IN' | 'pa-IN'>('en-US');

  // Browser Speech Recognition Setup
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initialize Speech Recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
    } else {
      setTranscript("Sorry, your browser doesn't support voice talk.");
    }
  }, []);

  // 1. Start Listening
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      if (!recognitionRef.current) return;
      
      // Stop any current speech
      window.speechSynthesis.cancel();
      
      recognitionRef.current.lang = language;
      recognitionRef.current.start();
      setIsListening(true);
      setTranscript("Listening...");
      setAiResponse("");

      recognitionRef.current.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        // Auto-submit when silence is detected
        if (recognitionRef.current && transcript !== "Listening...") {
          handleSendToAI();
        }
      };
    }
  };

  // 2. Send to Bytez AI
  const handleSendToAI = async () => {
    // Small delay to ensure state is updated
    const textToSend = document.getElementById('transcript-display')?.innerText || "";
    if (textToSend.length < 2 || textToSend === "Listening...") return;

    setAiResponse("Thinking...");

    try {
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
              content: `You are Diyara, a giggly 2-year-old child. 
                        You are talking to ${profile.relation}. 
                        Keep sentences very short (5-10 words). 
                        Use simple words. 
                        Giggle often like *giggles*.
                        Reply in the same language as the user (${language}).` 
            },
            { role: "user", content: textToSend }
          ]
        })
      });

      const data = await response.json();
      const reply = data.choices?.[0]?.message?.content || "Giggle!";
      setAiResponse(reply);
      speakOutLoud(reply);

    } catch (error) {
      console.error(error);
      setAiResponse("Oopsie, I fell asleep!");
    }
  };

  // 3. Text-to-Speech (The "Giggly Voice")
  const speakOutLoud = (text: string) => {
    if (!window.speechSynthesis) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    
    // THE MAGIC: High pitch + slightly fast rate = Child Voice
    utterance.pitch = 1.6; // 0 to 2 (High pitch)
    utterance.rate = 1.1;  // 0.1 to 10 (Slightly fast)
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-slate-900 to-purple-900 p-6 overflow-y-auto pb-24">
      
      {/* Language Selector */}
      <div className="flex justify-center gap-2 mb-8">
        {[
          { code: 'en-US', label: '🇺🇸 English' },
          { code: 'hi-IN', label: '🇮🇳 Hindi' },
          { code: 'pa-IN', label: '🪯 Punjabi' }
        ].map(lang => (
          <button
            key={lang.code}
            onClick={() => setLanguage(lang.code as any)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
              language === lang.code ? 'bg-yellow-400 text-black scale-105' : 'bg-slate-800 text-white'
            }`}
          >
            {lang.label}
          </button>
        ))}
      </div>

      {/* Avatar Animation */}
      <div className="flex-1 flex flex-col items-center justify-center min-h-[300px]">
        <div className={`relative w-48 h-48 rounded-full flex items-center justify-center transition-all duration-500 ${
          isSpeaking ? 'scale-110' : 'scale-100'
        }`}>
          {/* Glowing Ring */}
          <div className={`absolute inset-0 rounded-full border-4 border-yellow-400 ${
            isSpeaking || isListening ? 'animate-ping opacity-50' : 'opacity-0'
          }`}></div>
          
          <div className="w-full h-full rounded-full bg-purple-600 flex items-center justify-center text-8xl border-4 border-white shadow-2xl z-10">
            {profile.avatar}
          </div>

          {/* Status Bubble */}
          <div className="absolute -top-12 bg-white text-black px-4 py-2 rounded-xl rounded-br-none font-bold animate-bounce shadow-lg">
            {isListening ? "👂 Listening..." : isSpeaking ? "🗣️ Speaking..." : "Tap mic!"}
          </div>
        </div>
      </div>

      {/* Transcript Area */}
      <div className="bg-black/30 backdrop-blur-md rounded-2xl p-6 mb-8 border border-white/10 min-h-[150px]">
        <p className="text-slate-400 text-xs mb-2 uppercase tracking-wider">You said:</p>
        <p id="transcript-display" className="text-white text-lg font-medium mb-6 min-h-[28px]">
          {transcript}
        </p>
        
        <div className="border-t border-white/10 my-4"></div>

        <p className="text-purple-300 text-xs mb-2 uppercase tracking-wider">Diyara said:</p>
        <p className="text-yellow-300 text-xl font-bold italic">
          "{aiResponse}"
        </p>
      </div>

      {/* Controls */}
      <div className="flex justify-center">
        <button
          onClick={toggleListening}
          className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl shadow-2xl transition-all transform active:scale-90 ${
            isListening 
              ? 'bg-red-500 animate-pulse' 
              : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:scale-110'
          }`}
        >
          {isListening ? '⬛' : '🎙️'}
        </button>
      </div>
    </div>
  );
};

export default LiveTalkFeature;
