import React, { useState } from 'react';
import ApiKeyModal from './ApiKeyModal';

interface WelcomeScreenProps {
  onComplete: () => void;
}

export default function WelcomeScreen({ onComplete }: WelcomeScreenProps) {
  const [showModal, setShowModal] = useState(false);

  const handleGetStarted = () => {
    setShowModal(true);
  };

  const handleModalClose = () => {
    const apiKey = localStorage.getItem('GROQ_API_KEY');
    if (apiKey) {
      onComplete();
    } else {
      setShowModal(false);
    }
  };

  return (
    <>
      <div className="min-h-screen max-h-screen overflow-y-auto bg-gradient-to-br from-purple-900 via-slate-900 to-black flex items-center justify-center p-4 py-8">
        <div className="max-w-2xl w-full my-8">
          {/* Main Welcome Card */}
          <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl p-6 md:p-10 border border-slate-700 shadow-2xl">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="text-5xl mb-3 animate-bounce">🌟</div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                Welcome to <span className="text-yellow-400">Diyara</span>!
              </h1>
              <p className="text-lg md:text-xl text-slate-300">
                Your AI Companion for Organizing Thoughts
              </p>
            </div>

            {/* Description */}
            <div className="bg-slate-800/50 rounded-xl p-4 mb-6 border border-slate-700">
              <p className="text-slate-300 text-center text-sm md:text-base leading-relaxed">
                An AI's first thought is a jumble of data. Help it find clarity and structure
                with the power of Groq AI - completely <span className="text-yellow-400 font-semibold">FREE</span> and lightning fast! ⚡
              </p>
            </div>

            {/* Setup Steps */}
            <div className="space-y-3 mb-6">
              <h3 className="text-base md:text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <span className="text-xl">🚀</span>
                Quick Setup (30 seconds):
              </h3>
              
              <div className="space-y-2">
                <div className="flex items-start gap-3 bg-slate-800/30 p-3 rounded-lg border border-slate-700">
                  <span className="flex-shrink-0 w-7 h-7 bg-yellow-500 text-black font-bold rounded-full flex items-center justify-center text-sm">
                    1
                  </span>
                  <div>
                    <p className="text-white font-medium text-sm mb-1">Get Your Free Groq API Key</p>
                    <p className="text-slate-400 text-xs">
                      Visit{' '}
                      <a 
                        href="https://console.groq.com/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-yellow-400 hover:text-yellow-300 underline"
                      >
                        Groq Console
                      </a>
                      {' '}and create a free API key
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-slate-800/30 p-3 rounded-lg border border-slate-700">
                  <span className="flex-shrink-0 w-7 h-7 bg-yellow-500 text-black font-bold rounded-full flex items-center justify-center text-sm">
                    2
                  </span>
                  <div>
                    <p className="text-white font-medium text-sm mb-1">Enter Your Key</p>
                    <p className="text-slate-400 text-xs">
                      Copy the key and paste it in the next screen
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-slate-800/30 p-3 rounded-lg border border-slate-700">
                  <span className="flex-shrink-0 w-7 h-7 bg-yellow-500 text-black font-bold rounded-full flex items-center justify-center text-sm">
                    3
                  </span>
                  <div>
                    <p className="text-white font-medium text-sm mb-1">Start Using Diyara!</p>
                    <p className="text-slate-400 text-xs">
                      Your AI companion will be ready to help you organize your thoughts
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Privacy Note */}
            <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-3 mb-6">
              <div className="flex items-start gap-2">
                <span className="text-xl">🔒</span>
                <div>
                  <p className="text-blue-300 font-medium text-sm mb-1">Privacy First</p>
                  <p className="text-blue-200 text-xs">
                    Your API key is stored only in your browser's local storage. 
                    It never leaves your device and is completely private to you.
                  </p>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <button
              onClick={handleGetStarted}
              className="w-full py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold text-base md:text-lg rounded-xl transition-all transform hover:scale-105 active:scale-95 shadow-lg"
            >
              Get Started - It's Free! 🚀
            </button>

            {/* Footer Note */}
            <p className="text-center text-slate-500 text-xs mt-4">
              Made with ❤️ by a 13-year-old developer
            </p>
          </div>
        </div>
      </div>

      <ApiKeyModal 
        isOpen={showModal} 
        onClose={handleModalClose}
        forceShow={true}
      />
    </>
  );
}
