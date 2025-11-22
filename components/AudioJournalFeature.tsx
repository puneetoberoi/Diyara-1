import React, { useState, useEffect, useRef } from 'react';
import { UserProfile } from '../types';
import { supabase } from '../supabase';

interface JournalProps {
  userId: string;
  profile: UserProfile;
}

const AudioJournalFeature: React.FC<JournalProps> = ({ userId, profile }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordings, setRecordings] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    fetchJournals();
    
    // Cleanup on unmount
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [userId]);

  const fetchJournals = async () => {
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching journals:', error);
        setError("Could not load journals");
      } else if (data) {
        setRecordings(data);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError("Failed to load journals");
    }
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

      // 2. Delete from Storage (extract path correctly)
      try {
        const urlParts = audioUrl.split('/storage/v1/object/public/audio-journals/');
        if (urlParts[1]) {
          await supabase.storage.from('audio-journals').remove([urlParts[1]]);
        }
      } catch (storageErr) {
        console.log('Storage cleanup failed:', storageErr);
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
      setError("");
      
      // Check for getUserMedia support
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Your browser doesn't support audio recording");
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      streamRef.current = stream;
      
      // Determine best mime type
      let mimeType = 'audio/webm';
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
      } else if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
        mimeType = 'audio/ogg;codecs=opus';
      }
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = handleStopRecording;
      
      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        setError("Recording error occurred");
        setIsRecording(false);
      };

      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      
    } catch (err: any) {
      console.error("Error accessing microphone:", err);
      setError(err.message || "Microphone access denied.");
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Stop all tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    }
  };

  const handleStopRecording = async () => {
    const defaultTitle = title.trim() || `Journal Entry ${new Date().toLocaleDateString()}`;
    setUploading(true);
    setError("");
    
    try {
      // Create the audio blob
      const audioBlob = new Blob(audioChunksRef.current, { 
        type: mediaRecorderRef.current?.mimeType || 'audio/webm' 
      });
      
      // Check if blob is valid
      if (audioBlob.size === 0) {
        throw new Error("No audio data recorded");
      }

      const fileName = `${userId}/${Date.now()}.webm`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('audio-journals')
        .upload(fileName, audioBlob, {
          contentType: audioBlob.type,
          upsert: true
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('audio-journals')
        .getPublicUrl(fileName);

      // Save to database - REMOVED duration field
      const { error: dbError } = await supabase
        .from('journal_entries')
        .insert({
          user_id: userId,
          audio_url: publicUrl,
          title: defaultTitle,
          mood: 'Reflective'
        });

      if (dbError) {
        console.error('Database error:', dbError);
        throw new Error(`Failed to save: ${dbError.message}`);
      }

      // Reset state
      setTitle("");
      audioChunksRef.current = [];
      await fetchJournals();

    } catch (error: any) {
      console.error('Error saving journal:', error);
      setError(error.message || 'Failed to save journal.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-900 p-4 sm:p-6 overflow-y-auto pb-24 max-w-3xl mx-auto w-full">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        🎙️ Audio Journal
      </h2>

      {/* Error Display */}
      {error && (
        <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-4">
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      <div className="bg-slate-800 rounded-2xl p-6 sm:p-8 text-center border border-slate-700 mb-8 shadow-lg">
        <input 
          type="text" 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title your thought..."
          className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white mb-6 focus:outline-none focus:border-purple-500 text-center"
          disabled={isRecording || uploading}
        />

        <div className="mb-6 text-purple-200 h-6 text-sm sm:text-base">
          {uploading ? "⏳ Saving..." : isRecording ? "🔴 Recording..." : "Tap mic to record"}
        </div>

        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={uploading}
          className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center text-4xl transition-all ${
            isRecording 
              ? 'bg-red-500 animate-pulse shadow-red-500/50' 
              : uploading
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-purple-600 hover:bg-purple-500 shadow-purple-600/50'
          } shadow-xl mx-auto`}
        >
          {uploading ? '⏳' : isRecording ? '⏹️' : '🎙️'}
        </button>
      </div>

      <h3 className="text-lg font-semibold text-slate-300 mb-4">Your Thoughts</h3>
      
      <div className="space-y-3">
        {recordings.length === 0 ? (
          <p className="text-slate-500 text-center text-sm py-8">No journals yet. Record your first thought!</p>
        ) : (
          recordings.map((rec) => (
            <div key={rec.id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-white font-medium">{rec.title || "Untitled Entry"}</p>
                  <span className="text-xs text-slate-400">
                    {new Date(rec.created_at).toLocaleDateString()} at {new Date(rec.created_at).toLocaleTimeString()}
                  </span>
                </div>
                <button 
                  onClick={() => handleDelete(rec.id, rec.audio_url)} 
                  className="text-slate-500 hover:text-red-400 p-2 transition-colors"
                  title="Delete recording"
                >
                  🗑️
                </button>
              </div>
              <audio controls src={rec.audio_url} className="w-full h-8" preload="metadata" />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AudioJournalFeature;
