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
    <div className="min-h-screen w-screen flex flex-col items-center justify-center p-4 md:p-8 bg-gradient-to-br from-purple-900 via-slate-900 to-black overflow-y-auto">
      <div className="w-full max-w-5xl my-8">
        {/* Header */}
        <div className="text-center mb-12">
          <DiyaMascot className="w-24 h-24 mx-auto mb-6 animate-bounce" />
          <h1 className="text-4xl md:text-6xl font-bold holographic-text mb-4 font-brand">
            I am Diyara
          </h1>
          <p className="text-xl md:text-2xl text-slate-300">
            Who wants to explore today?
          </p>
        </div>

        {/* Profile Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-8">
          {defaultProfiles.map((profile) => (
            <button
              key={profile.id}
              onClick={() => handleProfileClick(profile)}
              onMouseEnter={() => setHoveredProfile(profile.id)}
              onMouseLeave={() => setHoveredProfile(null)}
              className={`relative group p-6 md:p-8 rounded-2xl border-3 transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                hoveredProfile === profile.id
                  ? 'border-yellow-400 shadow-2xl shadow-yellow-400/30'
                  : 'border-slate-700 hover:border-slate-500'
              }`}
            >
              {/* Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${profile.color} opacity-20 group-hover:opacity-30 rounded-2xl transition-opacity`}></div>
              
              {/* Content */}
              <div className="relative flex flex-col items-center gap-3">
                {/* Profile Picture/Emoji Circle */}
                <div className={`w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br ${profile.color} flex items-center justify-center text-4xl md:text-5xl border-4 border-white/20 shadow-lg transform group-hover:rotate-6 transition-transform`}>
                  {profile.emoji}
                </div>
                
                {/* Name */}
                <p className="text-white font-bold text-lg md:text-xl font-brand">
                  {profile.name}
                </p>
              </div>

              {/* Hover Glow Effect */}
              {hoveredProfile === profile.id && (
                <div className="absolute inset-0 rounded-2xl bg-yellow-400/10 animate-pulse"></div>
              )}
            </button>
          ))}
        </div>

        {/* Add New Profile Button */}
        <div className="flex justify-center">
          <button
            className="group px-8 py-4 rounded-full border-2 border-dashed border-slate-600 hover:border-yellow-400 transition-all duration-300 flex items-center gap-3 hover:scale-105 active:scale-95"
          >
            <div className="w-12 h-12 rounded-full bg-slate-800 group-hover:bg-yellow-400 flex items-center justify-center transition-colors">
              <span className="text-2xl group-hover:text-black text-slate-400">+</span>
            </div>
            <span className="text-slate-400 group-hover:text-yellow-400 font-semibold text-lg transition-colors">
              Add New Profile
            </span>
          </button>
        </div>

        {/* Footer Note */}
        <p className="text-center text-slate-500 text-sm mt-8">
          Each family member gets their own personalized experience! 💛
        </p>
      </div>
    </div>
  );
};

export default ProfileSelection;
