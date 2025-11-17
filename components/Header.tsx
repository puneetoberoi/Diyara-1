import React from 'react';
import DiyaMascot from './DiyaMascot';
import MusicControl from './MusicControl';
import Icon from './Icons';

interface HeaderProps {
    userName: string;
    onOpenSettings: () => void;
    isMusicPlaying: boolean;
    onToggleMusic: () => void;
}

const Header: React.FC<HeaderProps> = ({ userName, onOpenSettings, isMusicPlaying, onToggleMusic }) => (
  <header className="bg-black/20 backdrop-blur-md sticky top-0 z-20 w-full p-3 flex items-center justify-between shadow-lg shadow-black/20">
    <div className="flex items-center gap-3">
      <DiyaMascot className="w-10 h-10" />
      <div>
        <h1 className="text-xl font-bold font-brand text-white">Hello, {userName}</h1>
        <p className="text-xs text-slate-300">AI Companion: <span className="font-bold text-yellow-300">Diyara</span></p>
      </div>
    </div>
    <div className="flex items-center gap-2">
        <MusicControl isMusicPlaying={isMusicPlaying} onToggleMusic={onToggleMusic} />
        <button
            onClick={onOpenSettings}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-black/20 text-slate-300 hover:bg-white/10 hover:text-yellow-300 transition-colors"
            title="Settings"
        >
            <Icon name="settings" className="w-5 h-5" />
        </button>
    </div>
  </header>
);

export default Header;