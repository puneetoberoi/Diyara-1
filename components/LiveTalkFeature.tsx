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

// Debug mode - set to false in production
const DEBUG_MODE = true;

const LiveTalkFeature: React.FC<LiveTalkProps> = ({ userId, profile }) => {
  // State Management
  const [sessionState, setSessionState] = useState<'idle' | 'connecting' | 'listening' | 'thinking' | 'speaking'>('idle');
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  const [error, setError] = useState('');
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  
  // Refs
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis>(window.speechSynthesis);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const messageIdCounterRef = useRef(0);
  const currentUserMessageIdRef = useRef<number | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isActiveRef = useRef(false);
  const finalTranscriptRef = useRef('');

  // Debug logging
  const debugLog = (message: string, data?: any) => {
    if (DEBUG_MODE) {
      console.log(`🎙️ [LiveTalk] ${message}`, data || '');
    }
  };

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize Speech Recognition ONCE
  useEffect(() => {
    debugLog('Initializing speech recognition...');
    
    const SpeechRecognition = (window as any).SpeechRecognition || 
                              (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      debugLog('Speech Recognition API found');
      setSpeechSupported(true);
      
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        debugLog('Recognition started');
        finalTranscriptRef.current = '';
      };

      recognition.onresult = (event: any) => {
        debugLog('Recognition result received', event.results.length);
        
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

        debugLog('Transcripts:', { final: finalTranscript, interim: interimTranscript });

        // Show current transcript
        const display = finalTranscript || interimTranscript;
        if (display.trim()) {
          setCurrentTranscript(display);
          updateUserMessage(display, !finalTranscript);
        }

        // Process final transcript
        if (finalTranscript.trim() && isActiveRef.current) {
          finalTranscriptRef.current += finalTranscript;
          
          // Clear existing timer
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
          }
          
          // Set new timer for silence detection
          silenceTimerRef.current = setTimeout(() => {
            debugLog('Silence detected, processing:', finalTranscriptRef.current);
            if (finalTranscriptRef.current.trim().length > 2 && isActiveRef.current) {
              processUserInput(finalTranscriptRef.current.trim());
              finalTranscriptRef.current = '';
            }
          }, 1500); // 1.5 second silence
        }
      };

      recognition.onerror = (event: any) => {
        debugLog('Recognition error:', event.error);
        
        if (event.error === 'not-allowed') {
          setError('Microphone permission denied. Please allow access.');
        } else if (event.error === 'no-speech') {
          // This is normal, just restart
          if (isActiveRef.current) {
            setTimeout(() => {
              if (isActiveRef.current) {
                try {
                  recognition.start();
                } catch (e) {
                  debugLog('Restart failed:', e);
                }
              }
            }, 100);
          }
        } else {
          setError(`Speech error: ${event.error}`);
        }
      };

      recognition.onend = () => {
        debugLog('Recognition ended');
        // Restart if session is still active
        if (isActiveRef.current && sessionState === 'listening') {
          setTimeout(() => {
            if (isActiveRef.current) {
              try {
                recognition.start();
                debugLog('Recognition restarted');
              } catch (e) {
                debugLog('Restart failed:', e);
              }
            }
          }, 100);
        }
      };

      recognitionRef.current = recognition;
      
    } else {
      debugLog('Speech Recognition not supported');
      setSpeechSupported(false);
      setError('Speech recognition not supported in this browser. Try Chrome or Edge.');
    }

    // Initialize voices
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        const voices = window.speechSynthesis.getVoices();
        debugLog('Voices loaded:', voices.length);
      };
    }

    return () => {
      debugLog('Cleaning up...');
      isActiveRef.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
    };
  }, []); // Empty dependency - run once

  // Update user message in real-time
  const updateUserMessage = (text: string, isInterim: boolean) => {
    if (!text.trim()) return;

    if (currentUserMessageIdRef.current === null) {
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
      setMessages(prev => prev.map(msg => 
        msg.id === currentUserMessageIdRef.current 
          ? { ...msg, text: text, isFinal: !isInterim }
          : msg
      ));
    }
  };

  // Process user input
  const processUserInput = async (userText: string) => {
    debugLog('Processing user input:', userText);
    
    if (!userText.trim() || !isActiveRef.current) return;
    
    // Stop listening temporarily
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    
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

    // Stop any ongoing speech
    synthRef.current.cancel();

    try {
      const aiResponse = await getAIResponse(userText);
      debugLog('AI Response received:', aiResponse);
      
      if (aiResponse && isActiveRef.current) {
        await streamAIResponse(aiResponse);
      }
    } catch (error) {
      debugLog('AI Error:', error);
      const fallback = getFallbackResponse();
      if (isActiveRef.current) {
        await streamAIResponse(fallback);
      }
    }
  };

  // Get AI response
  const getAIResponse = async (userText: string): Promise<string> => {
    if (!BYTEZ_API_KEY) {
      debugLog('No API key, using fallback');
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
              content: `You are Diyara, a 2-year-old girl. Reply in max 10 words. Be cute and playful.`
            },
            {
              role: 'user',
              content: userText
            }
          ],
          max_tokens: 30,
          temperature: 0.8
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || getFallbackResponse();
      
    } catch (error) {
      debugLog('API call failed:', error);
      return getFallbackResponse();
    }
  };

  // Stream AI response
  const streamAIResponse = async (text: string) => {
    return new Promise<void>((resolve) => {
      const id = messageIdCounterRef.current++;
      
      setMessages(prev => [...prev, {
        id,
        speaker: 'ai',
        text: '',
        timestamp: new Date(),
        isFinal: false
      }]);

      // Type out the response
      let currentText = '';
      const chars = text.split('');
      let charIndex = 0;

      const typeChar = () => {
        if (charIndex < chars.length && isActiveRef.current) {
          currentText += chars[charIndex];
          setMessages(prev => prev.map(msg => 
            msg.id === id ? { ...msg, text: currentText } : msg
          ));
          charIndex++;
          setTimeout(typeChar, 30);
        } else {
          // Finalize and speak
          setMessages(prev => prev.map(msg => 
            msg.id === id ? { ...msg, isFinal: true } : msg
          ));
          
          if (isActiveRef.current) {
            speakText(text);
          }
          resolve();
        }
      };

      typeChar();
    });
  };

  // Text-to-speech
  const speakText = (text: string) => {
    if (!('speechSynthesis' in window) || !isActiveRef.current) return;
    
    debugLog('Speaking:', text);
    setSessionState('speaking');
    setIsAISpeaking(true);
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    const voices = synthRef.current.getVoices();
    const preferredVoice = voices.find(v => 
      v.name.toLowerCase().includes('female') ||
      v.name.includes('Samantha')
    );
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.pitch = 1.5;
    utterance.rate = 0.95;
    utterance.volume = 1.0;
    
    utterance.onend = () => {
      debugLog('Speech ended');
      setIsAISpeaking(false);
      
      if (isActiveRef.current) {
        setSessionState('listening');
        setCurrentTranscript('');
        finalTranscriptRef.current = '';
        
        // Resume listening
        setTimeout(() => {
          if (isActiveRef.current && recognitionRef.current) {
            try {
              recognitionRef.current.start();
              debugLog('Resumed listening');
            } catch (e) {
              debugLog('Resume failed:', e);
            }
          }
        }, 100);
      }
    };

    utterance.onerror = (event) => {
      debugLog('Speech error:', event);
      setIsAISpeaking(false);
      if (isActiveRef.current) {
        setSessionState('listening');
      }
    };

    synthRef.current.cancel();
    synthRef.current.speak(utterance);
  };

  // Fallback responses
  const getFallbackResponse = (): string => {
    const responses = [
      "Hi hi! Me happy!",
      "You funny! Hehe!",
      "Me love you!",
      "Yay! Fun fun!",
      "Ooh pretty!",
      "Me Diyara!",
      "Play more!",
      "You nice!"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  // Setup audio analyzer
  const setupAudioAnalyzer = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      micStreamRef.current = stream;
      
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);
      
      // Monitor audio levels
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      
      const checkAudioLevel = () => {
        if (analyserRef.current && isActiveRef.current) {
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          setAudioLevel(average / 255);
          requestAnimationFrame(checkAudioLevel);
        }
      };
      
      checkAudioLevel();
      debugLog('Audio analyzer setup complete');
      
    } catch (error) {
      debugLog('Microphone error:', error);
      setError('Microphone access required. Please allow access and try again.');
      throw error;
    }
  };

  // Toggle session
  const toggleSession = async () => {
    if (sessionState !== 'idle') {
      // Stop session
      debugLog('Stopping session');
      
      isActiveRef.current = false;
      setSessionState('idle');
      synthRef.current.cancel();
      
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
          recognitionRef.current.abort();
        } catch {}
      }
      
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach(track => track.stop());
        micStreamRef.current = null;
      }
      
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
      
      setAudioLevel(0);
      setCurrentTranscript('');
      currentUserMessageIdRef.current = null;
      
    } else {
      // Start session
      debugLog('Starting session');
      
      if (!speechSupported) {
        setError('Speech recognition not supported. Please use Chrome or Edge browser.');
        return;
      }
      
      setError('');
      setMessages([]);
      setSessionState('connecting');
      
      try {
        await setupAudioAnalyzer();
        isActiveRef.current = true;
        
        // Start recognition
        if (recognitionRef.current) {
          try {
            await recognitionRef.current.start();
            setSessionState('listening');
            debugLog('Session started successfully');
            
            // Initial greeting
            setTimeout(() => {
              if (isActiveRef.current) {
                const greeting = `Hi ${profile.relation || 'friend'}! Me Diyara!`;
                streamAIResponse(greeting);
              }
            }, 500);
            
          } catch (error) {
            debugLog('Recognition start error:', error);
            setError('Could not start speech recognition. Please try again.');
            setSessionState('idle');
            isActiveRef.current = false;
          }
        }
      } catch (error) {
        debugLog('Setup error:', error);
        setSessionState('idle');
        isActiveRef.current = false;
      }
    }
  };

  // Manual input fallback
  const handleManualInput = () => {
    const text = prompt('Type your message to Diyara:');
    if (text && text.trim()) {
      if (!isActiveRef.current) {
        toggleSession().then(() => {
          setTimeout(() => {
            processUserInput(text);
          }, 1000);
        });
      } else {
        processUserInput(text);
      }
    }
  };

  // Button state
  const getButtonDisplay = () => {
    switch (sessionState) {
      case 'idle':
        return { text: 'Start Chat', emoji: '🎙️', color: 'from-purple-600 to-pink-600' };
      case 'connecting':
        return { text: 'Setting up...', emoji: '⏳', color: 'from-yellow-600 to-orange-600' };
      case 'listening':
        return { text: 'Listening', emoji: '👂', color: 'from-green-600 to-emerald-600' };
      case 'thinking':
        return { text: 'Thinking', emoji: '🤔', color: 'from-blue-600 to-cyan-600' };
      case 'speaking':
        return { text: 'Speaking', emoji: '💬', color: 'from-purple-600 to-pink-600' };
      default:
        return { text: 'Start', emoji: '🎙️', color: 'from-gray-600 to-gray-700' };
    }
  };

  const buttonState = getButtonDisplay();

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-slate-900 to-purple-900 p-4">
      <div className="max-w-lg mx-auto w-full flex flex-col h-full">
        
        {/* Header */}
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
          <h2 className="text-2xl font-bold text-white">Talk with Diyara</h2>
          <p className="text-sm text-purple-200 mt-1">
            {currentTranscript || (sessionState === 'idle' ? 'Press button to start' : 'Say something...')}
          </p>
        </div>

        {/* Messages */}
        <div className="flex-1 bg-black/20 backdrop-blur rounded-2xl p-4 mb-4 overflow-y-auto">
          <div className="space-y-2">
            {messages.length === 0 && (
              <div className="text-center text-gray-400 py-8">
                <p>🎤 Ready to chat!</p>
                {!speechSupported && (
                  <p className="text-yellow-400 text-sm mt-2">
                    ⚠️ Voice not supported. Use the type button below.
                  </p>
                )}
              </div>
            )}
            
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.speaker === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                  msg.speaker === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-purple-600 text-white'
                } ${!msg.isFinal ? 'opacity-70' : ''}`}>
                  <p>{msg.text}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-3 mb-4">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={handleManualInput}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            📝 Type
          </button>
          
          <button
            onClick={toggleSession}
            disabled={sessionState === 'connecting'}
            className={`relative w-20 h-20 rounded-full flex flex-col items-center justify-center bg-gradient-to-br ${buttonState.color} text-white shadow-lg transition-transform hover:scale-105 active:scale-95 disabled:opacity-50`}
          >
            <span className="text-2xl">{buttonState.emoji}</span>
            <span className="text-xs">{buttonState.text}</span>
          </button>

          {DEBUG_MODE && (
            <button
              onClick={() => console.log({
                sessionState,
                isActive: isActiveRef.current,
                recognition: recognitionRef.current,
                speechSupported,
                messages
              })}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              🐛 Debug
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveTalkFeature;
