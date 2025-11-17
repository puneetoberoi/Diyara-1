import React, { useState, useEffect, useRef } from 'react';
import { FeatureTab, ChatMessage, UserProfile, GeneratedImage, MissionState, AudioEntry, User, Toast } from './types';
import DiyaMascot from './components/DiyaMascot';
import AwakeningSequence from './components/AwakeningSequence';
import GalaxyView from './components/GalaxyView';
import ChatFeature from './components/ChatFeature';
import CreateFeature from './components/CreateFeature';
import GardenFeature from './components/GardenFeature';
import LiveTalkFeature from './components/LiveTalkFeature';
import GalleryFeature from './components/GalleryFeature';
import AudioJournalFeature from './components/AudioJournalFeature';
import AuthGate from './components/AuthGate';
import SettingsModal from './components/SettingsModal';
import ToastComponent from './components/Toast';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import MusicConsentModal from './components/MusicConsentModal';
import ParentDashboard from './components/ParentDashboard';


// --- MAIN APP COMPONENT ---
const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAwakened, setIsAwakened] = useState(false);
  const [activeTab, setActiveTab] = useState<FeatureTab>(FeatureTab.Galaxy);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showMusicConsent, setShowMusicConsent] = useState(false);
  const [showParentDashboard, setShowParentDashboard] = useState(false);
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [missionState, setMissionState] = useState<MissionState>({ completedMissions: [] });
  const [audioEntries, setAudioEntries] = useState<AudioEntry[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = document.getElementById('background-music') as HTMLAudioElement;
    if (audioRef.current) {
        audioRef.current.volume = 0.1;
    }
  }, []);

  // Sync audio element with isMusicPlaying state
  useEffect(() => {
    if (audioRef.current) {
        if (isMusicPlaying && audioRef.current.paused) {
            audioRef.current.play().catch(e => console.error("Audio play error", e));
        } else if (!isMusicPlaying && !audioRef.current.paused) {
            audioRef.current.pause();
        }
    }
  }, [isMusicPlaying]);
  
  const toggleMusic = () => {
      setIsMusicPlaying(prev => !prev);
  };


  // Load data from localStorage on initial mount
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('diyaraUser');
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        
        const savedProfile = localStorage.getItem('diyaraUserProfile');
        if (savedProfile) {
          setUserProfile(JSON.parse(savedProfile));
          setIsAwakened(true);
        }
        
        const savedImages = localStorage.getItem('diyaraGeneratedImages');
        if (savedImages) setGeneratedImages(JSON.parse(savedImages));

        const savedMissions = localStorage.getItem('diyaraMissionState');
        if (savedMissions) setMissionState(JSON.parse(savedMissions));
        
        const savedAudioEntries = localStorage.getItem('diyaraAudioEntries');
        if (savedAudioEntries) setAudioEntries(JSON.parse(savedAudioEntries));
      }
    } catch (error) {
        console.error("Failed to parse data from localStorage", error);
        handleReset();
    }
    setIsLoading(false);
  }, []);

  const addToast = (message: string, action?: Toast['action']) => {
    const newToast: Toast = { id: Date.now(), message, action };
    setToasts(prev => [...prev, newToast]);
  };
  
  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };


  useEffect(() => {
    document.body.classList.toggle('awakened', isAwakened);
  }, [isAwakened]);

  const handleLogin = (loggedInUser: User) => {
    localStorage.setItem('diyaraUser', JSON.stringify(loggedInUser));
    setUser(loggedInUser);
  };

  const handleOnboardingComplete = (profile: UserProfile, name: string) => {
    if(user){
        const updatedUser = {...user, name};
        setUser(updatedUser);
        localStorage.setItem('diyaraUser', JSON.stringify(updatedUser));
    }
    localStorage.setItem('diyaraUserProfile', JSON.stringify(profile));
    setUserProfile(profile);
    setIsAwakened(true);
    setMessages([{
        role: 'model',
        text: `Greetings, ${name}! I am Diyara. Our journey through the ${profile.topic} galaxy begins now. I'm ready for your first transmission!`
    }]);
    
    const musicConsentGiven = localStorage.getItem('diyaraMusicConsent');
    if (!musicConsentGiven) {
      setShowMusicConsent(true);
    }
  };

  const handleMusicConsent = () => {
    setIsMusicPlaying(true);
    localStorage.setItem('diyaraMusicConsent', 'true');
    setShowMusicConsent(false);
  };

  const handleImageCreated = (image: GeneratedImage) => {
    setGeneratedImages(prev => {
        const updatedImages = [image, ...prev];
        localStorage.setItem('diyaraGeneratedImages', JSON.stringify(updatedImages));
        return updatedImages;
    });
    setActiveTab(FeatureTab.Gallery);
  };

  const handleMissionComplete = (missionId: string) => {
    setMissionState(prev => {
        if (prev.completedMissions.includes(missionId)) return prev;
        const newState = { ...prev, completedMissions: [...prev.completedMissions, missionId] };
        localStorage.setItem('diyaraMissionState', JSON.stringify(newState));
        return newState;
    });
  };

  const handleAudioEntriesUpdate = (updatedEntries: AudioEntry[]) => {
      setAudioEntries(updatedEntries);
      localStorage.setItem('diyaraAudioEntries', JSON.stringify(updatedEntries));
  }

  const handleReset = () => {
      localStorage.clear();
      window.location.reload();
  };

  const openParentDashboard = () => {
    setIsSettingsOpen(false);
    setShowParentDashboard(true);
  };


  if (isLoading) {
      return (
        <div className="h-screen w-screen flex items-center justify-center bg-black">
            <DiyaMascot className="w-24 h-24" />
        </div>
      );
  }

  const renderAppContent = () => {
    if (!user) {
        return <AuthGate onLogin={handleLogin} />;
    }
    if (!userProfile) {
        return <AwakeningSequence onComplete={handleOnboardingComplete} />;
    }
    if (showParentDashboard) {
        return <ParentDashboard onBack={() => setShowParentDashboard(false)} />;
    }

    const renderFeature = () => {
        switch (activeTab) {
        case FeatureTab.Galaxy:
            return <GalaxyView userName={user.name} userProfile={userProfile} missionState={missionState} onMissionComplete={handleMissionComplete} />;
        case FeatureTab.Chat:
            return <ChatFeature userName={user.name} profile={userProfile} messages={messages} setMessages={setMessages} />;
        case FeatureTab.AudioJournal:
            return <AudioJournalFeature entries={audioEntries} onEntriesUpdate={handleAudioEntriesUpdate} />;
        case FeatureTab.Create:
            return <CreateFeature onImageCreated={handleImageCreated} />;
        case FeatureTab.Gallery:
            return <GalleryFeature images={generatedImages} />;
        case FeatureTab.Garden:
            return <GardenFeature missionState={missionState} />;
        case FeatureTab.Talk:
            return <LiveTalkFeature />;
        default:
            return null;
        }
    };

    return (
        <div className="h-screen w-screen flex flex-col">
            <Header 
                userName={user.name} 
                onOpenSettings={() => setIsSettingsOpen(true)}
                isMusicPlaying={isMusicPlaying}
                onToggleMusic={toggleMusic}
            />
            <main key={activeTab} className="flex-1 overflow-y-auto pb-20 main-content-animate">
                {renderFeature()}
            </main>
            <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
    );
  }

  return (
    <>
      {renderAppContent()}
      {isSettingsOpen && <SettingsModal onClose={() => setIsSettingsOpen(false)} onReset={handleReset} onOpenParentDashboard={openParentDashboard} />}
      {showMusicConsent && <MusicConsentModal onConsent={handleMusicConsent} onDismiss={() => setShowMusicConsent(false)} />}
      <div className="fixed bottom-24 right-4 z-50 flex flex-col gap-2">
        {toasts.map(toast => <ToastComponent key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />)}
      </div>
    </>
  );
};

export default App;