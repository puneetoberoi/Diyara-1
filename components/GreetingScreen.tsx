// GreetingScreen - Futuristic welcome animation
import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';

interface GreetingScreenProps {
  profile: UserProfile;
  onComplete: () => void;
}

const GreetingScreen: React.FC<GreetingScreenProps> = ({ profile, onComplete }) => {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStage(1), 1000),
      setTimeout(() => setStage(2), 2500),
      setTimeout(() => setStage(3), 4000),
      setTimeout(() => onComplete(), 6000),
    ];

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 w-screen h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-black flex items-center justify-center overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-yellow-400 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDuration: `${3 + Math.random() * 4}s`,
              animationDelay: `${Math.random() * 2}s`,
              opacity: 0.3 + Math.random() * 0.4,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-2xl">
        {/* Stage 1: Profile avatar */}
        {stage >= 1 && (
          <div className="mb-8 animate-fadeIn">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-yellow-400 rounded-full blur-3xl opacity-60 scale-150 animate-pulse" />
              <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-yellow-300 via-yellow-400 to-orange-500 flex items-center justify-center text-7xl shadow-2xl border-4 border-yellow-200/30">
                {profile.avatar}
              </div>
            </div>
          </div>
        )}

        {/* Stage 2: Greeting message */}
        {stage >= 2 && (
          <div className="mb-6 animate-fadeIn">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 holographic-text">
              {profile.greeting}
            </h1>
            <p className="text-xl sm:text-2xl text-yellow-300 font-medium">
              Welcome, {profile.name}!
            </p>
          </div>
        )}

        {/* Stage 3: Topic introduction */}
        {stage >= 3 && (
          <div className="animate-fadeIn">
            <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border-2 border-yellow-400/30">
              <div className="flex items-center justify-center gap-3 mb-3">
                <span className="text-4xl">{profile.topicIcon}</span>
                <h2 className="text-2xl font-bold text-white">
                  {profile.topic}
                </h2>
              </div>
              <p className="text-slate-300 text-lg">
                Let's explore together and create something amazing!
              </p>
            </div>
          </div>
        )}

        {/* Loading indicator */}
        <div className="mt-8">
          <div className="w-64 h-2 bg-slate-800 rounded-full mx-auto overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-1000"
              style={{ width: `${(stage / 3) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GreetingScreen;
