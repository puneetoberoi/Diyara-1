import React from 'react';

interface HeaderProps {
  userName: string;
  onOpenSettings: () => void;
  isMusicPlaying: boolean;
  onToggleMusic: () => void;
  profileBio?: string; // Add profile relationship/bio
}

// Personalized messages for each family member
const personalizedMessages: Record<string, string> = {
  'Mom': 'Mumma ki Diyaaru 💛',
  'Dad': 'Papa ki Koochie 💙',
  'Daada Ji': 'Daadu ki Dunia 🌍',
  'Daadi Ji': 'Daadi ki Shehzadi 👑',
  'Chachu': 'Fun with Chachu Ji 🎉',
  'Chachi': 'Sweet Chachi Ji 🤗',
  'Nani Ji': 'Nani ki Cookie 🍪',
  'Mamu': 'Mamu\'s Little Star ⭐',
  'Mami': 'Graceful Mami Ji 🌸',
};

const Header: React.FC<HeaderProps> = ({ 
  userName, 
  onOpenSettings, 
  isMusicPlaying, 
  onToggleMusic 
}) => {
  // Get personalized message or default
  const personalMessage = personalizedMessages[userName] || `Hello, ${userName}`;

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-purple-900 via-purple-800 to-indigo-900 border-b-2 border-purple-700/50 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-2">
          {/* Left: Profile info with personalized message */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            {/* Diyara avatar */}
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 bg-yellow-400 rounded-full blur-md opacity-50 animate-pulse" />
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-yellow-300 via-yellow-400 to-orange-500 border-2 border-yellow-200 flex items-center justify-center overflow-hidden shadow-lg">
                <span className="text-xl sm:text-2xl">👶</span>
              </div>
            </div>

            {/* Name and personalized message */}
            <div className="min-w-0 flex-1">
              <h1 className="text-base sm:text-lg font-bold text-white truncate">
                Hello, {userName}
              </h1>
              <p className="text-xs sm:text-sm text-yellow-300 font-medium truncate">
                {personalMessage}
              </p>
            </div>
          </div>

          {/* Right: Controls */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Music toggle */}
            <button
              onClick={onToggleMusic}
              className="p-2 sm:p-2.5 rounded-lg bg-purple-800/50 hover:bg-purple-700/50 border border-purple-600/50 transition-all transform hover:scale-110 active:scale-95"
              aria-label="Toggle music"
            >
              <span className="text-lg sm:text-xl">
                {isMusicPlaying ? '🎵' : '🔇'}
              </span>
            </button>

            {/* Settings */}
            <button
              onClick={onOpenSettings}
              className="p-2 sm:p-2.5 rounded-lg bg-purple-800/50 hover:bg-purple-700/50 border border-purple-600/50 transition-all transform hover:scale-110 active:scale-95"
              aria-label="Settings"
            >
              <span className="text-lg sm:text-xl">⚙️</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
