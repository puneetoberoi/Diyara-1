// AudioManager - Centralized audio management for Diyara
// Handles background music, button sounds, and voice pronunciations

class AudioManager {
  private static instance: AudioManager;
  private backgroundMusic: HTMLAudioElement | null = null;
  private currentMusicUrl: string = '';
  private isMusicEnabled: boolean = true;
  private isSoundsEnabled: boolean = true;
  
  // Royalty-free music URLs (using reliable sources)
  private musicTracks = {
    welcome: 'https://assets.mixkit.co/music/preview/mixkit-little-night-light-143.mp3', // Gentle lullaby
    accessCode: 'https://assets.mixkit.co/music/preview/mixkit-beautiful-dream-142.mp3', // Dreamy
    profileSelection: 'https://assets.mixkit.co/music/preview/mixkit-a-happy-child-532.mp3', // Playful
    greeting: 'https://assets.mixkit.co/music/preview/mixkit-sleepy-cat-135.mp3', // Warm
    apiSetup: 'https://assets.mixkit.co/music/preview/mixkit-little-night-light-143.mp3', // Gentle
    onboarding: 'https://assets.mixkit.co/music/preview/mixkit-a-happy-child-532.mp3', // Happy
    mainApp: 'https://assets.mixkit.co/music/preview/mixkit-games-worldbeat-466.mp3', // Upbeat
  };

  // Sound effects URLs
  private soundEffects = {
    buttonClick: 'https://assets.mixkit.co/sfx/preview/mixkit-select-click-1109.mp3',
    buttonHover: 'https://assets.mixkit.co/sfx/preview/mixkit-baby-laugh-2172.mp3', // Baby giggle
    profileClick: 'https://assets.mixkit.co/sfx/preview/mixkit-happy-baby-giggle-2173.mp3',
    success: 'https://assets.mixkit.co/sfx/preview/mixkit-achievement-bell-600.mp3',
    transition: 'https://assets.mixkit.co/sfx/preview/mixkit-fairy-arcade-sparkle-866.mp3',
  };

  // Profile name pronunciations (text-to-speech will be generated on the fly)
  private profileNames: Record<string, string> = {
    'mom': 'Mom',
    'dad': 'Dad', 
    'daadaji': 'Daada Ji',
    'daadiji': 'Daadi Ji',
    'chachu': 'Chachu',
    'chachi': 'Chachi',
    'naniji': 'Nani Ji',
    'mamu': 'Mamu',
    'mami': 'Mami',
  };

  private constructor() {
    // Check localStorage for user preferences
    const musicPref = localStorage.getItem('diyaraMusicEnabled');
    const soundsPref = localStorage.getItem('diyaraSoundsEnabled');
    
    this.isMusicEnabled = musicPref !== 'false';
    this.isSoundsEnabled = soundsPref !== 'false';
  }

  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  // Background music control
  playBackgroundMusic(screen: keyof typeof this.musicTracks) {
    if (!this.isMusicEnabled) return;

    const musicUrl = this.musicTracks[screen];
    
    // If same music is already playing, don't restart
    if (this.currentMusicUrl === musicUrl && this.backgroundMusic && !this.backgroundMusic.paused) {
      return;
    }

    // Stop current music
    this.stopBackgroundMusic();

    // Create new audio element
    this.backgroundMusic = new Audio(musicUrl);
    this.backgroundMusic.volume = 0.15; // Gentle volume
    this.backgroundMusic.loop = true;
    this.currentMusicUrl = musicUrl;

    // Play with error handling
    this.backgroundMusic.play().catch(error => {
      console.log('Audio play prevented by browser:', error);
      // Some browsers block autoplay, that's okay
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

  // Sound effects
  playSound(sound: keyof typeof this.soundEffects, volume: number = 0.3) {
    if (!this.isSoundsEnabled) return;

    const soundUrl = this.soundEffects[sound];
    const audio = new Audio(soundUrl);
    audio.volume = volume;
    audio.play().catch(error => {
      console.log('Sound effect blocked:', error);
    });
  }

  // Button sounds
  playButtonClick() {
    this.playSound('buttonClick', 0.4);
  }

  playButtonHover() {
    this.playSound('buttonHover', 0.2); // Quieter for hover
  }

  // Profile-specific sounds
  playProfileClick() {
    this.playSound('profileClick', 0.5);
  }

  // Say profile name using browser's text-to-speech
  sayProfileName(profileId: string) {
    if (!this.isSoundsEnabled) return;
    if (!('speechSynthesis' in window)) return;

    const name = this.profileNames[profileId] || profileId;
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(name);
    utterance.rate = 0.9; // Slightly slower
    utterance.pitch = 1.2; // Slightly higher pitch (child-like)
    utterance.volume = 0.7;

    window.speechSynthesis.speak(utterance);
  }

  // Success/celebration sound
  playSuccess() {
    this.playSound('success', 0.5);
  }

  // Transition sound
  playTransition() {
    this.playSound('transition', 0.3);
  }

  // Toggle music on/off
  toggleMusic(enabled: boolean) {
    this.isMusicEnabled = enabled;
    localStorage.setItem('diyaraMusicEnabled', String(enabled));
    
    if (!enabled) {
      this.stopBackgroundMusic();
    }
  }

  // Toggle sounds on/off
  toggleSounds(enabled: boolean) {
    this.isSoundsEnabled = enabled;
    localStorage.setItem('diyaraSoundsEnabled', String(enabled));
  }

  // Get current states
  isMusicPlaying(): boolean {
    return this.backgroundMusic !== null && !this.backgroundMusic.paused;
  }

  getMusicEnabled(): boolean {
    return this.isMusicEnabled;
  }

  getSoundsEnabled(): boolean {
    return this.isSoundsEnabled;
  }

  // Fade out music (for transitions)
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

  // Fade in music
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
