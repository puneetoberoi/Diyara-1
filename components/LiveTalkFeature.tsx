import React, { useState, useRef, useEffect } from 'react';
import Groq from 'groq-sdk';
import Icon from './Icons';

type SessionState = 'idle' | 'connecting' | 'listening' | 'error';
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
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const transcriptEndRef = useRef<HTMLDivElement>(null);

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

    const handleToggleSession = async () => {
        if (sessionState === 'listening') {
            // Stop recording
            setIsRecording(false);
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                mediaRecorderRef.current.stop();
            }
            setSessionState('idle');
            return;
        }
        
        setSessionState('connecting');
        setErrorMessage('');
        
        try {
            const apiKey = localStorage.getItem('GROQ_API_KEY');
            
            if (!apiKey) {
                throw new Error('No API key found');
            }

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];
            
            let turnCounter = 0;
            let currentInputId: number | null = null;

            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorderRef.current.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                
                // Convert to base64 for Groq
                const reader = new FileReader();
                reader.readAsDataURL(audioBlob);
                reader.onloadend = async () => {
                    try {
                        setSessionState('connecting');
                        
                        // Add user's audio to transcription
                        currentInputId = turnCounter++;
                        setTranscriptions(prev => [...prev, { 
                            id: currentInputId as number, 
                            speaker: 'user', 
                            text: '🎤 Processing your voice...', 
                            isFinal: false 
                        }]);

                        // Initialize Groq
                        const groq = new Groq({
                            apiKey: apiKey,
                            dangerouslyAllowBrowser: true
                        });

                        // For now, we'll use text-based chat since Groq doesn't support audio input yet
                        // This is a limitation we'll note to the user
                        setTranscriptions(prev => prev.map(t => 
                            t.id === currentInputId 
                                ? {...t, text: 'Voice input transcription coming soon! For now, please use the Chat feature for text conversations.', isFinal: true} 
                                : t
                        ));

                        stream.getTracks().forEach(track => track.stop());
                        setSessionState('idle');
                        setIsRecording(false);

                    } catch (error) {
                        console.error('Error processing audio:', error);
                        setErrorMessage('Error processing audio. Please try again.');
                        setSessionState('error');
                        stream.getTracks().forEach(track => track.stop());
                    }
                };
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
            setSessionState('listening');
            
        } catch (err) {
            console.error('Failed to start session:', err);
            setErrorMessage('Could not access microphone. Please grant permission.');
            setSessionState('error');
        }
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
        }
    };
    const buttonState = getButtonState();

    return (
        <div className="p-4 flex flex-col h-full animate-fadeIn">
            <div className="text-center">
                <h2 className="text-2xl font-brand holographic-text">Live Conversation</h2>
                <p className="text-slate-300 max-w-sm mx-auto mb-2">Press the button and start talking to Diya.</p>
                <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-3 max-w-md mx-auto mb-4">
                    <p className="text-xs text-blue-300">
                        ⚠️ Note: Voice transcription is being upgraded. For now, please use the <strong>Chat</strong> feature for conversations!
                    </p>
                </div>
            </div>

            <div className="flex-grow bg-black/20 rounded-lg p-3 my-4 overflow-y-auto min-h-0">
                <div className="space-y-3">
                    {transcriptions.map(t => (
                        <div key={t.id} className={`flex items-end gap-2 ${t.speaker === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {t.speaker === 'model' && <Icon name="sparkle" className="w-5 h-5 text-yellow-300 flex-shrink-0 mb-1" />}
                            <p className={`p-2 rounded-lg max-w-xs md:max-w-md ${t.speaker === 'user' ? 'bg-secondary text-white' : 'bg-slate-700 text-slate-200'}`}>
                                {t.text}
                            </p>
                        </div>
                    ))}
                    {sessionState === 'listening' && transcriptions.length === 0 && (
                        <p className="text-slate-400 text-center animate-pulse">Listening for your transmission...</p>
                    )}
                </div>
                <div ref={transcriptEndRef}></div>
            </div>

            <div className="flex flex-col items-center justify-center text-center">
                <div className="relative flex items-center justify-center">
                    {buttonState.pulse && (
                        <div className={`absolute w-40 h-40 ${buttonState.color} rounded-full opacity-75 animate-ping`}></div>
                    )}
                    <button
                        onClick={handleToggleSession}
                        className={`relative w-28 h-28 rounded-full text-black font-bold flex flex-col items-center justify-center gap-1 transition-all duration-300 ${buttonState.color} shadow-lg hover:scale-105 active:scale-95`}
                    >
                        <Icon name={buttonState.icon} className="w-8 h-8" />
                        <span>{buttonState.text}</span>
                    </button>
                </div>
                {errorMessage && <p className="text-red-400 mt-4">{errorMessage}</p>}
            </div>
        </div>
    );
};

export default LiveTalkFeature;
