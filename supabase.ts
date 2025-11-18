// Supabase Client - Database Connection
import { createClient } from '@supabase/supabase-js';

// Get environment variables - try multiple ways
const supabaseUrl = 
  import.meta.env?.VITE_SUPABASE_URL || 
  (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_URL) || 
  '';

const supabaseAnonKey = 
  import.meta.env?.VITE_SUPABASE_ANON_KEY || 
  (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_ANON_KEY) || 
  '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials!');
  console.log('supabaseUrl:', supabaseUrl ? 'SET' : 'MISSING');
  console.log('supabaseAnonKey:', supabaseAnonKey ? 'SET' : 'MISSING');
  console.log('import.meta.env:', import.meta.env);
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Database helper functions
export const db = {
  // Profiles
  async getProfiles(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async createProfile(userId: string, profileData: any) {
    const { data, error } = await supabase
      .from('profiles')
      .insert([{ user_id: userId, ...profileData }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateProfile(profileId: string, updates: any) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', profileId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Chat Messages
  async getChatMessages(profileId: string, limit = 100) {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('profile_id', profileId)
      .order('created_at', { ascending: true })
      .limit(limit);
    
    if (error) throw error;
    return data;
  },

  async saveChatMessage(userId: string, profileId: string, role: string, message: string) {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert([{
        user_id: userId,
        profile_id: profileId,
        role,
        message
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Generated Images
  async getImages(profileId: string) {
    const { data, error } = await supabase
      .from('generated_images')
      .select('*')
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async saveImage(userId: string, profileId: string, prompt: string, imageUrl: string) {
    const { data, error } = await supabase
      .from('generated_images')
      .insert([{
        user_id: userId,
        profile_id: profileId,
        prompt,
        image_url: imageUrl
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Missions
  async getMissions(profileId: string) {
    const { data, error } = await supabase
      .from('missions')
      .select('*')
      .eq('profile_id', profileId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async saveMission(userId: string, profileId: string, missionData: any) {
    const { data, error } = await supabase
      .from('missions')
      .upsert([{
        user_id: userId,
        profile_id: profileId,
        ...missionData
      }], {
        onConflict: 'user_id,profile_id,mission_id'
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateMission(userId: string, profileId: string, missionId: string, updates: any) {
    const { data, error } = await supabase
      .from('missions')
      .update(updates)
      .eq('user_id', userId)
      .eq('profile_id', profileId)
      .eq('mission_id', missionId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Audio Journal
  async getAudioEntries(profileId: string) {
    const { data, error } = await supabase
      .from('audio_journal')
      .select('*')
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async saveAudioEntry(userId: string, profileId: string, audioUrl: string, transcript?: string, duration?: number) {
    const { data, error } = await supabase
      .from('audio_journal')
      .insert([{
        user_id: userId,
        profile_id: profileId,
        audio_url: audioUrl,
        transcript,
        duration
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // User Preferences
  async getPreferences(userId: string, profileId: string) {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .eq('profile_id', profileId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // Ignore "not found" error
    return data;
  },

  async savePreferences(userId: string, profileId: string, preferences: any) {
    const { data, error } = await supabase
      .from('user_preferences')
      .upsert([{
        user_id: userId,
        profile_id: profileId,
        ...preferences
      }], {
        onConflict: 'user_id,profile_id'
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// Storage helper for images and audio
export const storage = {
  async uploadImage(userId: string, file: File) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('diyara-content')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) throw error;
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('diyara-content')
      .getPublicUrl(fileName);
    
    return publicUrl;
  },

  async uploadAudio(userId: string, blob: Blob) {
    const fileName = `${userId}/${Date.now()}.webm`;
    
    const { data, error } = await supabase.storage
      .from('diyara-content')
      .upload(fileName, blob, {
        cacheControl: '3600',
        upsert: false,
        contentType: 'audio/webm'
      });
    
    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from('diyara-content')
      .getPublicUrl(fileName);
    
    return publicUrl;
  }
};

export default supabase;
