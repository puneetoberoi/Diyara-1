// AudioManager - Centralized audio management for Diyara
// FIXED: Using working sound effect URLs

class AudioManager {
  private static instance: AudioManager;
  private backgroundMusic: HTMLAudioElement | null = null;
  private currentMusicUrl: string = '';
  private isMusicEnabled: boolean = true;
  private isSoundsEnabled: boolean = true;
  
  // Background music - using working URLs
  private musicTracks = {
    welcome: 'https://cdn.pixabay.com/audio/2022/03/10/audio_c8c8e1d4ab.mp3', // Gentle
    accessCode: 'https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3', // Dreamy
    profileSelection: 'https://cdn.pixabay.com/audio/2022/08/02/audio_2dff3e6814.mp3', // Playful
    greeting: 'https://cdn.pixabay.com/audio/2022/03/10/audio_c8c8e1d4ab.mp3', // Warm
    apiSetup: 'https://cdn.pixabay.com/audio/2022/03/10/audio_c8c8e1d4ab.mp3', // Gentle
    onboarding: 'https://cdn.pixabay.com/audio/2022/08/02/audio_2dff3e6814.mp3', // Happy
    mainApp: 'https://cdn.pixabay.com/audio/2022/03/24/audio_c36014a1b0.mp3', // Upbeat
  };

  // Sound effects - DISABLED for now due to CORS issues
  // We'll use simple beep sounds instead
  private soundEffects = {
    buttonClick: '', // Will use audioContext
    buttonHover: '',
    profileClick: '',
    success: '',
    transition: '',
  };

  // Audio context for simple sounds
  private audioContext: AudioContext | null = null;

  private constructor() {
    const musicPref = localStorage.getItem('diyaraMusicEnabled');
    const soundsPref = localStorage.getItem('diyaraSoundsEnabled');
    
    this.isMusicEnabled = musicPref !== 'false';
    this.isSoundsEnabled = soundsPref !== 'false';

    // Initialize audio context for sound effects
    if (typeof window !== 'undefined' && 'AudioContext' in window) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  // Simple beep sound generator
  private playBeep(frequency: number = 800, duration: number = 100, volume: number = 0.3) {
    if (!this.isSoundsEnabled || !this.audioContext) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration / 1000);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration / 1000);
    } catch (error) {
      console.log('Sound effect error:', error);
    }
  }

  // Background music control
  playBackgroundMusic(screen: keyof typeof this.musicTracks) {
    if (!this.isMusicEnabled) return;

    const musicUrl = this.musicTracks[screen];
    
    if (this.currentMusicUrl === musicUrl && this.backgroundMusic && !this.backgroundMusic.paused) {
      return;
    }

    this.stopBackgroundMusic();

    this.backgroundMusic = new Audio(musicUrl);
    this.backgroundMusic.volume = 0.15;
    this.backgroundMusic.loop = true;
    this.currentMusicUrl = musicUrl;

    this.backgroundMusic.play().catch(error => {
      console.log('Audio autoplay prevented:', error);
    });
  }

  stopBackgroundMusic() {
    if (this.backgroundMusic) {
      this.backgroundMusic.pause();
      this.backgroundMusic.currentTime = 0;
      this.backgroundMusic = null;
    }
    this.currentMusicUrl = '';
  }

  // Sound effects using beeps
  playButtonClick() {
    this.playBeep(600, 80, 0.2);
  }

  playButtonHover() {
    this.playBeep(1000, 50, 0.1);
  }

  playProfileClick() {
    // Happy ascending tones
    this.playBeep(600, 100, 0.3);
    setTimeout(() => this.playBeep(800, 100, 0.3), 100);
  }

  // Say profile name using browser's text-to-speech
  sayProfileName(profileId: string) {
    if (!this.isSoundsEnabled) return;
    if (!('speechSynthesis' in window)) return;

    const nameMap: Record<string, string> = {
      'mom': 'Mumma Ji',
      'dad': 'Papa Ji',
      'daadaji': 'Daadu Ji',
      'daadiji': 'Daadi Ji',
      'chachu': 'Chachu Ji',
      'chachi': 'Chachi Ji',
      'naniji': 'Nani Ji',
      'mamu': 'Mamu Ji',
      'mami': 'Mami Ji',
    };

    const name = nameMap[profileId.toLowerCase()] || profileId;
    
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(name);
    utterance.rate = 0.9;
    utterance.pitch = 1.2;
    utterance.volume = 0.7;

    window.speechSynthesis.speak(utterance);
  }

  playSuccess() {
    // Success sound - ascending chime
    this.playBeep(600, 100, 0.3);
    setTimeout(() => this.playBeep(800, 100, 0.3), 80);
    setTimeout(() => this.playBeep(1000, 150, 0.3), 160);
  }

  playTransition() {
    // Sparkle sound
    this.playBeep(1200, 100, 0.2);
    setTimeout(() => this.playBeep(1400, 80, 0.15), 50);
  }

  toggleMusic(enabled: boolean) {
    this.isMusicEnabled = enabled;
    localStorage.setItem('diyaraMusicEnabled', String(enabled));
    
    if (!enabled) {
      this.stopBackgroundMusic();
    }
  }

  toggleSounds(enabled: boolean) {
    this.isSoundsEnabled = enabled;
    localStorage.setItem('diyaraSoundsEnabled', String(enabled));
  }

  isMusicPlaying(): boolean {
    return this.backgroundMusic !== null && !this.backgroundMusic.paused;
  }

  getMusicEnabled(): boolean {
    return this.isMusicEnabled;
  }

  getSoundsEnabled(): boolean {
    return this.isSoundsEnabled;
  }

  fadeOutMusic(duration: number = 1000) {
    if (!this.backgroundMusic) return;

    const audio = this.backgroundMusic;
    const startVolume = audio.volume;
    const step = startVolume / (duration / 50);

    const fadeInterval = setInterval(() => {
      if (audio.volume > step) {
        audio.volume -= step;
      } else {
        audio.volume = 0;
        this.stopBackgroundMusic();
        clearInterval(fadeInterval);
      }
    }, 50);
  }

  fadeInMusic(screen: keyof typeof this.musicTracks, duration: number = 1000) {
    this.playBackgroundMusic(screen);
    
    if (!this.backgroundMusic) return;

    const audio = this.backgroundMusic;
    audio.volume = 0;
    const targetVolume = 0.15;
    const step = targetVolume / (duration / 50);

    const fadeInterval = setInterval(() => {
      if (audio.volume < targetVolume - step) {
        audio.volume += step;
      } else {
        audio.volume = targetVolume;
        clearInterval(fadeInterval);
      }
    }, 50);
  }
}

export default AudioManager;

// Helper hook for React components
export const useAudio = () => {
  const audioManager = AudioManager.getInstance();
  
  return {
    playBackgroundMusic: (screen: string) => audioManager.playBackgroundMusic(screen as any),
    stopBackgroundMusic: () => audioManager.stopBackgroundMusic(),
    playButtonClick: () => audioManager.playButtonClick(),
    playButtonHover: () => audioManager.playButtonHover(),
    playProfileClick: () => audioManager.playProfileClick(),
    sayProfileName: (profileId: string) => audioManager.sayProfileName(profileId),
    playSuccess: () => audioManager.playSuccess(),
    playTransition: () => audioManager.playTransition(),
    toggleMusic: (enabled: boolean) => audioManager.toggleMusic(enabled),
    toggleSounds: (enabled: boolean) => audioManager.toggleSounds(enabled),
    isMusicEnabled: () => audioManager.getMusicEnabled(),
    isSoundsEnabled: () => audioManager.getSoundsEnabled(),
  };
};
