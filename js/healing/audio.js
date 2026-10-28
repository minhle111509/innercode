/** Web Audio player for a pure tone or a synthesized singing bowl. Starts only from a user gesture. */

import { bowlPartials } from './frequency.js';

export class SoundPlayer {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.nodes = [];
    this.timers = [];
    this.playing = false;
    this.volume = 0.5;
  }

  ensureContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) throw new Error('Trình duyệt này không hỗ trợ phát âm thanh.');
      this.ctx = new AudioCtx();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0;
      this.master.connect(this.ctx.destination);
    }
    return this.ctx;
  }

  setVolume(value) {
    this.volume = value;
    if (this.master && this.playing) this.master.gain.setTargetAtTime(value * 0.6, this.ctx.currentTime, 0.1);
  }

  strike(hz) {
    const ctx = this.ctx;
    const now = ctx.currentTime;
    for (const p of bowlPartials(hz)) {
      // A pair of slightly detuned oscillators gives the bowl its slow "wah-wah" beating.
      for (const detune of [-1.2, 1.2]) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = p.freq + detune;
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(p.gain * 0.25, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + p.decay);
        osc.connect(gain).connect(this.master);
        osc.start(now);
        osc.stop(now + p.decay + 0.1);
      }
    }
  }

  async play({ mode, hz, minutes = 10 }) {
    this.stop();
    const ctx = this.ensureContext();
    if (ctx.state === 'suspended') await ctx.resume();
    this.playing = true;
    this.master.gain.cancelScheduledValues(ctx.currentTime);
    this.master.gain.setTargetAtTime(this.volume * 0.6, ctx.currentTime, 0.4);

    if (mode === 'bowl') {
      this.strike(hz);
      this.timers.push(setInterval(() => this.strike(hz), 8000));
    } else {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = hz;
      osc.connect(this.master);
      osc.start();
      this.nodes.push(osc);
    }
    this.timers.push(setTimeout(() => this.stop(), minutes * 60000));
  }

  stop() {
    this.timers.forEach((t) => { clearInterval(t); clearTimeout(t); });
    this.timers = [];
    if (this.ctx && this.master) {
      const now = this.ctx.currentTime;
      this.master.gain.cancelScheduledValues(now);
      this.master.gain.setTargetAtTime(0, now, 0.3);
      const nodes = this.nodes;
      setTimeout(() => nodes.forEach((n) => { try { n.stop(); } catch { /* already stopped */ } }), 1500);
    }
    this.nodes = [];
    const was = this.playing;
    this.playing = false;
    if (was) this.onstop?.();
  }
}
