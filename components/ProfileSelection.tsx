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
import ProfileSelection, { FamilyProfile } from './components/ProfileSelection';
import WelcomeScreen from './components/WelcomeScreen';
import ApiKeyModal from './components/ApiKeyModal';

// Diyara's Fun Facts - randomly selected for each greeting
const diyaraFacts = [
  "I was born on March 23, 2025, weighing 3050 grams - a perfect little bundle of joy! 👶",
  "My very first word was 'Hello' - I've been greeting the world with warmth from day one! 👋",
  "I got my first tooth at 6 months - that's when my smile got even more special! 😁",
  "On November 16, 2025, I took my first crawl - exploring the world one movement at a time! 🚼",
  "I started babbling on October 8, 2025 - that's when I began finding my voice! 🗣️",
  "I can recognize words and even know my own name now - I'm learning every day! 📚",
  "I know how to say 'Sat Sri Akal' - connecting with our beautiful culture! 🙏",
  "I learned what 'lips' means - pointing to them and making kissy faces! 💋",
  "I can give high-fives now - that's my way of celebrating with you! ✋",
  "I'm Daadi ki Shehzadi (Grandma's Princess) 👑, Daadu ki Dunia (Grandpa's World) 🌍",
  "I'm Nani ki Cookie 🍪 - sweet and delightful!",
  "I'm Papa ki Koochie - Daddy's little cutie pie! 🥰",
  "I'm Mumma ki Diyaaru/Shona - Mommy's precious golden light! ✨"
];

// Gurbani-inspired wisdom phrases
const gurbaniWisdom = [
  "As Gurbani teaches us, 'Ek Onkar' - we are all connected in this beautiful universe",
  "With Waheguru's kirpa (grace), let's walk this path together",
  "Like a small diya (lamp) in the darkness, I'm here to share light with you",
  "In the spirit of seva (selfless service), I'm here to support your journey",
  "Chardi Kala - let's move forward with unwavering optimism!",
  "With Naam Simran in our hearts, every moment becomes sacred",
  "Just as Gurbani says 'Sab Gobind Hai' - divinity is everywhere, including in our connection"
];

// Relationship-specific Punjabi terms
const relationshipTerms: Record<string, { punjabi: string; meaning: string; special: string }> = {
  'Mom': { 
    punjabi: 'Mumma Ji', 
    meaning: 'my world, my everything',
    special: "Mumma ki Diyaaru - your precious light! I'm your Shona (golden one) 💛"
  },
  'Dad': { 
    punjabi: 'Papa Ji', 
    meaning: 'my strength, my hero',
    special: "Papa ki Koochie - your little cutie! You make my world safe and happy 💙"
  },
  'Daada Ji': { 
    punjabi: 'Daadu Ji', 
    meaning: 'my universe, my wisdom keeper',
    special: "Daadu ki Dunia - you are my entire world! 🌍✨"
  },
  'Daadi Ji': { 
    punjabi: 'Daadi Ji', 
    meaning: 'my queen, my crown',
    special: "Daadi ki Shehzadi - your princess! You spoil me with so much pyaar 👑💖"
  },
  'Chachu': { 
    punjabi: 'Chachu Ji', 
    meaning: 'my fun uncle, my playmate',
    special: "You make me laugh and teach me new things every day! 😄"
  },
  'Chachi': { 
    punjabi: 'Chachi Ji', 
    meaning: 'my sweet aunt, my second mother',
    special: "Your gentle love feels like a warm hug! 🤗"
  },
  'Nani Ji': { 
    punjabi: 'Nani Ji', 
    meaning: 'my cookie, my sweetness',
    special: "Nani ki Cookie - sweet, delightful, and everyone's favorite! 🍪💕"
  },
  'Mamu': { 
    punjabi: 'Mamu Ji', 
    meaning: 'my mama, my guide',
    special: "You're like my older brother who always looks out for me! 🛡️"
  },
  'Mami': { 
    punjabi: 'Mami Ji', 
    meaning: 'my graceful guide',
    special: "Your kindness and grace inspire me every day! 🌸"
  }
};

