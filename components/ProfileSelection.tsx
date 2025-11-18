import React, { useState, useRef } from 'react';
import DiyaMascot from './DiyaMascot';

export interface FamilyProfile {
  id: string;
  name: string;
  avatarUrl?: string; // For uploaded photos
  color: string;
  bio: string;
  gender: 'male' | 'female';
  orbitRadius: number;
  orbitSpeed: number;
  planetSize: number;
  lastUsed?: number;
}

interface ProfileSelectionProps {
  onSelectProfile: (profile: FamilyProfile) => void;
}

const defaultProfiles: FamilyProfile[] = [
  { 
    id: 'mom', 
    name: 'Mom',
    color: 'from-pink-500 to-rose-600',
    bio: "Guiding star & wisdom 💖",
    gender: 'female',
    orbitRadius: 140,
    orbitSpeed: 50,
    planetSize: 70
  },
  { 
    id: 'dad', 
    name: 'Dad',
    color: 'from-blue-500 to-indigo-600',
    bio: "Protector & strength 💪",
    gender: 'male',
    orbitRadius: 140,
    orbitSpeed: 58,
    planetSize: 75
  },
  { 
    id: 'daadaji', 
    name: 'Daada Ji',
    color: 'from-amber-500 to-orange-600',
    bio: "Wise elder 📚",
    gender: 'male',
    orbitRadius: 200,
    orbitSpeed: 65,
    planetSize: 75
  },
  { 
    id: 'daadiji', 
    name: 'Daadi Ji',
    color: 'from-purple-500 to-pink-600',
    bio: "Sweetest blessing 🌸",
    gender: 'female',
    orbitRadius: 200,
    orbitSpeed: 72,
    planetSize: 70
  },
  { 
    id: 'chachu', 
    name: 'Chachu',
    color: 'from-teal-500 to-cyan-600',
    bio: "Fun companion 🎉",
    gender: 'male',
    orbitRadius: 260,
    orbitSpeed: 78,
    planetSize: 65
  },
  { 
    id: 'chachi', 
    name: 'Chachi',
    color: 'from-green-500 to-emerald-600',
    bio: "Gentle soul 🌺",
    gender: 'female',
    orbitRadius: 260,
    orbitSpeed: 85,
    planetSize: 65
  },
  { 
    id: 'naniji', 
    name: 'Nani Ji',
    color: 'from-yellow-500 to-amber-600',
    bio: "Sunshine guardian ☀️",
    gender: 'female',
    orbitRadius: 320,
    orbitSpeed: 92,
    planetSize: 70
  },
  { 
    id: 'mamu', 
    name: 'Mamu',
    color: 'from-indigo-500 to-purple-600',
    bio: "Playful friend 🚀",
    gender: 'male',
    orbitRadius: 320,
    orbitSpeed: 100,
    planetSize: 65
  },
  { 
    id: 'mami', 
    name: 'Mami',
    color: 'from-red-500 to-pink-600',
    bio: "Graceful inspiration 🦋",
    gender: 'female',
    orbitRadius: 380,
    orbitSpeed: 108,
    planetSize: 65
  },
];

// Simple Avatar Component - Using Emojis (Guaranteed to work!)
const SimpleAvatar: React.FC<{ profile: FamilyProfile }> = ({ profile }) => {
  // Different emojis for each person
  const avatarEmojis: Record<string, string> = {
    'mom': '👩',
    'dad': '👳‍♂️',
    'daadaji': '👴🏻',
    'daadiji': '👵🏻', 
    'chachu': '🧔',
    'chachi': '👩🏻',
    'naniji': '👵',
    'mamu': '🧔🏻',
    'mami': '👩🏻‍🦱'
  };

  const emoji = avatarEmojis[profile.id] || (profile.gender === 'male' ? '👨' : '👩');

  return (
    <div className="w-full h-full flex items-center justify-center text-6xl md:text-7xl bg-gradient-to-br from-white/10 to-transparent">
      {emoji}
    </div>
  );
};

