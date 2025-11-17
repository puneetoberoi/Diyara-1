import React, { useState } from 'react';
import { UserProfile, MissionState } from '../types';
import MissionView from './MissionView'; 
import Icon from './Icons';
import { nexusPrimeMissions } from '../data/missions';
import { Mission } from '../data/missions';

// A simple component for a moving starfield background
const Starfield = () => (
    <div className="absolute top-0 left-0 w-full h-full -z-10 overflow-hidden">
        <div id="stars1" className="starfield"></div>
        <div id="stars2" className="starfield"></div>
        <div id="stars3" className="starfield"></div>
        <style>{`
            @keyframes move-twink-back {
                from {background-position:0 0;}
                to {background-position:-10000px 5000px;}
            }
            .starfield {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: transparent;
            }
            #stars1 {
                background-image: url('data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCIgd2lkdGg9IjFweCIgaGVpZ2h0PSIx HgiIHZpZXdCb3g9IjAgMCAxIDEiIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDEgMSIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+PHJlY3QgZmlsbD0iI0ZGRkZGRiIgd2lkdGg9IjEiIGhlaWdodD0iMSIvPjwvc3ZnPg==');
                animation: move-twink-back 200s linear infinite;
            }
            #stars2 {
                background-image: url('data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCIgd2lkdGg9IjJweCIgaGVpZ2h0PSIy HgiIHZpZXdCb3g9IjAgMCAyIDIiIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDIgMiIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+PHJlY3QgZmlsbD0iI0ZGRkZGRiIgd2lkdGg9IjIiIGhlaWdodD0iMiIvPjwvc3ZnPg==');
                animation: move-twink-back 150s linear infinite;
            }
            #stars3 {
                background-image: url('data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCIgd2lkdGg9IjNweCIgaGVpZ2h0PSIz HgiIHZpZXdCb3g9IjAgMCAzIDMiIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDMgMyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+PHJlY3QgZmlsbD0iI0ZGRkZGRiIgd2lkdGg9IjMiIGhlaWdodD0iMyIvPjwvc3ZnPg==');
                animation: move-twink-back 100s linear infinite;
            }
        `}</style>
    </div>
);

interface GalaxyViewProps {
    userName: string;
    userProfile: UserProfile;
    missionState: MissionState;
    onMissionComplete: (missionId: string) => void;
}

type MissionStatus = 'complete' | 'current' | 'locked';

const MissionCard: React.FC<Mission & { status: MissionStatus; onStart: () => void, index: number }> = ({ title, narrative, status, onStart, index }) => {
    return (
        <div 
            className={`flex items-center p-4 rounded-xl border transition-all duration-300 animate-fadeIn ${
                status === 'locked' ? 'bg-black/20 border-white/10' : 
                status === 'complete' ? 'bg-green-500/10 border-green-500/30' : 
                'bg-black/30 border-white/20 hover:border-yellow-300 hover:scale-105 hover:shadow-lg hover:shadow-yellow-400/20 cursor-pointer'
            }`}
            style={{ animationDelay: `${index * 100}ms`}}
            onClick={status === 'current' ? onStart : undefined}
        >
             <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center mr-4 font-bold text-lg ${
                status === 'locked' ? 'bg-gray-700 text-gray-400' : 
                status === 'complete' ? 'bg-green-500 text-black' : 
                'bg-yellow-400 text-black'
             }`}>
                <Icon name="sparkle" className="w-6 h-6"/>
            </div>
            <div className="flex-grow">
                <h3 className={`font-bold font-brand ${status === 'locked' ? 'text-gray-400' : 'text-white'}`}>{title}</h3>
                <p className={`text-sm ${status === 'locked' ? 'text-gray-500' : 'text-slate-300'}`}>{narrative}</p>
            </div>
            <div className="ml-4 w-24 text-right">
                {status === 'current' && <button onClick={onStart} className="bg-yellow-400 text-black font-bold py-2 px-5 rounded-full text-sm hover:bg-yellow-300 transition-all hover:scale-105 animate-pulse">Launch</button>}
                {status === 'locked' && <div className="inline-flex items-center justify-center bg-gray-800 rounded-full text-gray-500 w-10 h-10">🔒</div>}
                {status === 'complete' && <div className="font-bold text-green-400">Complete</div>}
            </div>
        </div>
    );
};

const GalaxyView: React.FC<GalaxyViewProps> = ({ userName, userProfile, missionState, onMissionComplete }) => {
  const [activeMission, setActiveMission] = useState<Mission | null>(null);

  const getMissionStatus = (missionId: string, index: number): MissionStatus => {
      if (missionState.completedMissions.includes(missionId)) {
          return 'complete';
      }
      const firstIncompleteIndex = nexusPrimeMissions.findIndex(m => !missionState.completedMissions.includes(m.id));
      if (index === firstIncompleteIndex || firstIncompleteIndex === -1 && index === 0) {
          return 'current';
      }
      return 'locked';
  };

  if (activeMission) {
      return <MissionView mission={activeMission} onBack={() => setActiveMission(null)} onComplete={onMissionComplete} />;
  }

  return (
    <div className="p-4 relative min-h-full">
      <Starfield />
      <div className="bg-black/20 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-white/10 mb-6 animate-fadeIn">
        <h1 className="text-2xl font-bold font-brand holographic-text">Galaxy: {userProfile.topic}</h1>
        <p className="text-slate-300">Your current mission awaits, {userName}.</p>
      </div>

      <div className="space-y-4">
        {nexusPrimeMissions.map((mission, index) => {
            const status = getMissionStatus(mission.id, index);
            return (
                <MissionCard
                    key={mission.id} 
                    {...mission}
                    index={index}
                    status={status}
                    onStart={() => status === 'current' && setActiveMission(mission)}
                />
            );
        })}
      </div>
    </div>
  );
};

export default GalaxyView;