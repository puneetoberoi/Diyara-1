import React, { useState, useRef, useEffect } from 'react';
import Groq from 'groq-sdk';
import Icon from './Icons';

type SessionState = 'idle' | 'connecting' | 'listening' | 'processing' | 'error';
interface Transcription {
    id: number;
    speaker: 'user' | 'model';
    text: string;
    isFinal: boolean;
}

const LiveTalkFeature: React.FC = () => {
    const [sessionState, setSessionState] = useState<SessionState>('idle');
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const transcriptEndRef = useRef<HTMLDivElement>(null);
    const turnCounterRef = useRef(0);
    const conversationHistoryRef = useRef<{role: 'user' | 'assistant', content: string}[]>([]);

    useEffect(() => {
        transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [transcriptions]);

    const cleanup = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            mediaRecorderRef.current = null;
        }
        audioChunksRef.current = [];
    };
    
    useEffect(() => {
        return () => cleanup();
    }, []);

    const playTextToSpeech = async (text: string) => {
        try {
            // Use browser's built-in speech synthesis
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 1.0;
            utterance.pitch = 1.0;
            utterance.volume = 1.0;
            window.speechSynthesis.speak(utterance);
        } catch (error) {
            console.error('Error with text-to-speech:', error);
        }
    };

    const handleToggleSession = async () => {
        if (sessionState === 'listening') {
            // Stop recording
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                mediaRecorderRef.current.stop();
            }
            return;
        }
        
        setSessionState('connecting');
        setErrorMessage('');
        
        try {
            const apiKey = localStorage.getItem('GROQ_API_KEY');
            
            if (!apiKey) {
                throw new Error('No API key found. Please set up your Groq API key.');
            }

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorderRef.current.onstop = async () => {
                setSessionState('processing');
                
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const audioFile = new File([audioBlob], "recording.webm", { type: "audio/webm" });
                
                try {
                    // Initialize Groq
                    const groq = new Groq({
                        apiKey: apiKey,
                        dangerouslyAllowBrowser: true
                    });

                    // Step 1: Add user's pending message
                    const userTranscriptId = turnCounterRef.current++;
                    setTranscriptions(prev => [...prev, { 
                        id: userTranscriptId, 
                        speaker: 'user', 
                        text: '🎤 Transcribing...', 
                        isFinal: false 
                    }]);

                    // Step 2: Transcribe audio using Groq Whisper
                    const transcription = await groq.audio.transcriptions.create({
                        file: audioFile,
                        model: "whisper-large-v3",
                        response_format: "json",
                    });

                    const userText = transcription.text;

                    // Update user transcription
                    setTranscriptions(prev => prev.map(t => 
                        t.id === userTranscriptId 
                            ? {...t, text: userText, isFinal: true} 
                            : t
                    ));

                    // Add to conversation history
                    conversationHistoryRef.current.push({
                        role: 'user',
                        content: userText
                    });

                    // Step 3: Add model's pending message
                    const modelTranscriptId = turnCounterRef.current++;
                    setTranscriptions(prev => [...prev, { 
                        id: modelTranscriptId, 
                        speaker: 'model', 
                        text: '🤔 Thinking...', 
                        isFinal: false 
                    }]);

                    // Step 4: Get AI response
                    const chatCompletion = await groq.chat.completions.create({
                        messages: [
                            {
                                role: 'system',
                                content: 'You are Diyara, a curious and helpful AI companion. Keep responses concise and conversational, as this is a voice conversation. Respond in 2-3 sentences.'
                            },
                            ...conversationHistoryRef.current
                        ],
                        model: 'llama-3.1-70b-versatile',
                        temperature: 0.7,
                        max_tokens: 150,
                    });

                    const modelText = chatCompletion.choices[0]?.message?.content || 'I\'m having trouble responding right now.';

                    // Update model transcription
                    setTranscriptions(prev => prev.map(t => 
                        t.id === modelTranscriptId 
                            ? {...t, text: modelText, isFinal: true} 
                            : t
                    ));

                    // Add to conversation history
                    conversationHistoryRef.current.push({
                        role: 'assistant',
                        content: modelText
                    });

                    // Step 5: Speak the response
                    await playTextToSpeech(modelText);

                    // Cleanup and ready for next recording
                    stream.getTracks().forEach(track => track.stop());
                    setSessionState('idle');

                } catch (error) {
                    console.error('Error processing audio:', error);
                    setErrorMessage('Error processing audio. Please try again.');
                    setSessionState('error');
                    stream.getTracks().forEach(track => track.stop());
                }
            };

            mediaRecorderRef.current.start();
            setSessionState('listening');
            
        } catch (err) {
            console.error('Failed to start session:', err);
            setErrorMessage('Could not access microphone. Please grant permission.');
            setSessionState('error');
        }
    };

    const handleClearConversation = () => {
        setTranscriptions([]);
        conversationHistoryRef.current = [];
        turnCounterRef.current = 0;
        window.speechSynthesis.cancel();
    };
    
    const getButtonState = () => {
        switch (sessionState) {
            case 'idle':
            case 'error':
                return { text: 'Talk', icon: 'talk', color: 'bg-yellow-400', pulse: false } as const;
            case 'connecting':
                return { text: 'Connecting...', icon: 'talk', color: 'bg-yellow-500', pulse: true } as const;
            case 'listening':
                return { text: 'Listening...', icon: 'sound', color: 'bg-red-500', pulse: true } as const;
            case 'processing':
                return { text: 'Processing...', icon: 'analyze', color: 'bg-blue-500', pulse: true } as const;
        }
    };
    const buttonState = getButtonState();

    return (
        <div className="p-4 flex flex-col h-full animate-fadeIn">
            <div className="text-center">
                <h2 className="text-2xl font-brand holographic-text">Live Conversation</h2>
                <p className="text-slate-300 max-w-sm mx-auto mb-2">Press Talk, speak, then press again to stop and get a response!</p>
                <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-3 max-w-md mx-auto mb-4">
                    <p className="text-xs text-green-300">
                        ✅ Powered by Groq Whisper for transcription + Llama for conversation!
                    </p>
                </div>
            </div>

            <div className="flex-grow bg-black/20 rounded-lg p-3 my-4 overflow-y-auto min-h-0">
                <div className="space-y-3">
                    {transcriptions.map(t => (
                        <div key={t.id} className={`flex items-end gap-2 ${t.speaker === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
                            {t.speaker === 'model' && <Icon name="sparkle" className="w-5 h-5 text-yellow-300 flex-shrink-0 mb-1" />}
                            <p className={`p-3 rounded-lg max-w-xs md:max-w-md ${t.speaker === 'user' ? 'bg-[#6A5ACD] text-white' : 'bg-slate-700 text-slate-200'}`}>
                                {t.text}
                            </p>
                        </div>
                    ))}
                    {sessionState === 'listening' && (
                        <p className="text-slate-400 text-center animate-pulse">🎤 Speak now...</p>
                    )}
                    {sessionState === 'processing' && (
                        <p className="text-slate-400 text-center animate-pulse">⚙️ Processing your message...</p>
                    )}
                    {transcriptions.length === 0 && sessionState === 'idle' && (
                        <p className="text-slate-400 text-center">Press Talk to start your conversation with Diyara!</p>
                    )}
                </div>
                <div ref={transcriptEndRef}></div>
            </div>

            <div className="flex flex-col items-center justify-center text-center gap-3">
                <div className="relative flex items-center justify-center">
                    {buttonState.pulse && (
                        <div className={`absolute w-40 h-40 ${buttonState.color} rounded-full opacity-75 animate-ping`}></div>
                    )}
                    <button
                        onClick={handleToggleSession}
                        disabled={sessionState === 'processing'}
                        className={`relative w-28 h-28 rounded-full text-black font-bold flex flex-col items-center justify-center gap-1 transition-all duration-300 ${buttonState.color} shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        <Icon name={buttonState.icon} className="w-8 h-8" />
                        <span className="text-sm">{buttonState.text}</span>
                    </button>
                </div>
                
                {transcriptions.length > 0 && (
                    <button
                        onClick={handleClearConversation}
                        className="text-slate-400 hover:text-white text-sm underline"
                    >
                        Clear Conversation
                    </button>
                )}
                
                {errorMessage && <p className="text-red-400">{errorMessage}</p>}
            </div>
        </div>
    );
};

export default LiveTalkFeature;
