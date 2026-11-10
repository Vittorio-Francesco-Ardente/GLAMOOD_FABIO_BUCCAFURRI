// Bubble lettering (kit: shared/bubble.js). Decorative only: aria-label carries the text.
export function bubbles(root = document) {
  root.querySelectorAll('[data-bubble]').forEach((el) => {
    if (el.dataset.done) return; el.dataset.done = '1';
    const words = el.dataset.bubble.split('|'); let seed = +(el.dataset.seed || 7);
    const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    el.classList.add('bubble', el.dataset.style === 'bounce' ? 'bubble-bounce' : 'bubble-gloss');
    el.setAttribute('role', 'img'); el.setAttribute('aria-label', words.join(' '));
    el.innerHTML = words.map((w) => `<span class="bw">${[...w].map((ch) => {
      const r = (rnd() - 0.5) * (el.dataset.style === 'bounce' ? 26 : 16), y = (rnd() - 0.5) * 0.22, s = 0.88 + rnd() * 0.3;
      return `<span class="bl" aria-hidden="true" style="--r:${r.toFixed(1)}deg;--y:${y.toFixed(2)}em;--s:${s.toFixed(2)};--d:${(rnd() * 2).toFixed(2)}s">${ch}</span>`;
    }).join('')}</span>`).join('');
  });
}