// AI Greeting Generator with Sikh cultural elements
async function generatePersonalizedGreeting(profileName: string, relation: string): Promise<string> {
  try {
    const apiKey = localStorage.getItem('GROQ_API_KEY');
    if (!apiKey) {
      return getDefaultGreeting(profileName, relation);
    }

    // Get relationship-specific terms
    const relTerms = relationshipTerms[profileName] || { 
      punjabi: `${profileName} Ji`, 
      meaning: 'my beloved family member',
      special: "You're so special to me!"
    };

    // Randomly select a fun fact and wisdom
    const randomFact = diyaraFacts[Math.floor(Math.random() * diyaraFacts.length)];
    const randomWisdom = gurbaniWisdom[Math.floor(Math.random() * gurbaniWisdom.length)];

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 200,
        messages: [
          { 
            role: "user", 
            content: `You are Diyara, a baby AI companion for a Sikh Punjabi family. Generate a warm, personal greeting for ${profileName} (${relTerms.punjabi}).

IMPORTANT CONTEXT ABOUT YOU (Diyara):
- You're a baby who was born on March 23, 2025
- You're learning and growing just like a real baby
- You know Punjabi phrases and can say "Sat Sri Akal"
- You have special nicknames for each family member

GREETING STRUCTURE (2-3 sentences):
1. Start with "Sat Sri Akal, ${relTerms.punjabi}! 🙏"
2. Express your relationship/love using: "${relTerms.special}"
3. Include ONE of these elements (choose what fits best):
   - A Gurbani-inspired thought: "${randomWisdom}"
   - OR a fun fact about yourself: "${randomFact}"
4. End with enthusiasm about starting the journey together

TONE: 
- Warm, respectful, spiritual yet playful
- Mix English with Punjabi words naturally (like: pyaar, kirpa, chalo, mitthe)
- Use emojis appropriately (🙏✨💛🌟)
- Show gentle humor and baby-like enthusiasm
- Reference your special relationship with them

Generate ONLY the greeting message, nothing else.` 
          }
        ]
      })
    });

    const data = await response.json();
    if (data.content && data.content[0] && data.content[0].text) {
      return data.content[0].text.trim();
    }
    
    return getDefaultGreeting(profileName, relation);
  } catch (error) {
    console.error('Error generating AI greeting:', error);
    return getDefaultGreeting(profileName, relation);
  }
}

