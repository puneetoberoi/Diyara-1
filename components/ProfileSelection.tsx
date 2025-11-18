import React, { useState } from 'react';
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
    orbitRadius: 200,
    orbitSpeed: 50,
    planetSize: 90
  },
  { 
    id: 'dad', 
    name: 'Dad',
    color: 'from-blue-500 to-indigo-600',
    bio: "Protector & strength 💪",
    gender: 'male',
    orbitRadius: 200,
    orbitSpeed: 58,
    planetSize: 95
  },
  { 
    id: 'daadaji', 
    name: 'Daada Ji',
    color: 'from-amber-500 to-orange-600',
    bio: "Wise elder 📚",
    gender: 'male',
    orbitRadius: 280,
    orbitSpeed: 65,
    planetSize: 95
  },
  { 
    id: 'daadiji', 
    name: 'Daadi Ji',
    color: 'from-purple-500 to-pink-600',
    bio: "Sweetest blessing 🌸",
    gender: 'female',
    orbitRadius: 280,
    orbitSpeed: 72,
    planetSize: 90
  },
  { 
    id: 'chachu', 
    name: 'Chachu',
    color: 'from-teal-500 to-cyan-600',
    bio: "Fun companion 🎉",
    gender: 'male',
    orbitRadius: 360,
    orbitSpeed: 78,
    planetSize: 85
  },
  { 
    id: 'chachi', 
    name: 'Chachi',
    color: 'from-green-500 to-emerald-600',
    bio: "Gentle soul 🌺",
    gender: 'female',
    orbitRadius: 360,
    orbitSpeed: 85,
    planetSize: 85
  },
  { 
    id: 'naniji', 
    name: 'Nani Ji',
    color: 'from-yellow-500 to-amber-600',
    bio: "Sunshine guardian ☀️",
    gender: 'female',
    orbitRadius: 440,
    orbitSpeed: 92,
    planetSize: 90
  },
  { 
    id: 'mamu', 
    name: 'Mamu',
    color: 'from-indigo-500 to-purple-600',
    bio: "Playful friend 🚀",
    gender: 'male',
    orbitRadius: 440,
    orbitSpeed: 100,
    planetSize: 85
  },
  { 
    id: 'mami', 
    name: 'Mami',
    color: 'from-red-500 to-pink-600',
    bio: "Graceful inspiration 🦋",
    gender: 'female',
    orbitRadius: 520,
    orbitSpeed: 108,
    planetSize: 85
  },
];

