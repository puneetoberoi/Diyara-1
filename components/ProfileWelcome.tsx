import React, { useEffect, useState } from 'react';
import DiyaMascot from './DiyaMascot';
import { FamilyProfile } from './ProfileSelection';

interface ProfileWelcomeProps {
  profile: FamilyProfile;
  onComplete: () => void;
}

const welcomeMessages: Record<string, string[]> = {
  mom: [
    "Welcome back, Mom! Your wisdom lights up our universe. ✨",
    "Hello Mom! Ready to explore and learn together today? 💖",
    "Mom, it's wonderful to see you! Let's create something amazing! 🌟"
  ],
  dad: [
    "Welcome, Dad! Your strength inspires our journey. 💪",
    "Hello Dad! Ready for another adventure through knowledge? 🚀",
    "Dad, great to have you back! Let's discover something new! ⭐"
  ],
  daadaji: [
    "Namaste Daada Ji! Your experience guides our path. 🙏",
    "Welcome Daada Ji! Ready to share your wisdom today? 📚",
    "Daada Ji, it's an honor! Let's explore together! 🌺"
  ],
  daadiji: [
    "Namaste Daadi Ji! Your love warms our universe. 💝",
    "Welcome Daadi Ji! Ready for stories and learning? 🌸",
    "Daadi Ji, how wonderful to see you! Let's create magic! ✨"
  ],
  chachu: [
    "Hey Chachu! Your energy sparks our creativity. ⚡",
    "Welcome Chachu! Ready to have some fun learning? 🎉",
    "Chachu, great to see you! Let's make today awesome! 🌟"
  ],
  chachi: [
    "Welcome Chachi! Your care nurtures our growth. 🌺",
    "Hello Chachi! Ready to explore something new? 💐",
    "Chachi, so happy you're here! Let's learn together! 🌷"
  ],
  naniji: [
    "Namaste Nani Ji! Your kindness lights our way. 🌟",
    "Welcome Nani Ji! Ready for another beautiful day? 🌼",
    "Nani Ji, it's lovely to see you! Let's discover together! 💫"
  ],
  mamu: [
    "Hey Mamu! Your humor brightens our journey. 😊",
    "Welcome Mamu! Ready to learn and laugh? 🎭",
    "Mamu, awesome to see you! Let's have a great time! 🌈"
  ],
  mami: [
    "Welcome Mami! Your grace inspires our universe. 🦋",
    "Hello Mami! Ready to create something beautiful? 🌸",
    "Mami, wonderful to have you here! Let's explore! 💖"
  ],
};

const ProfileWelcome: React.FC<ProfileWelcomeProps> = ({ profile, onComplete }) => {
  const [showWelcome, setShowWelcome] = useState(false);
  const [message, setMessage] = useState('');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Get random welcome message for this profile
    const messages = welcomeMessages[profile.id] || [
      `Welcome back, ${profile.name}! Ready to explore? 🌟`
    ];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    setMessage(randomMessage);

    // Animate in
    setTimeout(() => setShowWelcome(true), 100);

    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 60);

    // Auto-complete after 3 seconds
    const timer = setTimeout(() => {
      setShowWelcome(false);
      setTimeout(onComplete, 500);
    }, 3000);

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, [profile, onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black overflow-hidden">
      {/* Animated gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${profile.color} opacity-30 animate-pulse`}></div>
      
      {/* Radial gradient overlay */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-black/50 to-black"></div>

      {/* Content */}
      <div
        className={`relative z-10 text-center transition-all duration-1000 transform px-4 ${
          showWelcome ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
        }`}
      >
        {/* Profile Avatar with modern glow effect */}
        <div className="relative inline-block mb-8">
          {/* Multiple layered glows for depth */}
          <div className={`absolute inset-0 bg-gradient-to-br ${profile.color} blur-3xl opacity-60 scale-150 animate-pulse`}></div>
          <div className={`absolute inset-0 bg-gradient-to-br ${profile.color} blur-2xl opacity-40 scale-125`}></div>
          
          {/* Avatar container */}
          <div className="relative">
            {/* Rotating ring */}
            <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${profile.color} opacity-30 blur-sm animate-spin-slow`} style={{ animationDuration: '3s' }}></div>
            
            {/* Main avatar */}
            <div 
              className={`relative w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br ${profile.color} flex items-center justify-center text-6xl md:text-7xl border-4 border-white/30 shadow-2xl backdrop-blur-sm`}
              style={{
                animation: 'float 3s ease-in-out infinite'
              }}
            >
              {profile.emoji}
            </div>
          </div>
        </div>

        {/* Welcome Message with modern typography */}
        <div className="mb-6 space-y-2">
          <h1 className="text-3xl md:text-5xl font-bold text-white font-brand leading-tight animate-fadeIn">
            {message.split(' ').map((word, i) => (
              <span
                key={i}
                className="inline-block mx-1"
                style={{
                  animation: 'slideUp 0.5s ease-out forwards',
                  animationDelay: `${i * 0.1}s`,
                  opacity: 0
                }}
              >
                {word}
              </span>
            ))}
          </h1>
        </div>

        {/* Loading progress bar - modern style */}
        <div className="max-w-xs mx-auto mb-8">
          <div className="h-1 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
            <div 
              className={`h-full bg-gradient-to-r ${profile.color} rounded-full transition-all duration-300 shadow-lg`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Diyara mascot with subtle animation */}
        <div 
          className="animate-fadeIn" 
          style={{ 
            animationDelay: '500ms',
            animation: 'bounce 2s ease-in-out infinite'
          }}
        >
          <DiyaMascot className="w-16 h-16 md:w-20 md:h-20 mx-auto opacity-80" />
        </div>

        {/* Skip button with modern styling */}
        <button
          onClick={() => {
            setShowWelcome(false);
            setTimeout(onComplete, 300);
          }}
          className="mt-6 text-gray-400 hover:text-white text-sm transition-all duration-300 px-6 py-2 rounded-full hover:bg-white/5 backdrop-blur-sm"
        >
          Skip →
        </button>
      </div>

      {/* Animated particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className={`absolute rounded-full bg-gradient-to-br ${profile.color}`}
            style={{
              width: `${2 + Math.random() * 4}px`,
              height: `${2 + Math.random() * 4}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 3}s`,
              opacity: 0.3 + Math.random() * 0.4,
            }}
          ></div>
        ))}
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
          }
          50% {
            transform: translateY(-20px) translateX(10px);
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .animate-fadeIn {
          animation: fadeIn 1s ease-out forwards;
        }

        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ProfileWelcome;
