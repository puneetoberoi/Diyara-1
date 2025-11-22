import React, { useState, useEffect, useRef } from 'react';
import { UserProfile } from '../types';

interface LiveTalkProps {
  userId: string;
  profile: UserProfile;
}

const BYTEZ_API_KEY = import.meta.env.VITE_BYTEZ_API_KEY?.trim();

// Use a simpler model that definitely supports chat
const MODEL_ID = 'mistralai/Mistral-7B-Instruct-v0.1';

const LiveTalkFeature: React.FC<LiveTalkProps> = ({ userId, profile }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("Tap my face to talk!");
  const [aiResponse, setAiResponse] = useState("");
  const [error, setError] = useState("");
  const [speechSupported, setSpeechSupported] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis>(window.speechSynthesis);
  const currentTranscriptRef = useRef<string>("");

  useEffect(() => {
    // Check for Speech Recognition support (browser's built-in, not Bytez)
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
            // Send the text to AI for response
            handleSendToAI(finalText);
          }
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setError(`Speech error: ${event.error}`);
          setIsListening(false);
          setTranscript("Couldn't hear you. Try again!");
        };

        recognitionRef.current = recognition;
      } catch (err) {
        console.error('Failed to setup speech recognition:', err);
        setSpeechSupported(false);
      }
    } else {
      setSpeechSupported(false);
      setError("Your browser doesn't support speech recognition");
    }

    // Load voices for text-to-speech
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }

    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (err) {}
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const toggleListening = async () => {
    if (!speechSupported || !recognitionRef.current) {
      // Fallback: Allow manual text input
      const userInput = prompt("Type your message to Diyara:");
      if (userInput) {
        setTranscript(userInput);
        handleSendToAI(userInput);
      }
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch (err) {}
      setIsListening(false);
    } else {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        synthRef.current.cancel();
        setError("");
        currentTranscriptRef.current = "";
        recognitionRef.current.start();
        setIsListening(true);
        setTranscript("Listening...");
        setAiResponse("");
      } catch (err: any) {
        console.error('Microphone error:', err);
        setError("Microphone access denied. Type instead!");
        
        // Fallback to text input
        const userInput = prompt("Type your message to Diyara:");
        if (userInput) {
          setTranscript(userInput);
          handleSendToAI(userInput);
        }
      }
    }
  };

  const handleSendToAI = async (textToSend: string) => {
    if (!BYTEZ_API_KEY) {
      setError("API key not configured!");
      setAiResponse("I can't talk without API key!");
      return;
    }

    setIsProcessing(true);
    setAiResponse("Thinking...");
    setError("");

    try {
      // IMPORTANT: Use the correct endpoint and format for TEXT GENERATION
      // Not speech recognition!
      const requestBody = {
        model: MODEL_ID,
        messages: [
          {
            role: "system",
            content: "You are Diyara, a sweet 2-year-old girl. Respond in maximum 10 words. Be cute, playful, and child-like."
          },
          {
            role: "user",
            content: textToSend
          }
        ],
        max_tokens: 50,
        temperature: 0.7,
        stream: false // Use non-streaming for simplicity
      };

      console.log('Sending request:', requestBody);

      // Use the chat completions endpoint (for text generation, NOT speech)
      const response = await fetch('https://api.bytez.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${BYTEZ_API_KEY}`
        },
        body: JSON.stringify(requestBody)
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.text();
        console.error('API Error:', errorData);
        
        // Try alternative endpoint if first one fails
        if (response.status === 404 || response.status === 422) {
          // Try alternative endpoint structure
          const altResponse = await fetch('https://api.bytez.com/inference', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${BYTEZ_API_KEY}`
            },
            body: JSON.stringify({
              model: MODEL_ID,
              prompt: `User: ${textToSend}\nDiyara (2-year-old girl):`,
              max_tokens: 50,
              temperature: 0.7
            })
          });

          if (altResponse.ok) {
            const altData = await altResponse.json();
            const aiText = altData.generated_text || altData.text || altData.response || "Hi hi!";
            setAiResponse(aiText);
            speakOutLoud(aiText);
            return;
          }
        }
        
        throw new Error(`API Error ${response.status}: ${errorData.substring(0, 200)}`);
      }

      const data = await response.json();
      console.log('API Response:', data);

      // Extract the response text
      const aiText = data.choices?.[0]?.message?.content || 
                     data.response || 
                     data.text || 
                     "Oopsie, no words!";
      
      setAiResponse(aiText);
      speakOutLoud(aiText);

    } catch (error: any) {
      console.error('Error:', error);
      setError(`Error: ${error.message}`);
      setAiResponse("Oopsie! Can't think now!");
      
      // Fallback response without API
      const fallbackResponses = [
        "Hi hi! You nice!",
        "Me Diyara! Me happy!",
        "Yay! Fun fun!",
        "You funny! Hehe!",
        "Me love you!",
        "Play with me!",
        "Me hungry now!",
        "Where teddy bear?",
        "Me sleepy...",
        "You best friend!"
      ];
      const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
      setTimeout(() => {
        setAiResponse(randomResponse);
        speakOutLoud(randomResponse);
      }, 1000);
    } finally {
      setIsProcessing(false);
    }
  };

  const speakOutLoud = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    
    try {
      synthRef.current.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      
      const voices = synthRef.current.getVoices();
      const femaleVoice = voices.find(v => 
        v.name.toLowerCase().includes('female') ||
        v.name.toLowerCase().includes('child') ||
        v.name.toLowerCase().includes('girl')
      );
      
      if (femaleVoice) utterance.voice = femaleVoice;
      utterance.pitch = 1.6; // High pitch for child voice
      utterance.rate = 0.9;
      utterance.volume = 1.0;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      
      synthRef.current.speak(utterance);
    } catch (err) {
      console.error('Speech failed:', err);
      setIsSpeaking(false);
    }
  };

  // Manual text input handler
  const handleManualInput = () => {
    const userInput = prompt("Type your message to Diyara:");
    if (userInput) {
      setTranscript(userInput);
      handleSendToAI(userInput);
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

        {/* Manual Input Option */}
        <div className="w-full mb-4 flex gap-2">
          <button
            onClick={handleManualInput}
            disabled={isProcessing}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50"
          >
            📝 Type Message
          </button>
          {!speechSupported && (
            <span className="text-yellow-400 text-xs flex items-center">
              Voice not supported - Use typing
            </span>
          )}
        </div>
        
        {/* Interactive Face */}
        <div className="flex-1 flex flex-col items-center justify-center min-h-[250px]">
          <button 
            onClick={toggleListening}
            disabled={isProcessing}
            className={`relative w-56 h-56 rounded-full flex items-center justify-center transition-all duration-300 outline-none ${
              isSpeaking ? 'scale-110' : 'scale-100'
            } ${isListening ? 'scale-105' : ''} hover:scale-105 active:scale-95 ${
              isProcessing ? 'opacity-50' : ''
            }`}
          >
            <div className={`absolute inset-0 rounded-full border-4 border-yellow-400 ${
              (isSpeaking || isListening) ? 'animate-ping opacity-50' : 'opacity-0'
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
              {isProcessing && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-20">
                  <span className="text-4xl animate-spin">🤔</span>
                </div>
              )}
            </div>

            <div className="absolute -top-14 bg-white text-black px-6 py-2 rounded-2xl rounded-br-none font-bold animate-bounce shadow-lg text-lg whitespace-nowrap z-30">
              {isProcessing ? "Thinking..." : isListening ? "Listening..." : isSpeaking ? "Talking!" : "Tap me!"}
            </div>
          </button>
        </div>

        {/* Conversation Display */}
        <div className="w-full bg-black/30 backdrop-blur-md rounded-3xl p-6 border border-white/10 min-h-[180px] shadow-xl">
          <p className="text-slate-400 text-xs mb-2 uppercase tracking-wider font-bold">You said:</p>
          <p className="text-white text-lg font-medium mb-4 min-h-[28px]">
            {transcript}
          </p>
          <div className="border-t border-white/10 my-4"></div>
          <p className="text-purple-300 text-xs mb-2 uppercase tracking-wider font-bold">Diyara says:</p>
          <p className="text-yellow-300 text-xl font-bold italic leading-relaxed">
            "{aiResponse || '...'}"
          </p>
        </div>
      </div>
    </div>
  );
};

export default LiveTalkFeature;
