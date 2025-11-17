import React, { useState } from 'react';
import DiyaMascot from './DiyaMascot';
import { User } from '../types';

interface AuthGateProps {
    onLogin: (user: User) => void;
}

const AuthGate: React.FC<AuthGateProps> = ({ onLogin }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === 'diyara2025') {
            const simulatedUser: User = {
                id: 'user_authed',
                name: 'Creator', // This is a placeholder, will be updated in onboarding
                email: 'creator@diyara.ai'
            };
            onLogin(simulatedUser);
        } else {
            setError('Incorrect access code. Please try again.');
            setPassword('');
        }
    };

    return (
        <div className="h-screen w-screen flex flex-col items-center justify-center p-4 bg-black">
             <div className="w-full max-w-sm text-center animate-fadeIn">
                <DiyaMascot className="w-24 h-24 mx-auto mb-4" />
                <h1 className="text-3xl md:text-4xl font-bold holographic-text mb-2 font-brand">Access Required</h1>
                <p className="text-slate-400 mb-8">This universe is currently in a private development phase.</p>
                
                <form onSubmit={handleSubmit}>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter Access Code"
                        className="w-full p-3 text-center border-2 border-slate-700 bg-black/30 rounded-lg focus:ring-2 focus:ring-yellow-300 focus:outline-none transition text-white placeholder:text-slate-400"
                    />
                    {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
                    <button
                        type="submit"
                        className="mt-6 w-full bg-yellow-400 text-black font-bold py-3 px-8 rounded-full text-lg shadow-lg shadow-yellow-400/20 transition-transform hover:scale-105 active:scale-95"
                    >
                        Authenticate
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AuthGate;