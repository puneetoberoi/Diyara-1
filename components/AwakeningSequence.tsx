import React, { useState } from 'react';
import { UserProfile } from '../types';
import DiyaMascot from './DiyaMascot';

interface AwakeningSequenceProps {
  onComplete: (profile: UserProfile, name: string) => void;
  profileName?: string; // Profile name passed from selection
}

const AwakeningSequence: React.FC<AwakeningSequenceProps> = ({ onComplete, profileName }) => {
  const [step, setStep] = useState(1);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  const topics = [
    { id: 'space', name: 'Space & Cosmos', icon: '🌌', description: 'Explore the universe!' },
    { id: 'nature', name: 'Nature & Animals', icon: '🦋', description: 'Discover the wild!' },
    { id: 'art', name: 'Art & Creativity', icon: '🎨', description: 'Create and imagine!' },
    { id: 'science', name: 'Science & Technology', icon: '🔬', description: 'Learn and innovate!' },
    { id: 'stories', name: 'Stories & Adventures', icon: '📚', description: 'Read and explore!' },
    { id: 'music', name: 'Music & Dance', icon: '🎵', description: 'Feel the rhythm!' },
  ];

  const handleTopicSelect = (topicId: string) => {
    setSelectedTopic(topicId);
  };

  const handleContinue = () => {
    if (selectedTopic) {
      const topic = topics.find(t => t.id === selectedTopic);
      if (topic) {
        const profile: UserProfile = {
          name: profileName || 'Explorer', // Use profile name
          topic: topic.name,
          avatar: topic.icon,
        };
        onComplete(profile, profileName || 'Explorer');
      }
    }
  };

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-y-auto bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950">
      <div className="min-h-screen flex items-center justify-center p-4 py-8">
        <div className="w-full max-w-4xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mb-6 inline-block relative">
              <div className="absolute inset-0 rounded-full bg-yellow-400 blur-3xl opacity-60 scale-150 animate-pulse" />
              <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-yellow-300 via-yellow-400 to-orange-500 flex items-center justify-center shadow-2xl border-4 border-yellow-200/30 overflow-hidden">
                <DiyaMascot className="w-full h-full object-cover scale-110" />
              </div>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 font-brand">
              Welcome, <span className="text-yellow-400">{profileName || 'Explorer'}</span>! 🌟
            </h1>
            <p className="text-gray-300 text-base sm:text-lg md:text-xl max-w-2xl mx-auto">
              I'm Diyara, your AI companion! Let's choose your universe to explore together.
            </p>
          </div>

          {/* Topic Selection */}
          <div className="mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white text-center mb-6">
              Choose Your Galaxy of Interest:
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {topics.map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => handleTopicSelect(topic.id)}
                  className={`relative p-6 rounded-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                    selectedTopic === topic.id
                      ? 'bg-gradient-to-br from-yellow-500 to-yellow-600 shadow-2xl shadow-yellow-500/50 scale-105'
                      : 'bg-slate-800/50 hover:bg-slate-800/70 border-2 border-slate-600 hover:border-yellow-400'
                  }`}
                >
                  <div className="text-5xl sm:text-6xl mb-3">{topic.icon}</div>
                  <h3 className={`text-lg sm:text-xl font-bold mb-2 ${
                    selectedTopic === topic.id ? 'text-black' : 'text-white'
                  }`}>
                    {topic.name}
                  </h3>
                  <p className={`text-sm ${
                    selectedTopic === topic.id ? 'text-black/80' : 'text-gray-400'
                  }`}>
                    {topic.description}
                  </p>
                  
                  {selectedTopic === topic.id && (
                    <div className="absolute top-3 right-3">
                      <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Continue Button */}
          <div className="text-center">
            <button
              onClick={handleContinue}
              disabled={!selectedTopic}
              className={`px-8 py-4 rounded-xl font-bold text-lg sm:text-xl transition-all transform ${
                selectedTopic
                  ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black hover:scale-105 active:scale-95 shadow-lg'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              Begin Your Journey ✨
            </button>
          </div>

          {/* Info Note */}
          <p className="text-center text-gray-500 text-sm mt-6">
            💡 Don't worry, you can explore all galaxies anytime!
          </p>
        </div>
      </div>
    </div>
  );
};

export default AwakeningSequence;
