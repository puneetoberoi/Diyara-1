// AudioManager - Sweet Baby Melodies (No Annoying Beeps!)
// Perfect for a baby app - gentle, musical, delightful sounds

class AudioManager {
  private static instance: AudioManager;
  private backgroundMusic: HTMLAudioElement | null = null;
  private currentMusicUrl: string = '';
  private isMusicEnabled: boolean = true;
  private isSoundsEnabled: boolean = true;
  
  // No music URLs - keeping it simple and silent by default
  // Music can be enabled later if needed
  private audioContext: AudioContext | null = null;

  private constructor() {
    const musicPref = localStorage.getItem('diyaraMusicEnabled');
    const soundsPref = localStorage.getItem('diyaraSoundsEnabled');
    
    this.isMusicEnabled = musicPref === 'true'; // Default OFF
    this.isSoundsEnabled = soundsPref !== 'false'; // Default ON

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

  // Sweet baby melody note generator
  private playNote(frequency: number, startTime: number, duration: number, volume: number = 0.1) {
    if (!this.isSoundsEnabled || !this.audioContext) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      const now = this.audioContext.currentTime;

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Soft sine wave (pure, gentle tone)
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;

      // Gentle envelope (attack, sustain, release)
      gainNode.gain.setValueAtTime(0, now + startTime);
      gainNode.gain.linearRampToValueAtTime(volume, now + startTime + 0.02); // Quick attack
      gainNode.gain.setValueAtTime(volume, now + startTime + duration - 0.05); // Sustain
      gainNode.gain.linearRampToValueAtTime(0, now + startTime + duration); // Gentle release

      oscillator.start(now + startTime);
      oscillator.stop(now + startTime + duration);
    } catch (error) {
      console.log('Sound error:', error);
    }
  }

  // Musical scale notes (Major scale - happy and friendly)
  private notes = {
    C4: 261.63,   // Do
    D4: 293.66,   // Re
    E4: 329.63,   // Mi
    F4: 349.23,   // Fa
    G4: 392.00,   // Sol
    A4: 440.00,   // La
    B4: 493.88,   // Ti
    C5: 523.25,   // Do (high)
  };

  // Baby-friendly melodies
  playButtonClick() {
    if (!this.isSoundsEnabled) return;
    // Sweet "ding" - single note
    this.playNote(this.notes.G4, 0, 0.15, 0.08);
  }

  playButtonHover() {
    if (!this.isSoundsEnabled) return;
    // Gentle "pop" - very soft
    this.playNote(this.notes.C5, 0, 0.1, 0.05);
  }

  playProfileClick() {
    if (!this.isSoundsEnabled) return;
    // Happy ascending melody: Do-Mi-Sol (C-E-G chord)
    this.playNote(this.notes.C4, 0, 0.2, 0.1);      // Do
    this.playNote(this.notes.E4, 0.12, 0.2, 0.1);   // Mi
    this.playNote(this.notes.G4, 0.24, 0.25, 0.1);  // Sol
  }

  sayProfileName(profileId: string) {
    if (!this.isSoundsEnabled) return;
    if (!('speechSynthesis' in window)) return;

    // First play a gentle chime
    this.playNote(this.notes.C5, 0, 0.15, 0.08);

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

    window.speechSynthesis.cancel();

    const profileData = nameMap[profileId.toLowerCase()];
    const text = profileData?.text || englishNames[profileId.toLowerCase()] || profileId;
    const lang = profileData?.lang || 'en-IN';

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.85;
    utterance.pitch = 1.3;
    utterance.volume = 0.8;

    // Try to find appropriate voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.lang.startsWith(lang.split('-')[0])
    );
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 200);
  }

  sayText(text: string, lang: string = 'pa-IN') {
    if (!this.isSoundsEnabled) return;
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.85;
    utterance.pitch = 1.3;
    utterance.volume = 0.8;

    window.speechSynthesis.speak(utterance);
  }

  playSuccess() {
    if (!this.isSoundsEnabled) return;
    // Happy celebration: C-E-G-C (Major chord progression)
    this.playNote(this.notes.C4, 0, 0.15, 0.1);     // Do
    this.playNote(this.notes.E4, 0.1, 0.15, 0.1);   // Mi
    this.playNote(this.notes.G4, 0.2, 0.15, 0.1);   // Sol
    this.playNote(this.notes.C5, 0.3, 0.25, 0.12);  // Do (high)
  }

  playTransition() {
    if (!this.isSoundsEnabled) return;
    // Magical twinkle: High notes descending
    this.playNote(this.notes.C5, 0, 0.1, 0.06);
    this.playNote(this.notes.G4, 0.08, 0.12, 0.05);
  }

  // Background music control (keeping simple - no music by default)
  playBackgroundMusic(screen: string) {
    // Music disabled by default for now
    // Can be enabled later if needed
    if (!this.isMusicEnabled) return;
  }

  stopBackgroundMusic() {
    if (this.backgroundMusic) {
      this.backgroundMusic.pause();
      this.backgroundMusic.currentTime = 0;
      this.backgroundMusic = null;
    }
    this.currentMusicUrl = '';
  }

  // Toggle controls
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

  fadeInMusic(screen: string, duration: number = 1000) {
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
    playBackgroundMusic: (screen: string) => audioManager.playBackgroundMusic(screen),
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
