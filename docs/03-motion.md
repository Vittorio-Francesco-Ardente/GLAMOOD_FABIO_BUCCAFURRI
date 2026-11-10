# 03. Motion and interaction system

Principle: every animation communicates something (arrival, hierarchy, feedback, the "cut" and the "wave" of the brand). Motion intensity: high on desktop, calmer on mobile, static under reduced motion.

## Engine
- One shared ticker: GSAP ticker drives Lenis (`lenis.raf`) and any canvas loop. Canvas/WebGL loops pause when off-screen (IntersectionObserver) and when the tab is hidden.
- ScrollTrigger for pinning/scrubbing; never `window.addEventListener('scroll')`.
- Easing vocabulary: `expo.out` for reveals (0.9-1.2 s), `power3.inOut` for transitions, springs for hover physics (stiffness ~180, damping ~20).
- Max DPR 2 for canvases (1.5 on touch).

## Signature motions
| Name | Where | Behaviour |
|---|---|---|
| Lights on | Loader | radial light mask grows from the sign, logo glow, then photo zooms into hero |
| Mask rise | All titles | lines/words slide up from an overflow-hidden mask, stagger 60-110 ms (SplitText) |
| Cartoon trail | Hero | cursor-trail reveal of the cartoon twin (see 02) |
| Giant drift | Background words | GLAMOOD/LISTINO/PRODOTTI translate horizontally 6-10% with scroll |
| Planks | Section 2 and separators | bands slide in from alternating sides and lock into a wave band, scrubbed |
| Wave draw | Separators | SVG wave paths draw themselves (stroke-dashoffset) as they enter |
| Leaf breathing | Decorations | plants sway 1-2 degrees, parallax depth by layer (front 1.3x, mid 1x, back 0.6x) |
| Scissors snip | Menu hover, CTA hover, section cuts | tiny scissors icon opens/closes once; optional clip-path "cut" line across a section transition |
| Shelf turn | Tagli | active box rotates Y from 90 to 0 degrees with lift and tilt, others slide |
| Sheet open | Tagli detail | FLIP from cover rect to full screen, rotation from tilt to 0 |
| Peel | Stickers | corner peels on hover (CSS 3D) |
| Stamp spin | Rotating stamp | slow constant spin, speed coupled to scroll velocity |
| Magnetic CTA | Primary buttons | button follows pointer within 12 px, label lags slightly |

## Section transitions (choose per pair, not all the same)
- Hero to bands: planks.
- Bands to salon: horizontal pin.
- Salon to tagli: wooden shelf slides up from below.
- Tagli to listino: a scissors cut line crosses the screen and the next section is revealed below (clip-path).
- Listino to prodotti: wave draw.
- Products to merch to social: simple mask rises (rest for the eye).
- Gioco: wooden counter band enters from the right.
- Footer: plants grow in from the corners as the page bottoms out; the mascot pops up last.

## Hover and touch
- All hover effects have a tap equivalent or are non-essential.
- Cursor: native cursor (no custom cursor), except inside the hero where a small ring hint appears near the pointer for 2 s on first visit ("passa sopra").

## Reduced motion
- Disable Lenis, trails, parallax, marquee (static band text), pinning (sections flow normally), shelf turns (instant), loader (400 ms static).
