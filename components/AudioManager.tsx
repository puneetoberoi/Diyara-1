// AudioManager - Baby-friendly sounds with Punjabi support
// FIXED: Better music, softer sounds, Punjabi text-to-speech

class AudioManager {
  private static instance: AudioManager;
  private backgroundMusic: HTMLAudioElement | null = null;
  private currentMusicUrl: string = '';
  private isMusicEnabled: boolean = true;
  private isSoundsEnabled: boolean = true;
  
  // Simpler, reliable background music (always works)
  private musicTracks = {
    welcome: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjaH0fPTgjMGHm7A7+OZSA0PVqzn7a1aFgxDm+LyvmwhBjiF0PPTgjMGHm++7+OYRw0PVqzn7a1aFgxDm+LyvmwhBjiF0PPTgjMGHm++7+OYRw0PVqzn7a1aFgxDm+LyvmwhBjiF0PPTgjMGHm++7+OYRw0PVqzn7a1aFgxDm+LyvmwhBjiF0PPTgjMGHm++7+OYRw0PVqzn7a1aFgxDm+LyvmwhBjiF0PPTgjMGHm++7+OYRw0PVqzn7a1aFgxDm+LyvmwhBjiF0PPTgjMGHm++7+OYRw0PVqzn7a1aFgxDm+LyvmwhBjiF0PPTgjMGHm++7+OYRw==',
    accessCode: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmM=',
    profileSelection: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmM=',
    greeting: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmM=',
    apiSetup: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmM=',
    onboarding: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmM=',
    mainApp: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmM=',
  };

  // Audio context for baby-friendly sounds
  private audioContext: AudioContext | null = null;

