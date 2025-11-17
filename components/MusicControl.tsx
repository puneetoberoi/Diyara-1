import React from 'react';
import Icon from './Icons';

interface MusicControlProps {
    isMusicPlaying: boolean;
    onToggleMusic: () => void;
}

const MusicControl: React.FC<MusicControlProps> = ({ isMusicPlaying, onToggleMusic }) => {
    return (
        <button
            onClick={onToggleMusic}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-black/20 text-slate-300 hover:bg-white/10 hover:text-yellow-300 transition-colors disabled:opacity-50"
            title={isMusicPlaying ? 'Pause Music' : 'Play Music'}
        >
            <Icon name={isMusicPlaying ? 'pause' : 'music'} className="w-5 h-5" />
        </button>
    );
};

export default MusicControl;