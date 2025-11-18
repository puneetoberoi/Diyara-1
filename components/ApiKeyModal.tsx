import React, { useState } from 'react';
import DiyaMascot from './DiyaMascot';

interface ApiKeySetupProps {
  onComplete: () => void;
}

const ApiKeySetup: React.FC<ApiKeySetupProps> = ({ onComplete }) => {
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const handleSave = () => {
    if (apiKey.trim() && apiKey.trim().startsWith('gsk_')) {
      localStorage.setItem('GROQ_API_KEY', apiKey.trim());
      setSaved(true);
      setTimeout(() => {
        setIsClosing(true);
        setTimeout(() => {
          onComplete();
        }, 300);
      }, 1000);
    } else {
      alert('Please enter a valid Groq API key (starts with gsk_...)');
    }
  };

  return (
    <div className={`fixed inset-0 w-screen h-screen overflow-y-auto bg-gradient-to-br from-purple-900 via-slate-900 to-black transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}>
      <div className="min-h-screen flex items-center justify-center p-4 py-8">
        <div className={`w-full max-w-2xl transform transition-transform duration-300 ${isClosing ? 'scale-95' : 'scale-100'}`}>
          {/* Header with Diyara */}
          <div className="text-center mb-6">
            <div className="mb-4 inline-block relative">
              <div className="absolute inset-0 rounded-full bg-yellow-400 blur-3xl opacity-60 scale-150 animate-pulse" />
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-yellow-300 via-yellow-400 to-orange-500 flex items-center justify-center shadow-2xl border-4 border-yellow-200/30 overflow-hidden">
                <DiyaMascot className="w-full h-full object-cover scale-110" />
              </div>
            </div>
            
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">
              Welcome to <span className="text-yellow-400">Diyara</span>!
            </h1>
            <p className="text-gray-300 text-sm sm:text-base md:text-lg px-2">
              Your AI Companion for Organizing Thoughts
            </p>
          </div>

          {/* Main card */}
          <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-8 border-2 border-white/20 shadow-2xl mb-4">
            {/* Description */}
            <div className="bg-slate-800/50 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 border border-slate-700">
              <p className="text-slate-300 text-center text-xs sm:text-sm md:text-base leading-relaxed">
                An AI's first thought is a jumble of data. Help it find clarity and structure
                with the power of <span className="text-yellow-400 font-semibold">Groq AI</span> - completely <span className="text-yellow-400 font-semibold">FREE</span> and lightning fast! ⚡
              </p>
            </div>

            {/* Setup steps */}
            <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
              <h3 className="text-sm sm:text-base md:text-lg font-semibold text-white mb-2 sm:mb-3 flex items-center gap-2">
                <span className="text-base sm:text-xl">🚀</span>
                Quick Setup (30 seconds):
              </h3>
              
              <div className="space-y-2">
                {/* Step 1 */}
                <div className="flex items-start gap-2 sm:gap-3 bg-slate-800/30 p-2 sm:p-3 rounded-lg border border-slate-700">
                  <span className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 bg-yellow-500 text-black font-bold rounded-full flex items-center justify-center text-xs sm:text-sm">
                    1
                  </span>
                  <div className="flex-1">
                    <p className="text-white font-medium text-xs sm:text-sm mb-0.5 sm:mb-1">Get Your Free Groq API Key</p>
                    <p className="text-slate-400 text-[10px] sm:text-xs">
                      Visit{' '}
                      <a 
                        href="https://console.groq.com/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-yellow-400 hover:text-yellow-300 underline font-medium"
                      >
                        Groq Console
                      </a>
                      {' '}and create a free API key
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-start gap-2 sm:gap-3 bg-slate-800/30 p-2 sm:p-3 rounded-lg border border-slate-700">
                  <span className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 bg-yellow-500 text-black font-bold rounded-full flex items-center justify-center text-xs sm:text-sm">
                    2
                  </span>
                  <div className="flex-1">
                    <p className="text-white font-medium text-xs sm:text-sm mb-0.5 sm:mb-1">Enter Your Key Below</p>
                    <p className="text-slate-400 text-[10px] sm:text-xs">
                      Copy the key and paste it in the input field
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-start gap-2 sm:gap-3 bg-slate-800/30 p-2 sm:p-3 rounded-lg border border-slate-700">
                  <span className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 bg-yellow-500 text-black font-bold rounded-full flex items-center justify-center text-xs sm:text-sm">
                    3
                  </span>
                  <div className="flex-1">
                    <p className="text-white font-medium text-xs sm:text-sm mb-0.5 sm:mb-1">Start Working with Diyara!</p>
                    <p className="text-slate-400 text-[10px] sm:text-xs">
                      Your AI companion will be ready to help you organize your thoughts
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* API Key input */}
            <div className="mb-4">
              <label className="block text-xs sm:text-sm font-semibold text-slate-300 mb-2">
                Groq API Key
              </label>
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your Groq API key (starts with gsk_...)"
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-800 border border-slate-600 rounded-lg text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                disabled={saved}
              />
            </div>

            {/* Success message */}
            {saved && (
              <div className="flex items-center gap-2 text-green-400 text-xs sm:text-sm bg-green-900/30 border border-green-700/50 p-2 sm:p-3 rounded-lg animate-pulse mb-4">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-medium">API key saved! Starting your journey...</span>
              </div>
            )}

            {/* Privacy note */}
            <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-2 sm:p-3 mb-4">
              <div className="flex items-start gap-2">
                <span className="text-base sm:text-xl">🔒</span>
                <div className="flex-1">
                  <p className="text-blue-300 font-medium text-xs sm:text-sm mb-0.5 sm:mb-1">Privacy First</p>
                  <p className="text-blue-200 text-[10px] sm:text-xs">
                    Your API key is stored only in your browser's local storage. 
                    It never leaves your device and is completely private to you.
                  </p>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-2 sm:p-3 mb-4">
              <div className="space-y-1 sm:space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm sm:text-base">⚡</span>
                  <p className="text-slate-300 text-[10px] sm:text-xs">Groq is super fast and free - 14,400 requests per day!</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm sm:text-base">🌟</span>
                  <p className="text-slate-300 text-[10px] sm:text-xs">Powerful AI to help organize your thoughts</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm sm:text-base">🔐</span>
                  <p className="text-slate-300 text-[10px] sm:text-xs">Your data stays private on your device</p>
                </div>
              </div>
            </div>

            {/* Save button */}
            <button
              onClick={handleSave}
              disabled={!apiKey.trim() || saved}
              className="w-full py-3 sm:py-4 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 disabled:from-gray-600 disabled:to-gray-700 text-black disabled:text-gray-400 font-bold text-sm sm:text-base md:text-lg rounded-xl transition-all transform hover:scale-105 active:scale-95 disabled:scale-100 disabled:cursor-not-allowed shadow-lg disabled:shadow-none"
            >
              {saved ? 'Starting...' : 'Save & Continue'} {!saved && '🚀'}
            </button>
          </div>

          {/* Footer */}
          <p className="text-center text-slate-500 text-[10px] sm:text-xs">
            Made with ❤️ by Proud Parents
          </p>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default ApiKeySetup;
