# Haircuts shelf

## What it is
VHS-shelf carousel (reference: Vasari spec in references): boxes stand spine-out on a petrol ledge, the active one turns in 3D to show its cover; drag, arrows, keyboard; caption slides through a mask; the cover opens into a full-screen detail sheet (FLIP) with WhatsApp booking.

## Demo
Open `demo/index.html` through a local server from the kit root: `python3 -m http.server 8000` then visit `http://localhost:8000/sections/09-tagli/demo/`. Look at `screenshots/` for phone (390), tablet (820) and desktop (1440).

## Must keep
To be faithful to the reference, covers and spines must be REAL textured cassette art: use `the separate zip glamood-ASSET-GEN-cassette-vhs.zip` to generate the two sheets (covers 4x2, spines row), then crop each item from the sheet like the reference does. The demo currently builds the boxes in CSS as placeholders.

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
