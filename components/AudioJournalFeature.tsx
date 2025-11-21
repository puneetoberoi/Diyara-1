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
  const [title, setTitle] = useState("");
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    fetchJournals();
  }, [userId]);

  const fetchJournals = async () => {
    const { data } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (data) setRecordings(data);
  };

  const handleDelete = async (id: string, audioUrl: string) => {
    if (!window.confirm("Are you sure you want to delete this memory?")) return;

    try {
      // 1. Delete from DB
      const { error: dbError } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', id);
      
      if (dbError) throw dbError;

      // 2. Delete from Storage (Optional but clean)
      const path = audioUrl.split('/audio-journals/')[1];
      if (path) {
        await supabase.storage.from('audio-journals').remove([path]);
      }

      // Refresh UI
      setRecordings(prev => prev.filter(r => r.id !== id));

    } catch (error) {
      console.error("Error deleting:", error);
      alert("Could not delete entry.");
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
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
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleStopRecording = async () => {
    const defaultTitle = title.trim() || `Journal Entry ${new Date().toLocaleDateString()}`;
    setUploading(true);
    
    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    const fileName = `${userId}/${Date.now()}.webm`;

    try {
      const { error: uploadError } = await supabase.storage
        .from('audio-journals')
        .upload(fileName, audioBlob);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('audio-journals')
        .getPublicUrl(fileName);

      const { error: dbError } = await supabase
        .from('journal_entries')
        .insert({
          user_id: userId,
          audio_url: publicUrl,
          title: defaultTitle,
          mood: 'Reflective'
        });

      if (dbError) throw dbError;

      setTitle("");
      fetchJournals();

    } catch (error) {
      console.error('Error saving journal:', error);
      alert('Failed to save journal. Check DB policies.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-900 p-4 sm:p-6 overflow-y-auto pb-24 max-w-3xl mx-auto w-full">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        🎙️ Audio Journal
      </h2>

      <div className="bg-slate-800 rounded-2xl p-6 sm:p-8 text-center border border-slate-700 mb-8 shadow-lg">
        <input 
          type="text" 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title your thought..."
          className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white mb-6 focus:outline-none focus:border-purple-500 text-center"
        />

        <div className="mb-6 text-purple-200 h-6 text-sm sm:text-base">
          {isRecording ? "🔴 Recording..." : "Tap mic to record"}
        </div>

        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={uploading}
          className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center text-4xl transition-all ${
            isRecording 
              ? 'bg-red-500 animate-pulse shadow-red-500/50' 
              : 'bg-purple-600 hover:bg-purple-500 shadow-purple-600/50'
          } shadow-xl mx-auto`}
        >
          {uploading ? '⏳' : isRecording ? '⏹️' : '🎙️'}
        </button>
      </div>

      <h3 className="text-lg font-semibold text-slate-300 mb-4">Your Thoughts</h3>
      
      <div className="space-y-3">
        {recordings.length === 0 ? (
          <p className="text-slate-500 text-center text-sm py-8">No journals yet.</p>
        ) : (
          recordings.map((rec) => (
            <div key={rec.id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-white font-medium">{rec.title || "Untitled Entry"}</p>
                  <span className="text-xs text-slate-400">
                    {new Date(rec.created_at).toLocaleDateString()}
                  </span>
                </div>
                <button onClick={() => handleDelete(rec.id, rec.audio_url)} className="text-slate-500 hover:text-red-400 p-2 transition-colors">
                  🗑️
                </button>
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
