// One shared engine: GSAP ticker drives Lenis; ScrollTrigger follows Lenis.
// Same feel as the kit (shared/smooth.js): lerp .075, wheel .9, native touch scrolling on phones.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Flip } from 'gsap/Flip';
import Lenis from 'lenis';
import { reduced } from './core.js';

gsap.registerPlugin(ScrollTrigger, Flip);
// fewer recalculations while scrolling: no refresh on mobile address-bar resize, callbacks only when they change state
ScrollTrigger.config({ ignoreMobileResize: true, limitCallbacks: true });
let started = false;
export function startMotion() {
  if (started) return; started = true;
  if (reduced) return;
  // smooth but responsive: a touch less floaty than the demo (lerp .075 -> .1), wheel steps evened out
  const lenis = new Lenis({ lerp: 0.1, smoothWheel: true, wheelMultiplier: 1, touchMultiplier: 1.2, syncTouch: false, anchors: false });
  window.lenis = lenis;
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.getAttribute('href') === '#') return;
    const t = document.querySelector(a.getAttribute('href'));
    if (t) { e.preventDefault(); lenis.scrollTo(t, { offset: -20, duration: 1.4, easing: (x) => 1 - Math.pow(1 - x, 4) }); history.replaceState(null, '', a.getAttribute('href')); }
  });
}
export { gsap, ScrollTrigger, Flip };
