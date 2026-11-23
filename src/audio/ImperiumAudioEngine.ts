import { CharacterId, WeaponForm } from '../data/imperiumLore';

/**
 * 100% Procedural Web Audio Engine (Zero External Audio Files).
 * Morphs seamlessly between the three protagonists' acoustic instrument themes:
 * - Enes Öztürk: Cathedral pipe organ & symphonic choir harmonics + astrolabe chimes
 * - Demirhan: Deep timpani drums, heavy metallic anvil strikes & low brass
 * - Selinay: Glass harmonica, plucked harp arpeggios & crystalline bells
 */
export class ImperiumAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private droneGain: GainNode | null = null;
  private droneOscs: OscillatorNode[] = [];
  private droneFilter: BiquadFilterNode | null = null;
  private pulseTimer: number | null = null;
  private currentChar: CharacterId = 'enes';
  private isMuted = false;
  private isStarted = false;
  private stepIndex = 0;

  public unlockAndStart(initialChar: CharacterId) {
    this.currentChar = initialChar;
    if (this.isStarted) {
      if (this.ctx?.state === 'suspended') {
        void this.ctx.resume();
      }
      return;
    }

    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    this.ctx = new AudioCtx();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = this.isMuted ? 0 : 0.36;
    this.masterGain.connect(this.ctx.destination);

    this.droneFilter = this.ctx.createBiquadFilter();
    this.droneFilter.type = 'lowpass';
    this.droneFilter.frequency.value = 620;
    this.droneFilter.Q.value = 1.4;

    this.droneGain = this.ctx.createGain();
    this.droneGain.gain.value = 0.14;
    this.droneFilter.connect(this.droneGain);
    this.droneGain.connect(this.masterGain);

    // Rich harmonic organ/brass/crystal pad base
    const baseFreqs = [110, 164.81, 220, 329.63];
    const types: OscillatorType[] = ['sawtooth', 'triangle', 'sine', 'triangle'];
    for (let i = 0; i < baseFreqs.length; i++) {
      const osc = this.ctx.createOscillator();
      osc.type = types[i];
      osc.frequency.value = baseFreqs[i];
      const g = this.ctx.createGain();
      g.gain.value = i === 0 ? 0.35 : 0.2;
      osc.connect(g);
      g.connect(this.droneFilter);
      osc.start();
      this.droneOscs.push(osc);
    }

    this.isStarted = true;
    this.setCharacterTheme(initialChar);
    this.startRhythmicMotif();
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(muted ? 0 : 0.36, this.ctx.currentTime, 0.08);
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setCharacterTheme(charId: CharacterId) {
    this.currentChar = charId;
    if (!this.ctx || !this.droneFilter || !this.droneGain) return;

    const now = this.ctx.currentTime;
    if (charId === 'enes') {
      // Cathedral Pipe Organ & Symphonic D minor / Dorian majesty
      this.droneFilter.frequency.setTargetAtTime(760, now, 0.35);
      const freqs = [146.83, 220.0, 293.66, 440.0]; // D3, A3, D4, A4
      this.droneOscs.forEach((osc, i) => {
        osc.type = i % 2 === 0 ? 'sawtooth' : 'triangle';
        osc.frequency.setTargetAtTime(freqs[i], now, 0.3);
      });
    } else if (charId === 'demirhan') {
      // Low Brass & Geothermal Bass Drone (G1/D2/G2)
      this.droneFilter.frequency.setTargetAtTime(340, now, 0.35);
      const freqs = [55.0, 82.41, 110.0, 164.81]; // A1, E2, A2, E3
      this.droneOscs.forEach((osc, i) => {
        osc.type = i < 2 ? 'sawtooth' : 'triangle';
        osc.frequency.setTargetAtTime(freqs[i], now, 0.3);
      });
    } else {
      // Selinay: Crystalline Glass Harmonica & Etheric Fifths
      this.droneFilter.frequency.setTargetAtTime(1400, now, 0.35);
      const freqs = [196.0, 293.66, 392.0, 587.33]; // G3, D4, G4, D5
      this.droneOscs.forEach((osc, i) => {
        osc.type = 'sine';
        osc.frequency.setTargetAtTime(freqs[i], now, 0.3);
      });
    }
  }

  private startRhythmicMotif() {
    if (this.pulseTimer !== null) {
      window.clearInterval(this.pulseTimer);
    }
    this.pulseTimer = window.setInterval(() => {
      if (!this.ctx || !this.masterGain || this.isMuted || this.ctx.state !== 'running') return;
      this.stepIndex = (this.stepIndex + 1) % 8;

      if (this.currentChar === 'enes') {
        // Symphonic astrolabe chime + organ cadence
        if (this.stepIndex % 2 === 0) {
          const notes = [587.33, 659.25, 698.46, 880.0];
          const freq = notes[(this.stepIndex / 2) % notes.length];
          this.playTone(freq, 'triangle', 0.045, 0.48, 0.01);
        }
      } else if (this.currentChar === 'demirhan') {
        // Heavy timpani & forge anvil pulse
        if (this.stepIndex === 0 || this.stepIndex === 4) {
          this.playTimpani(62, 0.14);
        }
        if (this.stepIndex === 2 || this.stepIndex === 6) {
          this.playAnvilPing(0.04);
        }
      } else {
        // Selinay: Harp & crystal bell arpeggio
        const harp = [392.0, 493.88, 587.33, 739.99, 783.99, 739.99, 587.33, 493.88];
        this.playTone(harp[this.stepIndex], 'sine', 0.055, 0.42, 0.005);
      }
    }, 340);
  }

  private playTone(
    freq: number,
    type: OscillatorType,
    volume: number,
    duration: number,
    attack = 0.01
  ) {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(volume, now + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  private playTimpani(baseFreq: number, volume: number) {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq * 1.6, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.65, now + 0.28);

    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.44);
  }

  private playAnvilPing(volume: number) {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    // Inharmonic metallic partials for forged bronze anvil foley
    const partials = [740, 1185, 1890];
    partials.forEach((p, idx) => {
      this.playTone(p, 'triangle', volume / (idx + 1), 0.35 - idx * 0.06, 0.002);
    });
  }

  public playSwitchBurst(charId: CharacterId, isConjunction: boolean) {
    this.setCharacterTheme(charId);
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    if (charId === 'enes') {
      this.playTone(440, 'triangle', 0.14, 0.55, 0.01);
      this.playTone(659.25, 'sine', 0.12, 0.65, 0.015);
      this.playTone(880, 'sine', 0.1, 0.75, 0.02);
    } else if (charId === 'demirhan') {
      this.playTimpani(75, 0.25);
      this.playAnvilPing(0.12);
    } else {
      this.playTone(987.77, 'sine', 0.12, 0.45, 0.004);
      this.playTone(1479.98, 'sine', 0.09, 0.5, 0.01);
    }

    if (isConjunction) {
      // Grand Conjunction harmonic chord burst
      [220, 329.63, 440, 659.25, 880].forEach((f, i) => {
        this.playTone(f, i % 2 === 0 ? 'sawtooth' : 'triangle', 0.08, 0.85, 0.01);
      });
    }
  }

  public playAttack(charId: CharacterId, form: WeaponForm, isHeavy: boolean) {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    if (charId === 'enes') {
      if (form === 'primary') {
        // Whirring celestial chakrams
        this.playTone(isHeavy ? 620 : 520, 'triangle', 0.11, 0.24, 0.005);
        this.playTone(isHeavy ? 930 : 780, 'sine', 0.08, 0.26, 0.01);
      } else {
        // Plasma solar lance thrust
        this.playTone(isHeavy ? 280 : 340, 'sawtooth', 0.1, 0.28, 0.005);
        this.playTone(1120, 'sine', 0.07, 0.2, 0.004);
      }
    } else if (charId === 'demirhan') {
      if (form === 'primary') {
        this.playTimpani(isHeavy ? 52 : 68, isHeavy ? 0.34 : 0.22);
        this.playAnvilPing(isHeavy ? 0.14 : 0.08);
      } else {
        // Dragon Cannon siege boom
        this.playTimpani(45, 0.36);
        this.playTone(140, 'sawtooth', 0.12, 0.35, 0.005);
      }
    } else {
      if (form === 'primary') {
        // Prism Fans crisp slice
        this.playTone(isHeavy ? 1240 : 1040, 'sine', 0.1, 0.18, 0.002);
        this.playTone(1560, 'triangle', 0.06, 0.16, 0.003);
      } else {
        // Light-Whip resonant crack
        this.playTone(880, 'sawtooth', 0.07, 0.22, 0.002);
        this.playTone(1760, 'sine', 0.08, 0.24, 0.004);
      }
    }
  }

  public playTransform(charId: CharacterId, form: WeaponForm) {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const base = charId === 'demirhan' ? 320 : charId === 'enes' ? 520 : 840;
    const target = form === 'secondary' ? base * 1.5 : base * 0.85;
    this.playTone(base, 'triangle', 0.1, 0.18, 0.004);
    window.setTimeout(() => {
      this.playTone(target, 'sine', 0.11, 0.28, 0.006);
    }, 65);
  }

  public playHit(isConjunction: boolean) {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    this.playTimpani(isConjunction ? 58 : 95, isConjunction ? 0.32 : 0.16);
    if (isConjunction) {
      this.playAnvilPing(0.16);
    }
  }

  public playRealmShift() {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    [293.66, 440, 587.33].forEach((f, idx) => {
      window.setTimeout(() => {
        this.playTone(f, 'sine', 0.09, 0.75, 0.02);
      }, idx * 70);
    });
  }

  public dispose() {
    if (this.pulseTimer !== null) {
      window.clearInterval(this.pulseTimer);
      this.pulseTimer = null;
    }
    this.droneOscs.forEach((o) => {
      try {
        o.stop();
      } catch {
        // ignore already stopped
      }
    });
    this.droneOscs = [];
    if (this.ctx) {
      void this.ctx.close();
      this.ctx = null;
    }
    this.isStarted = false;
  }
}
