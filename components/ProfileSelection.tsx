import React, { useState, useRef, useEffect } from 'react';
import DiyaMascot from './DiyaMascot';

export interface FamilyProfile {
  id: string;
  name: string;
  avatarUrl?: string;
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
    planetSize: 60
  },
  { 
    id: 'dad', 
    name: 'Dad',
    color: 'from-blue-500 to-indigo-600',
    bio: "Protector & strength 💪",
    gender: 'male',
    orbitRadius: 140,
    orbitSpeed: 58,
    planetSize: 62
  },
  { 
    id: 'daadaji', 
    name: 'Daada Ji',
    color: 'from-amber-500 to-orange-600',
    bio: "Wise elder 📚",
    gender: 'male',
    orbitRadius: 190,
    orbitSpeed: 65,
    planetSize: 60
  },
  { 
    id: 'daadiji', 
    name: 'Daadi Ji',
    color: 'from-purple-500 to-pink-600',
    bio: "Sweetest blessing 🌸",
    gender: 'female',
    orbitRadius: 190,
    orbitSpeed: 72,
    planetSize: 58
  },
  { 
    id: 'chachu', 
    name: 'Chachu',
    color: 'from-teal-500 to-cyan-600',
    bio: "Fun companion 🎉",
    gender: 'male',
    orbitRadius: 240,
    orbitSpeed: 78,
    planetSize: 56
  },
  { 
    id: 'chachi', 
    name: 'Chachi',
    color: 'from-green-500 to-emerald-600',
    bio: "Gentle soul 🌺",
    gender: 'female',
    orbitRadius: 240,
    orbitSpeed: 85,
    planetSize: 56
  },
  { 
    id: 'naniji', 
    name: 'Nani Ji',
    color: 'from-yellow-500 to-amber-600',
    bio: "Sunshine guardian ☀️",
    gender: 'female',
    orbitRadius: 290,
    orbitSpeed: 92,
    planetSize: 58
  },
  { 
    id: 'mamu', 
    name: 'Mamu',
    color: 'from-indigo-500 to-purple-600',
    bio: "Playful friend 🚀",
    gender: 'male',
    orbitRadius: 290,
    orbitSpeed: 100,
    planetSize: 56
  },
  { 
    id: 'mami', 
    name: 'Mami',
    color: 'from-red-500 to-pink-600',
    bio: "Graceful inspiration 🦋",
    gender: 'female',
    orbitRadius: 340,
    orbitSpeed: 108,
    planetSize: 56
  },
];

const SimpleAvatar: React.FC<{ profile: FamilyProfile }> = ({ profile }) => {
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
    <div className="w-full h-full flex items-center justify-center text-5xl md:text-6xl bg-gradient-to-br from-white/10 to-transparent">
      {emoji}
    </div>
  );
};

