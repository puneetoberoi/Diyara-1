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
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-black flex items-center justify-center p-4">
        <div className="max-w-3xl w-full">
          {/* Main Welcome Card */}
          <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-slate-700 shadow-2xl">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="text-6xl mb-4 animate-bounce">🌟</div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Welcome to <span className="text-yellow-400">Diyara</span>!
              </h1>
              <p className="text-xl text-slate-300">
                Your AI Companion for Organizing Thoughts
              </p>
            </div>

            {/* Description */}
            <div className="bg-slate-800/50 rounded-xl p-6 mb-8 border border-slate-700">
              <p className="text-slate-300 text-center leading-relaxed">
                An AI's first thought is a jumble of data. Help it find clarity and structure
                with the power of Groq AI - completely <span className="text-yellow-400 font-semibold">FREE</span> and lightning fast! ⚡
              </p>
            </div>

            {/* Setup Steps */}
            <div className="space-y-4 mb-8">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">🚀</span>
                Quick Setup (30 seconds):
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-start gap-4 bg-slate-800/30 p-4 rounded-lg border border-slate-700">
                  <span className="flex-shrink-0 w-8 h-8 bg-yellow-500 text-black font-bold rounded-full flex items-center justify-center">
                    1
                  </span>
                  <div>
                    <p className="text-white font-medium mb-1">Get Your Free Groq API Key</p>
                    <p className="text-slate-400 text-sm">
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

                <div className="flex items-start gap-4 bg-slate-800/30 p-4 rounded-lg border border-slate-700">
                  <span className="flex-shrink-0 w-8 h-8 bg-yellow-500 text-black font-bold rounded-full flex items-center justify-center">
                    2
                  </span>
                  <div>
                    <p className="text-white font-medium mb-1">Enter Your Key</p>
                    <p className="text-slate-400 text-sm">
                      Copy the key and paste it in the next screen
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 bg-slate-800/30 p-4 rounded-lg border border-slate-700">
                  <span className="flex-shrink-0 w-8 h-8 bg-yellow-500 text-black font-bold rounded-full flex items-center justify-center">
                    3
                  </span>
                  <div>
                    <p className="text-white font-medium mb-1">Start Using Diyara!</p>
                    <p className="text-slate-400 text-sm">
                      Your AI companion will be ready to help you organize your thoughts
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Why Groq Box */}
            <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-700/50 rounded-lg p-4 mb-8">
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚡</span>
                <div>
                  <p className="text-purple-300 font-medium mb-1">Why Groq?</p>
                  <p className="text-purple-200 text-sm">
                    Groq is blazing fast, completely free (14,400 requests/day), and uses powerful models like Llama 3! 
                    No credit card needed!
                  </p>
                </div>
              </div>
            </div>

            {/* Privacy Note */}
            <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4 mb-8">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🔒</span>
                <div>
                  <p className="text-blue-300 font-medium mb-1">Privacy First</p>
                  <p className="text-blue-200 text-sm">
                    Your API key is stored only in your browser's local storage. 
                    It never leaves your device and is completely private to you.
                  </p>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <button
              onClick={handleGetStarted}
              className="w-full py-4 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold text-lg rounded-xl transition-all transform hover:scale-105 active:scale-95 shadow-lg"
            >
              Get Started - It's Free! 🚀
            </button>

            {/* Footer Note */}
            <p className="text-center text-slate-500 text-sm mt-6">
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
