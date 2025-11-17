import React from 'react';
import Icon from './Icons';

interface ParentDashboardProps {
    onBack: () => void;
}

const ParentDashboard: React.FC<ParentDashboardProps> = ({ onBack }) => {
    return (
        <div className="p-4 animate-fadeIn h-full flex flex-col">
             <button 
                onClick={onBack} 
                className="flex items-center gap-2 text-slate-300 font-semibold mb-4 p-2 rounded-lg hover:bg-white/10 transition-colors self-start"
              >
                <Icon name="arrowLeft" className="w-5 h-5" />
                Return to Universe
            </button>
            <div className="flex-grow flex flex-col items-center justify-center text-center bg-black/20 rounded-lg border border-white/10 p-6">
                <Icon name="lock" className="w-16 h-16 text-slate-500 mb-4" />
                <h2 className="text-3xl font-brand holographic-text mb-4">Parent Dashboard</h2>
                <p className="text-slate-300 max-w-md">
                    This feature is under construction. Soon, you'll be able to track learning progress, view creations, and manage settings from here.
                </p>
            </div>
        </div>
    );
};

export default ParentDashboard;
