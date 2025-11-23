import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { db, supabase } from '../supabase'; // Ensure supabase is imported for storage
import { UserProfile } from '../types';

interface ProfileSelectionProps {
  onSelectProfile: (profile: any) => void;
  onLogout: () => void;
}

const ProfileSelection: React.FC<ProfileSelectionProps> = ({ onSelectProfile, onLogout }) => {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  
  // Form State
  const [newName, setNewName] = useState('');
  const [newRelation, setNewRelation] = useState('Mom');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);

  // Load existing profiles on mount
  useEffect(() => {
    if (user) fetchProfiles();
  }, [user]);

  const fetchProfiles = async () => {
    if (!user) return;
    try {
      const data = await db.getProfiles(user.id);
      if (data) setProfiles(data);
    } catch (error) {
      console.error('Error fetching profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setPreviewUrl(URL.createObjectURL(file)); // Local preview
    }
  };

  const handleAddProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    
    setUploading(true);
    let finalAvatarUrl = "";

    try {
      // 1. Upload Image to Supabase Storage (If selected)
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${user?.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, avatarFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);
          
        finalAvatarUrl = publicUrl;
      }

      // 2. Prepare Profile Object
      const newProfile = {
        name: newName,
        relation: newRelation,
        avatarUrl: finalAvatarUrl || '👤', // Use uploaded URL or default emoji
        id: Date.now().toString() // Temporary ID until DB confirms
      };

      // 3. Pass to App.tsx (which saves to DB)
      await onSelectProfile(newProfile);

    } catch (error) {
      console.error("Error creating profile:", error);
      alert("Failed to create profile. Please try again.");
      setUploading(false);
    }
  };

  // Render Loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-black flex flex-col items-center justify-center p-6">
      
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white mb-2">Who is playing?</h1>
          <p className="text-purple-200">Select a profile to start learning</p>
        </div>

        {/* Profile Grid */}
        {!isAdding && (
          <div className="grid grid-cols-2 gap-4 mb-8">
            {profiles.map((profile) => (
              <button
                key={profile.id}
                onClick={() => onSelectProfile({
                  id: profile.relation.toLowerCase(),
                  name: profile.name,
                  relation: profile.relation,
                  avatarUrl: profile.avatar_url,
                  topic: profile.topic
                })}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 rounded-2xl p-6 flex flex-col items-center gap-3 transition-all transform hover:scale-105"
              >
                <div className="w-20 h-20 rounded-full bg-purple-600 border-4 border-white/50 flex items-center justify-center text-4xl overflow-hidden">
                  {profile.avatar_url && profile.avatar_url.startsWith('http') ? (
                    <img src={profile.avatar_url} alt={profile.name} className="w-full h-full object-cover" />
                  ) : (
                    profile.avatar_url || '👤'
                  )}
                </div>
                <span className="text-white font-bold text-lg">{profile.name}</span>
                <span className="text-purple-300 text-xs uppercase tracking-wider">{profile.relation}</span>
              </button>
            ))}

            {/* Add New Button */}
            <button
              onClick={() => setIsAdding(true)}
              className="bg-white/5 hover:bg-white/10 border-2 border-dashed border-white/20 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 transition-all"
            >
              <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-3xl text-white">
                +
              </div>
              <span className="text-slate-300 font-medium">Add New</span>
            </button>
          </div>
        )}

        {/* Add New Profile Form */}
        {isAdding && (
          <div className="bg-slate-800/80 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl animate-fadeIn">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Create Profile</h2>
            
            <form onSubmit={handleAddProfile} className="space-y-6">
              {/* Avatar Upload */}
              <div className="flex justify-center">
                <div className="relative">
                  <label className="w-24 h-24 rounded-full bg-purple-600 flex items-center justify-center border-4 border-white/50 cursor-pointer overflow-hidden hover:opacity-90 transition">
                    {previewUrl ? (
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl">📷</span>
                    )}
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleFileChange}
                    />
                  </label>
                  <div className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-md">
                    <span className="text-xs">✏️</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-purple-200 text-sm font-bold mb-2">Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-slate-900/50 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                  placeholder="e.g. Rohan"
                  required
                />
              </div>

              <div>
                <label className="block text-purple-200 text-sm font-bold mb-2">Relation</label>
                <select
                  value={newRelation}
                  onChange={(e) => setNewRelation(e.target.value)}
                  className="w-full bg-slate-900/50 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                >
                  {['Mom', 'Dad', 'Daada Ji', 'Daadi Ji', 'Nani Ji', 'Nana Ji', 'Brother', 'Sister', 'Chachu', 'Mamu'].map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="flex-1 py-3 rounded-xl bg-slate-700 text-white font-bold hover:bg-slate-600 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 py-3 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-500 transition shadow-lg shadow-purple-600/30 disabled:opacity-50"
                >
                  {uploading ? 'Saving...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="mt-12 text-center">
          <button 
            onClick={onLogout}
            className="text-slate-400 hover:text-white text-sm transition flex items-center gap-2 mx-auto"
          >
            <span>←</span> Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSelection;
