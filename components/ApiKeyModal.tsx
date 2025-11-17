import React, { useState, useEffect } from 'react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  forceShow?: boolean;
}

export default function ApiKeyModal({ isOpen, onClose, forceShow = false }: ApiKeyModalProps) {
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const savedKey = localStorage.getItem('GROQ_API_KEY');
    if (savedKey) {
      setApiKey('••••••••••••••••');
      setSaved(true);
    }
  }, [isOpen]);

  const handleSave = () => {
    if (apiKey.trim() && !apiKey.includes('•')) {
      localStorage.setItem('GROQ_API_KEY', apiKey.trim());
      setSaved(true);
      setTimeout(() => {
        setIsClosing(true);
        setTimeout(() => {
          window.location.reload();
        }, 300);
      }, 1000);
    }
  };

  const handleClear = () => {
    if (confirm('Are you sure you want to remove your API key? You will need to enter it again.')) {
      localStorage.removeItem('GROQ_API_KEY');
      setApiKey('');
      setSaved(false);
      if (!forceShow) {
        setTimeout(() => window.location.reload(), 500);
      }
    }
  };

  const handleClose = () => {
    if (!forceShow) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}>
      <div className={`bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl max-w-lg w-full p-8 border border-slate-700 shadow-2xl transform transition-transform duration-300 ${isClosing ? 'scale-95' : 'scale-100'}`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <span className="text-3xl">🔑</span> API Key Settings
          </h2>
          {!forceShow && (
            <button 
              onClick={handleClose} 
              className="text-slate-400 hover:text-white transition-colors p-1 hover:bg-slate-700 rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Groq API Key
            </label>
            <input
              type={saved && apiKey.includes('•') ? "password" : "text"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your Groq API key (starts with gsk_...)"
              className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
            />
          </div>

          {saved && (
            <div className="flex items-center gap-2 text-green-400 text-sm bg-green-900/30 border border-green-700/50 p-3 rounded-lg animate-pulse">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="font-medium">API key saved! Reloading...</span>
            </div>
          )}

          <div className="text-sm text-slate-300 space-y-3 bg-slate-800/50 border border-slate-700 p-4 rounded-lg">
            <p className="flex items-start gap-2">
              <span className="text-lg">🔐</span>
              <span>Your API key is stored locally in your browser only. It never leaves your device.</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-lg">📝</span>
              <span>
                Get your free key from{' '}
                <a
                  href="https://console.groq.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-yellow-400 hover:text-yellow-300 underline font-medium"
                >
                  Groq Console
                </a>
              </span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-lg">⚡</span>
              <span>Groq is super fast and free - 14,400 requests per day!</span>
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={!apiKey.trim() || apiKey.includes('•')}
              className="flex-1 px-4 py-3 bg-yellow-500 hover:bg-yellow-600 disabled:bg-slate-700 disabled:cursor-not-allowed text-black font-bold rounded-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg disabled:transform-none"
            >
              {saved ? 'Update Key' : 'Save & Continue'}
            </button>
            {saved && (
              <button
                onClick={handleClear}
                className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all transform hover:scale-105 active:scale-95 shadow-lg"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
