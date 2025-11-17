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
    orbitRadius: 180,
    orbitSpeed: 60,
    planetSize: 80
  },
  { 
    id: 'dad', 
    name: 'Dad',
    color: 'from-blue-500 to-indigo-600',
    bio: "Protector & strength 💪",
    gender: 'male',
    orbitRadius: 180,
    orbitSpeed: 55,
    planetSize: 85
  },
  { 
    id: 'daadaji', 
    name: 'Daada Ji',
    color: 'from-amber-500 to-orange-600',
    bio: "Wise elder, magic of generations 📚",
    gender: 'male',
    orbitRadius: 240,
    orbitSpeed: 70,
    planetSize: 85
  },
  { 
    id: 'daadiji', 
    name: 'Daadi Ji',
    color: 'from-purple-500 to-pink-600',
    bio: "Sweetest blessing 🌸",
    gender: 'female',
    orbitRadius: 240,
    orbitSpeed: 75,
    planetSize: 80
  },
  { 
    id: 'chachu', 
    name: 'Chachu',
    color: 'from-teal-500 to-cyan-600',
    bio: "Fun companion 🎉",
    gender: 'male',
    orbitRadius: 300,
    orbitSpeed: 80,
    planetSize: 75
  },
  { 
    id: 'chachi', 
    name: 'Chachi',
    color: 'from-green-500 to-emerald-600',
    bio: "Gentle soul 🌺",
    gender: 'female',
    orbitRadius: 300,
    orbitSpeed: 85,
    planetSize: 75
  },
  { 
    id: 'naniji', 
    name: 'Nani Ji',
    color: 'from-yellow-500 to-amber-600',
    bio: "Sunshine guardian ☀️",
    gender: 'female',
    orbitRadius: 360,
    orbitSpeed: 90,
    planetSize: 80
  },
  { 
    id: 'mamu', 
    name: 'Mamu',
    color: 'from-indigo-500 to-purple-600',
    bio: "Playful friend 🚀",
    gender: 'male',
    orbitRadius: 360,
    orbitSpeed: 95,
    planetSize: 75
  },
  { 
    id: 'mami', 
    name: 'Mami',
    color: 'from-red-500 to-pink-600',
    bio: "Graceful inspiration 🦋",
    gender: 'female',
    orbitRadius: 420,
    orbitSpeed: 100,
    planetSize: 75
  },
];

// Turban SVG Component (Sikh style - orange/saffron)
const TurbanAvatar: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    {/* Face */}
    <circle cx="50" cy="55" r="30" fill="#F4D03F" />
    
    {/* Beard */}
    <path 
      d="M35 65 Q30 75 35 80 L50 82 L65 80 Q70 75 65 65 Z" 
      fill="#2C3E50"
    />
    
    {/* Turban - Sikh style with folds */}
    <ellipse cx="50" cy="32" rx="32" ry="22" fill="#E67E22" />
    {/* Turban folds */}
    <path d="M25 32 Q30 28 50 28 Q70 28 75 32" stroke="#D35400" strokeWidth="3" fill="none" opacity="0.6" />
    <path d="M22 35 Q28 31 50 31 Q72 31 78 35" stroke="#D35400" strokeWidth="2.5" fill="none" opacity="0.5" />
    <path d="M20 38 Q26 34 50 34 Q74 34 80 38" stroke="#D35400" strokeWidth="2" fill="none" opacity="0.4" />
    
    {/* Top knot style */}
    <ellipse cx="50" cy="18" rx="12" ry="8" fill="#E67E22" />
    <path d="M50 15 Q45 12 42 18" stroke="#D35400" strokeWidth="2" fill="none" />
    <path d="M50 15 Q55 12 58 18" stroke="#D35400" strokeWidth="2" fill="none" />
    
    {/* Eyes */}
    <circle cx="42" cy="52" r="3" fill="#2C3E50" />
    <circle cx="58" cy="52" r="3" fill="#2C3E50" />
    
    {/* Eyebrows */}
    <path d="M37 47 Q42 45 47 47" stroke="#2C3E50" strokeWidth="2" fill="none" />
    <path d="M53 47 Q58 45 63 47" stroke="#2C3E50" strokeWidth="2" fill="none" />
    
    {/* Mouth */}
    <path d="M42 62 Q50 65 58 62" stroke="#2C3E50" strokeWidth="2" fill="none" />
  </svg>
);

