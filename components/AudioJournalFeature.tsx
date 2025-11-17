import React, { useState, useRef, useMemo } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { AudioEntry } from '../types';
import Icon from './Icons';
import { fileToBase64 } from '../utils';

interface AudioJournalProps {
    entries: AudioEntry[];
    onEntriesUpdate: (entries: AudioEntry[]) => void;
}

type RecordingState = 'idle' | 'recording' | 'processing';

const AudioJournalFeature: React.FC<AudioJournalProps> = ({ entries, onEntriesUpdate }) => {
    const [recordingState, setRecordingState] = useState<RecordingState>('idle');
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
    const [editingText, setEditingText] = useState('');
    
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const handleStartRecording = async () => {
        if (recordingState !== 'idle') return;
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            mediaRecorderRef.current.ondataavailable = event => {
                audioChunksRef.current.push(event.data);
            };
            mediaRecorderRef.current.onstop = handleProcessRecording;
            audioChunksRef.current = [];
            mediaRecorderRef.current.start();
            setRecordingState('recording');
            setError(null);
        } catch (err) {
            console.error('Error starting recording:', err);
            setError('Could not access microphone. Please grant permission.');
        }
    };

    const handleStopRecording = () => {
        if (mediaRecorderRef.current && recordingState === 'recording') {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            setRecordingState('processing');
        }
    };

    const handleProcessRecording = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioFile = new File([audioBlob], "recording.webm", { type: "audio/webm" });

        try {
            const base64Audio = await fileToBase64(audioFile);
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            
            const prompt = "The following is a transcript of an audio journal entry. Based on the content, provide a short, fitting title (5 words or less) and the full transcript. Respond in JSON format.";

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: [
                    { parts: [{ text: prompt }] },
                    { parts: [{ inlineData: { mimeType: 'audio/webm', data: base64Audio } }] }
                ],
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            transcript: { type: Type.STRING },
                        },
                    },
                }
            });
            
            const result = JSON.parse(response.text.trim());
            const newEntry: AudioEntry = {
                id: `audio_${Date.now()}`,
                title: result.title,
                transcript: result.transcript,
                audioSrc: URL.createObjectURL(audioBlob),
                timestamp: Date.now(),
            };
            onEntriesUpdate([newEntry, ...entries]);

        } catch (err) {
            console.error("Error processing audio:", err);
            setError("AI could not process the audio. Please try again.");
        } finally {
            setRecordingState('idle');
        }
    };
    
    const handleEdit = (entry: AudioEntry) => {
        setEditingEntryId(entry.id);
        setEditingText(entry.title);
    };

    const handleSaveEdit = (entryId: string) => {
        const updatedEntries = entries.map(e => e.id === entryId ? { ...e, title: editingText } : e);
        onEntriesUpdate(updatedEntries);
        setEditingEntryId(null);
    };

    const filteredEntries = useMemo(() => {
        if (!searchQuery) return entries;
        return entries.filter(entry =>
            entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            entry.transcript.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [entries, searchQuery]);

    const getButton = () => {
        switch(recordingState) {
            case 'idle':
                return <button onClick={handleStartRecording} className="bg-yellow-400 text-black font-bold py-3 px-6 rounded-full flex items-center gap-2 hover:scale-105 transition-transform"><Icon name="talk" className="w-5 h-5"/> Record New Entry</button>
            case 'recording':
                return <button onClick={handleStopRecording} className="bg-red-500 text-white font-bold py-3 px-6 rounded-full flex items-center gap-2 animate-pulse"><Icon name="pause" className="w-5 h-5"/> Stop Recording</button>
            case 'processing':
                return <button disabled className="bg-slate-500 text-white font-bold py-3 px-6 rounded-full flex items-center gap-2 cursor-not-allowed"><Icon name="analyze" className="w-5 h-5 animate-spin"/> Processing...</button>
        }
    }

    return (
        <div className="p-4 h-full flex flex-col">
            <div className="text-center mb-6">
                <h2 className="text-3xl font-brand holographic-text">Audio Journal</h2>
                <p className="text-slate-300">Your personal space for thoughts and reflections.</p>
            </div>
            <div className="flex flex-col items-center gap-4 mb-6">
                {getButton()}
                <input
                    type="text"
                    placeholder="Search journal..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full max-w-md p-2 border border-white/20 bg-black/30 rounded-full focus:ring-2 focus:ring-[#FFD700] focus:outline-none transition text-white placeholder:text-slate-400 text-center"
                />
            </div>
            {error && <p className="text-center text-red-400 mb-4">{error}</p>}
            <div className="flex-grow overflow-y-auto space-y-3 pr-2">
                {filteredEntries.length === 0 ? (
                    <div className="text-center text-slate-400 pt-10">
                        <Icon name="journal" className="w-16 h-16 mx-auto mb-4 opacity-50"/>
                        <p>{searchQuery ? 'No entries match your search.' : 'Your audio entries will appear here.'}</p>
                    </div>
                ) : (
                    filteredEntries.map(entry => (
                        <div key={entry.id} className="bg-black/20 p-4 rounded-lg border border-white/10">
                            {editingEntryId === entry.id ? (
                                <div className="flex items-center gap-2 mb-2">
                                    <input 
                                        type="text"
                                        value={editingText}
                                        onChange={(e) => setEditingText(e.target.value)}
                                        className="flex-grow p-1 bg-slate-800 rounded text-yellow-300 font-brand text-lg"
                                        onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit(entry.id)}
                                    />
                                    <button onClick={() => handleSaveEdit(entry.id)} className="bg-green-500 text-white px-3 py-1 rounded">Save</button>
                                    <button onClick={() => setEditingEntryId(null)} className="bg-gray-500 text-white px-3 py-1 rounded">Cancel</button>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-bold text-yellow-300 font-brand text-lg">{entry.title}</h3>
                                    <button onClick={() => handleEdit(entry)} className="text-slate-400 hover:text-white"><Icon name="edit" className="w-4 h-4"/></button>
                                </div>
                            )}
                            <p className="text-xs text-slate-400 mb-2">{new Date(entry.timestamp).toLocaleString()}</p>
                            <audio src={entry.audioSrc} controls className="w-full h-10 mb-2" />
                            <details className="text-slate-300 text-sm">
                                <summary className="cursor-pointer font-semibold">View Transcript</summary>
                                <p className="pt-2 whitespace-pre-wrap">{entry.transcript}</p>
                            </details>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AudioJournalFeature;