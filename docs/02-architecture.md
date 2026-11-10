# 02. Site architecture and section specs

One long home page (`/`) plus `/privacy`, `/404`. Anchors: `#salone`, `#tagli`, `#listino`, `#prodotti`, `#merch`, `#social`, `#gioco`, `#dove`. Single-page navigation with smooth anchor scrolling.

## Global chrome

### Loader (first visit only)
Concept: **the salon in the dark, then the lights come on.** Black-petrol screen; only the GLAMOOD sign glows faintly like a backlit shop sign (soft halo, slight flicker of 2 frames). Then a warm light blooms from the sign outward (radial mask grows), revealing the real salon photo: mirrors, chairs, plants, wood. The photo then slides/zooms into the hero transition.
- Assets: until dedicated night/day renders exist, build it from `salone/salone-11-titolare.jpg` (or `salone-05.jpg`) using two layers: same photo darkened (brightness .12, saturate .6, slight blue-petrol tint) and the normal photo revealed through a growing radial gradient mask centered on the sign position; the wordmark SVG sits on top with a glow (text-shadow / SVG filter feGaussianBlur in white at 40%). If `assets/salone/loader-buio.png` and `loader-luce.png` are added later, swap them in.
- Duration: total max 1.6 s; skippable on click/tap/key; shown once per session (sessionStorage, wrapped in try/catch); never blocks the LCP element (the hero renders underneath).
- Reduced motion: show the lit photo with the logo for 400 ms, then fade.

### Header (pattern from `riferimenti/sito-vittorio/`, screenshots `screenshot-hero.png`, `screenshot-menu.png`)
- Floating pill bar, 12-16 px from the top, max-width 1400, height 64 px, petrol-deep translucent (`backdrop-filter: blur(14px) saturate(150%)`, solid fallback), radius full.
- Left: GLAMOOD wordmark (white). Center (>=1024 px): Salone, Tagli, Listino, Prodotti, Dove siamo, with an active underline that slides between items (brass 2 px). Right: Instagram, Facebook, WhatsApp icons + "Prenota" pill (white bg, petrol text) + menu button (square rounded 44 px).
- Behaviour: hides on scroll down after 200 px, reappears on scroll up; becomes more opaque after the hero.
- Mobile: wordmark + "Prenota" + menu button only.

### Full-screen menu
- Background: **animated WebGL waves in petrol** (adapt `onda-shader-menu.js`: colors from `--petrol-darker`, `--petrol`, `--petrol-light`, white crests at low opacity, subtle grain). Fallback: `onde-piatte.svg` static.
- Huge items in Archivo 900 uppercase, staggered reveal (each line slides up from a mask), hover: item turns white-to-petrol-pale and a tiny scissors icon "cuts" in from the left.
- Bottom row: pills for WhatsApp, Telefono, Instagram, Facebook, Mappe. Top-left label "MENU, GLAMOOD". Close button top-right (X).
- Mobile version: reuse the look of the existing link tree (`riferimenti/linktree-glamood/`): large rounded stacked buttons with icons, including the "Portami da Glamood" route chooser (Apple Maps / Google Maps), over the moving waves.
- Focus trap, Esc closes, body scroll lock, `aria-expanded`.

### Mobile bottom bar
Fixed bar at the bottom (<768 px), white with petrol top border: "Prenota su WhatsApp" (primary) + "Chiama" (icon). Hidden while the menu is open and in the hero first 400 ms.

### Side section indicator (desktop >=1280)
Thin vertical list of dots on the left edge with labels on hover (ref `rif-margarita-landing.png`), active dot petrol filled. Purely an enhancement.

## Sections (home, in order)

