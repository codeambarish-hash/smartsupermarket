// Sound utility for UI interactions
export class SoundManager {
  private static sounds: { [key: string]: { frequency: number; duration: number; type: OscillatorType } } = {};
  private static enabled = true;
  private static audioContext: AudioContext | null = null;

  static init() {
    // Create audio contexts for different sound effects
    // Using Web Audio API to generate simple beeps and tones
    this.createSound('click', 800, 50, 'sine');
    this.createSound('success', 1200, 200, 'sine');
    this.createSound('scan', 1500, 100, 'square');
    this.createSound('delete', 400, 150, 'sawtooth');
    this.createSound('error', 300, 300, 'triangle');
    this.createSound('payment', 1800, 400, 'sine');
  }

  private static getAudioContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.audioContext;
  }

  private static createSound(name: string, frequency: number, duration: number, type: OscillatorType) {
    // Store sound parameters
    this.sounds[name] = { frequency, duration, type };
  }

  private static playSound(frequency: number, duration: number, type: OscillatorType) {
    if (!this.enabled) return;

    try {
      const audioContext = this.getAudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = type;

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration / 1000);

      // Clean up oscillator after it stops
      oscillator.onended = () => {
        oscillator.disconnect();
        gainNode.disconnect();
      };
    } catch (error) {
      console.warn('Sound playback failed:', error);
    }
  }

  static play(soundName: 'click' | 'success' | 'scan' | 'delete' | 'error' | 'payment') {
    const sound = this.sounds[soundName];
    if (sound && this.enabled) {
      this.playSound(sound.frequency, sound.duration, sound.type);
    }
  }

  static setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  static isEnabled() {
    return this.enabled;
  }
}

// Initialize sounds
if (typeof window !== 'undefined') {
  SoundManager.init();
}
