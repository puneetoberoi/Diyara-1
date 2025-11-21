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
  const [title, setTitle] = useState(""); // New State for Title
  
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
      // 1. Upload Audio
      const { error: uploadError } = await supabase.storage
        .from('audio-journals')
        .upload(fileName, audioBlob);

      if (uploadError) throw uploadError;

      // 2. Get URL
      const { data: { publicUrl } } = supabase.storage
        .from('audio-journals')
        .getPublicUrl(fileName);

      // 3. Save to DB with TITLE
      const { error: dbError } = await supabase
        .from('journal_entries')
        .insert({
          user_id: userId,
          audio_url: publicUrl,
          title: defaultTitle, // Saving the title
          mood: 'Reflective'
        });

      if (dbError) throw dbError;

      setTitle(""); // Reset title
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
        
        {/* Title Input */}
        <input 
          type="text" 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title your thought (e.g., A funny dream)..."
          className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white mb-6 focus:outline-none focus:border-purple-500 text-center"
        />

        <div className="mb-6 text-purple-200 h-6">
          {isRecording ? "🔴 Recording... Listening..." : "Tap to record"}
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
      </div>

      {/* List of Recordings */}
      <h3 className="text-lg font-semibold text-slate-300 mb-4">Your Thoughts</h3>
      
      <div className="space-y-3">
        {recordings.length === 0 ? (
          <p className="text-slate-500 text-center text-sm py-8">No journals yet.</p>
        ) : (
          recordings.map((rec) => (
            <div key={rec.id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-white font-medium">{rec.title || "Untitled Entry"}</p>
                  <span className="text-xs text-slate-400">
                    {new Date(rec.created_at).toLocaleDateString()}
                  </span>
                </div>
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
