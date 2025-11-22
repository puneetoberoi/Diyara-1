import React, { useState, useEffect, useRef, useCallback } from 'react';
import { UserProfile } from '../types';

interface LiveTalkProps {
  userId: string;
  profile: UserProfile;
}

interface Message {
  id: number;
  speaker: 'user' | 'ai';
  text: string;
  timestamp: Date;
  isFinal: boolean;
}

interface AudioVisualizerProps {
  audioLevel: number;
  isActive: boolean;
}

// Audio Visualizer Component
const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ audioLevel, isActive }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const barsRef = useRef<number[]>(Array(20).fill(0));

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const barWidth = canvas.width / barsRef.current.length;
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#fbbf24');
      gradient.addColorStop(1, '#a855f7');
      
      barsRef.current.forEach((bar, i) => {
        // Smoothly animate bars
        const targetHeight = isActive ? 
          Math.random() * audioLevel * canvas.height : 0;
        barsRef.current[i] += (targetHeight - bar) * 0.3;
        
        const height = barsRef.current[i];
        const x = i * barWidth + barWidth / 4;
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - height, barWidth / 2, height);
      });
      
      animationRef.current = requestAnimationFrame(draw);
    };
    
    draw();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [audioLevel, isActive]);

  return (
    <canvas
      ref={canvasRef}
      width={200}
      height={50}
      className="w-full h-12"
    />
  );
};

// Main Component
const BYTEZ_API_KEY = import.meta.env.VITE_BYTEZ_API_KEY?.trim();
const MODEL_ID = 'mistralai/Mistral-7B-Instruct-v0.1';

