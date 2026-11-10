# 01. Brand system

## Positioning
"La barberia di design sullo Stretto." Glamood is a design-led barber shop in the Sbarre district of Reggio Calabria: petrol walls, light oak, brass, black-and-gold vintage chairs, real plants. Competitors in Reggio have no own website, no public prices and no online booking (research: `riferimenti/specifiche/ricerca-piano-sito.md`). The site must feel premium and local at the same time, with a playful mascot layer that nobody else has.

## Palette (design tokens)
| Token | Hex | Use |
|---|---|---|
| `--petrol` | #0F6870 | brand color, headings, buttons, large surfaces |
| `--petrol-deep` | #0C5A61 | hover, shadows, wave shade |
| `--petrol-darker` | #0A4A50 | footer, deep panels |
| `--petrol-light` | #12757E | wave highlights |
| `--petrol-pale` | #DDEAE7 | soft tints, chips |
| `--white` | #FFFFFF | main background |
| `--paper` | #FBFBF9 | alternate background with grain |
| `--ink` | #17292C | body text |
| `--ink-soft` | #4C6366 | secondary text |
| `--oak` | #C8975E | wood details only (never text on white) |
| `--brass` | #B8935A | thin lines, screws, underlines, icons (never body text) |
| `--chili` | #C8202A | chili only |

Verified contrast: petrol on white 6.49:1, white on petrol 6.49:1, ink on oak 7.23:1 (oak buttons take dark text). Oak or brass on white about 2.4:1: decorative only.
Proportion: about 60% white/paper, 30% petrol, 7% wood, 3% brass.

## Typography (self-host, `font-display: swap`, subset Latin + Italian accents)
- **Archivo** (700, 800, 900; also Archivo Expanded/SemiExpanded width if available): display, section titles, giant background words (GLAMOOD, LISTINO, TAGLI, PRODOTTI). Tight tracking (-0.02 to -0.04em), line-height 0.9 to 1.0 for giants.
- **Instrument Sans** (400, 500, 600): body, UI, buttons, nav.
- **Lilita One** (or Bowlby One, test Italian accents first): character register only (stickers, mascot speech, game teaser, 404). Max 3 families total.
- Scale (fluid clamp): body 16-18 px, small 14 px, h3 24-32, h2 40-72, display 72-140, background giants 18-28vw.

## Logos and marks (in `assets/brand/`)
- `wordmark-petrolio.svg`: GLAMOOD wordmark (primary). Recolor via CSS `fill` for white version.
- `logo-glamood-con-firma-*`: wordmark with Fabio's signature. Use only in the loader and footer (the signature trace is imperfect at very large sizes; keep it under 600 px wide).
- `G-rasoio-*`: G monogram with straight razor. Favicon, app icon, small marks, rotating stamp center.
- `faccia-petrolio.svg`: mascot face, one color. Social avatar, stickers, QR center.
- `G-peperoncino-SHEET.png`: chili G (character register, merch only).
- `onde-piatte.svg`: tone-on-tone waves (business-card front style). `onde-bande-*.svg`: bold petrol and white diagonal bands (t-shirt back style).
- `qr/`: the real QR to glamood-links.pages.dev. Never modify.

## Patterns and decoration
- **Tone-on-tone waves** (business card): soft overlapping petrol curves. Backgrounds of petrol panels, the loader, the menu.
- **Wave bands** (t-shirt back): bold diagonal petrol and white bands. Section separators, bands that build on scroll, sticker backs.
- **Wood**: `texture/` oak planks, horizontal. Used for a few bands, the counter in the game teaser, one or two cards.
- **Paper grain**: very light, fixed, `pointer-events: none` overlay (never on scrolling layers).
- **Real decorations** (`attrezzi/`, `piante/`, 4096 px PNG with alpha): scissors, razor, brush, comb, crossed tools, hair lock, 3D wave ribbon, monstera, pampas, areca palm, pothos, potted plant. They break out of section edges like the leaves in `riferimenti/immagini/rif-margarita-landing.png` and `rif-limone-grill.png`, with gentle parallax.
- **Rotating stamp**: circular text "GLAMOOD · BARBER SHOP · REGGIO CALABRIA ·" around the G monogram, slow rotation, speeds up on scroll.
- **Stickers**: die-cut white border + thin petrol outline, slight rotation, peel corner "TOP" (ref `rif-brambleroot-jam.png`).

## Shape and depth
- One radius system: cards 20 px, media 24 px, buttons fully rounded (pill), stickers organic.
- Shadows tinted petrol, never black: e.g. `0 24px 60px -24px rgb(12 90 97 / .35)`.
- Buttons: primary petrol with white text; secondary white with petrol 1.5 px border; on petrol surfaces, white button with petrol text. Press state: scale .98.

## Voice
Informal "tu", short sentences, confident, a pinch of Reggio irony (at most one dialect word per screen, never in buttons or near prices). Examples in `docs/04-content.md`.
