
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
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
    const [isLoading, setIsLoading] = useState(false);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!prompt.trim() || isLoading) return;
        setIsLoading(true);
        setGeneratedImage(null);
        setError(null);
        const currentPrompt = prompt;

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const response = await ai.models.generateImages({
                model: 'imagen-4.0-generate-001',
                prompt: currentPrompt,
                config: {
                    numberOfImages: 1,
                    aspectRatio: aspectRatio,
                },
            });

            if (response.generatedImages && response.generatedImages.length > 0 && response.generatedImages[0].image) {
                const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
                const imageUrl = `data:image/png;base64,${base64ImageBytes}`;
                setGeneratedImage(imageUrl);
                
                onImageCreated({
                    id: `img_${Date.now()}`,
                    prompt: currentPrompt,
                    imageUrl,
                    timestamp: Date.now()
                });
                setPrompt(''); // Clear prompt on success
            } else {
                console.error("Image generation failed: No images returned from API.", response);
                setError("The vision could not be synthesized. The prompt might have been blocked by safety filters. Please try a different idea.");
            }

        } catch (err) {
            console.error("Image generation failed:", err);
            setError("A cosmic ray interfered with the creation process. Please try another prompt.");
        } finally {
            setIsLoading(false);
        }
    };
    
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
                <div className={`w-full max-w-md mx-auto bg-black/20 border-2 border-dashed border-white/20 rounded-xl flex items-center justify-center p-4 transition-all duration-300 ${getAspectRatioClass(aspectRatio)}`}>
                    {isLoading ? (
                        <div className="text-center">
                            <DiyaMascot className="w-24 h-24 mx-auto" />
                            <p className="text-yellow-300 animate-pulse mt-2">Synthesizing... please wait.</p>
                        </div>
                    ) : error ? (
                        <div className="text-center text-red-400">
                            <Icon name="analyze" className="w-12 h-12 mx-auto mb-2" />
                            <p>{error}</p>
                        </div>
                    ) : generatedImage ? (
                        <img src={generatedImage} alt="Generated art" className="object-contain w-full h-full rounded-lg" />
                    ) : (
                        <div className="text-center text-slate-400">
                            <Icon name="photo" className="w-12 h-12 mx-auto mb-2" />
                            <p>Your generated image will appear here.</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="p-4 bg-black/20 border-t border-white/10 mt-auto">
                 <div className="flex items-start gap-3 mb-3">
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g., A neon hologram of a cat driving at top speed"
                        className="flex-grow p-3 border border-white/20 bg-black/30 rounded-xl focus:ring-2 focus:ring-[#FFD700] focus:outline-none transition text-white placeholder:text-slate-400 resize-none"
                        rows={3}
                        disabled={isLoading}
                    />
                    <button 
                        onClick={handleGenerate} 
                        disabled={isLoading || !prompt.trim()}
                        className="flex-shrink-0 flex items-center justify-center gap-2 bg-yellow-400 text-black font-bold py-3 px-5 rounded-full text-lg h-[84px] hover:bg-yellow-300 disabled:bg-gray-600 transition-all hover:scale-105 active:scale-95 disabled:hover:scale-100"
                    >
                        <Icon name="sparkle" className="w-6 h-6" />
                        <span>{isLoading ? '...' : 'Generate'}</span>
                    </button>
                </div>
                <div className="flex justify-center gap-2">
                    {(['1:1', '16:9', '9:16'] as AspectRatio[]).map(ratio => (
                        <button 
                            key={ratio}
                            onClick={() => setAspectRatio(ratio)}
                            disabled={isLoading}
                            className={`px-4 py-2 text-sm font-semibold rounded-full border-2 transition-colors ${aspectRatio === ratio ? 'bg-yellow-400/30 border-yellow-300 text-yellow-200' : 'bg-black/30 border-white/20 text-slate-300 hover:border-yellow-300/50'}`}
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
