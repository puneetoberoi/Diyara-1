// Ultra Simple Chat - With Error Catching
import React, { useState } from 'react';

interface ChatFeatureProps {
  userId: string;
  profile: any;
}

const ChatFeature: React.FC<ChatFeatureProps> = ({ userId, profile }) => {
  const [error, setError] = useState<string | null>(null);

  // Catch any errors
  React.useEffect(() => {
    console.log('[ChatFeature] Component mounted!');
    console.log('[ChatFeature] userId:', userId);
    console.log('[ChatFeature] profile:', profile);
  }, []);

  if (error) {
    return (
      <div className="h-full flex items-center justify-center p-8 bg-red-900/20">
        <div className="bg-red-800 border border-red-600 rounded-xl p-6 max-w-md">
          <h2 className="text-2xl font-bold text-red-200 mb-4">⚠️ Error</h2>
          <p className="text-red-100">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-purple-900/30 to-slate-900/30">
      <div className="max-w-2xl w-full bg-slate-800 rounded-2xl p-8 border-2 border-green-500">
        <div className="text-center mb-6">
          <div className="text-8xl mb-4 animate-bounce">✅</div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Chat Component Working!
          </h1>
        </div>

        <div className="space-y-4">
          <div className="bg-green-900/30 border border-green-600 rounded-xl p-4">
            <p className="text-green-300 font-bold mb-2">Component Status:</p>
            <p className="text-white text-sm">✅ Rendered successfully!</p>
          </div>

          <div className="bg-blue-900/30 border border-blue-600 rounded-xl p-4">
            <p className="text-blue-300 font-bold mb-2">Props Received:</p>
            <p className="text-white text-sm">User ID: {userId}</p>
            <p className="text-white text-sm">Profile: {profile?.name || 'N/A'}</p>
            <p className="text-white text-sm">Relation: {profile?.relation || 'N/A'}</p>
          </div>

          <div className="bg-yellow-900/30 border border-yellow-600 rounded-xl p-4">
            <p className="text-yellow-300 font-bold mb-2">Next Steps:</p>
            <p className="text-white text-sm">
              If you see this, the component is working! 
              Now we can add the Bytez integration.
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm">
            Check browser console (F12) for debug logs
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatFeature;
