import React, { useState } from 'react';
import Icon from './Icons';

interface SettingsModalProps {
    onClose: () => void;
    onReset: () => void;
    onOpenParentDashboard: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, onReset, onOpenParentDashboard }) => {
    const [confirmingReset, setConfirmingReset] = useState(false);

    const handleResetClick = () => {
        if (confirmingReset) {
            onReset();
        } else {
            setConfirmingReset(true);
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn"
            onClick={onClose}
        >
            <div 
                className="bg-slate-900 border border-yellow-300/30 rounded-xl p-6 max-w-md w-full relative" 
                onClick={e => e.stopPropagation()}
            >
                <button onClick={onClose} className="absolute top-3 right-3 text-slate-400 hover:text-white">
                    <Icon name="close" className="w-6 h-6" />
                </button>
                <h2 className="text-2xl font-brand font-bold text-yellow-300 mb-6 text-center">Settings</h2>

                <div className="space-y-4">
                     <button
                        onClick={onOpenParentDashboard}
                        className="w-full py-3 px-5 rounded-lg font-bold transition-colors bg-blue-500/50 hover:bg-blue-500/70 text-blue-100"
                    >
                        Parent Dashboard
                    </button>
                    
                    <div className="border-t border-white/10 my-4"></div>

                    <div>
                        <p className="text-slate-300 text-sm mb-2">
                            This will erase all your progress from this device, including your profile, creations, and mission history. This action cannot be undone.
                        </p>
                        <button
                            onClick={handleResetClick}
                            className={`w-full py-3 px-5 rounded-lg font-bold transition-colors ${
                                confirmingReset
                                    ? 'bg-red-600 hover:bg-red-500 text-white animate-pulse'
                                    : 'bg-red-500/50 hover:bg-red-500/70 text-red-100'
                            }`}
                        >
                            {confirmingReset ? 'Confirm Reset' : 'Reset All Progress'}
                        </button>
                        {confirmingReset && (
                            <button onClick={() => setConfirmingReset(false)} className="w-full text-center text-slate-400 text-sm mt-2 hover:text-white">
                                Cancel
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;