// Female Avatar SVG
const FemaleAvatar: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    {/* Face */}
    <circle cx="50" cy="50" r="30" fill="#F4D03F" />
    
    {/* Hair */}
    <path d="M20 45 Q20 20 50 20 Q80 20 80 45" fill="#8B4513" />
    <ellipse cx="50" cy="25" rx="30" ry="20" fill="#8B4513" />
    
    {/* Eyes */}
    <circle cx="42" cy="48" r="3" fill="#2C3E50" />
    <circle cx="58" cy="48" r="3" fill="#2C3E50" />
    
    {/* Eyebrows */}
    <path d="M37 43 Q42 41 47 43" stroke="#6F4E37" strokeWidth="2" fill="none" />
    <path d="M53 43 Q58 41 63 43" stroke="#6F4E37" strokeWidth="2" fill="none" />
    
    {/* Smile */}
    <path d="M40 58 Q50 63 60 58" stroke="#E74C3C" strokeWidth="2" fill="none" />
    
    {/* Bindi (optional) */}
    <circle cx="50" cy="40" r="2" fill="#E74C3C" />
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
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Sun - Baby Diyara in center */}
        <div className="relative z-20">
          {/* Sun glow layers */}
          <div className="absolute inset-0 rounded-full bg-yellow-400 blur-3xl opacity-40 animate-pulse scale-150" />
          <div className="absolute inset-0 rounded-full bg-orange-400 blur-2xl opacity-30 animate-pulse scale-125" />
          
          {/* Sun core */}
          <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-yellow-300 via-yellow-400 to-orange-500 flex items-center justify-center shadow-2xl border-4 border-yellow-200/50">
            <DiyaMascot className="w-16 h-16 md:w-20 md:h-20" />
          </div>

          {/* Sun rays */}
          {[...Array(12)].map((_, i) => (
            <div
              key={`ray-${i}`}
              className="absolute top-1/2 left-1/2 w-1 h-16 bg-gradient-to-t from-yellow-400 to-transparent origin-bottom"
              style={{
                transform: `translate(-50%, -100%) rotate(${i * 30}deg)`,
                opacity: 0.3,
                animation: `pulse 2s infinite ${i * 0.1}s`,
              }}
            />
          ))}

          {/* Diyara label */}
          <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-center whitespace-nowrap">
            <p className="text-white font-bold text-lg md:text-xl font-brand">Diyara</p>
            <p className="text-yellow-400 text-xs md:text-sm">The Sun ☀️</p>
          </div>
        </div>

        {/* Orbiting Planets - Family Members */}
        {defaultProfiles.map((profile, index) => {
          const angle = (index / defaultProfiles.length) * 2 * Math.PI;
          const radius = profile.orbitRadius;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          const isHovered = hoveredProfile === profile.id;
          const isSelected = selectedProfile?.id === profile.id;

          return (
            <React.Fragment key={profile.id}>
              {/* Orbit path */}
              <div
                className="absolute top-1/2 left-1/2 rounded-full border border-white/10"
                style={{
                  width: `${radius * 2}px`,
                  height: `${radius * 2}px`,
                  transform: 'translate(-50%, -50%)',
                  pointerEvents: 'none',
                }}
              />

              {/* Planet */}
              <div
                className="absolute top-1/2 left-1/2 transition-all duration-300"
                style={{
                  transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
                  animation: `orbit ${profile.orbitSpeed}s linear infinite`,
                  animationDelay: `${-index * (profile.orbitSpeed / defaultProfiles.length)}s`,
                }}
              >
                <button
                  onClick={() => handleProfileClick(profile)}
                  onMouseEnter={() => setHoveredProfile(profile.id)}
                  onMouseLeave={() => setHoveredProfile(null)}
                  className={`relative group transition-all duration-300 ${
                    isHovered || isSelected ? 'scale-125 z-30' : 'scale-100'
                  }`}
                >
                  {/* Planet glow */}
                  <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${profile.color} blur-xl opacity-50 scale-150 ${isHovered ? 'animate-pulse' : ''}`} />
                  
                  {/* Planet surface with avatar */}
                  <div
                    className={`relative rounded-full bg-gradient-to-br ${profile.color} flex items-center justify-center border-4 border-white/30 shadow-2xl overflow-hidden`}
                    style={{
                      width: `${profile.planetSize}px`,
                      height: `${profile.planetSize}px`,
                    }}
                  >
                    {/* Avatar */}
                    <div className="w-full h-full flex items-center justify-center">
                      {profile.gender === 'male' ? (
                        <TurbanAvatar size={profile.planetSize} />
                      ) : (
                        <FemaleAvatar size={profile.planetSize} />
                      )}
                    </div>
                  </div>

                  {/* Planet info on hover */}
                  {isHovered && (
                    <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 whitespace-nowrap animate-fadeIn">
                      <p className="text-white font-bold text-sm">{profile.name}</p>
                      <p className="text-gray-300 text-xs">{profile.bio}</p>
                    </div>
                  )}
                </button>
              </div>
            </React.Fragment>
          );
        })}
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

        @keyframes orbit {
          from {
            transform: translate(-50%, -50%) rotate(0deg) translateX(var(--orbit-radius)) rotate(0deg);
          }
          to {
            transform: translate(-50%, -50%) rotate(360deg) translateX(var(--orbit-radius)) rotate(-360deg);
          }
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
            opacity: 0.3;
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
