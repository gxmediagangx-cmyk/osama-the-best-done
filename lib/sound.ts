// Offline Web Audio API Synthesizer & Haptic Vibration

class AudioFeedbackManager {
  private audioCtx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  // Play a two-tone victory/chime sound for Rest Timer completion
  playTimerDoneChime() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      // Tone 1
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now); // D5 note
      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.35);

      // Tone 2 (Higher tone chime)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880.00, now + 0.18); // A5 note
      gain2.gain.setValueAtTime(0.35, now + 0.18);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.18);
      osc2.stop(now + 0.7);

      // Trigger vibration
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([200, 100, 200, 100, 400]);
      }
    } catch {
      // Audio or vibration unavailable in this browser state
    }
  }

  // Soft haptic click for set completion or Smart Overload click
  playClickPop() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);

      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(30);
      }
    } catch {
      // Ignore
    }
  }

  // Weight Overload Level Up Sound (satisfying power chime)
  playOverloadLevelUp() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const freqs = [440, 554.37, 659.25, 880]; // A Major arpeggio

      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = now + idx * 0.07;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.25, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.25);
      });

      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([80, 50, 150]);
      }
    } catch {
      // Ignore
    }
  }

  // Authentic metallic boxing ring bell for round start/end
  playBoxingBell() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      // Metallic bell partials
      const partials = [
        { freq: 784, gain: 0.35, decay: 1.1 },
        { freq: 1176, gain: 0.25, decay: 0.8 },
        { freq: 1568, gain: 0.2, decay: 0.6 },
        { freq: 2120, gain: 0.12, decay: 0.4 },
      ];

      partials.forEach((p) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(p.freq, now);
        gain.gain.setValueAtTime(p.gain, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + p.decay);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + p.decay);
      });

      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([300, 100, 300]);
      }
    } catch {
      // Ignore
    }
  }

  // 10-second warning clapper (double wood knock)
  playTenSecondClapper() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      [0, 0.14].forEach((offset) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(320, now + offset);
        osc.frequency.exponentialRampToValueAtTime(120, now + offset + 0.06);

        gain.gain.setValueAtTime(0.25, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.06);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + offset);
        osc.stop(now + offset + 0.06);
      });

      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([60, 60, 60]);
      }
    } catch {
      // Ignore
    }
  }
}

export const soundManager = new AudioFeedbackManager();
