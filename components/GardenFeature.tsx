import React, { useState } from 'react';
import { MissionState } from '../types';
import Icon from './Icons';
import { nexusPrimeMissions, Mission } from '../data/missions';

const missionPositions: { [id: string]: { x: string, y: string } } = {
    'awakening': { x: '50%', y: '50%' },
    'pattern-dancer': { x: '30%', y: '30%' },
    'emotion-painter': { x: '70%', y: '30%' },
    // Add more positions for future missions
};

const NeuralFlower: React.FC<{ mission: Mission; index: number; onClick: () => void }> = ({ mission, index, onClick }) => {
    const seed = mission.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const petals = 5 + (seed % 4);
    const colorHue = (seed * 137.5) % 360;
    const size = 60 + (seed % 40);
    const position = missionPositions[mission.id] || { x: `${20 + (seed % 60)}%`, y: `${20 + (seed % 60)}%` };

    return (
        <div
            className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer animate-pulse-glow"
            style={{ 
                left: position.x, 
                top: position.y, 
                width: `${size}px`, 
                height: `${size}px`,
                animationDelay: `${index * 150}ms`,
                ['--glow-hue' as any]: colorHue,
            }}
            onClick={onClick}
            title={`Memory of: ${mission.title}`}
        >
            {Array.from({ length: petals }).map((_, i) => (
                <div 
                    key={i} 
                    style={{
                        width: `${size / 2}px`,
                        height: `${size / 2}px`,
                        background: `hsl(${colorHue}, 80%, 60%)`,
                        borderRadius: '50% 0',
                        position: 'absolute',
                        left: '50%',
                        top: '50%',
                        transformOrigin: '0% 0%',
                        transform: `translateX(-50%) translateY(-50%) rotate(${(360 / petals) * i}deg)`
                    }}
                />
            ))}
            <div style={{
                width: `${size / 3}px`,
                height: `${size / 3}px`,
                background: `radial-gradient(circle, hsl(${colorHue + 60}, 100%, 80%), hsl(${colorHue}, 80%, 60%))`,
                borderRadius: '50%',
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                boxShadow: `0 0 10px hsl(${colorHue + 60}, 100%, 80%)`,
            }} />
        </div>
    );
};


const GardenFeature: React.FC<{ missionState: MissionState }> = ({ missionState }) => {
    const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
    const { completedMissions } = missionState;

    if (completedMissions.length === 0) {
        return (
            <div className="p-6 text-center animate-fadeIn flex flex-col items-center justify-center h-full">
                <Icon name="garden" className="w-20 h-20 text-slate-600 mb-4" />
                <h2 className="text-3xl font-brand holographic-text mb-4">Your Neural Garden is Seeded</h2>
                <p className="text-slate-300 max-w-md">This is where your knowledge will grow. Complete missions in the Galaxy to cultivate your first Neural Flower. Each completed lesson blossoms into a unique memory here.</p>
            </div>
        );
    }
    
    const completedMissionDetails = nexusPrimeMissions.filter(m => completedMissions.includes(m.id));

    return (
        <div className="p-4 animate-fadeIn h-full flex flex-col">
            <div className="text-center mb-4">
                <h2 className="text-3xl font-brand holographic-text">Neural Garden</h2>
                <p className="text-slate-300">Your constellation of knowledge. Click a flower to revisit a memory.</p>
            </div>
            <div className="flex-grow relative bg-black/20 rounded-xl border border-white/10 overflow-hidden">
                <svg width="100%" height="100%" className="absolute inset-0">
                    {completedMissionDetails.map((mission, index) => {
                        if (index === 0) return null; // No path from the first node
                        const prevMission = completedMissionDetails[index-1];
                        const pos1 = missionPositions[prevMission.id];
                        const pos2 = missionPositions[mission.id];
                        if(!pos1 || !pos2) return null;

                        return (
                            <line 
                                key={`${prevMission.id}-${mission.id}`}
                                x1={pos1.x} y1={pos1.y}
                                x2={pos2.x} y2={pos2.y}
                                className="neural-pathway"
                                style={{animationDelay: `${index * 200}ms`}}
                            />
                        )
                    })}
                </svg>
                {completedMissionDetails.map((mission, index) => (
                    <NeuralFlower key={mission.id} mission={mission} index={index} onClick={() => setSelectedMission(mission)}/>
                ))}
            </div>
            
            {selectedMission && (
                <div 
                    className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn"
                    onClick={() => setSelectedMission(null)}
                >
                    <div className="bg-slate-900 border border-yellow-300/30 rounded-xl p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
                         <h3 className="text-2xl font-brand font-bold text-yellow-300 mb-2">Memory Core: {selectedMission.title}</h3>
                         <p className="text-slate-300">{selectedMission.narrative}</p>
                         <button
                            onClick={() => setSelectedMission(null)}
                            className="mt-6 bg-yellow-400 text-black font-bold py-2 px-5 rounded-full text-sm hover:bg-yellow-300 transition-colors w-full"
                         >
                            Close Memory
                         </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GardenFeature;