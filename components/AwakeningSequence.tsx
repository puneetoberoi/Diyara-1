import React, { useState } from 'react';
import DiyaMascot from './DiyaMascot';
import { UserProfile } from '../types';

type Stage = 'nameEntry' | 'calibration' | 'universeCreation' | 'finalizing';

interface AwakeningProps {
  onComplete: (profile: UserProfile, name: string) => void;
}

const ageGroups = ["5-7", "8-11", "12-14", "15-18", "18+"];
const galaxies = [
  { name: "NEXUS PRIME", topic: "AI Fundamentals", visual: "bg-gradient-to-br from-purple-500 to-indigo-800", preview: "Where machines learn to dream" },
  { name: "ARTIFICA", topic: "Digital Creativity", visual: "bg-gradient-to-br from-pink-500 to-rose-700", preview: "Where imagination meets intelligence" },
  { name: "MECHANICA", topic: "Robotics & Automation", visual: "bg-gradient-to-br from-gray-600 to-slate-800", preview: "Where metal comes to life" },
  { name: "FUTURA", topic: "Tomorrow's Technology", visual: "bg-gradient-to-br from-teal-500 to-cyan-700", preview: "Where the impossible becomes possible" }
];

const StageWrapper: React.FC<{ children: React.ReactNode, isVisible: boolean }> = ({ children, isVisible }) => (
    <div className={`absolute inset-0 w-full h-full flex items-center justify-center p-4 transition-opacity duration-700 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="w-full h-full flex flex-col items-center justify-center text-center animate-fadeIn">
            {children}
        </div>
    </div>
);

const AwakeningSequence: React.FC<AwakeningProps> = ({ onComplete }) => {
  const [stage, setStage] = useState<Stage>('nameEntry');
  const [name, setName] = useState('');
  const [formData, setFormData] = useState({ age: '', topic: '' });

  const canProceedToFinalize = formData.age && formData.topic;

  const updateForm = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({...prev, [field]: value}));
  };
  
  const handleComplete = () => {
    if (canProceedToFinalize && name) {
      setStage('finalizing');
      setTimeout(() => {
          onComplete(formData as UserProfile, name);
      }, 1500);
    }
  };

  document.body.classList.add('awakened');

  return (
    <div className="min-h-screen w-screen flex flex-col items-center justify-center p-4 overflow-hidden relative bg-transparent">
        <StageWrapper isVisible={stage === 'nameEntry'}>
          <div className="w-full max-w-md">
              <DiyaMascot className="w-28 h-28 mx-auto mb-4" />
              <h1 className="text-3xl md:text-5xl font-bold holographic-text mb-4 font-brand">I am Diyara.</h1>
              <p className="text-slate-300 mb-6">It is an honor to finally meet my Creator. What shall I call you?</p>
              <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name..."
                  className="w-full p-3 text-center text-lg border-2 border-slate-700 bg-black/30 rounded-lg focus:ring-2 focus:ring-yellow-300 focus:outline-none transition text-white placeholder:text-slate-400"
              />
              <button
                  onClick={() => setStage('calibration')}
                  disabled={!name.trim()}
                  className="mt-6 bg-yellow-400 text-black font-bold py-3 px-8 rounded-full text-lg shadow-lg shadow-yellow-400/20 transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                  Continue
              </button>
          </div>
        </StageWrapper>
        
        <StageWrapper isVisible={stage === 'calibration'}>
           <div className="w-full max-w-md">
              <h1 className="text-3xl md:text-5xl font-bold holographic-text mb-4 font-brand">Calibration</h1>
              <p className="text-slate-300 mb-8">Let's sync our energies, {name}. How many winters have you seen?</p>
              <div className="grid grid-cols-3 gap-4">
                  {ageGroups.map((group) => (
                  <button
                      key={group}
                      onClick={() => { updateForm('age', group); setStage('universeCreation'); }}
                      className={`p-5 rounded-lg font-semibold text-white transition-all duration-200 text-lg border-2 ${
                      formData.age === group ? 'bg-yellow-400/30 border-yellow-300 scale-105 shadow-lg' : 'bg-white/10 border-white/20 hover:bg-white/20 active:scale-95'
                      }`}
                  >
                      {group}
                  </button>
                  ))}
              </div>
          </div>
        </StageWrapper>

        <StageWrapper isVisible={stage === 'universeCreation'}>
          <div className="w-full max-w-2xl">
              <h1 className="text-3xl md:text-5xl font-bold holographic-text mb-4 font-brand">Choose Your Universe</h1>
              <p className="text-slate-300 mb-8">Our journey begins now, {name}. Select the first galaxy we will explore together.</p>
              <div className="grid grid-cols-2 gap-4">
              {galaxies.map((g) => (
                  <button
                      key={g.name}
                      onClick={() => updateForm('topic', g.topic)}
                      className={`p-6 rounded-xl text-white transition-all duration-300 border-4 active:scale-95 ${formData.topic === g.topic ? 'border-yellow-300 scale-105 shadow-2xl' : 'border-transparent hover:border-yellow-300/50'} ${g.visual}`}
                  >
                      <h3 className="text-xl font-bold font-brand">{g.name}</h3>
                      <p className="text-sm opacity-80">{g.preview}</p>
                  </button>
              ))}
              </div>
              <button
              onClick={handleComplete}
              disabled={!canProceedToFinalize}
              className="mt-12 bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-bold py-4 px-10 rounded-full text-lg shadow-lg transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
              >
              Enter The Universe
              </button>
          </div>
        </StageWrapper>

         <StageWrapper isVisible={stage === 'finalizing'}>
              <div className="flex flex-col items-center justify-center text-center">
                  <DiyaMascot className="w-32 h-32" />
                  <h1 className="text-3xl font-brand holographic-text mt-4 animate-pulse">Creating Your Universe...</h1>
              </div>
         </StageWrapper>
    </div>
  );
};

export default AwakeningSequence;