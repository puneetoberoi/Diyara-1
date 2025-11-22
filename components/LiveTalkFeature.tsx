import React, { useState, useEffect, useRef } from 'react';
import { UserProfile } from '../types';

interface LiveTalkProps {
  userId: string;
  profile: UserProfile;
}

// Debug: Log the API key status
const BYTEZ_API_KEY = import.meta.env.VITE_BYTEZ_API_KEY?.trim();
const MODEL_ID = 'codenamewei/speech-to-text';

console.log('🔑 API Key loaded:', BYTEZ_API_KEY ? `Yes (${BYTEZ_API_KEY.substring(0, 10)}...)` : 'NO - CHECK .env FILE!');

const LiveTalkFeature: React.FC<LiveTalkProps> = ({ userId, profile }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("Tap my face to talk!");
  const [aiResponse, setAiResponse] = useState("");
  const [error, setError] = useState("");
  const [speechSupported, setSpeechSupported] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [testInput, setTestInput] = useState("Hello Diyara!");
  const [isTestingAPI, setIsTestingAPI] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis>(window.speechSynthesis);
  const currentTranscriptRef = useRef<string>("");

  const addDebugLog = (message: string) => {
    console.log(`🔍 ${message}`);
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    // Check environment
    addDebugLog(`Browser: ${navigator.userAgent.substring(0, 50)}...`);
    addDebugLog(`API Key Status: ${BYTEZ_API_KEY ? 'Loaded' : 'Missing!'}`);
    
    // Check for Speech Recognition support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setSpeechSupported(true);
      addDebugLog('Speech Recognition: Supported ✅');
      
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = navigator.language || 'en-US';
        addDebugLog(`Language set to: ${recognition.lang}`);

        recognition.onstart = () => {
          addDebugLog('Recognition started');
        };

        recognition.onresult = (event: any) => {
          const text = event.results[0][0].transcript;
          setTranscript(text);
          currentTranscriptRef.current = text;
          addDebugLog(`Heard: "${text}"`);
        };

        recognition.onend = () => {
          addDebugLog('Recognition ended');
          setIsListening(false);
          const finalText = currentTranscriptRef.current;
          if (finalText && finalText.length > 2 && finalText !== "Listening...") {
            addDebugLog(`Processing: "${finalText}"`);
            handleSendToAI(finalText);
          }
        };

        recognition.onerror = (event: any) => {
          addDebugLog(`Speech Error: ${event.error}`);
          setError(`Error: ${event.error}`);
          setIsListening(false);
          setTranscript("Sorry, couldn't hear you. Try again!");
        };

        recognitionRef.current = recognition;
      } catch (err: any) {
        addDebugLog(`Setup failed: ${err.message}`);
        setSpeechSupported(false);
      }
    } else {
      setSpeechSupported(false);
      addDebugLog('Speech Recognition: Not supported ❌');
    }

    // Test Speech Synthesis
    if ('speechSynthesis' in window) {
      addDebugLog('Speech Synthesis: Supported ✅');
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        const voices = window.speechSynthesis.getVoices();
        addDebugLog(`Voices available: ${voices.length}`);
      };
    } else {
      addDebugLog('Speech Synthesis: Not supported ❌');
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

  // Manual API Test Function
  const testAPIDirectly = async () => {
    if (!BYTEZ_API_KEY) {
      setError("❌ API Key is missing! Add VITE_BYTEZ_API_KEY to your .env file");
      return;
    }

    setIsTestingAPI(true);
    setError("");
    setAiResponse("Testing API...");
    addDebugLog(`Testing API with: "${testInput}"`);

    try {
      // First, let's test if we can reach the API
      addDebugLog('Sending request to Bytez API...');
      
      const response = await fetch('https://api.bytez.com/models/v2/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${BYTEZ_API_KEY}`
        },
        body: JSON.stringify({
          model: MODEL_ID,
          stream: false, // Using non-streaming for testing
          max_tokens: 50,
          temperature: 0.7,
          messages: [
            { 
              role: "system", 
              content: "You are Diyara, a 2-year-old girl. Reply in max 8 words. Be cute." 
            },
            { role: "user", content: testInput }
          ]
        })
      });

      addDebugLog(`Response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        addDebugLog(`Error response: ${errorText}`);
        throw new Error(`API returned ${response.status}: ${errorText.substring(0, 200)}`);
      }

      const data = await response.json();
      addDebugLog('API Response received successfully!');
      
      const aiText = data.choices?.[0]?.message?.content || "No response";
      setAiResponse(aiText);
      addDebugLog(`AI said: "${aiText}"`);
      
      // Try to speak it
      speakOutLoud(aiText);

    } catch (error: any) {
      addDebugLog(`API Error: ${error.message}`);
      setError(`API Error: ${error.message}`);
      setAiResponse("API test failed!");
      
      // Common error fixes
      if (error.message.includes('401')) {
        setError("❌ Invalid API Key. Check your VITE_BYTEZ_API_KEY");
      } else if (error.message.includes('Failed to fetch')) {
        setError("❌ Network error. Check internet connection or CORS");
      }
    } finally {
      setIsTestingAPI(false);
    }
  };

  const toggleListening = async () => {
    if (!speechSupported || !recognitionRef.current) {
      setError("Speech not available. Use Chrome/Safari or try the text input below.");
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current.stop();
        addDebugLog('Stopped listening');
      } catch (err) {}
      setIsListening(false);
    } else {
      try {
        // Request microphone permission
        addDebugLog('Requesting microphone...');
        await navigator.mediaDevices.getUserMedia({ audio: true });
        addDebugLog('Microphone access granted');
        
        synthRef.current.cancel();
        setError("");
        currentTranscriptRef.current = "";
        recognitionRef.current.start();
        setIsListening(true);
        setTranscript("Listening...");
        setAiResponse("");
        addDebugLog('Started listening');
      } catch (err: any) {
        addDebugLog(`Microphone error: ${err.message}`);
        if (err.name === 'NotAllowedError') {
          setError("🎙️ Please allow microphone access and try again.");
        } else {
          setError("Could not access microphone.");
        }
      }
    }
  };

  const handleSendToAI = async (textToSend: string) => {
    if (!BYTEZ_API_KEY) {
      setError("❌ No API Key! Add VITE_BYTEZ_API_KEY to .env file");
      setAiResponse("I can't talk - no API key!");
      return;
    }

    setAiResponse("Thinking...");
    setError("");
    addDebugLog(`Sending to AI: "${textToSend}"`);

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
                        Keep replies under 8 words. Be cute and playful.` 
            },
            { role: "user", content: textToSend }
          ]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API ${response.status}: ${errorText.substring(0, 100)}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response stream");

      const decoder = new TextDecoder("utf-8");
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").filter(line => line.trim());

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
            } catch {}
          }
        }
      }

      if (fullText) {
        addDebugLog(`AI Response: "${fullText}"`);
        speakOutLoud(fullText);
      }

    } catch (error: any) {
      addDebugLog(`AI Error: ${error.message}`);
      setError(error.message);
      setAiResponse("Oopsie! Can't think!");
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
        v.name.toLowerCase().includes('samantha')
      );
      
      if (femaleVoice) utterance.voice = femaleVoice;
      utterance.pitch = 1.5;
      utterance.rate = 1.0;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      
      synthRef.current.speak(utterance);
      addDebugLog('Speaking response');
    } catch (err) {
      addDebugLog('Speech failed');
    }
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-slate-900 to-purple-900 p-4 overflow-y-auto pb-24">
      <div className="max-w-lg mx-auto w-full flex flex-col items-center h-full">
        
        {/* API Test Section */}
        <div className="w-full bg-black/30 backdrop-blur rounded-xl p-4 mb-4">
          <h3 className="text-white font-bold mb-2">🧪 Debug & Test</h3>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              placeholder="Test message..."
              className="flex-1 px-3 py-2 bg-slate-800 text-white rounded-lg text-sm"
            />
            <button
              onClick={testAPIDirectly}
              disabled={isTestingAPI}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm disabled:opacity-50"
            >
              {isTestingAPI ? '⏳' : '🚀'} Test API
            </button>
          </div>
          
          {/* Debug Logs */}
          <details className="text-xs">
            <summary className="text-gray-400 cursor-pointer">View Debug Logs ({debugInfo.length})</summary>
            <div className="mt-2 max-h-32 overflow-y-auto bg-black/50 rounded p-2">
              {debugInfo.map((log, i) => (
                <div key={i} className="text-gray-300 font-mono">{log}</div>
              ))}
            </div>
          </details>
        </div>

        {/* Error Display */}
        {error && (
          <div className="w-full bg-red-500/20 border border-red-500 rounded-lg p-3 mb-4">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}
        
        {/* Interactive Face */}
        <div className="flex-1 flex flex-col items-center justify-center min-h-[200px]">
          <button 
            onClick={toggleListening}
            disabled={!speechSupported}
            className={`relative w-48 h-48 rounded-full flex items-center justify-center transition-all duration-300 ${
              isSpeaking ? 'scale-110' : ''
            } ${isListening ? 'scale-105' : ''} hover:scale-105 ${
              !speechSupported ? 'opacity-50' : ''
            }`}
          >
            <div className={`absolute inset-0 rounded-full border-4 border-yellow-400 ${
              (isSpeaking || isListening) ? 'animate-ping opacity-50' : 'opacity-0'
            }`}></div>
            
            <div className={`w-full h-full rounded-full bg-purple-600 flex items-center justify-center text-8xl border-4 shadow-2xl ${
              isListening ? 'border-red-400' : 'border-white'
            }`}>
              <span>{profile.avatar || '👧'}</span>
              {isListening && (
                <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center">
                  <span className="text-4xl animate-bounce">🎙️</span>
                </div>
              )}
            </div>
          </button>
        </div>

        {/* Conversation Display */}
        <div className="w-full bg-black/30 backdrop-blur-md rounded-3xl p-4 border border-white/10">
          <p className="text-slate-400 text-xs mb-1 uppercase tracking-wider font-bold">You:</p>
          <p className="text-white text-lg mb-3">{transcript}</p>
          <div className="border-t border-white/10 my-3"></div>
          <p className="text-purple-300 text-xs mb-1 uppercase tracking-wider font-bold">Diyara:</p>
          <p className="text-yellow-300 text-xl font-bold italic">
            {aiResponse ? `"${aiResponse}"` : '...'}
          </p>
        </div>

        {/* Status Info */}
        <div className="mt-4 text-xs text-center space-y-1">
          <div className={BYTEZ_API_KEY ? 'text-green-400' : 'text-red-400'}>
            API Key: {BYTEZ_API_KEY ? '✅ Loaded' : '❌ Missing'}
          </div>
          <div className={speechSupported ? 'text-green-400' : 'text-yellow-400'}>
            Speech: {speechSupported ? '✅ Ready' : '⚠️ Not supported'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveTalkFeature;