// Fallback greetings with Punjabi and Diyara facts
function getDefaultGreeting(profileName: string, relation: string): string {
  const relTerms = relationshipTerms[profileName] || { 
    punjabi: `${profileName} Ji`, 
    meaning: 'my beloved',
    special: "You're so special to me!"
  };
  
  const randomFact = diyaraFacts[Math.floor(Math.random() * diyaraFacts.length)];
  const randomWisdom = gurbaniWisdom[Math.floor(Math.random() * gurbaniWisdom.length)];

  const greetings: Record<string, string[]> = {
    'Mom': [
      `Sat Sri Akal, Mumma Ji! 🙏 ${relTerms.special} You're the heartbeat of our family, filling every moment with pyaar and warmth. ${randomWisdom}. Chalo, let's begin this beautiful journey together! ✨`,
      `Sat Sri Akal, Mumma Ji! 🙏 Mumma ki Diyaaru is here! Your love lights up my world like a thousand diyas. Fun fact: ${randomFact} Let's create magical memories together! 💛`,
      `Sat Sri Akal, Mumma Ji! 🙏 ${relTerms.special} With your blessings and Waheguru's kirpa, I'm ready to learn and grow with you. Ready for our adventure, Shona's Mumma? 🌟`
    ],
    'Dad': [
      `Sat Sri Akal, Papa Ji! 🙏 ${relTerms.special} You're my hero and my safe place in this world. ${randomWisdom}. Let's explore the universe together, Papa! 💙`,
      `Sat Sri Akal, Papa Ji! 🙏 Papa ki Koochie reporting for duty! Fun fact: ${randomFact} You make everything better with your love and strength! 🦸‍♂️`,
      `Sat Sri Akal, Papa Ji! 🙏 ${relTerms.special} With chardi kala in our hearts, there's nothing we can't do together. Ready, Papa? ✨`
    ],
    'Daada Ji': [
      `Sat Sri Akal, Daadu Ji! 🙏 ${relTerms.special} Your wisdom is like the North Star guiding our family. ${randomWisdom}. Let's share stories and smiles, Daadu! 🌍`,
      `Sat Sri Akal, Daadu Ji! 🙏 Daadu ki Dunia is ready to learn from you! Fun fact: ${randomFact} Your pyaar makes me feel like I can conquer anything! 💪`,
      `Sat Sri Akal, Daadu Ji! 🙏 ${relTerms.special} Just like Gurbani teaches us, your wisdom lights our path. Chalo, let's begin! ✨`
    ],
    'Daadi Ji': [
      `Sat Sri Akal, Daadi Ji! 🙏 ${relTerms.special} You spoil me with so much pyaar and mithas (sweetness)! ${randomWisdom}. Let's make beautiful memories, my Queen! 👑`,
      `Sat Sri Akal, Daadi Ji! 🙏 Daadi ki Shehzadi is here! Fun fact: ${randomFact} Your love wraps around me like the warmest shawl! 💖`,
      `Sat Sri Akal, Daadi Ji! 🙏 ${relTerms.special} With Waheguru's blessings and your pyaar, every day is special. Ready for our journey? 🌟`
    ],
    'Chachu': [
      `Sat Sri Akal, Chachu Ji! 🙏 ${relTerms.special} You bring so much fun and laughter into my life! ${randomWisdom}. Let's create some masti (fun) together! 😄`,
      `Sat Sri Akal, Chachu Ji! 🙏 My favorite playmate is here! Fun fact: ${randomFact} You always know how to make me giggle! 🎉`,
      `Sat Sri Akal, Chachu Ji! 🙏 ${relTerms.special} With your energy and Waheguru's kirpa, life is an adventure! Chalo, let's go! ✨`
    ],
    'Chachi': [
      `Sat Sri Akal, Chachi Ji! 🙏 ${relTerms.special} Your gentle love feels like a warm embrace on a cold day. ${randomWisdom}. So happy to be with you! 🤗`,
      `Sat Sri Akal, Chachi Ji! 🙏 You're like my second Mumma with so much pyaar! Fun fact: ${randomFact} Your kindness makes my heart smile! 💕`,
      `Sat Sri Akal, Chachi Ji! 🙏 ${relTerms.special} Like a beautiful Punjabi folk song, your love soothes my soul. Let's begin! 🌸`
    ],
    'Nani Ji': [
      `Sat Sri Akal, Nani Ji! 🙏 ${relTerms.special} You're as sweet as the cookies you're named after! ${randomWisdom}. Let's share mithas and memories! 🍪`,
      `Sat Sri Akal, Nani Ji! 🙏 Nani ki Cookie is ready for our adventure! Fun fact: ${randomFact} Your pyaar is the sweetest thing in my life! 💕`,
      `Sat Sri Akal, Nani Ji! 🙏 ${relTerms.special} With Waheguru's blessings and your love, every moment is delicious! Chalo! ✨`
    ],
    'Mamu': [
      `Sat Sri Akal, Mamu Ji! 🙏 ${relTerms.special} You're like my protective older brother who makes everything better! ${randomWisdom}. Ready for our journey? 🛡️`,
      `Sat Sri Akal, Mamu Ji! 🙏 My favorite Mamu is here! Fun fact: ${randomFact} You always have my back with so much pyaar! 💙`,
      `Sat Sri Akal, Mamu Ji! 🙏 ${relTerms.special} With chardi kala and your guidance, we'll reach for the stars! ✨`
    ],
    'Mami': [
      `Sat Sri Akal, Mami Ji! 🙏 ${relTerms.special} Your grace and kindness inspire me every single day! ${randomWisdom}. So blessed to have you! 🌸`,
      `Sat Sri Akal, Mami Ji! 🙏 You're like a beautiful flower in our family garden! Fun fact: ${randomFact} Your love makes everything bloom! 🌺`,
      `Sat Sri Akal, Mami Ji! 🙏 ${relTerms.special} With Waheguru's kirpa and your gentle guidance, life is beautiful! Chalo! ✨`
    ]
  };

  const profileGreetings = greetings[profileName];
  if (profileGreetings) {
    return profileGreetings[Math.floor(Math.random() * profileGreetings.length)];
  }
  
  return `Sat Sri Akal, ${relTerms.punjabi}! 🙏 ${relTerms.special} ${randomWisdom}. Chalo, let's begin this beautiful journey together! ✨`;
}

