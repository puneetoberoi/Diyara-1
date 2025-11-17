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
    <div className="min-h-screen w-screen flex flex-col bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 overflow-y-auto">
      {/* Header Section */}
      <div className="flex-shrink-0 text-center pt-8 pb-6 px-4">
        <DiyaMascot className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-4" />
        <h1 className="text-4xl md:text-6xl font-bold mb-2 bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 bg-clip-text text-transparent font-brand animate-pulse">
          I am Diyara
        </h1>
        <p className="text-lg md:text-xl text-slate-300 font-light">
          Who wants to explore today?
        </p>
      </div>

      {/* Profile Grid - Scrollable */}
      <div className="flex-1 px-4 pb-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3 md:gap-6">
            {defaultProfiles.map((profile) => (
              <button
                key={profile.id}
                onClick={() => handleProfileClick(profile)}
                onMouseEnter={() => setHoveredProfile(profile.id)}
                onMouseLeave={() => setHoveredProfile(null)}
                className={`group relative overflow-hidden rounded-2xl transition-all duration-300 ${
                  hoveredProfile === profile.id
                    ? 'transform scale-105 z-10'
                    : 'transform scale-100'
                }`}
                style={{
                  aspectRatio: '1 / 1'
                }}
              >
                {/* Background with gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${profile.color} opacity-80 group-hover:opacity-100 transition-opacity`}></div>
                
                {/* Hover overlay */}
                <div className={`absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-all duration-300`}></div>
                
                {/* Border glow on hover */}
                {hoveredProfile === profile.id && (
                  <div className="absolute inset-0 border-4 border-yellow-400 rounded-2xl animate-pulse"></div>
                )}
                
                {/* Content */}
                <div className="relative h-full flex flex-col items-center justify-center p-4">
                  {/* Profile Circle */}
                  <div className={`w-16 h-16 md:w-24 md:h-24 mb-3 md:mb-4 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-3xl md:text-5xl shadow-2xl transform group-hover:scale-110 transition-transform duration-300 ${
                    hoveredProfile === profile.id ? 'ring-4 ring-yellow-300' : ''
                  }`}>
                    {profile.emoji}
                  </div>
                  
                  {/* Name */}
                  <p className="text-white font-bold text-base md:text-xl tracking-wide drop-shadow-lg">
                    {profile.name}
                  </p>
                  
                  {/* Hover effect indicator */}
                  {hoveredProfile === profile.id && (
                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-yellow-300 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-yellow-300 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-yellow-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Shine effect on hover */}
                <div className={`absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000`}></div>
              </button>
            ))}
          </div>

          {/* Add New Profile Button */}
          <div className="flex justify-center mt-8">
            <button className="group px-6 py-4 rounded-full bg-slate-800/50 hover:bg-slate-700/50 border-2 border-slate-600 hover:border-yellow-400 transition-all duration-300 flex items-center gap-3 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-full bg-slate-700 group-hover:bg-yellow-400 flex items-center justify-center transition-colors">
                <span className="text-2xl group-hover:text-black text-slate-400 font-bold">+</span>
              </div>
              <span className="text-slate-300 group-hover:text-yellow-400 font-semibold transition-colors">
                Add Profile
              </span>
            </button>
          </div>

          {/* Footer */}
          <p className="text-center text-slate-500 text-xs md:text-sm mt-6 mb-4">
            Each family member gets their own personalized journey 💛
          </p>
        </div>
      </div>

      {/* Animated background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-yellow-400/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `twinkle ${2 + Math.random() * 3}s ease-in-out ${Math.random() * 2}s infinite`,
            }}
          ></div>
        ))}
      </div>

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.5); }
        }
      `}</style>
    </div>
  );
};

export default ProfileSelection;
