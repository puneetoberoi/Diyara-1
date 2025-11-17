import React, { useState } from 'react';
import DiyaMascot from './DiyaMascot';

export interface FamilyProfile {
  id: string;
  name: string;
  emoji: string;
  color: string;
  lastUsed?: number;
}

interface ProfileSelectionProps {
  onSelectProfile: (profile: FamilyProfile) => void;
}

const defaultProfiles: FamilyProfile[] = [
  { id: 'mom', name: 'Mom', emoji: '👩', color: 'from-pink-500 to-rose-600' },
  { id: 'dad', name: 'Dad', emoji: '👨', color: 'from-blue-500 to-indigo-600' },
  { id: 'daadaji', name: 'Daada Ji', emoji: '👴', color: 'from-amber-500 to-orange-600' },
  { id: 'daadiji', name: 'Daadi Ji', emoji: '👵', color: 'from-purple-500 to-pink-600' },
  { id: 'chachu', name: 'Chachu', emoji: '👨', color: 'from-teal-500 to-cyan-600' },
  { id: 'chachi', name: 'Chachi', emoji: '👩', color: 'from-green-500 to-emerald-600' },
  { id: 'naniji', name: 'Nani Ji', emoji: '👵', color: 'from-yellow-500 to-amber-600' },
  { id: 'mamu', name: 'Mamu', emoji: '👨', color: 'from-indigo-500 to-purple-600' },
  { id: 'mami', name: 'Mami', emoji: '👩', color: 'from-red-500 to-pink-600' },
];

const ProfileSelection: React.FC<ProfileSelectionProps> = ({ onSelectProfile }) => {
  const [hoveredProfile, setHoveredProfile] = useState<string | null>(null);

  const handleProfileClick = (profile: FamilyProfile) => {
    const updatedProfile = { ...profile, lastUsed: Date.now() };
    onSelectProfile(updatedProfile);
  };

  return (
    <div className="min-h-screen max-h-screen overflow-y-auto w-screen bg-black">
      {/* Netflix-style background with gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-950/20 to-black"></div>
      
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden opacity-30">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-purple-400 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `twinkle ${2 + Math.random() * 3}s infinite ${Math.random() * 2}s`,
              opacity: Math.random() * 0.7,
            }}
          ></div>
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4 py-12 md:p-8">
        <div className="w-full max-w-6xl">
          {/* Header with modern styling */}
          <div className="text-center mb-8 md:mb-16">
            <DiyaMascot className="w-20 h-20 md:w-28 md:h-28 mx-auto mb-6 drop-shadow-2xl" />
            <h1 className="text-5xl md:text-7xl font-bold mb-3 font-brand bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400 bg-clip-text text-transparent animate-gradient">
              I am Diyara
            </h1>
            <p className="text-lg md:text-2xl text-gray-300 font-light tracking-wide">
              Who wants to explore today?
            </p>
          </div>

          {/* Modern Profile Grid - Netflix Style */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-6 mb-8 px-2">
            {defaultProfiles.map((profile) => (
              <button
                key={profile.id}
                onClick={() => handleProfileClick(profile)}
                onMouseEnter={() => setHoveredProfile(profile.id)}
                onMouseLeave={() => setHoveredProfile(null)}
                className="group relative"
              >
                {/* Card container with hover effects */}
                <div
                  className={`relative overflow-hidden rounded-xl transition-all duration-300 transform ${
                    hoveredProfile === profile.id
                      ? 'scale-105 shadow-2xl shadow-purple-500/50'
                      : 'scale-100 hover:scale-105'
                  }`}
                >
                  {/* Gradient background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${profile.color} opacity-80`}></div>
                  
                  {/* Glass morphism overlay */}
                  <div className="absolute inset-0 bg-white/5 backdrop-blur-sm"></div>
                  
                  {/* Border glow on hover */}
                  {hoveredProfile === profile.id && (
                    <div className="absolute inset-0 border-2 border-white/30 rounded-xl"></div>
                  )}

                  {/* Content */}
                  <div className="relative p-6 md:p-8 flex flex-col items-center">
                    {/* Profile Avatar with modern ring */}
                    <div className="relative mb-4">
                      {/* Outer glow ring */}
                      {hoveredProfile === profile.id && (
                        <div className={`absolute inset-0 bg-gradient-to-br ${profile.color} blur-xl opacity-60 scale-110`}></div>
                      )}
                      
                      {/* Avatar */}
                      <div
                        className={`relative w-24 h-24 md:w-28 md:h-28 rounded-full flex items-center justify-center text-5xl md:text-6xl bg-black/20 border-4 border-white/30 shadow-2xl transition-transform duration-300 ${
                          hoveredProfile === profile.id ? 'scale-110 rotate-6' : ''
                        }`}
                      >
                        {profile.emoji}
                      </div>
                    </div>

                    {/* Name with modern font */}
                    <p className="text-white font-bold text-base md:text-xl tracking-wide drop-shadow-lg">
                      {profile.name}
                    </p>
                  </div>

                  {/* Shine effect on hover */}
                  {hoveredProfile === profile.id && (
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent translate-x-full group-hover:translate-x-[-100%] transition-transform duration-700"></div>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Modern Add Profile Button */}
          <div className="flex justify-center mt-8 mb-8">
            <button
              className="group relative px-6 py-3 md:px-8 md:py-4 rounded-full bg-white/5 backdrop-blur-md border border-white/10 hover:border-purple-400/50 transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 group-hover:bg-purple-500/30 flex items-center justify-center transition-colors">
                  <span className="text-xl md:text-2xl text-gray-400 group-hover:text-purple-300">+</span>
                </div>
                <span className="text-gray-400 group-hover:text-purple-300 font-semibold text-sm md:text-base transition-colors">
                  Add New Profile
                </span>
              </div>
            </button>
          </div>

          {/* Footer with modern styling */}
          <p className="text-center text-gray-500 text-xs md:text-sm mt-8 font-light">
            Each family member gets their own personalized AI experience 💫
          </p>
        </div>
      </div>

      {/* CSS for animations */}
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0; transform: scale(0); }
          50% { opacity: 1; transform: scale(1); }
        }
        
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
};

export default ProfileSelection;
