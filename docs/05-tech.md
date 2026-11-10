# 05. Technical spec

## Project structure
```
/src
  /components   Header, Menu, MobileBar, Loader, Hero, Bands, Salone, Tagli, Listino, Prodotti, Merch, Social, Gioco, Dove, Footer, EasterEggs, Stamp, Decor
  /scripts      motion.ts (ticker, lenis, scrolltrigger setup), reveal.ts, hero-trail.ts, menu-waves.ts (WebGL), shelf.ts, eggs.ts, maps.ts
  /styles       tokens.css, base.css, type.css, utilities.css
  /data         business.ts, prices.ts, haircuts.ts, products.ts (single source of truth for content)
/public
  /img          generated derivatives only
  /fonts        self-hosted woff2
/functions/api/social.ts   Cloudflare Pages Function
/tools/assets.mjs          asset pipeline (sharp)
/qa                        screenshots
DECISIONS.md, TODO.md
```

## Asset pipeline (`tools/assets.mjs`, run with `npm run assets`)
- Input: `assets/**` (read-only masters). Output: `public/img/**`.
- For each image: trim transparent margins (keep 2% padding), export AVIF + WebP at widths [480, 768, 1200, 1800, 2600] (never upscale), keep a PNG fallback only for the 1200 width when alpha is present. Generate a 24 px blurred placeholder (base64) and intrinsic width/height for every image into `src/data/images.json` to prevent CLS.
- **Hero alignment**: load `hero/fabio-foto.png` and `hero/fabio-cartoon.png`; compute alpha bounding boxes; detect the head region (top 35% of the alpha bbox) and match the cartoon to the photo by scale (head width ratio) and translation (head center), then crop both to the same canvas. Save `hero-photo` and `hero-cartoon` derivatives with identical dimensions. Write the transform to DECISIONS.md.
- **Sticker sheet**: `sticker/sticker-SHEET-da-ritagliare.png` has noisy black speckles in the transparent area. Clean alpha (threshold, remove connected components smaller than 0.2% of the image area), then slice into individual stickers by connected components and name them (top, piu-richiesto, stella-g, mascotte-occhiolino, mano-indica, nastro, forbici, pettine, freccia, scintilla).
- **Mascot sheet**: slice `mascotte/mascotte-6-pose-SHEET.png` (3x2 grid on light background) into 6 PNGs with transparent background (flood-remove the background, keep a clean edge): saluto, spunta, pollice, confuso, shh, forbici.
- **Plants for depth**: from `piante/` generate, for each leaf, a "front" variant (gaussian blur 6-10 px, brightness .85) and a "back" variant (blur 2 px, opacity .7, slightly desaturated) for layered parallax.
- **Wood**: crop the left half of `texture/legno-e-carta-SHEET.png` as `legno` (tileable, check seams; if not seamless, mirror-tile) and the right half as `carta-grana` (to be used at very low opacity).

## Hero trail reveal (implementation notes)
- Canvas 2D, size = hero image box, DPR capped. Keep the last N=24 smoothed pointer samples; draw them as a chain of round capsules with radius decreasing along the chain (weight `pow(1 - i/N, 1.6)`), base radius 9% of the box width, scaled by pointer speed (eased attack .09, release .2). Apply as a mask: draw the cartoon image with `globalCompositeOperation = 'destination-in'` against the trail, over the photo. Add a slight edge warp with a small noise offset if performance allows.
- Gate: when the pointer rests, the trail fades out in ~600 ms and the photo is fully visible.
- Touch: follow touchmove; first-load auto-sweep once.

## Menu waves (WebGL)
Adapt `riferimenti/sito-vittorio/onda-shader-menu.js` (Vittorio's own shader): three layered sine waves, colors from CSS tokens (`--petrol-darker`, `--petrol`, `--petrol-light`), white crests at 10-18% opacity, grain 2.5%. Render only while the menu is open; DPR cap 1.85 (1.35 touch).

## Social feed (`functions/api/social.ts`)
- Instagram: use the **Instagram API with Instagram Login** (requires a Business or Creator Instagram account; no Facebook Page needed with this flow). Long-lived token stored as a Cloudflare secret `IG_TOKEN`; endpoint `GET https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp&limit=6`. Refresh the token before expiry (`/refresh_access_token`) on a scheduled call or when it is older than 45 days; store the refreshed token in a KV namespace `SOCIAL`.
- Facebook: posts can be read only from a **Facebook Page** (`/{page-id}/posts?fields=message,full_picture,permalink_url,created_time`, Page token secret `FB_PAGE_TOKEN`). Fabio currently has a personal profile, so this stays disabled until a Glamood Page exists.
- Cache the merged JSON in KV for 30 minutes and send `Cache-Control: public, max-age=1800`. On any error, return the last cached payload or `[]`; the frontend then shows the static fallback cards.
- Images: proxy or link directly to `media_url` with `loading="lazy"`, `referrerpolicy="no-referrer"`. Never embed Instagram scripts.

## SEO and structured data
- Title: "Glamood, barber shop a Reggio Calabria | Fabio Buccafurri". Meta description up to 155 characters. Open Graph image 1200x630 (build from the hero or the business-card front).
- JSON-LD `HairSalon` (schema.org has no BarberShop type): name, image, address (PostalAddress), geo (5+ decimals, TODO), telephone (+39 format, TODO), openingHoursSpecification (TODO), priceRange "€", url, sameAs (social links). No self-made aggregateRating.
- `sitemap.xml`, `robots.txt`, canonical URL, `lang="it"`, favicon set from the G monogram (SVG + PNG 32/180/192/512), web manifest with theme color #0F6870.

## Legal (Italy)
- Footer: business name, address, P.IVA (mandatory, art. 35 DPR 633/72), REA if applicable.
- Privacy page (Italian): data controller, contact, what the site processes (no tracking cookies; WhatsApp/phone links open external services; Pages Function does not store personal data). Only technical cookies/storage, so no consent banner is required, as long as no third-party embeds are added.

## Deploy
- Cloudflare Pages, build `npm run build`, output `dist`. Functions in `/functions`. Secrets: `IG_TOKEN`, optional `FB_PAGE_TOKEN`, `FB_PAGE_ID`. KV binding `SOCIAL`.
- Headers (`public/_headers`): long cache for `/img/*` and `/fonts/*` (immutable), security headers (CSP allowing only self, graph.instagram.com images via `img-src` for `*.cdninstagram.com` and `*.fbcdn.net`).
