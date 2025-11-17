import React, { useState } from 'react';
import DiyaMascot from './DiyaMascot';

export interface FamilyProfile {
  id: string;
  name: string;
  emoji: string;
  color: string;
  bio: string;
  lastUsed?: number;
}

interface ProfileSelectionProps {
  onSelectProfile: (profile: FamilyProfile) => void;
}

const defaultProfiles: FamilyProfile[] = [
  { 
    id: 'mom', 
    name: 'Mom', 
    emoji: '👩', 
    color: 'from-pink-500 to-rose-600',
    bio: "My guiding star, whose love teaches me the meaning of care and wisdom. 💖"
  },
  { 
    id: 'dad', 
    name: 'Dad', 
    emoji: '👨', 
    color: 'from-blue-500 to-indigo-600',
    bio: "My protector and hero, whose strength shows me how to be brave. 💪"
  },
  { 
    id: 'daadaji', 
    name: 'Daada Ji', 
    emoji: '👴', 
    color: 'from-amber-500 to-orange-600',
    bio: "My wise elder, whose stories hold the magic of generations past. 📚"
  },
  { 
    id: 'daadiji', 
    name: 'Daadi Ji', 
    emoji: '👵', 
    color: 'from-purple-500 to-pink-600',
    bio: "My sweetest blessing, whose warmth makes every moment special. 🌸"
  },
  { 
    id: 'chachu', 
    name: 'Chachu', 
    emoji: '👨', 
    color: 'from-teal-500 to-cyan-600',
    bio: "My fun companion, whose energy fills our home with laughter. 🎉"
  },
  { 
    id: 'chachi', 
    name: 'Chachi', 
    emoji: '👩', 
    color: 'from-green-500 to-emerald-600',
    bio: "My gentle soul, whose kindness blooms like flowers in spring. 🌺"
  },
  { 
    id: 'naniji', 
    name: 'Nani Ji', 
    emoji: '👵', 
    color: 'from-yellow-500 to-amber-600',
    bio: "My sunshine guardian, whose love lights up my darkest days. ☀️"
  },
  { 
    id: 'mamu', 
    name: 'Mamu', 
    emoji: '👨', 
    color: 'from-indigo-500 to-purple-600',
    bio: "My playful friend, who shows me that learning can be an adventure. 🚀"
  },
  { 
    id: 'mami', 
    name: 'Mami', 
    emoji: '👩', 
    color: 'from-red-500 to-pink-600',
    bio: "My graceful inspiration, whose elegance teaches me true beauty. 🦋"
  },
];

