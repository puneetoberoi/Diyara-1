// Create Feature - AI Image Generation!
import React, { useState, useEffect } from 'react';
import { bytez } from '../bytezClient';
import { db, storage } from '../supabase';
import { UserProfile } from '../types';

interface CreateFeatureProps {
  userId: string;
  profile: UserProfile;
}

interface GeneratedImage {
  id: string;
  prompt: string;
  imageUrl: string;
  createdAt: Date;
}

const CreateFeature: React.FC<CreateFeatureProps> = ({ userId, profile }) => {
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [loadingGallery, setLoadingGallery] = useState(true);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);

  // Load image gallery from database
  useEffect(() => {
    loadGallery();
  }, [userId, profile]);

  const loadGallery = async () => {
    try {
      setLoadingGallery(true);
      const profiles = await db.getProfiles(userId);
      const dbProfile = profiles?.find(p => p.relation === profile.relation);
      
      if (dbProfile) {
        const savedImages = await db.getImages(dbProfile.id);
        const formattedImages: GeneratedImage[] = savedImages.map(img => ({
          id: img.id,
          prompt: img.prompt,
          imageUrl: img.image_url,
          createdAt: new Date(img.created_at),
        }));
        setImages(formattedImages);
      }
    } catch (error) {
      console.error('Error loading gallery:', error);
    } finally {
      setLoadingGallery(false);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || generating) return;

    const userPrompt = prompt.trim();
    setGenerating(true);

    try {
      console.log('[Create] Generating image for prompt:', userPrompt);

      // Generate image with Bytez
      const response = await bytez.generateImage(userPrompt, {
        size: '1024x1024',
        model: 'dall-e-3',
        n: 1,
      });

      const imageUrl = response.data[0].url;
      console.log('[Create] Image generated!');

      // Save to database
      const profiles = await db.getProfiles(userId);
      const dbProfile = profiles?.find(p => p.relation === profile.relation);
      
      if (dbProfile) {
        const savedImage = await db.saveImage(userId, dbProfile.id, userPrompt, imageUrl);
        
        // Add to gallery
        const newImage: GeneratedImage = {
          id: savedImage.id,
          prompt: userPrompt,
          imageUrl: imageUrl,
          createdAt: new Date(),
        };
        setImages(prev => [newImage, ...prev]);
        setSelectedImage(newImage);
      }

      setPrompt('');

    } catch (error: any) {
      console.error('Error generating image:', error);
      alert(`Failed to generate image: ${error.message || 'Unknown error'}`);
    } finally {
      setGenerating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  // Prompt suggestions
  const suggestions = [
    `A cute baby ${profile.name} playing in a magical garden`,
    `${profile.topic} illustrated for children`,
    `A dreamy landscape with stars and planets`,
    `A friendly robot companion for a baby`,
    `A colorful rainbow castle in the clouds`,
  ];

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-purple-900/30 to-slate-900/30">
      {/* Header */}
      <div className="p-4 border-b border-slate-700 bg-slate-900/50">
        <h2 className="text-2xl font-bold text-white mb-2">🎨 Create Images</h2>
        <p className="text-gray-400 text-sm">
          Generate beautiful AI art for {profile.name}!
        </p>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Image generator */}
        <div className="mb-6">
          <label className="block text-white font-medium mb-2">
            Describe what you want to create:
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="A magical unicorn flying over a rainbow..."
            disabled={generating}
            rows={3}
            className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 disabled:opacity-50 resize-none"
          />
          
          {/* Quick suggestions */}
          <div className="mt-3 flex flex-wrap gap-2">
            <p className="w-full text-xs text-gray-500 mb-1">Quick ideas:</p>
            {suggestions.map((sug, index) => (
              <button
                key={index}
                onClick={() => setPrompt(sug)}
                disabled={generating}
                className="text-xs bg-slate-700 hover:bg-slate-600 text-gray-300 px-3 py-1 rounded-full transition disabled:opacity-50"
              >
                {sug.slice(0, 30)}...
              </button>
            ))}
          </div>

          <button
            onClick={handleGenerate}
            disabled={!prompt.trim() || generating}
            className="w-full mt-4 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 disabled:from-gray-600 disabled:to-gray-700 text-black disabled:text-gray-400 font-bold rounded-xl transition-all transform hover:scale-105 active:scale-95 disabled:scale-100 disabled:cursor-not-allowed shadow-lg"
          >
            {generating ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-3 border-black border-t-transparent rounded-full animate-spin"></div>
                Creating magic...
              </span>
            ) : (
              '✨ Generate Image'
            )}
          </button>
        </div>

        {/* Selected image preview */}
        {selectedImage && (
          <div className="mb-6 bg-slate-800 rounded-2xl p-4 border border-slate-700">
            <h3 className="text-white font-bold mb-2">Latest Creation:</h3>
            <img
              src={selectedImage.imageUrl}
              alt={selectedImage.prompt}
              className="w-full rounded-xl mb-3"
            />
            <p className="text-gray-300 text-sm italic">"{selectedImage.prompt}"</p>
            <p className="text-gray-500 text-xs mt-1">
              Created {selectedImage.createdAt.toLocaleString()}
            </p>
          </div>
        )}

        {/* Gallery */}
        <div>
          <h3 className="text-white font-bold mb-3 flex items-center gap-2">
            <span>🖼️</span> Your Gallery ({images.length})
          </h3>

          {loadingGallery ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-gray-400 text-sm">Loading gallery...</p>
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-12 bg-slate-800/30 rounded-xl border border-slate-700">
              <div className="text-5xl mb-3">🎨</div>
              <p className="text-gray-400">No images yet! Create your first masterpiece above!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {images.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(img)}
                  className="group relative aspect-square rounded-xl overflow-hidden border-2 border-transparent hover:border-yellow-400 transition-all"
                >
                  <img
                    src={img.imageUrl}
                    alt={img.prompt}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                    <p className="text-white text-xs text-center line-clamp-3">
                      {img.prompt}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateFeature;
