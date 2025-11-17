import React from 'react';
import Icon from './Icons';

interface MusicConsentModalProps {
    onConsent: () => void;
    onDismiss: () => void;
}

const MusicConsentModal: React.FC<MusicConsentModalProps> = ({ onConsent, onDismiss }) => {
    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div 
                className="bg-slate-900 border border-yellow-300/30 rounded-xl p-6 max-w-sm w-full text-center"
            >
                <Icon name="music" className="w-12 h-12 text-yellow-300 mx-auto mb-4" />
                <h2 className="text-xl font-brand font-bold text-white mb-2">Enable Ambient Sound?</h2>
                <p className="text-slate-300 mb-6">
                    Diyara includes a futuristic soundtrack to enhance your learning journey.
                </p>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={onConsent}
                        className="w-full py-3 px-5 rounded-lg font-bold transition-colors bg-yellow-400 text-black hover:bg-yellow-300"
                    >
                        Enable Sound
                    </button>
                    <button
                        onClick={onDismiss}
                        className="w-full text-center text-slate-400 text-sm hover:text-white"
                    >
                        Maybe Later
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MusicConsentModal;