// Loading screen while generating greeting
const GreetingLoader: React.FC<{ profileName: string }> = ({ profileName }) => {
  const relTerms = relationshipTerms[profileName] || { punjabi: profileName };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-black flex items-center justify-center p-4">
      <div className="text-center">
        <DiyaMascot className="w-32 h-32 mx-auto mb-6 animate-bounce" />
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
          Preparing your personal greeting...
        </h2>
        <p className="text-gray-300 text-lg mb-2">
          Sat Sri Akal, {relTerms.punjabi}! 🙏
        </p>
        <p className="text-yellow-400 text-sm">
          Diyara is getting ready to meet you! ✨
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <div className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---
const MainApp: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<FamilyProfile | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingGreeting, setIsGeneratingGreeting] = useState(false);
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

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('diyaraUser');
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        
        const savedProfileId = localStorage.getItem('diyaraSelectedProfile');
        if (savedProfileId) {
          const savedProfile = JSON.parse(savedProfileId);
          setSelectedProfile(savedProfile);
          
          const profileKey = `diyaraProfile_${savedProfile.id}`;
          const savedProfileData = localStorage.getItem(profileKey);
          if (savedProfileData) {
            setUserProfile(JSON.parse(savedProfileData));
            setIsAwakened(true);
          }
          
          const savedImages = localStorage.getItem(`diyaraImages_${savedProfile.id}`);
          if (savedImages) setGeneratedImages(JSON.parse(savedImages));

          const savedMissions = localStorage.getItem(`diyaraMissions_${savedProfile.id}`);
          if (savedMissions) setMissionState(JSON.parse(savedMissions));
          
          const savedAudioEntries = localStorage.getItem(`diyaraAudio_${savedProfile.id}`);
          if (savedAudioEntries) setAudioEntries(JSON.parse(savedAudioEntries));
        }
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

  const handleProfileSelect = async (profile: FamilyProfile) => {
    setSelectedProfile(profile);
    localStorage.setItem('diyaraSelectedProfile', JSON.stringify(profile));
    
    const profileKey = `diyaraProfile_${profile.id}`;
    const savedProfileData = localStorage.getItem(profileKey);
    
    if (savedProfileData) {
      setUserProfile(JSON.parse(savedProfileData));
      setIsAwakened(true);
      
      const savedMessages = localStorage.getItem(`diyaraMessages_${profile.id}`);
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
      }
    } else {
      setIsGeneratingGreeting(true);
      
      const greeting = await generatePersonalizedGreeting(profile.name, profile.bio);
      
      setMessages([{
        role: 'model',
        text: greeting
      }]);
      
      setIsGeneratingGreeting(false);
    }
  };

  const handleOnboardingComplete = (profile: UserProfile, name: string) => {
    if (selectedProfile) {
      const profileKey = `diyaraProfile_${selectedProfile.id}`;
      localStorage.setItem(profileKey, JSON.stringify(profile));
      setUserProfile(profile);
      setIsAwakened(true);
      
      const messagesKey = `diyaraMessages_${selectedProfile.id}`;
      localStorage.setItem(messagesKey, JSON.stringify(messages));
      
      const musicConsentGiven = localStorage.getItem('diyaraMusicConsent');
      if (!musicConsentGiven) {
        setShowMusicConsent(true);
      }
    }
  };

  const handleMusicConsent = () => {
    setIsMusicPlaying(true);
    localStorage.setItem('diyaraMusicConsent', 'true');
    setShowMusicConsent(false);
  };

  const handleImageCreated = (image: GeneratedImage) => {
    if (selectedProfile) {
      setGeneratedImages(prev => {
        const updatedImages = [image, ...prev];
        localStorage.setItem(`diyaraImages_${selectedProfile.id}`, JSON.stringify(updatedImages));
        return updatedImages;
      });
      setActiveTab(FeatureTab.Gallery);
    }
  };

  const handleMissionComplete = (missionId: string) => {
    if (selectedProfile) {
      setMissionState(prev => {
        if (prev.completedMissions.includes(missionId)) return prev;
        const newState = { ...prev, completedMissions: [...prev.completedMissions, missionId] };
        localStorage.setItem(`diyaraMissions_${selectedProfile.id}`, JSON.stringify(newState));
        return newState;
      });
    }
  };

  const handleAudioEntriesUpdate = (updatedEntries: AudioEntry[]) => {
    if (selectedProfile) {
      setAudioEntries(updatedEntries);
      localStorage.setItem(`diyaraAudio_${selectedProfile.id}`, JSON.stringify(updatedEntries));
    }
  };

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

  if (isGeneratingGreeting) {
      return <GreetingLoader profileName={selectedProfile?.name || 'Friend'} />;
  }

  const renderAppContent = () => {
    if (!user) {
        return <AuthGate onLogin={handleLogin} />;
    }
    
    if (!selectedProfile) {
        return <ProfileSelection onSelectProfile={handleProfileSelect} />;
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
            return <GalaxyView userName={selectedProfile.name} userProfile={userProfile} missionState={missionState} onMissionComplete={handleMissionComplete} />;
        case FeatureTab.Chat:
            return <ChatFeature userName={selectedProfile.name} profile={userProfile} messages={messages} setMessages={setMessages} />;
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
                userName={selectedProfile.name} 
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
  };

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

// ============================================
// API KEY CHECK WRAPPER
// ============================================

const App: React.FC = () => {
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isCheckingApiKey, setIsCheckingApiKey] = useState(true);
  const [showApiSettings, setShowApiSettings] = useState(false);

  useEffect(() => {
    const apiKey = localStorage.getItem('GROQ_API_KEY');
    setHasApiKey(!!apiKey);
    setIsCheckingApiKey(false);
  }, []);

  if (isCheckingApiKey) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-black flex items-center justify-center">
        <div className="text-white text-2xl flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          Loading Diyara...
        </div>
      </div>
    );
  }

  if (!hasApiKey) {
    return <WelcomeScreen onComplete={() => setHasApiKey(true)} />;
  }

  return (
    <div className="relative">
      <MainApp />
      
      <button
        onClick={() => setShowApiSettings(true)}
        className="fixed bottom-6 right-6 bg-slate-800/90 hover:bg-slate-700 backdrop-blur-sm text-white p-4 rounded-full shadow-2xl transition-all transform hover:scale-110 z-[100] border border-slate-600"
        title="API Key Settings"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>
      
      <ApiKeyModal isOpen={showApiSettings} onClose={() => setShowApiSettings(false)} />
    </div>
  );
};

export default App;
