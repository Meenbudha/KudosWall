/**
 * Visual Micro-interactions
 * Spawns floating animated emoji burst particles on reaction clicks
 * Sound effects completely removed as requested
 */

export const soundEffects = {
  playPop: () => {},
  playChime: () => {},
  toggleMute: () => false,
  muted: true
};

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