### 1. Hero
- Layout: white/paper background. **Giant "GLAMOOD" word** (Archivo 900, ~24vw, petrol) behind Fabio, at head-shoulder height, partly covered by his figure (ref `screenshot-hero.png` with VITTORIO). Fabio (`hero/fabio-foto.png`) centered, bottom-anchored, cut at the waist.
- **Hover reveal**: the cartoon twin (`hero/fabio-cartoon.png`, same canvas size) appears only where the cursor has just passed, through a liquid trail mask (ref `riferimenti/specifiche/rif-kimi-antonelli-hero.md`, section "What you will see": capsule chain along recent pointer samples, noise-warped edge, gated by pointer speed so a resting cursor shows the photo). Implement with a 2D canvas or a small WebGL quad; fall back to a soft circular CSS mask on low-end devices. Touch: on tap-and-drag reveal along the finger; idle auto-sweep once after load (left to right, 1.2 s) to teach the effect. Reduced motion: no trail, a toggle button "Versione cartoon" swaps the images.
- The two PNGs are not perfectly aligned (about 88% silhouette overlap). The pipeline (prompt 01) must align them: compute alpha bounding boxes and the face position, scale and translate the cartoon to match, export both at identical size.
- Left column: one-line kicker "Barber shop a Reggio Calabria", H1 "Il tuo taglio, preso sul serio." (or similar from content doc), subtext max 20 words, CTAs "Prenota" (WhatsApp) and "Vedi il listino".
- Right column: small card with today's opening hours (TODO), address, Google rating (only if real), and the rotating stamp.
- Decorations: monstera leaf bleeding from the top-right, pampas from the left edge, open scissors floating near the frame hands, slow parallax on pointer and scroll.
- Exit: on scroll, Fabio scales slightly down and the giant word slides left, bands start building below.

### 2. Wave band transition + manifesto
- The **bands build while scrolling**: horizontal stripes (petrol, white, one oak stripe) slide in from alternating sides like planks being laid, then form a wave-band banner (t-shirt back pattern). Scrubbed with ScrollTrigger.
- Inside the band: one marquee (the only marquee on the page) with "Taglio  ·  Barba  ·  Rasatura  ·  Stile  ·  Reggio Calabria" in Archivo, speed reacting to scroll velocity, direction reversing on scroll up.
- Short manifesto paragraph (2 lines) revealed word by word.

### 3. Il salone
- Horizontal pinned pan (desktop) through 5 large salon photos in organic shapes (arches and soft blobs, ref `rif-bubo-coffee.png`), thin petrol lines connecting them, small captions. Mobile: native horizontal scroll-snap with peeking next photo, no autoplay.
- Credit line for the interior design (architect name TODO, see content doc).
- Decorations: pothos hanging from the top edge, potted plant at the end.

### 4. I tagli (VHS-shelf carousel)
- Based on `riferimenti/specifiche/rif-vasari-vhs-carosello-tagli.md`: an endless shelf of branded boxes standing spine-out on a **wooden shelf** (oak texture). The active box is pulled out and turned in 3D to show its front cover with the haircut photo. Change with click on a spine, arrows, drag, wheel/scroll inside the section, keyboard arrows.
- Boxes built in CSS 3D (no images needed for the box itself): spine = petrol or white or oak, G monogram at top, haircut name vertical, wave band at bottom, brass line at base. Cover = petrol with tone-on-tone waves, photo window (rounded), GLAMOOD wordmark small, haircut name.
- Caption under the shelf (mask slide-up on change): haircut name, duration, price.
- Click the cover or press Enter: a white sheet grows from the cover (rotating from its tilt to straight) to full screen: detail page with large photos, description, who it suits, maintenance tips, duration, price, CTA "Prenota questo taglio" (WhatsApp with prefilled text). Close with X, Esc, back gesture (history state).
- Haircut list and photos: TODO from Fabio. Until then use 8 placeholder entries named in the content doc with salon photos as covers and a clear `TODO` badge in development only.

