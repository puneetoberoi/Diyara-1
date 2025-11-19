// Simple Chat Test - Just to verify it renders
import React from 'react';

interface ChatFeatureProps {
  userId: string;
  profile: any;
}

const ChatFeature: React.FC<ChatFeatureProps> = ({ userId, profile }) => {
  console.log('[ChatFeature TEST] Rendering!', { userId, profile: profile?.name });

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-purple-900/30 to-slate-900/30 p-8">
      <div className="max-w-2xl mx-auto w-full">
        <div className="text-center mb-8">
          <div className="text-8xl mb-4">💬</div>
          <h1 className="text-4xl font-bold text-white mb-4">Chat Feature Test</h1>
          <div className="bg-green-500/20 border border-green-500 rounded-xl p-6 mb-4">
            <p className="text-green-300 text-lg mb-2">✅ Component is rendering!</p>
            <p className="text-white">UserId: {userId}</p>
            <p className="text-white">Profile: {profile?.name}</p>
          </div>
          <div className="bg-yellow-500/20 border border-yellow-500 rounded-xl p-4">
            <p className="text-yellow-300 text-sm">
              If you see this, the component is loading correctly!
              Now we need to add the Bytez integration.
            </p>
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-6 border border-slate-600">
          <h3 className="text-white font-bold mb-3">Quick Debug Info:</h3>
          <div className="space-y-2 text-sm">
            <p className="text-gray-300">• Component: Loaded ✅</p>
            <p className="text-gray-300">• User ID: {userId ? 'Present ✅' : 'Missing ❌'}</p>
            <p className="text-gray-300">• Profile: {profile ? 'Present ✅' : 'Missing ❌'}</p>
            <p className="text-gray-300">• Profile Name: {profile?.name || 'N/A'}</p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-500 text-xs">
            Open Console (F12) to see more debug info
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatFeature;
