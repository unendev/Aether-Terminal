/**
 * Audio Reactive Engine
 * Handles Web Audio API, FFT frequency analysis, transient beat detection,
 * custom audio file loading, and built-in procedural cyberpunk synthesizer generator.
 */

export class AudioReactiveEngine {
  constructor() {
    this.ctx = null;
    this.analyser = null;
    this.dataArray = null;
    this.timeDomainArray = null;
    this.audioElement = null;
    this.sourceNode = null;
    this.isSynthRunning = false;
    this.synthInterval = null;

    this.features = {
      bass: 0,
      mid: 0,
      high: 0,
      energy: 0,
      beat: 0,
      waveform: []
    };

    this.beatThreshold = 0.55;
    this.beatDecay = 0.92;
  }

  init() {
    if (this.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContext();
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 256;
    this.analyser.smoothingTimeConstant = 0.85;

    const bufferLength = this.analyser.frequencyBinCount;
    this.dataArray = new Uint8Array(bufferLength);
    this.timeDomainArray = new Uint8Array(bufferLength);
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  async loadAudioUrl(url) {
    this.init();
    this.stopSynth();
    this.resume();

    if (this.audioElement) {
      this.audioElement.pause();
    }

    this.audioElement = new Audio(url);
    this.audioElement.crossOrigin = 'anonymous';

    if (this.sourceNode) {
      this.sourceNode.disconnect();
    }

    this.sourceNode = this.ctx.createMediaElementSource(this.audioElement);
    this.sourceNode.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);

    try {
      await this.audioElement.play();
    } catch (e) {
      console.log('[AudioEngine] Autoplay waiting for user gesture:', e);
    }
    return this.audioElement;
  }

  loadAudioFile(file) {
    this.init();
    this.stopSynth();
    this.resume();

    if (this.audioElement) {
      this.audioElement.pause();
    }

    const url = URL.createObjectURL(file);
    this.audioElement = new Audio(url);
    this.audioElement.crossOrigin = 'anonymous';

    if (this.sourceNode) {
      this.sourceNode.disconnect();
    }

    this.sourceNode = this.ctx.createMediaElementSource(this.audioElement);
    this.sourceNode.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);

    this.audioElement.play();
    return this.audioElement;
  }

  /**
   * Procedural Cyberpunk Synthesizer Pulse
   * Creates a dark 120 BPM electronic pulse and arpeggio directly via Web Audio oscillators
   */
  startProceduralSynth() {
    this.init();
    this.resume();
    if (this.isSynthRunning) return;
    this.isSynthRunning = true;

    if (this.audioElement) {
      this.audioElement.pause();
    }

    const masterGain = this.ctx.createGain();
    masterGain.gain.value = 0.25;
    masterGain.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);

    let step = 0;
    const bassNotes = [55, 55, 65.41, 48.99]; // A1, A1, C2, G1
    const arpNotes = [220, 261.63, 329.63, 440, 523.25, 440, 329.63, 261.63];

    this.synthInterval = setInterval(() => {
      if (!this.isSynthRunning || !this.ctx) return;
      const now = this.ctx.currentTime;

      // 1. Kick/Sub-Bass Pulse on every quarter note (step % 2 === 0)
      if (step % 2 === 0) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const rootFreq = bassNotes[Math.floor(step / 4) % bassNotes.length];

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(rootFreq * 2, now);
        osc.frequency.exponentialRampToValueAtTime(rootFreq, now + 0.15);

        gain.gain.setValueAtTime(0.8, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.4);
      }

      // 2. High-Frequency Cyberpunk Arpeggio (step % 1)
      const arpOsc = this.ctx.createOscillator();
      const arpGain = this.ctx.createGain();
      const arpFreq = arpNotes[step % arpNotes.length];

      arpOsc.type = 'sine';
      arpOsc.frequency.setValueAtTime(arpFreq, now);

      arpGain.gain.setValueAtTime(0.2, now);
      arpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      arpOsc.connect(arpGain);
      arpGain.connect(masterGain);
      arpOsc.start(now);
      arpOsc.stop(now + 0.15);

      step = (step + 1) % 16;
    }, 125); // 120 BPM 16th notes
  }

  stopSynth() {
    this.isSynthRunning = false;
    if (this.synthInterval) {
      clearInterval(this.synthInterval);
      this.synthInterval = null;
    }
  }

  update() {
    if (!this.analyser) {
      // Simulate slight idle pulse if audio is not yet active
      this.features.bass = 0.1 + Math.sin(Date.now() * 0.002) * 0.05;
      this.features.mid = 0.1 + Math.cos(Date.now() * 0.003) * 0.05;
      this.features.high = 0.08 + Math.sin(Date.now() * 0.005) * 0.04;
      this.features.energy = 0.1;
      this.features.beat = Math.max(0, this.features.beat * this.beatDecay);
      return this.features;
    }

    this.analyser.getByteFrequencyData(this.dataArray);
    this.analyser.getByteTimeDomainData(this.timeDomainArray);

    const len = this.dataArray.length;
    let bassSum = 0;
    let midSum = 0;
    let highSum = 0;

    const bassRange = Math.floor(len * 0.15);
    const midRange = Math.floor(len * 0.55);

    for (let i = 0; i < len; i++) {
      const val = this.dataArray[i] / 255.0;
      if (i < bassRange) {
        bassSum += val;
      } else if (i < midRange) {
        midSum += val;
      } else {
        highSum += val;
      }
    }

    this.features.bass = bassSum / bassRange;
    this.features.mid = midSum / (midRange - bassRange);
    this.features.high = highSum / (len - midRange);
    this.features.energy = (this.features.bass * 1.5 + this.features.mid + this.features.high) / 3.5;

    // Transient beat detection
    if (this.features.bass > this.beatThreshold && this.features.beat < 0.3) {
      this.features.beat = 1.0;
    } else {
      this.features.beat = Math.max(0, this.features.beat * this.beatDecay);
    }

    this.features.waveform = this.timeDomainArray;
    return this.features;
  }
}