### 5. Listino (price list)
- Giant background word **LISTINO** with the open scissors (`attrezzi/01_forbici_aperte.png`) crossing the letters (ref `rif-margarita-landing.png`, RECIPES with the glass).
- Prices from `docs/04-content.md` grouped in 3 cards: Taglio, Barba, Trattamenti. Each row: name, dotted leader, price in Archivo with tabular numbers. Combo rows highlighted. Sticker "PIU RICHIESTO" on the most requested item (TODO which).
- Background: white with a geometric pattern of thin petrol lines and wave bands at the edges (subtle).
- **Mascot** (`mascotte/mascotte-indica-listino.png`) full body in the bottom-right corner, pointing up-left at the list; on hover/scroll-in it switches to the wink version once. On mobile it sits below the list, smaller.

### 6. Prodotti
- Title PRODOTTI with a jar crossing the letters.
- The 4 identical jars (`prodotti/`) on round pedestals with wave bands (built in CSS or reuse `post-social/post-3D-forbici-piedistallo.png` style), 4-column on desktop, 2x2 on tablet, horizontal snap on mobile. Hover: jar lifts and rotates 6 degrees, label sticker "TOP" peels.
- Each card: product name, one-line use, "Chiedi in salone" (no e-commerce). Product names are placeholders (TODO).
- Stickers and a hand-drawn arrow note "il preferito di Fabio" (character register).

### 7. Merch
- Bento with 4 cells (exact count): the 4 merch photos (`merch/`), one large, three smaller, varied ratios. Caption per item. CTA "Chiedila in salone". Optional light 3D tilt on hover.

### 8. Social
- "Dal salone" grid of the latest 6 Instagram posts (and Facebook Page posts when available) fetched by the Pages Function (see `docs/05-tech.md`), shown as our own cards (image, date, link to the post). Fallback: curated static posts from `post-social/` + salon photos.
- Buttons "Seguici su Instagram" / "Facebook".

### 9. Il gioco (coming soon)
- Teaser card on a wooden counter band: `post-social/gioco-anteprima.png`, the mascot figurine, text "Prossimamente: corri sul bancone del salone mentre aspetti il tuo turno." Badge "Prossimamente". No fake play button.

### 10. Dove siamo
- Stylized **SVG map of Reggio Calabria** drawn in code (coastline, Stretto, main streets around Via Sbarre Centrali) in petrol lines on white with a pin in the shape of the G; no map iframe.
- Address, hours table (TODO), phone/WhatsApp, buttons "Portami da Glamood" (Apple Maps on iOS, Google Maps elsewhere, logic from `riferimenti/linktree-glamood/app.js`).

### 11. Footer
- Petrol-darker background with tone-on-tone waves, plants (monstera, palm) entering from both lower corners in layers (front layer blurred), the mascot peeking from the bottom edge (pose from `mascotte-6-pose-SHEET.png`, sliced).
- Giant sign-off **"CI VEDIAMO DA GLAMOOD"** full width (ref Limone, Margarita).
- Columns: contacts, hours, social, legal (Glamood di Fabio Buccafurri, address, P.IVA TODO, Privacy). Small G monogram: tapping it 3 times opens the secret salon easter egg.

## Easter eggs
1. **"Chi è Fabio"**: tapping the chili pendant on any mascot 5 times (or typing "fabio" on the keyboard) opens a modal styled like a scrapbook page: torn-edge photos with tape (salon and Fabio photos), short story (TODO from Fabio), fun facts. Character register.
2. **"Il salone segreto"**: 3 taps on the footer G (or the Konami code). Opens a full-screen section with ALL salon photos in a curved, cylinder-like draggable carousel (spec: `riferimenti/specifiche/rif-reelmark-carosello-curvo.md`), white background with petrol waves, Archivo title "Il salone segreto", hand-drawn notes and arrows in petrol, "Prenota" button with a dashed ring. Close with X or Esc.
3. Hidden hint: the 404 page and the "shh" mascot pose hint that secrets exist.

## 404
Mascot scratching his head (pose from sheet), "Questa pagina ha cambiato taglio." Button back home.
