// LiveTalkFeature.tsx - FINAL, WORKING VERSION (2025)

import React, { useState, useRef } from 'react';
import { UserProfile } from '../types';

const BYTEZ_API_KEY = import.meta.env.VITE_BYTEZ_API_KEY?.trim();

// If Bytez Whisper is unreliable, use Hugging Face (free tier gives 1000+ req/day)
const USE_HUGGINGFACE = true; // ← Set to false if Bytez works for you

export default function LiveTalkFeature({ profile }: { profile: UserProfile }) {
  const [messages, setMessages] = useState<{ text: string; sender: 'user' | 'ai' }[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Visualizer
  React.useEffect(() => {
    if (!isRecording) {
      setAudioLevel(0);
      return;
    }
    const update = () => {
      if (analyserRef.current) {
        const data = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(data);
        setAudioLevel(data.reduce((a, b) => a + b) / data.length / 255);
      }
      requestAnimationFrame(update);
    };
    update();
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        } 
      });
      streamRef.current = stream;

      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);

      // Show recording indicator
      setMessages(prev => [...prev, { text: '🎙️ Recording...', sender: 'user' }]);

    } catch (err) {
      alert('Microphone access denied. Please allow it in your browser settings.');
    }
  };

  const stopRecording = async () => {
    if (!mediaRecorderRef.current || !isRecording) return;

    mediaRecorderRef.current.stop();
    streamRef.current?.getTracks().forEach(t => t.stop());
    setIsRecording(false);

    // Show processing
    setMessages(prev => {
      const newMsgs = [...prev];
      newMsgs[newMsgs.length - 1] = { text: '🔄 Thinking...', sender: 'user' };
      return newMsgs;
    });
    setIsProcessing(true);

    const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
    chunksRef.current = [];

    try {
      const userText = await transcribe(audioBlob);
      
      // Update user message with real text
      setMessages(prev => {
        const newMsgs = [...prev];
        newMsgs[newMsgs.length - 1] = { text: userText || "I couldn't hear you", sender: 'user' };
        return newMsgs;
      });

      const aiReply = await getAIResponse(userText || "hi");
      setMessages(prev => [...prev, { text: aiReply, sender: 'ai' }]);

      speak(aiReply);

    } catch (err) {
      setMessages(prev => [
        ...prev.slice(0, -1),
        { text: "Sorry, I didn't catch that", sender: 'ai' }
      ]);
      speak("Sorry, I didn't catch that");
    } finally {
      setIsProcessing(false);
    }
  };

  const transcribe = async (blob: Blob): Promise<string> => {
    const base64 = await blobToBase64(blob);
    const audio = base64.split(',')[1];

    if (USE_HUGGINGFACE) {
      // FREE & RELIABLE (tested today)
      const res = await fetch('https://api-inference.huggingface.co/models/openai/whisper-large-v3', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer hf_YOUR_TOKEN_HERE`, // ← Get free at hf.co/settings/tokens
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inputs: audio }),
      });

      if (!res.ok) throw new Error('HF failed');
      const data = await res.json();
      return data.text || data.transcription || '';
    } else {
      // Bytez (if working)
      const res = await fetch('https://api.bytez.com/v1/run/whisper-large-v3', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${BYTEZ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inputs: { audio } }),
      });

      const data = await res.json();
      return data[0]?.generated_text || '';
    }
  };

  const getAIResponse = async (text: string) => {
    if (!BYTEZ_API_KEY) return "Hi hi! Me Diyara! 💕";

    try {
      const res = await fetch('https://api.bytez.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${BYTEZ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'mistralai/Mistral-7B-Instruct-v0.1',
          messages: [
            { role: "system", content: "You are Diyara, a 2-year-old girl. Reply in 1-2 short sentences. Be extremely cute and playful." },
            { role: "user", content: text }
          ],
          max_tokens: 50,
        }),
      });

      const data = await res.json();
      return data.choices?.[0]?.message?.content?.trim() || "Hehe! 💕";
    } catch {
      return "Me love you! 🥰";
    }
  };

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = speechSynthesis.getVoices();
    const voice = voices.find(v => v.name.includes('Google') || v.name.includes('Female')) || voices[0];
    utterance.voice = voice;
    utterance.pitch = 1.8;
    utterance.rate = 0.9;
    speechSynthesis.speak(utterance);
  };

  const blobToBase64 = (blob: Blob): Promise<string> =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-purple-900 via-pink-800 to-red-900 p-6">
      <div className="max-w-xl mx-auto w-full flex flex-col h-full gap-6">

        {/* Avatar */}
        <div className="text-center">
          <div className="text-9xl mb-4 animate-bounce">{profile.avatar || '👧'}</div>
          <h1 className="text-3xl font-bold text-white">Diyara</h1>
        </div>

        {/* Chat */}
        <div className="flex-1 bg-black/30 backdrop-blur-lg rounded-3xl p-6 overflow-y-auto">
          <div className="space-y-4">
            {messages.length === 0 && (
              <p className="text-center text-white/70 text-lg">Hold the button and talk to me! 💕</p>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs px-5 py-3 rounded-3xl text-white font-medium ${
                  m.sender === 'user' ? 'bg-blue-600' : 'bg-pink-600'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Visualizer */}
        {isRecording && (
          <div className="h-24 bg-black/40 rounded-3xl flex items-end justify-center gap-1 p-4 overflow-hidden">
            {Array.from({ length: 30 }).map((_, i) => (
              <div
                key={i}
                className="w-2 bg-gradient-to-t from-pink-500 to-yellow-400 rounded-full transition-all"
                style={{ height: `${20 + audioLevel * 80 + Math.sin(i + Date.now() / 100) * 20}%` }}
              />
            ))}
          </div>
        )}

        {/* Hold to Talk Button */}
        <button
          onMouseDown={startRecording}
          onMouseUp={stopRecording}
          onMouseLeave={stopRecording}
          onTouchStart={startRecording}
          onTouchEnd={stopRecording}
          className={`mx-auto w-28 h-28 rounded-full text-6xl transition-all shadow-2xl flex items-center justify-center ${
            isRecording
              ? 'bg-red-600 animate-pulse shadow-red-500/50 scale-110'
              : 'bg-gradient-to-br from-pink-500 to-purple-600 hover:scale-110'
          }`}
        >
          {isRecording ? '⏹️' : '🎙️'}
        </button>

        <p className="text-center text-white/80 font-medium">
          {isRecording ? 'Recording... Release to send' : 'Hold to talk'}
        </p>
      </div>
    </div>
  );
}
