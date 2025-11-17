import React, { useState } from 'react';
import Icon from './Icons';
import DiyaMascot from './DiyaMascot';
import { GeneratedImage } from '../types';

interface CreateFeatureProps {
    onImageCreated: (image: GeneratedImage) => void;
}

type AspectRatio = '1:1' | '16:9' | '9:16';

const CreateFeature: React.FC<CreateFeatureProps> = ({ onImageCreated }) => {
    const [prompt, setPrompt] = useState('');
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');

    const getAspectRatioClass = (ratio: AspectRatio) => {
        switch(ratio) {
            case '1:1': return 'aspect-square';
            case '16:9': return 'aspect-video';
            case '9:16': return 'aspect-[9/16]';
            default: return 'aspect-square';
        }
    }

    return (
        <div className="p-4 flex flex-col min-h-full animate-fadeIn">
            <div className="text-center">
                <h2 className="text-2xl font-brand holographic-text">Image Synthesizer</h2>
                <p className="text-slate-300">Transmit your vision into pixels.</p>
            </div>

            <div className="flex-grow flex flex-col items-center justify-center my-4">
                <div className={`w-full max-w-md mx-auto bg-black/20 border-2 border-dashed border-white/20 rounded-xl flex items-center justify-center p-8 transition-all duration-300 ${getAspectRatioClass(aspectRatio)}`}>
                    <div className="text-center">
                        <DiyaMascot className="w-24 h-24 mx-auto mb-4" />
                        <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-6 max-w-sm">
                            <div className="flex items-center justify-center gap-2 mb-3">
                                <Icon name="sparkle" className="w-6 h-6 text-yellow-400" />
                                <h3 className="text-lg font-bold text-yellow-300">Coming Soon!</h3>
                            </div>
                            <p className="text-slate-300 text-sm mb-2">
                                Image generation is being upgraded with free AI models.
                            </p>
                            <p className="text-slate-400 text-xs">
                                The previous image API required a paid account. We're adding a completely free alternative! 🎨
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-4 bg-black/20 border-t border-white/10 mt-auto opacity-50">
                 <div className="flex items-start gap-3 mb-3">
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g., A neon hologram of a cat driving at top speed"
                        className="flex-grow p-3 border border-white/20 bg-black/30 rounded-xl focus:ring-2 focus:ring-[#FFD700] focus:outline-none transition text-white placeholder:text-slate-400 resize-none"
                        rows={3}
                        disabled={true}
                    />
                    <button 
                        disabled={true}
                        className="flex-shrink-0 flex items-center justify-center gap-2 bg-gray-600 text-gray-400 font-bold py-3 px-5 rounded-full text-lg h-[84px] cursor-not-allowed"
                    >
                        <Icon name="sparkle" className="w-6 h-6" />
                        <span>Generate</span>
                    </button>
                </div>
                <div className="flex justify-center gap-2">
                    {(['1:1', '16:9', '9:16'] as AspectRatio[]).map(ratio => (
                        <button 
                            key={ratio}
                            onClick={() => setAspectRatio(ratio)}
                            disabled={true}
                            className={`px-4 py-2 text-sm font-semibold rounded-full border-2 transition-colors ${aspectRatio === ratio ? 'bg-yellow-400/30 border-yellow-300 text-yellow-200' : 'bg-black/30 border-white/20 text-slate-300'} opacity-50 cursor-not-allowed`}
                        >
                            {ratio === '1:1' ? 'Square' : ratio === '16:9' ? 'Landscape' : 'Portrait'}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CreateFeature;
