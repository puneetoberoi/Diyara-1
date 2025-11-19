import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { db } from './supabase';
import AuthScreen from './components/AuthScreen';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import GreetingScreen from './components/GreetingScreen';
import ProfileSelection from './components/ProfileSelection';
import ChatFeature from './components/ChatFeature';
import CreateFeature from './components/CreateFeature';
// Make sure FeatureTab is imported here
import { FeatureTab, UserProfile } from './types'; 

function App() {
  const { user, loading: authLoading, signOut } = useAuth();
  
  // State
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [showGreeting, setShowGreeting] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [loadingProfiles, setLoadingProfiles] = useState(true);
  
  // FIX 1: Initialize with the Enum, not a string
  const [activeTab, setActiveTab] = useState<FeatureTab>(FeatureTab.Galaxy);

  // Load user profiles from database
  useEffect(() => {
    if (user) {
      loadProfiles();
    } else {
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
        setSelectedProfile(mappedProfiles[0]);
      } else {
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
      const dbProfile = {
        name: profile.name,
        relation: profile.name,
        avatar_url: profile.avatarUrl || getDefaultAvatar(profile.name),
        punjabi_name: getDefaultGreeting(profile.name),
        personalized_message: getDefaultGreeting(profile.name),
        topic: getDefaultTopic(profile.name),
        topic_icon: getDefaultTopicIcon(profile.name),
      };
      
      const existingProfiles = await db.getProfiles(user.id);
      const exists = existingProfiles?.some(p => 
        p.relation.toLowerCase() === dbProfile.relation.toLowerCase()
      );

      if (!exists) {
        await db.createProfile(user.id, dbProfile);
      }

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

  const FeaturePlaceholder = ({ featureName, icon }: { featureName: string; icon: string }) => (
    <div className="min-h-full flex items-center justify-center p-8 bg-gradient-to-br from-purple-900/50 to-slate-900/50">
      <div className="max-w-md w-full text-center">
        <div className="text-8xl mb-6 animate-bounce">{icon}</div>
        <h2 className="text-3xl font-bold text-white mb-4">{featureName}</h2>
        <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-xl p-6 mb-6">
          <p className="text-yellow-300 text-lg mb-2">🚧 Coming Soon!</p>
        </div>
      </div>
    </div>
  );

  // FIX 2: Use the FeatureTab Enum in the switch statement
  const renderFeature = () => {
    if (!selectedProfile || !user) return null;

    // Debug log to verify what is happening
    console.log('Current Active Tab:', activeTab);

    switch (activeTab) {
      case FeatureTab.Chat:
        return <ChatFeature userId={user.id} profile={selectedProfile} />;
      case FeatureTab.Create:
        return <CreateFeature userId={user.id} profile={selectedProfile} />;
      case FeatureTab.Galaxy:
        return <FeaturePlaceholder featureName="Galaxy Missions" icon="🌌" />;
      case FeatureTab.AudioJournal: // Note: BottomNav used 'AudioJournal', make sure this matches
        return <FeaturePlaceholder featureName="Audio Journal" icon="🎙️" />;
      case FeatureTab.Talk:
        return <FeaturePlaceholder featureName="Live Talk" icon="🗣️" />;
      case FeatureTab.Gallery:
        return <FeaturePlaceholder featureName="Gallery" icon="🖼️" />;
      case FeatureTab.Garden:
        return <FeaturePlaceholder featureName="Garden" icon="🌻" />;
      default:
        // Fallback to catch mismatches
        console.log('Hit default case with tab:', activeTab);
        return <FeaturePlaceholder featureName="Select a Feature" icon="✨" />;
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

  if (!user) return <AuthScreen />;

  if (!selectedProfile) {
    return (
      <ProfileSelection
        onSelectProfile={handleProfileSelect}
        onLogout={handleLogout}
      />
    );
  }

  if (showGreeting) {
    return (
      <GreetingScreen
        profile={selectedProfile}
        onComplete={handleGreetingComplete}
      />
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden">
      <Header
        userName={selectedProfile.name}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />
      
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
              <button onClick={handleLogout} className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition">
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper functions remain the same...
function getDefaultAvatar(relation: string) { return '👤'; }
function getDefaultGreeting(relation: string) { return `Hello, ${relation}!`; }
function getDefaultTopic(relation: string) { return 'General Topics'; }
function getDefaultTopicIcon(relation: string) { return '✨'; }

export default App;
