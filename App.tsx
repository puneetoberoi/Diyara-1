import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { db } from './supabase';
import AuthScreen from './components/AuthScreen';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import GreetingScreen from './components/GreetingScreen';
import ProfileSelection from './components/ProfileSelection';
import ChatFeature from './components/ChatFeature';
import CreateFeature from './components/CreateFeature';
import { FeatureTab, UserProfile } from './types';

function App() {
  const { user, loading: authLoading, signOut } = useAuth();
  
  // State
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [showGreeting, setShowGreeting] = useState(true);
  const [activeTab, setActiveTab] = useState<FeatureTab>('galaxy');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [loadingProfiles, setLoadingProfiles] = useState(true);

  // Load user profiles from database
  useEffect(() => {
    if (user) {
      loadProfiles();
    } else {
      // No user, so no profiles to load
      setLoadingProfiles(false);
      setProfiles([]);
    }
  }, [user]);

  const loadProfiles = async () => {
    if (!user) return;
    
    setLoadingProfiles(true);
    try {
      const userProfiles = await db.getProfiles(user.id);
      
      if (userProfiles && userProfiles.length > 0) {
        // Map database profiles to UserProfile type
        const mappedProfiles: UserProfile[] = userProfiles.map(p => ({
          id: p.relation.toLowerCase(),
          name: p.name,
          relation: p.relation,
          avatar: p.avatar_url || getDefaultAvatar(p.relation),
          greeting: p.personalized_message || getDefaultGreeting(p.relation),
          topic: p.topic || getDefaultTopic(p.relation),
          topicIcon: p.topic_icon || '🌌',
        }));
        
        setProfiles(mappedProfiles);
        
        // Auto-select first profile
        setSelectedProfile(mappedProfiles[0]);
      } else {
        // No profiles yet - keep empty, ProfileSelection will handle creation
        setProfiles([]);
      }
    } catch (error) {
      console.error('Error loading profiles:', error);
    } finally {
      setLoadingProfiles(false);
    }
  };

  const handleProfileSelect = async (profile: any) => {
    if (!user) return;

    try {
      // Convert FamilyProfile to database format
      const dbProfile = {
        name: profile.name,
        relation: profile.name, // Use name as relation (Mom, Dad, etc.)
        avatar_url: profile.avatarUrl || getDefaultAvatar(profile.name),
        punjabi_name: getDefaultGreeting(profile.name),
        personalized_message: getDefaultGreeting(profile.name),
        topic: getDefaultTopic(profile.name),
        topic_icon: getDefaultTopicIcon(profile.name),
      };
      
      console.log('[App] Creating profile with data:', dbProfile);

      // Check if profile exists in database
      const existingProfiles = await db.getProfiles(user.id);
      const exists = existingProfiles?.some(p => 
        p.relation.toLowerCase() === dbProfile.relation.toLowerCase()
      );

      if (!exists) {
        // Create new profile in database
        await db.createProfile(user.id, dbProfile);
      }

      // Convert to UserProfile format for the app
      const userProfile: UserProfile = {
        id: profile.id,
        name: profile.name,
        relation: profile.name,
        avatar: getDefaultAvatar(profile.name),
        greeting: getDefaultGreeting(profile.name),
        topic: getDefaultTopic(profile.name),
        topicIcon: getDefaultTopicIcon(profile.name),
      };

      setSelectedProfile(userProfile);
      setShowGreeting(true);
    } catch (error) {
      console.error('Error selecting profile:', error);
      alert('Error creating profile. Please try again.');
    }
  };

  const handleGreetingComplete = () => {
    setShowGreeting(false);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setSelectedProfile(null);
      setProfiles([]);
      setShowGreeting(true);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Render feature based on active tab
  const renderFeature = () => {
    if (!selectedProfile || !user) return null;
  
    switch (activeTab) {
      case 'chat':
        return <ChatFeature userId={user.id} profile={selectedProfile} />;
      case 'create':
        return <CreateFeature userId={user.id} profile={selectedProfile} />;
      case 'galaxy':
        return <GalaxyView userId={user.id} profile={selectedProfile} />;
      case 'journal':
        return <AudioJournalFeature userId={user.id} profile={selectedProfile} />;
      case 'talk':
        return <LiveTalkFeature userId={user.id} profile={selectedProfile} />;
      case 'gallery':
        return <GalleryFeature userId={user.id} profile={selectedProfile} />;
      case 'garden':
        return <GardenFeature userId={user.id} profile={selectedProfile} />;
      default:
        return null;
    }
};

    // Placeholder for features not yet implemented
    const FeaturePlaceholder = ({ featureName, icon }: { featureName: string; icon: string }) => (
      <div className="min-h-full flex items-center justify-center p-8 bg-gradient-to-br from-purple-900/50 to-slate-900/50">
        <div className="max-w-md w-full text-center">
          <div className="text-8xl mb-6 animate-bounce">{icon}</div>
          <h2 className="text-3xl font-bold text-white mb-4">{featureName}</h2>
          <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-xl p-6 mb-6">
            <p className="text-yellow-300 text-lg mb-2">🚧 Coming Soon!</p>
            <p className="text-gray-300 text-sm">
              This feature is in development. Check back soon!
            </p>
          </div>
          <div className="bg-slate-800/50 border border-slate-600 rounded-xl p-4 text-left space-y-2">
            <p className="text-green-400 text-sm flex items-center gap-2">
              <span>✅</span> Chat working
            </p>
            <p className="text-green-400 text-sm flex items-center gap-2">
              <span>✅</span> Image generation working
            </p>
            <p className="text-yellow-400 text-sm flex items-center gap-2">
              <span>⏳</span> More features coming!
            </p>
          </div>
        </div>
      </div>
    );

    switch (activeTab) {
      case 'chat':
        return <ChatFeature userId={user.id} profile={selectedProfile} />;
      case 'create':
        return <CreateFeature userId={user.id} profile={selectedProfile} />;
      case 'galaxy':
        return <FeaturePlaceholder featureName="Galaxy Missions" icon="🌌" />;
      case 'journal':
        return <FeaturePlaceholder featureName="Audio Journal" icon="🎙️" />;
      case 'talk':
        return <FeaturePlaceholder featureName="Live Talk" icon="🗣️" />;
      default:
        return null;
    }
  };

  // Loading state
  if (authLoading || loadingProfiles) {
    return (
      <div className="fixed inset-0 w-screen h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading Diyara...</p>
        </div>
      </div>
    );
  }

  // Not logged in - show auth screen
  if (!user) {
    return <AuthScreen />;
  }

  // Logged in but no profile selected - show profile selection
  if (!selectedProfile) {
    return (
      <ProfileSelection
        onSelectProfile={handleProfileSelect}
        onLogout={handleLogout}
      />
    );
  }

  // Show greeting screen
  if (showGreeting) {
    return (
      <GreetingScreen
        profile={selectedProfile}
        onComplete={handleGreetingComplete}
      />
    );
  }

  // Main app
  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden">
      <Header
        userName={selectedProfile.name}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />
      
      {/* Temporary: Profile Switch Button */}
      <div className="bg-green-500/20 border-b border-green-500/50 px-4 py-2 flex items-center justify-between">
        <p className="text-green-300 text-sm">
          ✨ Phase 2 Active - Chat & Create working!
        </p>
        <button
          onClick={() => setSelectedProfile(null)}
          className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition"
        >
          Switch Profile
        </button>
      </div>

      <main key={activeTab} className="flex-1 overflow-y-auto pb-20 main-content-animate">
        {renderFeature()}
      </main>
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Settings</h2>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-slate-800 p-4 rounded-lg">
                <p className="text-gray-300 text-sm mb-2">Logged in as:</p>
                <p className="text-white font-medium">{user.email}</p>
              </div>

              <div className="bg-slate-800 p-4 rounded-lg">
                <p className="text-gray-300 text-sm mb-2">Current Profile:</p>
                <p className="text-white font-medium">{selectedProfile.name} ({selectedProfile.relation})</p>
              </div>

              <button
                onClick={() => {
                  setSelectedProfile(null);
                  setIsSettingsOpen(false);
                }}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
              >
                Switch Profile
              </button>

              <button
                onClick={handleLogout}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

// Helper functions for default values
function getDefaultAvatar(relation: string): string {
  const avatars: Record<string, string> = {
    'Mom': '👩',
    'Dad': '👨',
    'Daada Ji': '👴',
    'Daadi Ji': '👵',
    'Chachu': '👨‍🦱',
    'Chachi': '👩‍🦰',
    'Nani Ji': '👵',
    'Mamu': '👨‍🦲',
    'Mami': '👩‍🦳',
  };
  return avatars[relation] || '👤';
}

function getDefaultGreeting(relation: string): string {
  const greetings: Record<string, string> = {
    'Mom': 'Mumma ki Diyaaru 💛',
    'Dad': 'Papa ki Koochie 💙',
    'Daada Ji': 'Daadu ki Dunia 🌍',
    'Daadi Ji': 'Daadi ki Shehzadi 👑',
    'Chachu': 'Fun with Chachu Ji 🎉',
    'Chachi': 'Sweet Chachi Ji 🤗',
    'Nani Ji': 'Nani ki Cookie 🍪',
    'Mamu': "Mamu's Little Star ⭐",
    'Mami': 'Graceful Mami Ji 🌸',
  };
  return greetings[relation] || `Hello, ${relation}!`;
}

function getDefaultTopic(relation: string): string {
  const topics: Record<string, string> = {
    'Mom': 'Family & Love',
    'Dad': 'Adventures & Learning',
    'Daada Ji': 'Space & Cosmos',
    'Daadi Ji': 'Stories & Wisdom',
    'Chachu': 'Games & Fun',
    'Chachi': 'Music & Dance',
    'Nani Ji': 'Food & Recipes',
    'Mamu': 'Sports & Fitness',
    'Mami': 'Art & Creativity',
  };
  return topics[relation] || 'General Topics';
}

function getDefaultTopicIcon(relation: string): string {
  const icons: Record<string, string> = {
    'Mom': '❤️',
    'Dad': '🚀',
    'Daada Ji': '🌌',
    'Daadi Ji': '📚',
    'Chachu': '🎮',
    'Chachi': '🎵',
    'Nani Ji': '🍳',
    'Mamu': '⚽',
    'Mami': '🎨',
  };
  return icons[relation] || '✨';
}

export default App;
