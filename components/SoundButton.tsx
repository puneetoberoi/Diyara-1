import React from 'react';
import { useAudio } from '../utils/AudioManager';

interface SoundButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  withHoverSound?: boolean;
  withClickSound?: boolean;
  soundType?: 'default' | 'profile' | 'success';
}

const SoundButton: React.FC<SoundButtonProps> = ({ 
  children, 
  withHoverSound = true,
  withClickSound = true,
  soundType = 'default',
  onClick,
  onMouseEnter,
  className = '',
  ...props 
}) => {
  const audio = useAudio();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (withClickSound) {
      if (soundType === 'profile') {
        audio.playProfileClick();
      } else if (soundType === 'success') {
        audio.playSuccess();
      } else {
        audio.playButtonClick();
      }
    }
    onClick?.(e);
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (withHoverSound && !props.disabled) {
      audio.playButtonHover();
    }
    onMouseEnter?.(e);
  };

  return (
    <button
      {...props}
      className={className}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
    >
      {children}
    </button>
  );
};

export default SoundButton;
