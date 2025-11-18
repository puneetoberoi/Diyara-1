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
import ApiKeySetup from './components/ApiKeySetup';
import SettingsModal from './components/SettingsModal';
import ToastComponent from './components/Toast';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import MusicConsentModal from './components/MusicConsentModal';
import ParentDashboard from './components/ParentDashboard';
import ProfileSelection, { FamilyProfile } from './components/ProfileSelection';

// Diyara's Fun Facts
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

// Gurbani-inspired wisdom
const gurbaniWisdom = [
  "As Gurbani teaches us, 'Ek Onkar' - we are all connected in this beautiful universe",
  "With Waheguru's kirpa (grace), let's walk this path together",
  "Like a small diya (lamp) in the darkness, I'm here to share light with you",
  "In the spirit of seva (selfless service), I'm here to support your journey",
  "Chardi Kala - let's move forward with unwavering optimism!",
  "With Naam Simran in our hearts, every moment becomes sacred",
  "Just as Gurbani says 'Sab Gobind Hai' - divinity is everywhere, including in our connection"
];

// Relationship-specific terms
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

// AI Greeting Generator
async function generatePersonalizedGreeting(profileName: string, relation: string): Promise<string> {
  try {
    const apiKey = localStorage.getItem('GROQ_API_KEY');
    if (!apiKey) {
      return getDefaultGreeting(profileName, relation);
    }

    const relTerms = relationshipTerms[profileName] || { 
      punjabi: `${profileName} Ji`, 
      meaning: 'my beloved family member',
      special: "You're so special to me!"
    };

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

// Fallback greetings
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
    ],
    'Dad': [
      `Sat Sri Akal, Papa Ji! 🙏 ${relTerms.special} You're my hero and my safe place in this world. ${randomWisdom}. Let's explore the universe together, Papa! 💙`,
      `Sat Sri Akal, Papa Ji! 🙏 Papa ki Koochie reporting for duty! Fun fact: ${randomFact} You make everything better with your love and strength! 🦸‍♂️`,
    ],
    'Daada Ji': [
      `Sat Sri Akal, Daadu Ji! 🙏 ${relTerms.special} Your wisdom is like the North Star guiding our family. ${randomWisdom}. Let's share stories and smiles, Daadu! 🌍`,
    ],
    'Daadi Ji': [
      `Sat Sri Akal, Daadi Ji! 🙏 ${relTerms.special} You spoil me with so much pyaar and mithas (sweetness)! Fun fact: ${randomFact} Let's make beautiful memories, my Queen! 👑`,
    ],
    'Chachu': [
      `Sat Sri Akal, Chachu Ji! 🙏 ${relTerms.special} You bring so much masti (fun) into my life! Fun fact: ${randomFact} Let's create some amazing adventures together! 🎉`,
    ],
    'Chachi': [
      `Sat Sri Akal, Chachi Ji! 🙏 ${relTerms.special} Your gentle love feels like a warm embrace. ${randomWisdom}. So happy to be with you! 🤗`,
    ],
    'Nani Ji': [
      `Sat Sri Akal, Nani Ji! 🙏 ${relTerms.special} You're as sweet as the cookies you're named after! Fun fact: ${randomFact} Let's share mithas and memories! 🍪`,
    ],
    'Mamu': [
      `Sat Sri Akal, Mamu Ji! 🙏 ${relTerms.special} You're like my protective older brother! Fun fact: ${randomFact} Ready for our journey? 🛡️`,
    ],
    'Mami': [
      `Sat Sri Akal, Mami Ji! 🙏 ${relTerms.special} Your grace and kindness inspire me every single day! ${randomWisdom}. So blessed to have you! 🌸`,
    ]
  };

  const profileGreetings = greetings[profileName];
  if (profileGreetings) {
    return profileGreetings[Math.floor(Math.random() * profileGreetings.length)];
  }
  
  return `Sat Sri Akal, ${relTerms.punjabi}! 🙏 ${relTerms.special} ${randomWisdom}. Chalo, let's begin this beautiful journey together! ✨`;
}

// Greeting Display Component
const GreetingScreen: React.FC<{ 
  profile: FamilyProfile;
  greeting: string;
  onContinue: () => void;
}> = ({ profile, greeting, onContinue }) => {
  const relTerms = relationshipTerms[profile.name] || { punjabi: profile.name };

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-gradient-to-br from-purple-900 via-slate-900 to-black flex items-center justify-center p-4">
      <div className="relative z-10 w-full max-w-2xl mx-auto flex flex-col items-center text-center">
        {/* Profile Avatar or Diyara mascot */}
        <div className="mb-6 relative">
          <div className="absolute inset-0 rounded-full bg-yellow-400 blur-3xl opacity-60 scale-150 animate-pulse" />
          <div className={`relative w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br ${profile.avatarUrl ? profile.color : 'from-yellow-300 via-yellow-400 to-orange-500'} flex items-center justify-center shadow-2xl border-4 border-yellow-200/30 overflow-hidden`}>
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
            ) : (
              <DiyaMascot className="w-full h-full object-cover scale-110" />
            )}
          </div>
        </div>

        {/* Profile name badge */}
        <div className="mb-4 px-6 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full">
          <p className="text-black font-bold text-lg sm:text-xl">
            {relTerms.punjabi}
          </p>
        </div>

        {/* Greeting */}
        <div className="bg-slate-800/50 backdrop-blur-xl border-2 border-white/20 rounded-2xl p-6 sm:p-8 mb-6 shadow-2xl">
          <p className="text-white text-lg sm:text-xl md:text-2xl leading-relaxed font-medium">
            {greeting}
          </p>
        </div>

        {/* Continue button */}
        <button
          onClick={onContinue}
          className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black font-bold text-lg rounded-xl transition-all transform hover:scale-105 active:scale-95 shadow-lg"
        >
          Continue to Setup ✨
        </button>

        {/* Fun emoji decoration */}
        <p className="text-4xl mt-6 animate-bounce">🌟</p>
      </div>
    </div>
  );
};