// Improved Turban SVG Component (Sikh style - orange/saffron with prominent beard)
const TurbanAvatar: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
    {/* Face - larger and more prominent */}
    <ellipse cx="60" cy="65" rx="35" ry="38" fill="#F4D03F" />
    
    {/* Turban - Sikh style with visible folds and texture */}
    <ellipse cx="60" cy="38" rx="40" ry="28" fill="#E67E22" />
    
    {/* Turban folds - multiple layers for texture */}
    <path d="M25 38 Q35 32 60 32 Q85 32 95 38" stroke="#D35400" strokeWidth="4" fill="none" opacity="0.8" />
    <path d="M22 42 Q33 36 60 36 Q87 36 98 42" stroke="#D35400" strokeWidth="3.5" fill="none" opacity="0.7" />
    <path d="M20 46 Q31 40 60 40 Q89 40 100 46" stroke="#D35400" strokeWidth="3" fill="none" opacity="0.6" />
    <path d="M23 50 Q34 44 60 44 Q86 44 97 50" stroke="#D35400" strokeWidth="2.5" fill="none" opacity="0.5" />
    
    {/* Top knot (Joora) */}
    <ellipse cx="60" cy="22" rx="16" ry="11" fill="#E67E22" />
    <ellipse cx="60" cy="20" rx="12" ry="8" fill="#D35400" opacity="0.7" />
    <path d="M55 20 Q60 15 65 20" stroke="#BF6516" strokeWidth="2.5" fill="none" />
    
    {/* Shadow under turban */}
    <ellipse cx="60" cy="52" rx="38" ry="6" fill="#000" opacity="0.15" />
    
    {/* Eyes - expressive and friendly */}
    <ellipse cx="48" cy="62" rx="4" ry="5" fill="#2C3E50" />
    <ellipse cx="72" cy="62" rx="4" ry="5" fill="#2C3E50" />
    <circle cx="49" cy="61" r="1.5" fill="white" />
    <circle cx="73" cy="61" r="1.5" fill="white" />
    
    {/* Eyebrows - thick and expressive */}
    <path d="M42 55 Q48 52 54 55" stroke="#2C3E50" strokeWidth="3" strokeLinecap="round" fill="none" />
    <path d="M66 55 Q72 52 78 55" stroke="#2C3E50" strokeWidth="3" strokeLinecap="round" fill="none" />
    
    {/* Nose */}
    <path d="M60 68 L58 75" stroke="#D4A76A" strokeWidth="2" strokeLinecap="round" />
    <path d="M60 68 L62 75" stroke="#D4A76A" strokeWidth="2" strokeLinecap="round" />
    
    {/* PROMINENT BEARD - Full Sikh style */}
    <path 
      d="M38 72 Q35 85 40 95 Q45 100 60 102 Q75 100 80 95 Q85 85 82 72 Q78 75 72 78 Q65 80 60 80 Q55 80 48 78 Q42 75 38 72 Z" 
      fill="#1A252F"
    />
    
    {/* Beard texture/highlights */}
    <path d="M45 80 Q50 83 55 85" stroke="#2C3E50" strokeWidth="1.5" opacity="0.6" fill="none" />
    <path d="M65 85 Q70 83 75 80" stroke="#2C3E50" strokeWidth="1.5" opacity="0.6" fill="none" />
    <path d="M48 88 Q55 90 60 90 Q65 90 72 88" stroke="#2C3E50" strokeWidth="1.5" opacity="0.6" fill="none" />
    
    {/* Mustache above beard */}
    <path d="M48 73 Q54 76 60 76 Q66 76 72 73" stroke="#1A252F" strokeWidth="3" strokeLinecap="round" />
    
    {/* Smile visible through mustache */}
    <path d="M52 77 Q60 80 68 77" stroke="#C85A54" strokeWidth="1.5" fill="none" opacity="0.7" />
  </svg>
);

// Improved Female Avatar SVG
const FemaleAvatar: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
    {/* Hair background */}
    <ellipse cx="60" cy="45" rx="42" ry="48" fill="#6F4E37" />
    
    {/* Hair parting */}
    <path d="M60 10 Q58 30 55 45" stroke="#5A3A2A" strokeWidth="2" opacity="0.8" />
    <path d="M60 10 Q62 30 65 45" stroke="#5A3A2A" strokeWidth="2" opacity="0.8" />
    
    {/* Hair sides */}
    <ellipse cx="30" cy="60" rx="15" ry="35" fill="#6F4E37" />
    <ellipse cx="90" cy="60" rx="15" ry="35" fill="#6F4E37" />
    
    {/* Face */}
    <ellipse cx="60" cy="60" rx="32" ry="36" fill="#F4D03F" />
    
    {/* Eyes - expressive */}
    <ellipse cx="50" cy="56" rx="4" ry="5" fill="#2C3E50" />
    <ellipse cx="70" cy="56" rx="4" ry="5" fill="#2C3E50" />
    <circle cx="51" cy="55" r="1.5" fill="white" />
    <circle cx="71" cy="55" r="1.5" fill="white" />
    
    {/* Eyebrows */}
    <path d="M43 49 Q50 46 57 49" stroke="#6F4E37" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    <path d="M63 49 Q70 46 77 49" stroke="#6F4E37" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    
    {/* Nose */}
    <path d="M60 62 L58 68" stroke="#D4A76A" strokeWidth="2" strokeLinecap="round" />
    <path d="M60 62 L62 68" stroke="#D4A76A" strokeWidth="2" strokeLinecap="round" />
    
    {/* Warm smile */}
    <path d="M48 72 Q60 78 72 72" stroke="#C85A54" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    
    {/* Bindi */}
    <circle cx="60" cy="45" r="2.5" fill="#E74C3C" />
    
    {/* Earrings */}
    <circle cx="28" cy="65" r="4" fill="#FFD700" opacity="0.9" />
    <circle cx="92" cy="65" r="4" fill="#FFD700" opacity="0.9" />
    
    {/* Necklace hint */}
    <ellipse cx="60" cy="95" rx="25" ry="3" fill="#FFD700" opacity="0.7" />
  </svg>
);

