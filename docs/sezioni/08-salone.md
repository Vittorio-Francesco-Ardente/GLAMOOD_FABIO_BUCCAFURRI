# The salon

## What it is
Deep petrol section with the coral reaction-diffusion texture (ref, tone on tone); desktop pins and pans horizontally through salon photos in organic frames (arch, blob, circle, pill) with bold uppercase captions and a dashed brass line; tablet/phone use native swipe with snap.

## Demo
Open `demo/index.html` through a local server from the kit root: `python3 -m http.server 8000` then visit `http://localhost:8000/sections/08-salone/demo/`. Look at `screenshots/` for phone (390), tablet (820) and desktop (1440).

## Must keep
Choose photos per frame shape; set object-position per photo so faces/details are never cut.

## Device rules (no cropping, ever)
- Test at 360x740, 390x844, 768x1024, 820x1180, 1024x768, 1366x1024, 1440x900, 1920x1080. Screenshots of this demo at 390/820/1440 are in `screenshots/`.
- Use `svh/dvh` for full-height blocks (never `100vh` alone), `clamp()` for type, `aspect-ratio` boxes for media, `object-fit: contain` for cut-outs (people, mascot, products) and `cover` only for photos that can lose edges safely (set `object-position` per image).
- Cut-outs (Fabio, mascot, products, tools) must never be cropped by the viewport except where the design says so (bottom of the hero). Text and buttons are never covered by decorations (decorations live in `--z-decor`, below content).
- Safe areas: `env(safe-area-inset-*)` on fixed UI. Touch targets at least 44 px.

## Production notes
- Stack: Astro + vanilla TS, GSAP 3 (ScrollTrigger, SplitText, Flip) + Lenis. The demo already uses the same libraries from `shared/vendor/` and the same smooth-scroll setup (`shared/smooth.js`: Lenis lerp .075, native touch), so motion and feel must match the demo 1:1.
- Tokens and fonts: `shared/glamood.css` (copy into `src/styles/tokens.css`). Fonts are self-hosted in `shared/fonts/`.
- Images: the demo uses `assets/web/*.webp`. Production must regenerate responsive AVIF/WebP from `assets/masters/` (sharp) with width/height attributes.
- Everything respects `prefers-reduced-motion` (see the demo code paths marked `reduced`).

## Global rules (apply everywhere)
- Petrol dominates; cream/white only as accents (cards, tickets, buttons, photo borders).
- NO handwritten/script font anywhere. Former "hand" roles use Archivo 800-900 uppercase.
- Decorations never cover text, prices or buttons. Stickers are always shown whole (`object-fit: contain`, never inside a `cover` crop).
- Backgrounds use the reference textures recoloured 1:1 (`assets/web/pattern/ref/*`, classes `.bgref .r-*` in `shared/ref-kit.css`), floating slowly (`refdrift`), paused with reduced motion.
- Visual moves are taken from the Pinterest references and named in `shared/ref-kit.css` (Plates Meal, Brambleroot, Solar Pop, Play Strong, Margarita).
