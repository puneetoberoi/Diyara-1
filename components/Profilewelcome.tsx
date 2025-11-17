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

  useEffect(() => {
    // Get random welcome message for this profile
    const messages = welcomeMessages[profile.id] || [
      `Welcome back, ${profile.name}! Ready to explore? 🌟`
    ];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    setMessage(randomMessage);

    // Animate in
    setTimeout(() => setShowWelcome(true), 100);

    // Auto-complete after 3 seconds
    const timer = setTimeout(() => {
      setShowWelcome(false);
      setTimeout(onComplete, 500);
    }, 3000);

    return () => clearTimeout(timer);
  }, [profile, onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-purple-900 via-slate-900 to-black">
      <div
        className={`text-center transition-all duration-1000 transform ${
          showWelcome ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
        }`}
      >
        {/* Profile Picture with Glow */}
        <div className="relative inline-block mb-8">
          <div className={`absolute inset-0 bg-gradient-to-br ${profile.color} blur-3xl opacity-50 animate-pulse`}></div>
          <div className={`relative w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br ${profile.color} flex items-center justify-center text-6xl md:text-7xl border-4 border-white/30 shadow-2xl animate-bounce`}>
            {profile.emoji}
          </div>
        </div>

        {/* Welcome Message */}
        <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 font-brand holographic-text animate-fadeIn">
          {message}
        </h1>

        {/* Diyara Mascot */}
        <div className="mt-8 animate-fadeIn" style={{ animationDelay: '300ms' }}>
          <DiyaMascot className="w-16 h-16 md:w-20 md:h-20 mx-auto" />
        </div>

        {/* Loading Dots */}
        <div className="flex justify-center gap-2 mt-8">
          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
        </div>

        {/* Skip Button */}
        <button
          onClick={() => {
            setShowWelcome(false);
            setTimeout(onComplete, 300);
          }}
          className="mt-8 text-slate-400 hover:text-yellow-400 text-sm transition-colors"
        >
          Skip →
        </button>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-yellow-400/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default ProfileWelcome;