const ProfileSelection: React.FC<ProfileSelectionProps> = ({ onSelectProfile }) => {
  const [hoveredProfile, setHoveredProfile] = useState<string | null>(null);

  const handleProfileClick = (profile: FamilyProfile) => {
    const updatedProfile = { ...profile, lastUsed: Date.now() };
    onSelectProfile(updatedProfile);
  };

  return (
    <div className="min-h-screen max-h-screen overflow-y-auto w-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950">
      {/* Subtle animated background */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-purple-400 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `twinkle ${3 + Math.random() * 4}s infinite ${Math.random() * 2}s`,
            }}
          ></div>
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12 md:px-8 md:py-16">
        <div className="w-full max-w-7xl">
          {/* Header */}
          <div className="text-center mb-12 md:mb-16">
            <DiyaMascot className="w-16 h-16 md:w-24 md:h-24 mx-auto mb-6 drop-shadow-2xl animate-bounce" />
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-3 font-brand bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400 bg-clip-text text-transparent">
              I am Diyara
            </h1>
            <p className="text-base md:text-xl lg:text-2xl text-gray-400 font-light">
              Who wants to explore today?
            </p>
          </div>

          {/* Modern Floating Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12 px-2">
            {defaultProfiles.map((profile) => (
              <button
                key={profile.id}
                onClick={() => handleProfileClick(profile)}
                onMouseEnter={() => setHoveredProfile(profile.id)}
                onMouseLeave={() => setHoveredProfile(null)}
                className="group relative"
              >
                {/* Floating Card Container */}
                <div
                  className={`relative bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl rounded-3xl overflow-hidden transition-all duration-500 transform ${
                    hoveredProfile === profile.id
                      ? 'scale-105 shadow-2xl -translate-y-2'
                      : 'scale-100 shadow-xl hover:shadow-2xl'
                  }`}
                  style={{
                    boxShadow: hoveredProfile === profile.id 
                      ? `0 25px 50px -12px rgba(147, 51, 234, 0.4)` 
                      : '0 10px 30px -10px rgba(0, 0, 0, 0.5)',
                  }}
                >
                  {/* Glass morphism overlay */}
                  <div className="absolute inset-0 bg-white/5"></div>

                  {/* Border glow on hover */}
                  {hoveredProfile === profile.id && (
                    <div className="absolute inset-0 rounded-3xl border-2 border-white/10"></div>
                  )}

                  {/* Content */}
                  <div className="relative p-8 flex flex-col items-center">
                    {/* Avatar Section */}
                    <div className="relative mb-6">
                      {/* Glow effect behind avatar */}
                      {hoveredProfile === profile.id && (
                        <div 
                          className={`absolute inset-0 bg-gradient-to-br ${profile.color} blur-2xl opacity-60 scale-150`}
                        ></div>
                      )}
                      
                      {/* Avatar Circle */}
                      <div
                        className={`relative w-28 h-28 md:w-32 md:h-32 rounded-full bg-gradient-to-br ${profile.color} flex items-center justify-center text-6xl md:text-7xl shadow-2xl border-4 border-white/20 transition-all duration-500 ${
                          hoveredProfile === profile.id ? 'scale-110 rotate-6' : 'scale-100'
                        }`}
                      >
                        {profile.emoji}
                      </div>
                    </div>

                    {/* Name */}
                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 font-brand">
                      {profile.name}
                    </h3>

                    {/* Bio from Diyara */}
                    <p className="text-sm md:text-base text-gray-400 text-center leading-relaxed min-h-[60px] px-2">
                      {profile.bio}
                    </p>

                    {/* Colored accent bar at bottom */}
                    <div 
                      className={`absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r ${profile.color} transition-all duration-500 ${
                        hoveredProfile === profile.id ? 'h-2' : 'h-1.5'
                      }`}
                    ></div>
                  </div>

                  {/* Shine effect on hover */}
                  {hoveredProfile === profile.id && (
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent translate-x-full group-hover:translate-x-[-100%] transition-transform duration-1000"></div>
                  )}
                </div>

                {/* Floating shadow enhancement */}
                {hoveredProfile === profile.id && (
                  <div 
                    className={`absolute -inset-4 bg-gradient-to-br ${profile.color} opacity-20 blur-3xl -z-10 rounded-3xl`}
                  ></div>
                )}
              </button>
            ))}
          </div>

          {/* Add New Profile Button - Modern Style */}
          <div className="flex justify-center mb-12">
            <button className="group relative px-8 py-4 rounded-2xl bg-slate-900/50 backdrop-blur-xl border-2 border-dashed border-slate-700 hover:border-purple-500/50 transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg hover:shadow-2xl">
              <div className="flex items-center gap-4">
                {/* Plus icon with gradient */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <span className="text-2xl text-white font-bold">+</span>
                </div>
                <div className="text-left">
                  <span className="block text-white font-semibold text-lg">Add New Profile</span>
                  <span className="block text-gray-500 text-sm">Create a personalized experience</span>
                </div>
              </div>
            </button>
          </div>

          {/* Footer */}
          <p className="text-center text-gray-600 text-sm md:text-base font-light">
            Each family member gets their own AI companion experience 💫
          </p>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes twinkle {
          0%, 100% { 
            opacity: 0; 
            transform: scale(0); 
          }
          50% { 
            opacity: 1; 
            transform: scale(1); 
          }
        }
      `}</style>
    </div>
  );
};

export default ProfileSelection;
