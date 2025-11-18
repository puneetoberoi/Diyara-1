import React, { useState, useEffect } from 'react';
import DiyaMascot from './DiyaMascot';
import SoundButton from './SoundButton';
import { useAudio } from '../utils/AudioManager';

interface AuthGateProps {
  onLogin: (user: { id: string; name: string }) => void;
}

const AuthGate: React.FC<AuthGateProps> = ({ onLogin }) => {
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');
  const audio = useAudio();

  const VALID_CODE = 'DIYARA2025'; // Change this to your desired access code

  // Play background music when component mounts
  useEffect(() => {
    audio.playBackgroundMusic('accessCode');
    
    return () => {
      // Don't stop music on unmount, let it continue
    };
  }, []);

  const handleSubmit = () => {
    if (accessCode.trim().toUpperCase() === VALID_CODE) {
      audio.playSuccess();
      audio.playTransition();
      setTimeout(() => {
        onLogin({ id: 'family', name: 'Family' });
      }, 500);
    } else {
      setError('Invalid access code');
      setTimeout(() => setError(''), 2000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-black flex items-center justify-center p-4">
      {/* Animated background stars */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(50)].map((_, i) => (
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

      {/* Main content */}
      <div className="relative z-10 w-full max-w-md mx-auto flex flex-col items-center">
        {/* Diyara mascot */}
        <div className="mb-4 sm:mb-6 relative">
          <div className="absolute inset-0 rounded-full bg-yellow-400 blur-2xl opacity-50 scale-150 animate-pulse" />
          <div className="relative w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-yellow-300 via-yellow-400 to-orange-500 flex items-center justify-center shadow-2xl border-4 border-yellow-200/30 overflow-hidden">
            <DiyaMascot className="w-full h-full object-cover scale-110" />
          </div>
        </div>

        {/* Access Required text with glow */}
        <div className="relative mb-4 sm:mb-6">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center font-brand mb-2 sm:mb-3 text-white">
            <span className="inline-block animate-pulse" style={{ 
              textShadow: '0 0 20px rgba(234, 179, 8, 0.8), 0 0 40px rgba(234, 179, 8, 0.6), 0 0 60px rgba(234, 179, 8, 0.4)',
              background: 'linear-gradient(to right, #fbbf24, #fcd34d)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Access Required
            </span>
          </h1>
          <p className="text-gray-300 text-center text-xs sm:text-sm md:text-base px-2">
            This universe is currently in a private development phase.
          </p>
        </div>

        {/* Input container */}
        <div className="w-full space-y-3 sm:space-y-4">
          {/* Access code input */}
          <div className="relative">
            <input
              type="password"
              value={accessCode}
              onChange={(e) => {
                setAccessCode(e.target.value);
                setError('');
              }}
              onKeyPress={handleKeyPress}
              placeholder="Enter Access Code"
              className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-slate-800/50 border-2 border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/50 transition-all text-center text-sm sm:text-base md:text-lg font-medium backdrop-blur-sm"
              autoFocus
            />
            {error && (
              <p className="absolute -bottom-6 left-0 right-0 text-red-400 text-xs sm:text-sm text-center animate-pulse">
                {error}
              </p>
            )}
          </div>

          {/* Authenticate button */}
          <SoundButton
            onClick={handleSubmit}
            disabled={!accessCode.trim()}
            soundType="success"
            className="w-full px-6 py-3 sm:py-4 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 disabled:from-gray-600 disabled:to-gray-700 text-black disabled:text-gray-400 font-bold text-base sm:text-lg md:text-xl rounded-xl transition-all transform hover:scale-105 active:scale-95 disabled:scale-100 disabled:cursor-not-allowed shadow-lg disabled:shadow-none"
          >
            Authenticate
          </SoundButton>
        </div>

        {/* Help text */}
        <p className="text-gray-500 text-[10px] sm:text-xs text-center mt-4 sm:mt-6 px-4">
          🔒 Enter your family access code to continue
        </p>
      </div>

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default AuthGate;
