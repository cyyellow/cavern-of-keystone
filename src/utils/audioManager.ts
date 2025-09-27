// 🎵 AUDIO MANAGER - Handles all game audio
import { AUDIO_CONFIG } from '../config/gameConfig';

type MusicTrack = 'startScreen' | 'gameScreen' | 'bossWave';

class AudioManager {
  private backgroundMusic: Map<MusicTrack, HTMLAudioElement> = new Map();
  private currentTrack: MusicTrack | null = null;
  private soundEffects: Map<string, HTMLAudioElement> = new Map();
  private isInitialized = false;

  constructor() {
    this.initializeAudio();
  }

  private async initializeAudio() {
    try {
      // Preload all background music tracks
      for (const [trackKey, config] of Object.entries(AUDIO_CONFIG.BACKGROUND_MUSIC)) {
        const audio = new Audio(config.file);
        audio.loop = config.loop;
        audio.volume = config.volume * AUDIO_CONFIG.SETTINGS.masterVolume;
        audio.preload = 'auto';
        this.backgroundMusic.set(trackKey as MusicTrack, audio);
      }

      // Preload sound effects
      for (const [key, config] of Object.entries(AUDIO_CONFIG.SOUND_EFFECTS)) {
        const audio = new Audio(config.file);
        audio.volume = config.volume * AUDIO_CONFIG.SETTINGS.masterVolume;
        audio.preload = 'auto';
        this.soundEffects.set(key, audio);
      }

      this.isInitialized = true;
    } catch (error) {
      console.warn('Failed to initialize audio:', error);
    }
  }

  // Play specific background music track
  async playBackgroundMusic(track: MusicTrack) {
    if (!this.isInitialized || !AUDIO_CONFIG.SETTINGS.musicEnabled) {
      return;
    }

    // Stop current track if playing
    if (this.currentTrack && this.currentTrack !== track) {
      await this.stopBackgroundMusic();
    }

    const audio = this.backgroundMusic.get(track);
    if (audio) {
      try {
        this.currentTrack = track;
        await audio.play();
      } catch (error) {
        console.warn(`Failed to play background music track ${track}:`, error);
      }
    }
  }

  // Start background music (legacy method - defaults to startScreen)
  async startBackgroundMusic() {
    await this.playBackgroundMusic('startScreen');
  }

  // Stop background music
  async stopBackgroundMusic() {
    if (this.currentTrack) {
      const audio = this.backgroundMusic.get(this.currentTrack);
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
      this.currentTrack = null;
    }
  }

  // Play sound effect
  async playSoundEffect(soundKey: keyof typeof AUDIO_CONFIG.SOUND_EFFECTS) {
    if (!this.isInitialized || !AUDIO_CONFIG.SETTINGS.sfxEnabled) {
      return;
    }

    const audio = this.soundEffects.get(soundKey);
    if (audio) {
      try {
        // Reset to beginning and play
        audio.currentTime = 0;
        await audio.play();
      } catch (error) {
        console.warn(`Failed to play sound effect ${soundKey}:`, error);
      }
    }
  }

  // Update master volume
  updateMasterVolume(volume: number) {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    
    // Update all background music tracks volume
    for (const [trackKey, audio] of this.backgroundMusic) {
      const config = AUDIO_CONFIG.BACKGROUND_MUSIC[trackKey];
      audio.volume = config.volume * clampedVolume;
    }

    // Update sound effects volume
    for (const [key, audio] of this.soundEffects) {
      const config = AUDIO_CONFIG.SOUND_EFFECTS[key as keyof typeof AUDIO_CONFIG.SOUND_EFFECTS];
      audio.volume = config.volume * clampedVolume;
    }
  }

  // Toggle music on/off
  toggleMusic(enabled: boolean) {
    if (!enabled) {
      this.stopBackgroundMusic();
    } else if (this.currentTrack) {
      this.playBackgroundMusic(this.currentTrack);
    }
  }

  // Toggle sound effects on/off
  toggleSFX(_enabled: boolean) {
    // This is handled by the playSoundEffect method
  }

  // Get current track
  getCurrentTrack(): MusicTrack | null {
    return this.currentTrack;
  }

  // Cleanup
  destroy() {
    for (const audio of this.backgroundMusic.values()) {
      audio.pause();
    }
    this.backgroundMusic.clear();
    this.soundEffects.clear();
    this.currentTrack = null;
    this.isInitialized = false;
  }
}

// Create singleton instance
export const audioManager = new AudioManager();

// Export convenience functions
export const startBackgroundMusic = () => audioManager.startBackgroundMusic();
export const playBackgroundMusic = (track: MusicTrack) => audioManager.playBackgroundMusic(track);
export const stopBackgroundMusic = () => audioManager.stopBackgroundMusic();
export const playBulletSound = () => audioManager.playSoundEffect('bullet');
export const playHitSound = () => audioManager.playSoundEffect('hit');
export const playImpactSound = () => audioManager.playSoundEffect('impact');
export const playWindSound = () => audioManager.playSoundEffect('wind');
export const playHealSound = () => audioManager.playSoundEffect('heal');
export const playSlashSound = () => audioManager.playSoundEffect('slash');
export const playUltimateSound = () => audioManager.playSoundEffect('ultimate');
export const updateMasterVolume = (volume: number) => audioManager.updateMasterVolume(volume);
export const toggleMusic = (enabled: boolean) => audioManager.toggleMusic(enabled);
export const toggleSFX = (enabled: boolean) => audioManager.toggleSFX(enabled);
