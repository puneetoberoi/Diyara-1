import React, { useState } from 'react';
import { GeneratedImage } from '../types';
import Icon from './Icons';

const GalleryFeature: React.FC<{ images: GeneratedImage[] }> = ({ images }) => {
    const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);

    if (images.length === 0) {
        return (
            <div className="p-6 text-center flex flex-col items-center justify-center h-full animate-fadeIn">
                <Icon name="gallery" className="w-16 h-16 text-slate-500 mb-4" />
                <h2 className="text-2xl font-brand text-slate-300 mb-2">The Canvas is Blank</h2>
                <p className="text-slate-400">Venture to the 'Create' tab to synthesize your first image!</p>
            </div>
        );
    }

    return (
        <div className="p-4 animate-fadeIn">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-brand holographic-text">Creation Gallery</h2>
                <p className="text-slate-300">A collection of your synthesized visions.</p>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                {images.map((img, index) => (
                    <div 
                        key={img.id}
                        className="aspect-square bg-black/20 rounded-md overflow-hidden cursor-pointer transition-transform hover:scale-105"
                        onClick={() => setSelectedImage(img)}
                        style={{ animation: `fadeIn 0.5s ease-out ${index * 50}ms forwards`, opacity: 0 }}
                    >
                        <img src={img.imageUrl} alt={img.prompt} className="w-full h-full object-cover" />
                    </div>
                ))}
            </div>
            
            {selectedImage && (
                <div 
                    className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn"
                    onClick={() => setSelectedImage(null)}
                >
                    <div className="bg-slate-900 border border-white/20 rounded-xl p-4 max-w-3xl w-full max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                        <img src={selectedImage.imageUrl} alt={selectedImage.prompt} className="w-full h-auto object-contain rounded-lg flex-grow min-h-0" />
                        <div className="pt-4 mt-4 border-t border-white/20">
                            <p className="text-sm text-slate-400 mb-1">PROMPT:</p>
                            <p className="text-white bg-black/30 p-2 rounded-md">{selectedImage.prompt}</p>
                        </div>
                         <button
                            onClick={() => setSelectedImage(null)}
                            className="mt-4 bg-yellow-400 text-black font-bold py-2 px-5 rounded-full text-sm hover:bg-yellow-300 transition-colors self-center"
                         >
                            Close
                         </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GalleryFeature;