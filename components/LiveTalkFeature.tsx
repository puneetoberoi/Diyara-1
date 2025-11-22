import React, { useState, useEffect, useRef } from 'react';
import { UserProfile } from '../types';

interface LiveTalkProps {
  userId: string;
  profile: UserProfile;
}

const BYTEZ_API_KEY = import.meta.env.VITE_BYTEZ_API_KEY?.trim();
const MODEL_ID = 'meta-llama/Meta-Llama-3-8B-Instruct';

const LiveTalkFeature: React.FC<LiveTalkProps> = ({ userId, profile }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("Tap my face to talk!");
  const [aiResponse, setAiResponse] = useState("");
  const [error, setError] = useState("");
  const [speechSupported, setSpeechSupported] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis>(window.speechSynthesis);
  const currentTranscriptRef = useRef<string>("");

  useEffect(() => {
    // Check for Speech Recognition support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setSpeechSupported(true);
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = navigator.language || 'en-US';

        recognition.onresult = (event: any) => {
          const text = event.results[0][0].transcript;
          setTranscript(text);
          currentTranscriptRef.current = text;
        };

        recognition.onend = () => {
          setIsListening(false);
          const finalText = currentTranscriptRef.current;
          if (finalText && finalText.length > 2 && finalText !== "Listening...") {
            handleSendToAI(finalText);
          }
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setError(`Error: ${event.error}`);
          setIsListening(false);
          setTranscript("Sorry, couldn't hear you. Try again!");
        };

        recognitionRef.current = recognition;
      } catch (err) {
        console.error('Failed to setup speech recognition:', err);
        setError("Speech recognition setup failed");
        setSpeechSupported(false);
      }
    } else {
      setSpeechSupported(false);
      setError("Your browser doesn't support speech recognition. Try Chrome or Safari.");
    }

    // Load voices
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }

    // Cleanup
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (err) {}
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const toggleListening = async () => {
    if (!speechSupported || !recognitionRef.current) {
      setError("Speech recognition not available. Try using Chrome or Safari browser.");
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.error('Stop error:', err);
      }
      setIsListening(false);
    } else {
      try {
        // Request microphone permission first
        await navigator.mediaDevices.getUserMedia({ audio: true });
        
        synthRef.current.cancel();
        setError("");
        currentTranscriptRef.current = "";
        recognitionRef.current.start();
        setIsListening(true);
        setTranscript("Listening...");
        setAiResponse("");
      } catch (err: any) {
        console.error('Failed to start listening:', err);
        if (err.name === 'NotAllowedError') {
          setError("Microphone access denied. Please allow microphone access and try again.");
        } else {
          setError("Could not start listening. Check microphone permissions.");
        }
      }
    }
  };

  const handleSendToAI = async (textToSend: string) => {
    if (!BYTEZ_API_KEY) {
      setError("API key not configured");
      setAiResponse("I can't talk right now. API not set up!");
      return;
    }

    setAiResponse("Thinking...");
    setError("");

    try {
      const response = await fetch('https://api.bytez.com/models/v2/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${BYTEZ_API_KEY}`
        },
        body: JSON.stringify({
          model: MODEL_ID,
          stream: true,
          max_tokens: 100,
          temperature: 0.7,
          messages: [
            { 
              role: "system", 
              content: `You are Diyara, a sweet 2-year-old girl.
                        User is: ${profile.relation || 'a friend'}.
                        Reply in the SAME LANGUAGE as the user speaks.
                        Keep sentences SUPER short (max 8 words).
                        Be cute, playful, and child-like.
                        Sometimes make innocent mistakes or mispronounce words slightly.` 
            },
            { role: "user", content: textToSend }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").filter(line => line.trim() !== "");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;
            
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                fullText += content;
                setAiResponse(fullText);
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }

      if (fullText) {
        speakOutLoud(fullText);
      } else {
        setAiResponse("Hmm... I'm confused!");
      }

    } catch (error: any) {
      console.error('AI Error:', error);
      setError(error.message);
      setAiResponse("Oopsie! Can't think right now!");
    }
  };

  const speakOutLoud = (text: string) => {
    if (!('speechSynthesis' in window)) {
      console.log("Speech synthesis not supported");
      return;
    }
    
    try {
      synthRef.current.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      
      const voices = synthRef.current.getVoices();
      const preferredVoice = voices.find(v => 
        v.name.toLowerCase().includes('female') ||
        v.name.toLowerCase().includes('zira') ||
        v.name.toLowerCase().includes('samantha')
      );
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.pitch = 1.5;
      utterance.rate = 1.0;
      utterance.volume = 1.0;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = (event) => {
        console.error('Speech error:', event);
        setIsSpeaking(false);
      };
      
      synthRef.current.speak(utterance);
    } catch (err) {
      console.error('Failed to speak:', err);
      setIsSpeaking(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-slate-900 to-purple-900 p-4 overflow-y-auto pb-24">
      <div className="max-w-lg mx-auto w-full flex flex-col items-center h-full">
        
        {/* Error Display */}
        {error && (
          <div className="w-full bg-red-500/20 border border-red-500 rounded-lg p-3 mb-4">
            <p className="text-red-300 text-sm text-center">{error}</p>
          </div>
        )}

        {/* Speech Support Check */}
        {!speechSupported && (
          <div className="w-full bg-yellow-500/20 border border-yellow-500 rounded-lg p-3 mb-4">
            <p className="text-yellow-300 text-sm text-center">
              Speech not supported. Try Chrome or Safari browser.
            </p>
          </div>
        )}
        
        {/* Interactive Face */}
        <div className="flex-1 flex flex-col items-center justify-center min-h-[300px]">
          <button 
            onClick={toggleListening}
            disabled={!speechSupported}
            className={`relative w-56 h-56 rounded-full flex items-center justify-center transition-all duration-300 outline-none ${
              isSpeaking ? 'scale-110' : 'scale-100'
            } ${isListening ? 'scale-105' : ''} hover:scale-105 active:scale-95 ${
              !speechSupported ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <div className={`absolute inset-0 rounded-full border-4 border-yellow-400 ${
              isSpeaking || isListening ? 'animate-ping opacity-50' : 'opacity-0'
            }`}></div>
            
            <div className={`w-full h-full rounded-full bg-purple-600 flex items-center justify-center text-9xl border-4 shadow-2xl z-10 relative overflow-hidden ${
              isListening ? 'border-red-400' : 'border-white'
            }`}>
              <span className="z-10 relative">{profile.avatar || '👧'}</span>
              {isListening && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-20">
                  <span className="text-4xl animate-bounce">🎙️</span>
                </div>
              )}
            </div>

            <div className="absolute -top-14 bg-white text-black px-6 py-2 rounded-2xl rounded-br-none font-bold animate-bounce shadow-lg text-lg whitespace-nowrap z-30">
              {!speechSupported ? "Not supported!" : isListening ? "I'm listening..." : isSpeaking ? "Diyara speaking!" : "Tap my face!"}
            </div>
          </button>
        </div>

        {/* Conversation Display */}
        <div className="w-full bg-black/30 backdrop-blur-md rounded-3xl p-6 border border-white/10 min-h-[180px] shadow-xl">
          <p className="text-slate-400 text-xs mb-2 uppercase tracking-wider font-bold">You:</p>
          <p className="text-white text-lg font-medium mb-4 min-h-[28px]">
            {transcript}
          </p>
          <div className="border-t border-white/10 my-4"></div>
          <p className="text-purple-300 text-xs mb-2 uppercase tracking-wider font-bold">Diyara:</p>
          <p className="text-yellow-300 text-xl font-bold italic leading-relaxed">
            {aiResponse ? `"${aiResponse}"` : '...'}
          </p>
        </div>

        {/* Debug Info - Remove in production */}
        {!BYTEZ_API_KEY && (
          <div className="mt-4 text-xs text-red-400 text-center">
            ⚠️ VITE_BYTEZ_API_KEY not set in .env
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveTalkFeature;
