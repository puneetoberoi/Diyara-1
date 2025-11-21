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
  const [transcript, setTranscript] = useState("Tap my face to talk!");
  const [aiResponse, setAiResponse] = useState("");
  
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis>(window.speechSynthesis);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false; 
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = navigator.language || 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        const finalTranscript = document.getElementById('transcript-display')?.innerText || "";
        if (finalTranscript.length > 2 && finalTranscript !== "Listening...") {
          handleSendToAI(finalTranscript);
        } else {
          setTranscript("I didn't catch that. Tap to try again!");
        }
      };
    } else {
      setTranscript("Browser doesn't support speech.");
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      if (!recognitionRef.current) return;
      synthRef.current.cancel();
      recognitionRef.current.start();
      setIsListening(true);
      setTranscript("Listening...");
      setAiResponse("");
    }
  };

  const handleSendToAI = async (textToSend: string) => {
    setAiResponse("Thinking...");

    try {
      const response = await fetch('[https://api.bytez.com/models/v2/openai/v1/chat/completions](https://api.bytez.com/models/v2/openai/v1/chat/completions)', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${BYTEZ_API_KEY}`
        },
        body: JSON.stringify({
          model: MODEL_ID,
          stream: true, 
          max_tokens: 100, 
          messages: [
            { 
              role: "system", 
              content: `You are Diyara, a 2-year-old girl.
                        User is: ${profile.relation}.
                        Reply in the SAME LANGUAGE as the user.
                        Keep sentences SUPER short (max 8 words).
                        Be cute.` 
            },
            { role: "user", content: textToSend }
          ]
        })
      });

      if (!response.body) return;
      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let fullText = "";
      let firstChunkRead = false;

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
                fullText += content;
                setAiResponse(fullText);
              }
            } catch (e) {}
          }
        }
      }
      speakOutLoud(fullText);

    } catch (error) {
      console.error(error);
      setAiResponse("Oopsie! Brain freeze!");
    }
  };

  const speakOutLoud = (text: string) => {
    if (!synthRef.current) return;
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // FIX: Find Female Voice
    const voices = synthRef.current.getVoices();
    const preferredVoice = voices.find(v => 
      v.name.includes('Google US English') || 
      v.name.includes('Samantha') || 
      v.name.includes('Zira') ||
      v.name.includes('Female')
    );
    if (preferredVoice) utterance.voice = preferredVoice;

    // High Pitch = Child Voice
    utterance.pitch = 1.5; 
    utterance.rate = 1.1;  
    utterance.volume = 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    
    synthRef.current.speak(utterance);
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-slate-900 to-purple-900 p-4 overflow-y-auto pb-24">
      <div className="max-w-lg mx-auto w-full flex flex-col items-center h-full">
        
        {/* Interactive Face - NO BOTTOM BUTTON */}
        <div className="flex-1 flex flex-col items-center justify-center min-h-[300px]">
          <button 
            onClick={toggleListening}
            className={`relative w-56 h-56 rounded-full flex items-center justify-center transition-all duration-300 outline-none ${
              isSpeaking ? 'scale-110' : 'scale-100'
            } ${isListening ? 'scale-105' : ''} hover:scale-105 active:scale-95`}
          >
            <div className={`absolute inset-0 rounded-full border-4 border-yellow-400 ${
              isSpeaking || isListening ? 'animate-ping opacity-50' : 'opacity-0'
            }`}></div>
            
            <div className={`w-full h-full rounded-full bg-purple-600 flex items-center justify-center text-9xl border-4 border-white shadow-2xl z-10 relative overflow-hidden ${
              isListening ? 'border-red-400' : 'border-white'
            }`}>
              <span className="z-10 relative">{profile.avatar}</span>
              {isListening && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-20">
                  <span className="text-4xl animate-bounce">🎙️</span>
                </div>
              )}
            </div>

            <div className="absolute -top-14 bg-white text-black px-6 py-2 rounded-2xl rounded-br-none font-bold animate-bounce shadow-lg text-lg whitespace-nowrap z-30">
              {isListening ? "I'm listening..." : isSpeaking ? "Diyara speaking!" : "Tap my face!"}
            </div>
          </button>
        </div>

        <div className="w-full bg-black/30 backdrop-blur-md rounded-3xl p-6 border border-white/10 min-h-[180px] shadow-xl">
          <p className="text-slate-400 text-xs mb-2 uppercase tracking-wider font-bold">You:</p>
          <p id="transcript-display" className="text-white text-lg font-medium mb-4 min-h-[28px]">
            {transcript}
          </p>
          <div className="border-t border-white/10 my-4"></div>
          <p className="text-purple-300 text-xs mb-2 uppercase tracking-wider font-bold">Diyara:</p>
          <p className="text-yellow-300 text-xl font-bold italic leading-relaxed">
            "{aiResponse}"
          </p>
        </div>
      </div>
    </div>
  );
};

export default LiveTalkFeature;
