
import React from 'react';

const DiyaMascot: React.FC<{ className?: string }> = ({ className = "w-12 h-12" }) => {
  return (
    <svg 
      className={className} 
      viewBox="0 0 100 100" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff" stopOpacity="1" />
          <stop offset="70%" stopColor="#FFD700" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#6A5ACD" stopOpacity="0.3" />
        </radialGradient>
        <filter id="energyGlow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {/* Outer Rings */}
      <ellipse cx="50" cy="50" rx="45" ry="20" stroke="#6A5ACD" strokeWidth="2" fill="none" opacity="0.6">
         <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="10s" repeatCount="indefinite" />
      </ellipse>
       <ellipse cx="50" cy="50" rx="45" ry="20" stroke="#FFD700" strokeWidth="1.5" fill="none" opacity="0.4">
         <animateTransform attributeName="transform" type="rotate" from="360 50 50" to="0 50 50" dur="15s" repeatCount="indefinite" />
      </ellipse>
       <ellipse cx="50" cy="50" rx="30" ry="45" stroke="#FF6B6B" strokeWidth="1" fill="none" opacity="0.3">
         <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="8s" repeatCount="indefinite" />
      </ellipse>

      {/* Pulsating Core */}
      <circle cx="50" cy="50" r="18" fill="url(#coreGlow)" filter="url(#energyGlow)">
        <animate 
          attributeName="r"
          values="18;20;18"
          dur="2.5s"
          repeatCount="indefinite"
          keyTimes="0; 0.5; 1"
          calcMode="spline"
          keySplines="0.42 0 0.58 1; 0.42 0 0.58 1"
        />
      </circle>
    </svg>
  );
};

export default DiyaMascot;