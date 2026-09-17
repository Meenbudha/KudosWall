/**
 * Audio Haptics & Visual Micro-interactions
 * Synthesizes subtle UI sounds using standard Web Audio API (no assets required)
 * Spawns floating emoji burst particles on reaction clicks
 */

class SoundEffects {
  constructor() {
    this.ctx = null;
    this.muted = localStorage.getItem('kudos_sound_muted') === 'true';
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    localStorage.setItem('kudos_sound_muted', this.muted);
    return this.muted;
  }

  playPop() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.09);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.1);
    } catch {
      // Audio autoplay restrictions safeguard
    }
  }

  playChime() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.07);

        gain.gain.setValueAtTime(0.15, this.ctx.currentTime + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.07 + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(this.ctx.currentTime + idx * 0.07);
        osc.stop(this.ctx.currentTime + idx * 0.07 + 0.28);
      });
    } catch {
      // Ignore audio error
    }
  }
}

export const soundEffects = new SoundEffects();

/**
 * Spawns floating animated emoji burst particles from the click event position
 */
export const spawnEmojiBurst = (e, emoji = '✨') => {
  if (!e || typeof document === 'undefined') return;
  const rect = e.currentTarget?.getBoundingClientRect?.() || {
    left: e.clientX || window.innerWidth / 2,
    top: e.clientY || window.innerHeight / 2,
    width: 30,
    height: 30
  };

  soundEffects.playPop();

  const count = 3;
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'floating-emoji';
    el.innerText = emoji;

    // Randomize initial burst position
    const offsetX = (Math.random() - 0.5) * 40;
    const left = rect.left + rect.width / 2 + offsetX;
    const top = rect.top - 10;

    el.style.left = `${left}px`;
    el.style.top = `${top}px`;

    document.body.appendChild(el);

    setTimeout(() => {
      el.remove();
    }, 850);
  }
};
