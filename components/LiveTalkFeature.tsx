// LiveTalkFeature.tsx - FINAL VERSION (Works everywhere in 2025)

import React, { useState, useRef, useEffect } from 'react';
import { UserProfile } from '../types';

const BYTEZ_API_KEY = import.meta.env.VITE_BYTEZ_API_KEY?.trim();
const MODEL_ID = 'mistralai/Mistral-7B-Instruct-v0.1';

interface Message {
  id: number;
  speaker: 'user' | 'ai';
  text: string;
  isFinal: boolean;
}

export default function LiveTalkFeature({ profile }: { profile: UserProfile }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number>();

  // Visualizer
  useEffect(() => {
    if (!isRecording) {
      setAudioLevel(0);
      return;
    }

    const updateLevel = () => {
      if (analyserRef.current) {
        const data = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b) / data.length;
        setAudioLevel(avg / 255);
      }
      animationRef.current = requestAnimationFrame(updateLevel);
    };
    
    updateLevel();
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await transcribeAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Add initial message
      setMessages(prev => [...prev, {
        id: Date.now(),
        speaker: 'user',
        text: 'Recording...',
        isFinal: false
      }]);

    } catch (err) {
      alert('Please allow microphone access');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      streamRef.current?.getTracks().forEach(t => t.stop());
      setIsRecording(false);
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    setIsThinking(true);
    
    // Update last message to "thinking"
    setMessages(prev => prev.map((m, i) => 
      i === prev.length - 1 ? { ...m, text: 'Thinking...', isFinal: false } : m
    ));

    try {
      // Convert to base64
      const base64 = await blobToBase64(audioBlob);
      const audioBase64 = base64.split(',')[1];

      // Use Whisper via Bytez (or Hugging Face)
      const response = await fetch('https://api.bytez.com/v1/run/whisper-large-v3', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${BYTEZ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: {
            audio: audioBase64
          }
        })
      });

      const result = await response.json();
      const userText = result[0]?.generated_text || "I couldn't hear that";

      // Update user message
      setMessages(prev => prev.map((m, i) => 
        i === prev.length - 1 ? { ...m, text: userText, isFinal: true } : m
      ));

      // Get AI response
      const aiResponse = await getAIResponse(userText);
      
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        speaker: 'ai',
        text: aiResponse,
        isFinal: true
      }]);

      // Speak response
      speak(aiResponse);

    } catch (err) {
      const fallback = ["Hi hi!", "Me Diyara!", "You funny!", "Love you!"][Math.floor(Math.random() * 4)];
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        speaker: 'ai',
        text: fallback,
        isFinal: true
      }]);
      speak(fallback);
    } finally {
      setIsThinking(false);
    }
  };

  const getAIResponse = async (userText: string) => {
    if (!BYTEZ_API_KEY) return "Hehe hi!";

    try {
      const res = await fetch('https://api.bytez.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${BYTEZ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: MODEL_ID,
          messages: [
            { role: "system", content: "You are Diyara, a 2-year-old girl. Reply in 5-10 words max. Be super cute." },
            { role: "user", content: userText }
          ],
          max_tokens: 30
        })
      });

      const data = await res.json();
      return data.choices?.[0]?.message?.content || "Yay!";
    } catch {
      return "Me happy!";
    }
  };

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = speechSynthesis.getVoices();
    const childVoice = voices.find(v => 
      v.name.includes('Google') || v.name.includes('Female') || v.name.includes('Samantha')
    );
    if (childVoice) utterance.voice = childVoice;
    utterance.pitch = 1.8;
    utterance.rate = 0.9;
    speechSynthesis.speak(utterance);
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-purple-900 to-pink-900 p-6">
      <div className="max-w-2xl mx-auto w-full flex flex-col h-full">
        
        {/* Avatar */}
        <div className="text-center mb-6">
          <div className="text-8xl mb-4">{profile.avatar || '👧'}</div>
          <h1 className="text-3xl font-bold text-white">Talk to Diyara</h1>
        </div>

        {/* Messages */}
        <div className="flex-1 bg-white/10 backdrop-blur rounded-3xl p-6 mb-6 overflow-y-auto">
          <div className="space-y-4">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.speaker === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs px-5 py-3 rounded-3xl ${
                  m.speaker === 'user' ? 'bg-blue-600 text-white' : 'bg-pink-600 text-white'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Visualizer */}
        {isRecording && (
          <div className="h-20 mb-6 bg-black/30 rounded-2xl flex items-center justify-center overflow-hidden">
            <div className="flex gap-1 h-full items-end px-4">
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  className="w-3 bg-gradient-to-t from-pink-500 to-yellow-400 rounded-full transition-all duration-75"
                  style={{ height: `${Math.max(10, audioLevel * 100 + Math.random() * 30)}%` }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Record Button */}
        <button
          onTouchStart={startRecording}
          onTouchEnd={stopRecording}
          onMouseDown={startRecording}
          onMouseUp={stopRecording}
          onMouseLeave={stopRecording}
          className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center text-5xl transition-all ${
            isRecording 
              ? 'bg-red-500 animate-pulse shadow-2xl shadow-red-500/50 scale-110' 
              : 'bg-gradient-to-br from-pink-500 to-purple-600 shadow-2xl hover:scale-110'
          }`}
        >
          {isRecording ? '⏹️' : '🎙️'}
        </button>

        <p className="text-center text-white/70 mt-4 text-sm">
          {isRecording ? 'Recording... Release to send' : 'Hold to talk to Diyara'}
        </p>
      </div>
    </div>
  );
}
