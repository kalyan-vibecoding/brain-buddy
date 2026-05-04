let _ctx: AudioContext | null = null;

function ac(): AudioContext {
  if (!_ctx) _ctx = new AudioContext();
  return _ctx;
}

export function playCorrect(): void {
  try {
    const ctx = ac();
    [523.25, 659.25, 783.99].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.value = freq;
      const t = ctx.currentTime + i * 0.12;
      gain.gain.setValueAtTime(0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      osc.start(t);
      osc.stop(t + 0.4);
    });
  } catch { /* no audio ctx */ }
}

export function playCow(): void {
  try {
    const ctx = ac();
    const osc = ctx.createOscillator();
    const filt = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    osc.connect(filt);
    filt.connect(gain);
    gain.connect(ctx.destination);
    filt.type = "lowpass";
    filt.frequency.value = 900;
    osc.type = "sawtooth";
    const t = ctx.currentTime;
    osc.frequency.setValueAtTime(145, t);
    osc.frequency.linearRampToValueAtTime(108, t + 0.25);
    osc.frequency.linearRampToValueAtTime(128, t + 0.55);
    osc.frequency.linearRampToValueAtTime(88, t + 0.95);
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.28, t + 0.1);
    gain.gain.setValueAtTime(0.28, t + 0.7);
    gain.gain.linearRampToValueAtTime(0, t + 0.98);
    osc.start(t);
    osc.stop(t + 1.05);
  } catch { /* no audio ctx */ }
}

export function playCelebration(): void {
  try {
    const ctx = ac();
    [261.63, 329.63, 392.0, 523.25].forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.value = freq;
      const t = ctx.currentTime;
      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.6);
      osc.start(t);
      osc.stop(t + 1.6);
    });
    setTimeout(() => {
      try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.value = 1046.5;
        const t = ctx.currentTime;
        gain.gain.setValueAtTime(0.22, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 1.0);
        osc.start(t);
        osc.stop(t + 1.0);
      } catch { /* ignore */ }
    }, 280);
  } catch { /* no audio ctx */ }
}