const LiveTalkFeature: React.FC<LiveTalkProps> = ({ userId, profile }) => {
  // State Management
  const [sessionState, setSessionState] = useState<'idle' | 'connecting' | 'listening' | 'thinking' | 'speaking'>('idle');
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  const [error, setError] = useState('');
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [conversationStarted, setConversationStarted] = useState(false);
  
  // Refs for audio handling
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis>(window.speechSynthesis);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const speechQueueRef = useRef<string[]>([]);
  const messageIdCounterRef = useRef(0);
  const currentUserMessageIdRef = useRef<number | null>(null);
  const currentAIMessageIdRef = useRef<number | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isProcessingRef = useRef(false);
  const lastTranscriptRef = useRef('');

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = navigator.language || 'en-US';
      recognition.maxAlternatives = 1;

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        // Update current transcript for live display
        const fullTranscript = finalTranscript || interimTranscript;
        if (fullTranscript.trim()) {
          setCurrentTranscript(fullTranscript);
          handleTranscription(fullTranscript, !finalTranscript);
        }

        // If we have final transcript, process it
        if (finalTranscript.trim() && finalTranscript !== lastTranscriptRef.current) {
          lastTranscriptRef.current = finalTranscript;
          // Reset silence timer
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
          }
          
          // Wait for pause in speech before processing
          silenceTimerRef.current = setTimeout(() => {
            if (!isProcessingRef.current && finalTranscript.trim().length > 2) {
              processUserInput(finalTranscript.trim());
            }
          }, 1000); // 1 second pause = end of sentence
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'no-speech') {
          // Restart recognition
          setTimeout(() => {
            if (sessionState === 'listening') {
              try {
                recognition.start();
              } catch {}
            }
          }, 100);
        }
      };

      recognition.onend = () => {
        // Auto-restart if session is active
        if (sessionState === 'listening' && !isProcessingRef.current) {
          try {
            recognition.start();
          } catch {}
        }
      };

      recognitionRef.current = recognition;
    }

    // Initialize voices
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
      stopAllAudio();
    };
  }, [sessionState]);

  // Handle live transcription display
  const handleTranscription = (text: string, isInterim: boolean) => {
    if (!text.trim()) return;

    if (currentUserMessageIdRef.current === null) {
      // Create new user message
      const id = messageIdCounterRef.current++;
      currentUserMessageIdRef.current = id;
      setMessages(prev => [...prev, {
        id,
        speaker: 'user',
        text: text,
        timestamp: new Date(),
        isFinal: false
      }]);
    } else {
      // Update existing message
      setMessages(prev => prev.map(msg => 
        msg.id === currentUserMessageIdRef.current 
          ? { ...msg, text: text, isFinal: !isInterim }
          : msg
      ));
    }
  };

  // Process user input and get AI response
  const processUserInput = async (userText: string) => {
    if (!userText.trim() || isProcessingRef.current) return;
    
    isProcessingRef.current = true;
    setSessionState('thinking');
    
    // Finalize user message
    if (currentUserMessageIdRef.current !== null) {
      setMessages(prev => prev.map(msg => 
        msg.id === currentUserMessageIdRef.current 
          ? { ...msg, isFinal: true }
          : msg
      ));
      currentUserMessageIdRef.current = null;
    }

    // Interrupt any ongoing speech
    stopAllAudio();

    // Get AI response
    try {
      const aiResponse = await getAIResponse(userText);
      if (aiResponse) {
        streamAIResponse(aiResponse);
      }
    } catch (error) {
      console.error('AI Error:', error);
      const fallback = getFallbackResponse();
      streamAIResponse(fallback);
    } finally {
      isProcessingRef.current = false;
      if (sessionState !== 'idle') {
        setSessionState('listening');
      }
    }
  };

  // Get AI response from Bytez
  const getAIResponse = async (userText: string): Promise<string> => {
    if (!BYTEZ_API_KEY) {
      return getFallbackResponse();
    }

    try {
      const response = await fetch('https://api.bytez.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${BYTEZ_API_KEY}`
        },
        body: JSON.stringify({
          model: MODEL_ID,
          messages: [
            {
              role: 'system',
              content: `You are Diyara, a sweet 2-year-old girl talking to ${profile.relation || 'someone special'}.
                       Respond in 1-2 short sentences (max 15 words total).
                       Be playful, cute, and child-like.
                       Sometimes mispronounce words adorably.
                       Show excitement and emotion!`
            },
            {
              role: 'user',
              content: userText
            }
          ],
          max_tokens: 50,
          temperature: 0.8,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || getFallbackResponse();
      
    } catch (error) {
      console.error('API Error:', error);
      return getFallbackResponse();
    }
  };

  // Stream AI response with typing effect
  const streamAIResponse = (text: string) => {
    // Create AI message
    const id = messageIdCounterRef.current++;
    currentAIMessageIdRef.current = id;
    
    // Add message with empty text
    setMessages(prev => [...prev, {
      id,
      speaker: 'ai',
      text: '',
      timestamp: new Date(),
      isFinal: false
    }]);

    // Simulate typing effect
    let currentText = '';
    const words = text.split(' ');
    let wordIndex = 0;

    const typeWord = () => {
      if (wordIndex < words.length) {
        currentText += (wordIndex > 0 ? ' ' : '') + words[wordIndex];
        setMessages(prev => prev.map(msg => 
          msg.id === id ? { ...msg, text: currentText } : msg
        ));
        wordIndex++;
        setTimeout(typeWord, 100); // Adjust speed here
      } else {
        // Finalize message and speak
        setMessages(prev => prev.map(msg => 
          msg.id === id ? { ...msg, isFinal: true } : msg
        ));
        currentAIMessageIdRef.current = null;
        speakText(text);
      }
    };

    typeWord();
  };

  // Text-to-speech with voice queue
  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    
    setSessionState('speaking');
    setIsAISpeaking(true);
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Get child-like voice
    const voices = synthRef.current.getVoices();
    const preferredVoice = voices.find(v => 
      v.name.toLowerCase().includes('child') ||
      v.name.toLowerCase().includes('female') ||
      v.name.includes('Samantha') ||
      v.name.includes('Victoria')
    );
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    // Make it sound child-like
    utterance.pitch = 1.6;
    utterance.rate = 1.0;
    utterance.volume = 1.0;
    
    utterance.onend = () => {
      setIsAISpeaking(false);
      if (sessionState !== 'idle') {
        setSessionState('listening');
        // Resume listening
        try {
          recognitionRef.current?.start();
        } catch {}
      }
    };

    utterance.onerror = () => {
      setIsAISpeaking(false);
      setSessionState('listening');
    };

    // Speak
    synthRef.current.cancel(); // Cancel any ongoing speech
    synthRef.current.speak(utterance);
  };

  // Stop all audio
  const stopAllAudio = () => {
    synthRef.current.cancel();
    speechQueueRef.current = [];
    setIsAISpeaking(false);
  };

  // Get fallback response
  const getFallbackResponse = (): string => {
    const responses = [
      "Hehe! You funny!",
      "Me love talking you!",
      "Yay yay yay!",
      "Me happy now!",
      "You best friend!",
      "Play more please!",
      "Me Diyara! Hi hi!",
      "Ooh that cool!",
      "Me think... um... yay!",
      "Wanna play game?"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  // Setup audio analyzer for visualizer
  const setupAudioAnalyzer = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;
      
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);
      
      // Monitor audio levels
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      
      const checkAudioLevel = () => {
        if (analyserRef.current && sessionState !== 'idle') {
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          setAudioLevel(average / 255);
          requestAnimationFrame(checkAudioLevel);
        }
      };
      
      checkAudioLevel();
    } catch (error) {
      console.error('Microphone access error:', error);
      setError('Microphone access required');
    }
  };

  // Toggle conversation session
  const toggleSession = async () => {
    if (sessionState !== 'idle') {
      // Stop session
      setSessionState('idle');
      setConversationStarted(false);
      stopAllAudio();
      
      // Stop recognition
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      
      // Stop audio context
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      
      // Stop mic stream
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach(track => track.stop());
        micStreamRef.current = null;
      }
      
      // Clear timers
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
      
      setAudioLevel(0);
      setCurrentTranscript('');
      currentUserMessageIdRef.current = null;
      currentAIMessageIdRef.current = null;
      isProcessingRef.current = false;
      
    } else {
      // Start session
      setError('');
      setSessionState('connecting');
      setMessages([]);
      setConversationStarted(true);
      
      await setupAudioAnalyzer();
      
      // Start recognition
      if (recognitionRef.current) {
        try {
          await recognitionRef.current.start();
          setSessionState('listening');
          
          // Greet user
          setTimeout(() => {
            const greeting = `Hi ${profile.relation || 'friend'}! Me Diyara! Wanna talk?`;
            streamAIResponse(greeting);
          }, 500);
          
        } catch (error) {
          console.error('Recognition start error:', error);
          setError('Could not start speech recognition');
          setSessionState('idle');
        }
      }
    }
  };

  // Get button display state
  const getButtonDisplay = () => {
    switch (sessionState) {
      case 'idle':
        return { text: 'Start Chat', icon: '🎙️', pulseColor: '' };
      case 'connecting':
        return { text: 'Connecting...', icon: '⏳', pulseColor: 'bg-yellow-400' };
      case 'listening':
        return { text: 'Listening...', icon: '👂', pulseColor: 'bg-green-400' };
      case 'thinking':
        return { text: 'Thinking...', icon: '🤔', pulseColor: 'bg-blue-400' };
      case 'speaking':
        return { text: 'Speaking...', icon: '🗣️', pulseColor: 'bg-purple-400' };
      default:
        return { text: 'Start Chat', icon: '🎙️', pulseColor: '' };
    }
  };

  const buttonState = getButtonDisplay();

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-slate-900 to-purple-900 p-4">
      <div className="max-w-lg mx-auto w-full flex flex-col h-full">
        
        {/* Header with Avatar */}
        <div className="text-center mb-4">
          <div className="relative inline-block">
            <div className={`text-6xl mb-2 ${isAISpeaking ? 'animate-bounce' : ''}`}>
              {profile.avatar || '👧'}
            </div>
            {sessionState !== 'idle' && (
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                <AudioVisualizer audioLevel={audioLevel} isActive={sessionState === 'listening'} />
              </div>
            )}
          </div>
          <h2 className="text-2xl font-bold text-white mt-4">
            {conversationStarted ? `Talking with Diyara` : 'Talk with Diyara'}
          </h2>
          <p className="text-sm text-purple-200">
            {sessionState === 'idle' ? 'Press button to start talking' : currentTranscript || 'Say something...'}
          </p>
        </div>

        {/* Messages Container */}
        <div className="flex-1 bg-black/20 backdrop-blur rounded-2xl p-4 mb-4 overflow-y-auto min-h-0">
          <div className="space-y-3">
            {messages.length === 0 && sessionState === 'idle' && (
              <div className="text-center text-gray-400 py-8">
                <p className="text-lg mb-2">🎤 Ready to chat!</p>
                <p className="text-sm">Press the button below and start talking</p>
              </div>
            )}
            
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.speaker === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
              >
                <div className={`flex items-start gap-2 max-w-[80%] ${
                  msg.speaker === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}>
                  <div className="flex-shrink-0 mt-1">
                    {msg.speaker === 'user' ? '🗣️' : '👧'}
                  </div>
                  <div className={`px-4 py-2 rounded-2xl ${
                    msg.speaker === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-purple-600 text-white rounded-bl-none'
                  } ${!msg.isFinal ? 'opacity-70' : ''}`}>
                    <p className="text-sm leading-relaxed">
                      {msg.text}
                      {!msg.isFinal && <span className="inline-block w-2 h-4 ml-1 bg-white/50 animate-pulse" />}
                    </p>
                    <p className="text-xs opacity-60 mt-1">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-3 mb-4">
            <p className="text-red-300 text-sm text-center">{error}</p>
          </div>
        )}

        {/* Control Button */}
        <div className="flex flex-col items-center">
          <div className="relative">
            {sessionState !== 'idle' && buttonState.pulseColor && (
              <div className={`absolute inset-0 ${buttonState.pulseColor} rounded-full animate-ping opacity-25`} />
            )}
            <button
              onClick={toggleSession}
              className={`relative w-24 h-24 rounded-full flex flex-col items-center justify-center transition-all transform hover:scale-105 active:scale-95 ${
                sessionState === 'idle'
                  ? 'bg-gradient-to-br from-purple-600 to-pink-600 shadow-lg'
                  : sessionState === 'listening'
                  ? 'bg-gradient-to-br from-green-600 to-emerald-600 shadow-green-500/50'
                  : sessionState === 'thinking'
                  ? 'bg-gradient-to-br from-blue-600 to-cyan-600 shadow-blue-500/50'
                  : sessionState === 'speaking'
                  ? 'bg-gradient-to-br from-purple-600 to-pink-600 shadow-purple-500/50'
                  : 'bg-gradient-to-br from-yellow-600 to-orange-600'
              } shadow-2xl`}
            >
              <span className="text-3xl mb-1">{buttonState.icon}</span>
              <span className="text-xs font-bold text-white">{buttonState.text}</span>
            </button>
          </div>
          
          {/* Session Status */}
          {sessionState !== 'idle' && (
            <div className="mt-4 flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                sessionState === 'listening' ? 'bg-green-400' : 
                sessionState === 'thinking' ? 'bg-blue-400' :
                sessionState === 'speaking' ? 'bg-purple-400' :
                'bg-yellow-400'
              } animate-pulse`} />
              <span className="text-xs text-white/70">
                {sessionState === 'listening' ? 'Listening to you...' :
                 sessionState === 'thinking' ? 'Processing...' :
                 sessionState === 'speaking' ? 'Diyara is talking...' :
                 'Setting up...'}
              </span>
            </div>
          )}
        </div>

        {/* CSS for animations */}
        <style jsx>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeIn {
            animation: fadeIn 0.3s ease-out;
          }
        `}</style>
      </div>
    </div>
  );
};

export default LiveTalkFeature;