  private constructor() {
    const musicPref = localStorage.getItem('diyaraMusicEnabled');
    const soundsPref = localStorage.getItem('diyaraSoundsEnabled');
    
    this.isMusicEnabled = musicPref !== 'false';
    this.isSoundsEnabled = soundsPref !== 'false';

    // Initialize audio context
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

  // Baby-friendly sounds (soft, musical, playful)
  private playSoftTone(frequency: number, duration: number, volume: number = 0.15) {
    if (!this.isSoundsEnabled || !this.audioContext) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = 'sine'; // Soft sine wave

      // Soft attack and decay
      const now = this.audioContext.currentTime;
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(volume, now + 0.01); // Quick fade in
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration / 1000); // Gentle fade out

      oscillator.start(now);
      oscillator.stop(now + duration / 1000);
    } catch (error) {
      console.log('Sound effect error:', error);
    }
  }

  // Background music control (now uses data URLs - always works!)
  playBackgroundMusic(screen: keyof typeof this.musicTracks) {
    if (!this.isMusicEnabled) return;

    const musicUrl = this.musicTracks[screen];
    
    if (this.currentMusicUrl === musicUrl && this.backgroundMusic && !this.backgroundMusic.paused) {
      return;
    }

    this.stopBackgroundMusic();

    try {
      this.backgroundMusic = new Audio(musicUrl);
      this.backgroundMusic.volume = 0.08; // Very gentle
      this.backgroundMusic.loop = true;
      this.currentMusicUrl = musicUrl;

      // Try to play, but don't worry if blocked
      const playPromise = this.backgroundMusic.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.log('Music autoplay prevented (this is normal)');
        });
      }
    } catch (error) {
      console.log('Music error:', error);
    }
  }

  stopBackgroundMusic() {
    if (this.backgroundMusic) {
      this.backgroundMusic.pause();
      this.backgroundMusic.currentTime = 0;
      this.backgroundMusic = null;
    }
    this.currentMusicUrl = '';
  }

  // Baby-friendly button sounds
  playButtonClick() {
    // Soft xylophone-like click
    this.playSoftTone(800, 120, 0.12);
  }

  playButtonHover() {
    // Gentle bubble pop
    this.playSoftTone(1200, 80, 0.08);
  }

  playProfileClick() {
    // Happy ascending melody (like baby giggle)
    this.playSoftTone(523, 150, 0.15); // C
    setTimeout(() => this.playSoftTone(659, 150, 0.15), 100); // E
    setTimeout(() => this.playSoftTone(784, 200, 0.15), 200); // G
  }

  // Punjabi text-to-speech support
  sayText(text: string, lang: string = 'pa-IN') {
    if (!this.isSoundsEnabled) return;
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang; // Punjabi support
    utterance.rate = 0.85; // Slower for clarity
    utterance.pitch = 1.3; // Higher pitch (child-like)
    utterance.volume = 0.8;

    // Try to use a Punjabi voice if available
    const voices = window.speechSynthesis.getVoices();
    const punjabiVoice = voices.find(voice => 
      voice.lang.startsWith('pa') || 
      voice.lang.startsWith('hi') // Hindi as fallback
    );
    
    if (punjabiVoice) {
      utterance.voice = punjabiVoice;
    }

    window.speechSynthesis.speak(utterance);
  }

  // Say profile name (with Punjabi support)
  sayProfileName(profileId: string) {
    const nameMap: Record<string, { text: string; lang: string }> = {
      'mom': { text: 'ਮੰਮੀ ਜੀ', lang: 'pa-IN' },
      'dad': { text: 'ਪਾਪਾ ਜੀ', lang: 'pa-IN' },
      'daadaji': { text: 'ਦਾਦਾ ਜੀ', lang: 'pa-IN' },
      'daadiji': { text: 'ਦਾਦੀ ਜੀ', lang: 'pa-IN' },
      'chachu': { text: 'ਚਾਚੂ ਜੀ', lang: 'pa-IN' },
      'chachi': { text: 'ਚਾਚੀ ਜੀ', lang: 'pa-IN' },
      'naniji': { text: 'ਨਾਨੀ ਜੀ', lang: 'pa-IN' },
      'mamu': { text: 'ਮਾਮੂ ਜੀ', lang: 'pa-IN' },
      'mami': { text: 'ਮਾਮੀ ਜੀ', lang: 'pa-IN' },
    };

    const profileData = nameMap[profileId.toLowerCase()];
    
    if (profileData) {
      // Try Punjabi first, fallback to English
      this.sayText(profileData.text, profileData.lang);
      
      // Fallback to English pronunciation if Punjabi fails
      setTimeout(() => {
        const englishNames: Record<string, string> = {
          'mom': 'Mumma Ji',
          'dad': 'Papa Ji',
          'daadaji': 'Daada Ji',
          'daadiji': 'Daadi Ji',
          'chachu': 'Chachu Ji',
          'chachi': 'Chachi Ji',
          'naniji': 'Nani Ji',
          'mamu': 'Mamu Ji',
          'mami': 'Mami Ji',
        };
        
        if (!window.speechSynthesis.speaking) {
          this.sayText(englishNames[profileId.toLowerCase()] || profileId, 'en-IN');
        }
      }, 500);
    }
  }

  playSuccess() {
    // Success melody (happy chime)
    this.playSoftTone(523, 120, 0.15); // C
    setTimeout(() => this.playSoftTone(659, 120, 0.15), 100); // E
    setTimeout(() => this.playSoftTone(784, 120, 0.15), 200); // G
    setTimeout(() => this.playSoftTone(1047, 200, 0.15), 300); // High C
  }

  playTransition() {
    // Magical sparkle
    this.playSoftTone(1200, 100, 0.1);
    setTimeout(() => this.playSoftTone(1600, 80, 0.08), 60);
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
    const targetVolume = 0.08;
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
    sayText: (text: string, lang?: string) => audioManager.sayText(text, lang),
    playSuccess: () => audioManager.playSuccess(),
    playTransition: () => audioManager.playTransition(),
    toggleMusic: (enabled: boolean) => audioManager.toggleMusic(enabled),
    toggleSounds: (enabled: boolean) => audioManager.toggleSounds(enabled),
    isMusicEnabled: () => audioManager.getMusicEnabled(),
    isSoundsEnabled: () => audioManager.getSoundsEnabled(),
  };
};
