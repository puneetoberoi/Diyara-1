import React, { useState, useEffect, useRef } from 'react';
import { UserProfile } from '../types';
import { supabase } from '../supabase';

interface JournalProps {
  userId: string;
  profile: UserProfile;
}

const AudioJournalFeature: React.FC<JournalProps> = ({ userId }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordings, setRecordings] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Load previous journals
  useEffect(() => {
    fetchJournals();
  }, [userId]);

  const fetchJournals = async () => {
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (data) setRecordings(data);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = handleStopRecording;
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Microphone access denied.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Stop all tracks to release mic
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleStopRecording = async () => {
    setUploading(true);
    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    const fileName = `${userId}/${Date.now()}.webm`;

    try {
      // 1. Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('audio-journals')
        .upload(fileName, audioBlob);

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('audio-journals')
        .getPublicUrl(fileName);

      // 3. Save Metadata to DB
      const { error: dbError } = await supabase
        .from('journal_entries')
        .insert({
          user_id: userId,
          audio_url: publicUrl,
          mood: 'Reflective' // You can add a mood selector later
        });

      if (dbError) throw dbError;

      // Refresh list
      fetchJournals();

    } catch (error) {
      console.error('Error saving journal:', error);
      alert('Failed to save journal.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-900 p-6 overflow-y-auto pb-24">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        🎙️ Audio Journal
      </h2>

      {/* Recorder Card */}
      <div className="bg-slate-800 rounded-2xl p-8 text-center border border-slate-700 mb-8 shadow-lg">
        <div className="mb-6 text-purple-200">
          {isRecording ? "🔴 Recording... Speak from your heart." : "Record a message for the future."}
        </div>

        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={uploading}
          className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl transition-all ${
            isRecording 
              ? 'bg-red-500 animate-pulse shadow-red-500/50' 
              : 'bg-purple-600 hover:bg-purple-500 shadow-purple-600/50'
          } shadow-xl mx-auto`}
        >
          {uploading ? '⏳' : isRecording ? '⏹️' : '🎙️'}
        </button>
        
        {uploading && <p className="text-xs text-slate-400 mt-4">Saving to cloud...</p>}
      </div>

      {/* List of Recordings */}
      <h3 className="text-lg font-semibold text-slate-300 mb-4">Previous Entries</h3>
      
      <div className="space-y-3">
        {recordings.length === 0 ? (
          <p className="text-slate-500 text-center text-sm py-8">No journals yet.</p>
        ) : (
          recordings.map((rec) => (
            <div key={rec.id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-300">
                  {new Date(rec.created_at).toLocaleDateString()} at {new Date(rec.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                </span>
                <span className="text-xs bg-slate-700 px-2 py-1 rounded text-slate-400">
                  {rec.mood}
                </span>
              </div>
              
              <audio controls src={rec.audio_url} className="w-full h-8 rounded-lg" />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AudioJournalFeature;