const ProfileSelection: React.FC<ProfileSelectionProps> = ({ onSelectProfile }) => {
  const [hoveredProfile, setHoveredProfile] = useState<string | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<FamilyProfile | null>(null);

  const handleProfileClick = (profile: FamilyProfile) => {
    setSelectedProfile(profile);
    setTimeout(() => {
      const updatedProfile = { ...profile, lastUsed: Date.now() };
      onSelectProfile(updatedProfile);
    }, 500);
  };

  return (
    <div className="min-h-screen max-h-screen overflow-hidden w-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 relative flex items-center justify-center">
      {/* Deep space background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Stars */}
        {[...Array(200)].map((_, i) => (
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

        {/* Nebula clouds */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl" />
      </div>

      {/* Title */}
      <div className="absolute top-8 md:top-12 left-0 right-0 text-center z-10">
        <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold font-brand text-white mb-2">
          The Orbiting Planets Selection
        </h1>
        <p className="text-sm md:text-base text-gray-400">
          Diyara's family universe
        </p>
      </div>

      {/* Solar System Container */}
      <div className="relative w-full h-full flex items-center justify-center" style={{ minHeight: '600px' }}>
        {/* Sun - Baby Diyara in center */}
        <div className="relative z-20">
          {/* Back glow - large and prominent */}
          <div className="absolute inset-0 rounded-full bg-yellow-400 blur-[100px] opacity-60 scale-[3]" 
               style={{ zIndex: -1 }} />
          <div className="absolute inset-0 rounded-full bg-orange-400 blur-[80px] opacity-50 animate-pulse scale-[2.5]" 
               style={{ zIndex: -1 }} />
          <div className="absolute inset-0 rounded-full bg-yellow-300 blur-[60px] opacity-40 animate-pulse scale-[2]" 
               style={{ zIndex: -1, animationDelay: '0.5s' }} />
          
          {/* Sun core - bigger and less border */}
          <div className="relative w-40 h-40 md:w-48 md:h-48 rounded-full bg-gradient-to-br from-yellow-300 via-yellow-400 to-orange-500 flex items-center justify-center shadow-2xl border-2 border-yellow-200/30 overflow-hidden">
            {/* Photo fills the circle */}
            <DiyaMascot className="w-full h-full object-cover scale-110" />
          </div>

          {/* Sun rays */}
          {[...Array(12)].map((_, i) => (
            <div
              key={`ray-${i}`}
              className="absolute top-1/2 left-1/2 w-2 h-24 md:h-32 bg-gradient-to-t from-yellow-400 to-transparent origin-bottom"
              style={{
                transform: `translate(-50%, -100%) rotate(${i * 30}deg)`,
                opacity: 0.4,
                animation: `pulse 2s infinite ${i * 0.1}s`,
                zIndex: -1,
              }}
            />
          ))}

          {/* Diyara label */}
          <div className="absolute -bottom-16 md:-bottom-20 left-1/2 -translate-x-1/2 text-center whitespace-nowrap">
            <p className="text-white font-bold text-xl md:text-2xl font-brand drop-shadow-lg">Diyara</p>
            <p className="text-yellow-400 text-sm md:text-base">The Sun ☀️</p>
          </div>
        </div>

        {/* Orbiting Planets - Family Members */}
        <div className="absolute inset-0 flex items-center justify-center">
          {defaultProfiles.map((profile, index) => {
            const angle = (index / defaultProfiles.length) * 2 * Math.PI;
            const x = Math.cos(angle) * profile.orbitRadius;
            const y = Math.sin(angle) * profile.orbitRadius;
            const isHovered = hoveredProfile === profile.id;
            const isSelected = selectedProfile?.id === profile.id;

            return (
              <React.Fragment key={profile.id}>
                {/* Orbit path */}
                <div
                  className="absolute top-1/2 left-1/2 rounded-full border border-purple-400/20"
                  style={{
                    width: `${profile.orbitRadius * 2}px`,
                    height: `${profile.orbitRadius * 2}px`,
                    transform: 'translate(-50%, -50%)',
                    pointerEvents: 'none',
                  }}
                />

                {/* Planet with orbit animation */}
                <div
                  className="absolute top-1/2 left-1/2"
                  style={{
                    transform: `translate(-50%, -50%)`,
                  }}
                >
                  <div
                    className="absolute"
                    style={{
                      animation: `orbit-${profile.id} ${profile.orbitSpeed}s linear infinite`,
                      transformOrigin: '0 0',
                    }}
                  >
                    <div
                      style={{
                        transform: `translate(${x}px, ${y}px)`,
                      }}
                    >
                      <button
                        onClick={() => handleProfileClick(profile)}
                        onMouseEnter={() => setHoveredProfile(profile.id)}
                        onMouseLeave={() => setHoveredProfile(null)}
                        className={`relative group transition-all duration-300 ${
                          isHovered || isSelected ? 'scale-125 z-30' : 'scale-100 z-10'
                        }`}
                        style={{
                          padding: '20px', // Bigger click area
                          margin: '-20px', // Offset the padding
                        }}
                      >
                        {/* Planet glow */}
                        <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${profile.color} blur-2xl opacity-70 scale-[2] ${isHovered ? 'animate-pulse' : ''}`} 
                             style={{ pointerEvents: 'none' }} />
                        
                        {/* Planet surface with avatar */}
                        <div
                          className={`relative rounded-full bg-gradient-to-br ${profile.color} flex items-center justify-center border-4 border-white/50 shadow-2xl overflow-hidden transition-all duration-300 ${isHovered ? 'border-white' : ''}`}
                          style={{
                            width: `${profile.planetSize}px`,
                            height: `${profile.planetSize}px`,
                          }}
                        >
                          {/* Avatar */}
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-white/10 to-transparent">
                            {profile.gender === 'male' ? (
                              <TurbanAvatar size={profile.planetSize} />
                            ) : (
                              <FemaleAvatar size={profile.planetSize} />
                            )}
                          </div>
                        </div>

                        {/* Planet info - ALWAYS show on hover with better positioning */}
                        {isHovered && (
                          <div className="fixed top-8 left-1/2 -translate-x-1/2 bg-black/95 backdrop-blur-xl px-6 py-4 rounded-2xl border-2 border-white/40 whitespace-nowrap animate-fadeIn z-[100] shadow-2xl">
                            <p className="text-white font-bold text-lg mb-1">{profile.name}</p>
                            <p className="text-gray-300 text-sm">{profile.bio}</p>
                          </div>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Unique keyframe for each planet's orbit */}
                <style key={`orbit-style-${profile.id}`}>{`
                  @keyframes orbit-${profile.id} {
                    from {
                      transform: rotate(0deg);
                    }
                    to {
                      transform: rotate(360deg);
                    }
                  }
                `}</style>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* New Journey button */}
      <div className="absolute bottom-8 md:bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4">
        <button className="group px-8 py-4 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 transition-all duration-300 hover:scale-105 active:scale-95 shadow-2xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <span className="text-xl text-white font-bold">+</span>
          </div>
          <span className="text-white font-semibold text-lg">New Journey</span>
        </button>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translate(-50%, 10px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 0.4;
          }
          50% {
            opacity: 0.8;
          }
        }
      `}</style>
    </div>
  );
};

export default ProfileSelection;