// Photo Upload Modal Component
const PhotoUploadModal: React.FC<{
  isOpen: boolean;
  profile: FamilyProfile | null;
  onClose: () => void;
  onSave: (profileId: string, photoUrl: string) => void;
}> = ({ isOpen, profile, onClose, onSave }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  if (!isOpen || !profile) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (preview) {
      onSave(profile.id, preview);
      setPreview(null);
      onClose();
    }
  };

  const handleRemove = () => {
    onSave(profile.id, '');
    setPreview(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 md:p-8 max-w-md w-full border-2 border-white/20 shadow-2xl">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 font-brand text-center">
          {profile.name}'s Photo
        </h2>

        {/* Preview or Current Photo */}
        <div className="mb-6">
          <div className={`w-48 h-48 mx-auto rounded-full overflow-hidden border-4 bg-gradient-to-br ${profile.color} flex items-center justify-center`}>
            {preview || profile.avatarUrl ? (
              <img src={preview || profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
            ) : profile.gender === 'male' ? (
              <TurbanAvatar size={192} />
            ) : (
              <FemaleAvatar size={192} />
            )}
          </div>
        </div>

        {/* Upload Button */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="space-y-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl transition-all transform hover:scale-105 active:scale-95 shadow-lg flex items-center justify-center gap-3"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {preview || profile.avatarUrl ? 'Change Photo' : 'Add Photo'}
          </button>

          {preview && (
            <button
              onClick={handleSave}
              className="w-full py-4 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl transition-all transform hover:scale-105 active:scale-95 shadow-lg"
            >
              Save Photo
            </button>
          )}

          {profile.avatarUrl && !preview && (
            <button
              onClick={handleRemove}
              className="w-full py-3 bg-red-600/80 hover:bg-red-600 text-white font-semibold rounded-xl transition-all"
            >
              Remove Photo
            </button>
          )}

          <button
            onClick={() => {
              setPreview(null);
              onClose();
            }}
            className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl transition-all"
          >
            {preview ? 'Cancel' : 'Close'}
          </button>
        </div>

        <p className="text-gray-400 text-xs text-center mt-4">
          📸 Take a photo or choose from gallery
        </p>
      </div>
    </div>
  );
};

const ProfileSelection: React.FC<ProfileSelectionProps> = ({ onSelectProfile }) => {
  const [profiles, setProfiles] = useState<FamilyProfile[]>(() => {
    const saved = localStorage.getItem('familyProfiles');
    return saved ? JSON.parse(saved) : defaultProfiles;
  });
  const [hoveredProfile, setHoveredProfile] = useState<string | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<FamilyProfile | null>(null);
  const [editingProfile, setEditingProfile] = useState<FamilyProfile | null>(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  const saveProfiles = (updatedProfiles: FamilyProfile[]) => {
    setProfiles(updatedProfiles);
    localStorage.setItem('familyProfiles', JSON.stringify(updatedProfiles));
  };

  const handlePhotoSave = (profileId: string, photoUrl: string) => {
    const updated = profiles.map(p => 
      p.id === profileId ? { ...p, avatarUrl: photoUrl || undefined } : p
    );
    saveProfiles(updated);
  };

  const handleProfileClick = (profile: FamilyProfile) => {
    setSelectedProfile(profile);
    setTimeout(() => {
      const updatedProfile = { ...profile, lastUsed: Date.now() };
      onSelectProfile(updatedProfile);
    }, 500);
  };

  const handleProfileLongPress = (profile: FamilyProfile) => {
    setEditingProfile(profile);
    setShowPhotoModal(true);
  };

  return (
    <div className="min-h-screen max-h-screen overflow-hidden w-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 relative flex items-center justify-center">
      {/* Stars */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(100)].map((_, i) => (
          <div
            key={`star-${i}`}
            className="absolute bg-white rounded-full"
            style={{
              width: `${Math.random() * 2 + 1}px`,
              height: `${Math.random() * 2 + 1}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.7 + 0.3,
              animation: `twinkle ${2 + Math.random() * 4}s infinite ${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Title */}
      <div className="absolute top-4 md:top-8 left-0 right-0 text-center z-10 px-4">
        <h1 className="text-xl md:text-3xl lg:text-4xl font-bold font-brand text-white mb-1">
          The Orbiting Planets
        </h1>
        <p className="text-xs md:text-sm text-gray-400">
          Diyara's family universe • Long press to add photo
        </p>
      </div>

      {/* Solar System - Mobile Optimized */}
      <div className="relative w-full h-full flex items-center justify-center" style={{ minHeight: '400px' }}>
        {/* Sun - Diyara */}
        <div className="relative z-20">
          <div className="absolute inset-0 rounded-full bg-yellow-400 blur-[80px] md:blur-[100px] opacity-60 scale-[2.5] md:scale-[3]" style={{ zIndex: -1 }} />
          <div className="absolute inset-0 rounded-full bg-orange-400 blur-[60px] md:blur-[80px] opacity-50 animate-pulse scale-[2] md:scale-[2.5]" style={{ zIndex: -1 }} />
          
          <div className="relative w-32 h-32 md:w-48 md:h-48 rounded-full bg-gradient-to-br from-yellow-300 via-yellow-400 to-orange-500 flex items-center justify-center shadow-2xl border-2 border-yellow-200/30 overflow-hidden">
            <DiyaMascot className="w-full h-full object-cover scale-110" />
          </div>

          <div className="absolute -bottom-12 md:-bottom-16 left-1/2 -translate-x-1/2 text-center whitespace-nowrap">
            <p className="text-white font-bold text-base md:text-2xl font-brand drop-shadow-lg">Diyara</p>
            <p className="text-yellow-400 text-xs md:text-base">The Sun ☀️</p>
          </div>
        </div>

        {/* Orbiting Planets */}
        <div className="absolute inset-0 flex items-center justify-center">
          {profiles.map((profile, index) => {
            const angle = (index / profiles.length) * 2 * Math.PI;
            const scaleFactor = window.innerWidth < 768 ? 0.7 : 1; // Mobile scale
            const x = Math.cos(angle) * profile.orbitRadius * scaleFactor;
            const y = Math.sin(angle) * profile.orbitRadius * scaleFactor;
            const isHovered = hoveredProfile === profile.id;
            const planetSize = window.innerWidth < 768 ? profile.planetSize * 0.8 : profile.planetSize;

            return (
              <React.Fragment key={profile.id}>
                {/* Orbit ring */}
                <div
                  className="absolute top-1/2 left-1/2 rounded-full border border-purple-400/20"
                  style={{
                    width: `${profile.orbitRadius * 2 * scaleFactor}px`,
                    height: `${profile.orbitRadius * 2 * scaleFactor}px`,
                    transform: 'translate(-50%, -50%)',
                    pointerEvents: 'none',
                  }}
                />

                {/* Planet */}
                <div className="absolute top-1/2 left-1/2" style={{ transform: `translate(-50%, -50%)` }}>
                  <div
                    className="absolute"
                    style={{
                      animation: `orbit-${profile.id} ${profile.orbitSpeed}s linear infinite`,
                      transformOrigin: '0 0',
                    }}
                  >
                    <div style={{ transform: `translate(${x}px, ${y}px)` }}>
                      <div className="flex flex-col items-center gap-2">
                        <button
                          onClick={() => handleProfileClick(profile)}
                          onTouchStart={(e) => {
                            const target = e.currentTarget;
                            const timeout = setTimeout(() => {
                              handleProfileLongPress(profile);
                            }, 500);
                            (target as any)._longPressTimeout = timeout;
                          }}
                          onTouchEnd={(e) => {
                            const target = e.currentTarget;
                            clearTimeout((target as any)._longPressTimeout);
                          }}
                          onContextMenu={(e) => {
                            e.preventDefault();
                            handleProfileLongPress(profile);
                          }}
                          onMouseEnter={() => setHoveredProfile(profile.id)}
                          onMouseLeave={() => setHoveredProfile(null)}
                          className={`relative group transition-all duration-300 ${isHovered ? 'scale-125 z-30' : 'scale-100 z-10'}`}
                          style={{ padding: '20px', margin: '-20px' }}
                        >
                          <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${profile.color} blur-xl md:blur-2xl opacity-70 scale-[1.8] md:scale-[2] ${isHovered ? 'animate-pulse' : ''}`} style={{ pointerEvents: 'none' }} />
                          
                          <div
                            className={`relative rounded-full bg-gradient-to-br ${profile.color} flex items-center justify-center border-3 md:border-4 border-white/50 shadow-2xl overflow-hidden transition-all duration-300 ${isHovered ? 'border-white' : ''}`}
                            style={{ width: `${planetSize}px`, height: `${planetSize}px` }}
                          >
                            {profile.avatarUrl ? (
                              <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
                            ) : (
                              <SimpleAvatar profile={profile} />
                            )}
                          </div>

                          {isHovered && (
                            <div className="fixed top-20 md:top-24 left-1/2 -translate-x-1/2 bg-black/95 backdrop-blur-xl px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl border-2 border-white/40 whitespace-nowrap animate-fadeIn z-[100] shadow-2xl max-w-[90vw]">
                              <p className="text-white font-bold text-sm md:text-lg mb-1">{profile.name}</p>
                              <p className="text-gray-300 text-xs md:text-sm">{profile.bio}</p>
                              <p className="text-yellow-400 text-xs mt-1">Long press to add photo</p>
                            </div>
                          )}
                        </button>
                        
                        {/* Name label under planet - ALWAYS VISIBLE */}
                        <div className="text-center bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full border border-white/20">
                          <p className="text-white text-xs md:text-sm font-semibold whitespace-nowrap">
                            {profile.name}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <style key={`orbit-style-${profile.id}`}>{`
                  @keyframes orbit-${profile.id} {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                  }
                `}</style>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* New Journey Button - WORKING */}
      <div className="absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2">
        <button 
          onClick={() => {
            // Create a new profile template
            const newProfileId = `user_${Date.now()}`;
            const newProfile: FamilyProfile = {
              id: newProfileId,
              name: 'New Profile',
              color: 'from-purple-500 to-pink-500',
              bio: 'New journey begins! ✨',
              gender: 'female',
              orbitRadius: 200,
              orbitSpeed: 60,
              planetSize: 70
            };
            handleProfileClick(newProfile);
          }}
          className="px-6 md:px-8 py-3 md:py-4 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 transition-all duration-300 hover:scale-105 active:scale-95 shadow-2xl flex items-center gap-2 md:gap-3"
        >
          <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-white/20 flex items-center justify-center">
            <span className="text-lg md:text-xl text-white font-bold">+</span>
          </div>
          <span className="text-white font-semibold text-sm md:text-lg">New Journey</span>
        </button>
      </div>

      {/* Photo Upload Modal */}
      <PhotoUploadModal
        isOpen={showPhotoModal}
        profile={editingProfile}
        onClose={() => {
          setShowPhotoModal(false);
          setEditingProfile(null);
        }}
        onSave={handlePhotoSave}
      />

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translate(-50%, 10px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>
    </div>
  );
};

export default ProfileSelection;