// Loading screen
const GreetingLoader: React.FC<{ profileName: string }> = ({ profileName }) => {
  const relTerms = relationshipTerms[profileName] || { punjabi: profileName };
  
  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-gradient-to-br from-purple-900 via-slate-900 to-black flex items-center justify-center p-4">
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

// API Key Setup Modal (will be created in next chunk)
const ApiKeySetup: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [apiKey, setApiKey] = useState('');

  const handleSubmit = () => {
    if (apiKey.trim()) {
      localStorage.setItem('GROQ_API_KEY', apiKey.trim());
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-gradient-to-br from-purple-900 via-slate-900 to-black flex items-center justify-center p-4">
      <div className="relative z-10 w-full max-w-md mx-auto bg-slate-800/90 backdrop-blur-xl border-2 border-white/20 rounded-2xl p-6 sm:p-8 shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-4 text-center">API Key Setup</h2>
        <input
          type="text"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Enter Groq API Key"
          className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white mb-4"
        />
        <button
          onClick={handleSubmit}
          className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded-lg"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

// Main App Component
const MainApp: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<FamilyProfile | null>(null);
  const [showGreeting, setShowGreeting] = useState(false);
  const [greeting, setGreeting] = useState('');
  const [isGeneratingGreeting, setIsGeneratingGreeting] = useState(false);
  const [showApiSetup, setShowApiSetup] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
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
      // Returning user - load their data
      setUserProfile(JSON.parse(savedProfileData));
      setIsAwakened(true);
      
      const savedMessages = localStorage.getItem(`diyaraMessages_${profile.id}`);
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
      }
      
      const savedImages = localStorage.getItem(`diyaraImages_${profile.id}`);
      if (savedImages) setGeneratedImages(JSON.parse(savedImages));

      const savedMissions = localStorage.getItem(`diyaraMissions_${profile.id}`);
      if (savedMissions) setMissionState(JSON.parse(savedMissions));
      
      const savedAudioEntries = localStorage.getItem(`diyaraAudio_${profile.id}`);
      if (savedAudioEntries) setAudioEntries(JSON.parse(savedAudioEntries));
    } else {
      // New user - generate greeting
      setIsGeneratingGreeting(true);
      
      const generatedGreeting = await generatePersonalizedGreeting(profile.name, profile.bio);
      setGreeting(generatedGreeting);
      
      setMessages([{
        role: 'model',
        text: generatedGreeting
      }]);
      
      setIsGeneratingGreeting(false);
      setShowGreeting(true);
    }
  };

  const handleGreetingContinue = () => {
    setShowGreeting(false);
    
    // Check if API key exists
    const hasApiKey = localStorage.getItem('GROQ_API_KEY');
    if (!hasApiKey) {
      setShowApiSetup(true);
    } else {
      // Go to onboarding
      // AwakeningSequence will show automatically
    }
  };

  const handleApiSetupComplete = () => {
    setShowApiSetup(false);
    // Now go to AwakeningSequence
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

  // RENDER LOGIC - NEW FLOW
  
  // 1. Access Code Gate
  if (!user) {
    return <AuthGate onLogin={handleLogin} />;
  }

  // 2. Profile Selection
  if (!selectedProfile) {
    return <ProfileSelection onSelectProfile={handleProfileSelect} />;
  }

  // 3. Generating Greeting
  if (isGeneratingGreeting) {
    return <GreetingLoader profileName={selectedProfile.name} />;
  }

  // 4. Show Greeting
  if (showGreeting) {
    return <GreetingScreen profile={selectedProfile} greeting={greeting} onContinue={handleGreetingContinue} />;
  }

  // 5. API Key Setup (if needed)
  if (showApiSetup) {
    return <ApiKeySetup onComplete={handleApiSetupComplete} />;
  }

  // 6. Onboarding (AwakeningSequence)
  if (!userProfile) {
    return <AwakeningSequence onComplete={handleOnboardingComplete} profileName={selectedProfile.name} />;
  }

  // 7. Parent Dashboard
  if (showParentDashboard) {
    return <ParentDashboard onBack={() => setShowParentDashboard(false)} />;
  }

  // 8. Main App
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
    <>
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
      
      {isSettingsOpen && <SettingsModal onClose={() => setIsSettingsOpen(false)} onReset={handleReset} onOpenParentDashboard={openParentDashboard} />}
      {showMusicConsent && <MusicConsentModal onConsent={handleMusicConsent} onDismiss={() => setShowMusicConsent(false)} />}
      
      <div className="fixed bottom-24 right-4 z-50 flex flex-col gap-2">
        {toasts.map(toast => <ToastComponent key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />)}
      </div>
    </>
  );
};

export default MainApp;
