import React, { useState, useEffect } from 'react';
import Icon from './Icons';
import { Toast as ToastType } from '../types';

interface ToastProps {
    toast: ToastType;
    onDismiss: () => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        setVisible(true); // Trigger fade-in
        
        // If there's no action, auto-dismiss
        if (!toast.action) {
            const timer = setTimeout(() => {
                setVisible(false);
            }, 3500);
            
            const dismissTimer = setTimeout(onDismiss, 3800);

            return () => {
                clearTimeout(timer);
                clearTimeout(dismissTimer);
            };
        }
    }, [toast.action, onDismiss]);
    
    const handleActionClick = () => {
        toast.action?.onClick();
        setVisible(false);
        setTimeout(onDismiss, 300);
    }

    return (
        <div className={`flex items-center gap-3 bg-slate-800/90 backdrop-blur-sm text-white p-3 rounded-lg shadow-lg border border-yellow-300/30 transition-all duration-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <Icon name="music" className="w-5 h-5 text-yellow-300" />
            <p className="text-sm flex-grow">{toast.message}</p>
            {toast.action && (
                <button 
                    onClick={handleActionClick}
                    className="ml-2 bg-yellow-400 text-black font-semibold text-xs py-1 px-3 rounded-full hover:bg-yellow-300"
                >
                    {toast.action.label}
                </button>
            )}
        </div>
    );
};

export default Toast;