import React from 'react';
import Icon from './Icons';
import { FeatureTab } from '../types';

interface BottomNavProps {
  activeTab: FeatureTab;
  setActiveTab: (tab: FeatureTab) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: FeatureTab.Galaxy, icon: 'galaxy', label: 'Galaxy' },
    { id: FeatureTab.Chat, icon: 'chat', label: 'Chat' },
    { id: FeatureTab.Create, icon: 'create', label: 'Create' },
    { id: FeatureTab.Talk, icon: 'talk', label: 'Talk' },
    { id: FeatureTab.AudioJournal, icon: 'journal', label: 'Journal' },
  ] as const;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-black/30 backdrop-blur-lg h-20 flex justify-around items-center z-20 border-t border-white/10">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setActiveTab(item.id)}
          className={`flex flex-col items-center justify-center gap-1 transition-all duration-200 ease-in-out w-16 ${
            activeTab === item.id ? 'text-yellow-300' : 'text-slate-400 hover:text-yellow-400'
          }`}
          style={{ transform: activeTab === item.id ? 'scale(1.15)' : 'scale(1)' }}
        >
          <Icon name={item.icon} className="w-6 h-6" />
          <span className="text-xs font-semibold font-brand">{item.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default BottomNav;
