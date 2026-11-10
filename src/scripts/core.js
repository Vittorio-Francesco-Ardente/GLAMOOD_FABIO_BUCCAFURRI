// Shared helpers (ported 1:1 from the kit: shared/glamood.js). Business data comes from src/data/business.ts.
import { business } from '../data/business';
export const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const touch = matchMedia('(hover: none), (pointer: coarse)').matches;
export function device() { const w = innerWidth; return w < 768 ? 'mobile' : w < 1200 ? 'tablet' : w < 1600 ? 'desktop' : 'large'; }

// Pauses a rAF loop when the element is off-screen or the tab is hidden.
export function loop(el, fn, gate = () => true) {
  let on = false, raf = 0; const t0 = performance.now();
  const tick = (t) => { fn((t - t0) / 1000); if (on) raf = requestAnimationFrame(tick); };
  const set = (v) => { v = v && gate(); if (v === on) return; on = v; cancelAnimationFrame(raf); if (on && !reduced) raf = requestAnimationFrame(tick); else fn(0); };
  let vis = false;
  new IntersectionObserver((e) => { vis = e[0].isIntersecting; set(vis && !document.hidden); }, { rootMargin: '10%' }).observe(el);
  document.addEventListener('visibilitychange', () => set(!document.hidden && vis));
  return { set, refresh: () => set(vis && !document.hidden) };
}

// Apple Maps on Apple devices, Google Maps elsewhere (same logic as the link tree).
export function mapsUrl() {
  const q = encodeURIComponent(`${business.name}, ${business.address}, ${business.city}`);
  const apple = /iPad|iPhone|iPod|Macintosh/.test(navigator.userAgent);
  return apple ? `https://maps.apple.com/?daddr=${q}` : `https://www.google.com/maps/dir/?api=1&destination=${q}`;
}
export function wireMaps(root = document) {
  root.querySelectorAll('[data-maps]').forEach((a) => { a.href = mapsUrl(); a.target = '_blank'; a.rel = 'noopener'; });
}

// Simple focus trap for dialogs.
export function trapTab(e, box) {
  if (e.key !== 'Tab') return;
  const f = [...box.querySelectorAll('a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])')].filter((x) => x.offsetParent !== null || x === document.activeElement);
  if (!f.length) return;
  const i = f.indexOf(document.activeElement);
  if (e.shiftKey && i <= 0) { e.preventDefault(); f.at(-1).focus(); }
  else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
}

// Scroll lock shared by every overlay (menu, sheets, modals): native overflow + Lenis stop.
let locks = 0;
export function lockScroll(v) {
  locks = Math.max(0, locks + (v ? 1 : -1));
  document.documentElement.style.overflow = locks ? 'hidden' : '';
  if (window.lenis) locks ? window.lenis.stop() : window.lenis.start();
}