const PhotoUploadModal: React.FC<{
  isOpen: boolean;
  profile: FamilyProfile | null;
  onClose: () => void;
  onSave: (profileId: string, photoUrl: string) => void;
}> = ({ isOpen, profile, onClose, onSave }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
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

        <div className="mb-6">
          <div className={`w-48 h-48 mx-auto rounded-full overflow-hidden border-4 bg-gradient-to-br ${profile.color} flex items-center justify-center`}>
            {preview || profile.avatarUrl ? (
              <img src={preview || profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
            ) : (
              <SimpleAvatar profile={profile} />
            )}
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />

        <div className="space-y-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl transition-all transform hover:scale-105 active:scale-95 shadow-lg flex items-center justify-center gap-3"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {preview || profile.avatarUrl ? 'Change from Gallery' : 'Choose from Gallery'}
          </button>

          <button
            onClick={() => cameraInputRef.current?.click()}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold rounded-xl transition-all transform hover:scale-105 active:scale-95 shadow-lg flex items-center justify-center gap-3"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Take Photo with Camera
          </button>

          {preview && (
            <button
              onClick={handleSave}
              className="w-full py-4 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl transition-all transform hover:scale-105 active:scale-95 shadow-lg"
            >
              💾 Save Photo
            </button>
          )}

          {profile.avatarUrl && !preview && (
            <button
              onClick={handleRemove}
              className="w-full py-3 bg-red-600/80 hover:bg-red-600 text-white font-semibold rounded-xl transition-all"
            >
              🗑️ Remove Photo
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
          📸 Choose from gallery or take a new photo
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
  const [editingProfile, setEditingProfile] = useState<FamilyProfile | null>(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate scale to fit all planets in viewport
  useEffect(() => {
    const calculateScale = () => {
      if (!containerRef.current) return;
      
      const container = containerRef.current;
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      
      // Maximum orbit radius from profiles
      const maxRadius = Math.max(...profiles.map(p => p.orbitRadius));
      const maxPlanetSize = Math.max(...profiles.map(p => p.planetSize));
      
      // Total space needed (diameter + planet size + padding)
      const neededSpace = (maxRadius * 2) + maxPlanetSize + 100; // 100px padding
      const sunSize = 140; // Approximate sun size
      
      // Calculate scale to fit
      const scaleWidth = (containerWidth - 100) / neededSpace;
      const scaleHeight = (containerHeight - 200) / neededSpace; // More space for header/footer
      
      const newScale = Math.min(scaleWidth, scaleHeight, 1.2); // Max 1.2x scale
      setScale(Math.max(newScale, 0.4)); // Min 0.4x scale
    };

    calculateScale();
    window.addEventListener('resize', calculateScale);
    return () => window.removeEventListener('resize', calculateScale);
  }, [profiles]);

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
    const updatedProfile = { ...profile, lastUsed: Date.now() };
    onSelectProfile(updatedProfile);
  };

  const handleProfileLongPress = (profile: FamilyProfile, e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingProfile(profile);
    setShowPhotoModal(true);
  };

  const useLongPress = (profile: FamilyProfile) => {
    let timerId: NodeJS.Timeout | null = null;

    return {
      onTouchStart: (e: React.TouchEvent) => {
        timerId = setTimeout(() => {
          handleProfileLongPress(profile, e);
        }, 500);
      },
      onTouchEnd: () => {
        if (timerId) clearTimeout(timerId);
      },
      onTouchMove: () => {
        if (timerId) clearTimeout(timerId);
      },
      onContextMenu: (e: React.MouseEvent) => {
        e.preventDefault();
        handleProfileLongPress(profile, e);
      }
    };
  };

  return (
    <div className="min-h-screen max-h-screen overflow-hidden w-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 relative">
      {/* Stars */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(150)].map((_, i) => (
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
      <div className="absolute top-2 md:top-4 left-0 right-0 text-center z-10 px-4">
        <h1 className="text-lg md:text-2xl lg:text-3xl font-bold font-brand text-white mb-0.5">
          The Orbiting Planets
        </h1>
        <p className="text-xs md:text-sm text-gray-400">
          Select your profile • Long press to add photo
        </p>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-2 md:bottom-4 left-0 right-0 text-center z-10 px-4">
        <p className="text-white text-xs md:text-sm bg-black/50 backdrop-blur-sm px-3 py-1.5 md:px-4 md:py-2 rounded-full inline-block border border-white/20">
          ✨ Click to select • Long press to add photo ✨
        </p>
      </div>

      {/* Solar System Container */}
      <div 
        ref={containerRef}
        className="absolute inset-0 flex items-center justify-center"
        style={{ 
          paddingTop: '60px',
          paddingBottom: '60px'
        }}
      >
        <div 
          className="relative"
          style={{ 
            transform: `scale(${scale})`,
            transition: 'transform 0.3s ease-out'
          }}
        >
          {/* Sun - Diyara */}
          <div className="relative z-20">
            <div className="absolute inset-0 rounded-full bg-yellow-400 blur-[50px] opacity-40 scale-[2]" />
            <div className="absolute inset-0 rounded-full bg-orange-400 blur-[30px] opacity-30 animate-pulse scale-[1.5]" />
            
            <div className="relative w-32 h-32 md:w-36 md:h-36 rounded-full bg-gradient-to-br from-yellow-300 via-yellow-400 to-orange-500 flex items-center justify-center shadow-2xl border-2 border-yellow-200/30 overflow-hidden">
              <DiyaMascot className="w-full h-full object-cover scale-110" />
            </div>

            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-center whitespace-nowrap">
              <p className="text-white font-bold text-sm md:text-lg font-brand drop-shadow-lg">Diyara</p>
              <p className="text-yellow-400 text-xs">The Sun ☀️</p>
            </div>
          </div>

          {/* Orbiting Planets */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            {profiles.map((profile, index) => {
              const angle = (index / profiles.length) * 2 * Math.PI;
              const x = Math.cos(angle) * profile.orbitRadius;
              const y = Math.sin(angle) * profile.orbitRadius;
              const isHovered = hoveredProfile === profile.id;

              const longPressHandlers = useLongPress(profile);

              return (
                <React.Fragment key={profile.id}>
                  {/* Orbit ring */}
                  <div
                    className="absolute top-0 left-0 rounded-full border border-white/10 pointer-events-none"
                    style={{
                      width: `${profile.orbitRadius * 2}px`,
                      height: `${profile.orbitRadius * 2}px`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  />

                  {/* Planet */}
                  <div 
                    className="absolute top-0 left-0 pointer-events-none"
                    style={{
                      animation: `orbit-${profile.id} ${profile.orbitSpeed}s linear infinite`,
                      transformOrigin: '0 0',
                    }}
                  >
                    <div 
                      style={{ transform: `translate(${x}px, ${y}px)` }} 
                      className="pointer-events-auto"
                    >
                      <div className="flex flex-col items-center gap-1">
                        <button
                          onClick={() => handleProfileClick(profile)}
                          {...longPressHandlers}
                          onMouseEnter={() => setHoveredProfile(profile.id)}
                          onMouseLeave={() => setHoveredProfile(null)}
                          className={`relative group transition-all duration-300 cursor-pointer ${isHovered ? 'scale-110 z-50' : 'scale-100 z-30'}`}
                          style={{ padding: '10px', margin: '-10px' }}
                        >
                          {/* Glow effect */}
                          <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${profile.color} blur-md opacity-50 scale-125 pointer-events-none ${isHovered ? 'animate-pulse opacity-70' : ''}`} />
                          
                          {/* Planet */}
                          <div
                            className={`relative rounded-full bg-gradient-to-br ${profile.color} flex items-center justify-center border-2 md:border-3 border-white/50 shadow-xl overflow-hidden transition-all duration-300 ${isHovered ? 'border-white shadow-white/30' : ''}`}
                            style={{ 
                              width: `${profile.planetSize}px`, 
                              height: `${profile.planetSize}px` 
                            }}
                          >
                            {profile.avatarUrl ? (
                              <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
                            ) : (
                              <SimpleAvatar profile={profile} />
                            )}
                          </div>

                          {/* Hover tooltip */}
                          {isHovered && (
                            <div className="fixed top-16 md:top-20 left-1/2 -translate-x-1/2 bg-black/95 backdrop-blur-xl px-3 md:px-5 py-2 md:py-3 rounded-xl border-2 border-white/40 whitespace-nowrap animate-fadeIn z-[100] shadow-2xl max-w-[90vw]">
                              <p className="text-white font-bold text-xs md:text-base mb-0.5">{profile.name}</p>
                              <p className="text-gray-300 text-xs">{profile.bio}</p>
                              <p className="text-yellow-400 text-xs mt-0.5">👆 Tap • Long press for photo</p>
                            </div>
                          )}
                        </button>
                        
                        {/* Name label */}
                        <div className="text-center bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-full border border-white/20 pointer-events-none">
                          <p className="text-white text-xs font-semibold whitespace-nowrap">
                            {profile.name}
                          </p>
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
