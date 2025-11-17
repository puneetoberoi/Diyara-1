import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';
import Icon from './Icons';
import { encode, decode, decodeAudioData } from '../utils';

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
    const sessionRef = useRef<Promise<any> | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const transcriptEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [transcriptions]);

    const cleanup = () => {
        if (sessionRef.current) {
            sessionRef.current.then(session => session.close());
            sessionRef.current = null;
        }
        if (scriptProcessorRef.current) {
            scriptProcessorRef.current.disconnect();
            scriptProcessorRef.current = null;
        }
        if (mediaStreamSourceRef.current) {
            mediaStreamSourceRef.current.disconnect();
            mediaStreamSourceRef.current = null;
        }
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
         if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
            outputAudioContextRef.current.close();
            outputAudioContextRef.current = null;
        }
    };
    
    useEffect(() => {
        return () => cleanup();
    }, []);

    const handleToggleSession = async () => {
        if (sessionState === 'listening' || sessionState === 'connecting') {
            setSessionState('idle');
            cleanup();
            return;
        }
        
        setSessionState('connecting');
        setErrorMessage('');
        setTranscriptions([]);
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            audioContextRef.current = inputAudioContext;

            const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            outputAudioContextRef.current = outputAudioContext;
            let nextStartTime = 0;
            const sources = new Set<AudioBufferSourceNode>();
            
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

            let turnCounter = 0;
            let currentInputId: number | null = null;
            let currentOutputId: number | null = null;
            
            const sessionPromise = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: () => {
                        const source = inputAudioContext.createMediaStreamSource(stream);
                        mediaStreamSourceRef.current = source;
                        const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
                        scriptProcessorRef.current = scriptProcessor;

                        scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            const l = inputData.length;
                            const int16 = new Int16Array(l);
                            for (let i = 0; i < l; i++) {
                              int16[i] = inputData[i] * 32767;
                            }
                            const pcmBlob: Blob = {
                                data: encode(new Uint8Array(int16.buffer)),
                                mimeType: 'audio/pcm;rate=16000',
                            };
                            sessionPromise.then((session) => {
                                session.sendRealtimeInput({ media: pcmBlob });
                            });
                        };
                        source.connect(scriptProcessor);
                        scriptProcessor.connect(inputAudioContext.destination);
                        setSessionState('listening');
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        // Handle Transcription
                        if (message.serverContent?.inputTranscription) {
                            const { text } = message.serverContent.inputTranscription;
                            if (currentInputId === null) {
                                currentInputId = turnCounter++;
                                setTranscriptions(prev => [...prev, { id: currentInputId as number, speaker: 'user', text, isFinal: false }]);
                            } else {
                                setTranscriptions(prev => prev.map(t => t.id === currentInputId ? {...t, text: t.text + text} : t));
                            }
                        }
                         if (message.serverContent?.outputTranscription) {
                            const { text } = message.serverContent.outputTranscription;
                            if (currentOutputId === null) {
                                currentOutputId = turnCounter++;
                                setTranscriptions(prev => [...prev, { id: currentOutputId as number, speaker: 'model', text, isFinal: false }]);
                            } else {
                                setTranscriptions(prev => prev.map(t => t.id === currentOutputId ? {...t, text: t.text + text} : t));
                            }
                        }
                        if (message.serverContent?.turnComplete) {
                            if (currentInputId !== null) {
                                setTranscriptions(prev => prev.map(t => t.id === currentInputId ? {...t, isFinal: true} : t));
                                currentInputId = null;
                            }
                             if (currentOutputId !== null) {
                                setTranscriptions(prev => prev.map(t => t.id === currentOutputId ? {...t, isFinal: true} : t));
                                currentOutputId = null;
                            }
                        }

                        // Handle Audio
                        const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                        if (base64Audio && outputAudioContextRef.current) {
                            nextStartTime = Math.max(nextStartTime, outputAudioContextRef.current.currentTime);
                            const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContextRef.current, 24000, 1);
                            const source = outputAudioContextRef.current.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(outputAudioContextRef.current.destination);
                            source.addEventListener('ended', () => sources.delete(source));
                            source.start(nextStartTime);
                            nextStartTime += audioBuffer.duration;
                            sources.add(source);
                        }
                        const interrupted = message.serverContent?.interrupted;
                        if (interrupted) {
                            for (const source of sources.values()) {
                                source.stop();
                                sources.delete(source);
                            }
                            nextStartTime = 0;
                        }
                    },
                    onerror: (e: ErrorEvent) => {
                        console.error('Session error:', e);
                        setErrorMessage('A connection error occurred.');
                        setSessionState('error');
                        cleanup();
                    },
                    onclose: () => {
                       // Handled by the toggle button
                    },
                },
                 config: {
                    responseModalities: [Modality.AUDIO],
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                 }
            });
            sessionRef.current = sessionPromise;

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
                <p className="text-slate-300 max-w-sm mx-auto mb-4">Press the button and start talking to Diya.</p>
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