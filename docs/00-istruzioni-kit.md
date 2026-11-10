# CLAUDE.md: Glamood website

You are building the official website of **Glamood**, a barber shop owned by **Fabio Buccafurri**, Via Sbarre Centrali 282/G, Reggio Calabria (Italy). The site language is **Italian**. These instructions, the `docs/` folder and the `prompts/` folder are the source of truth. Read `docs/` fully before writing any code, then execute `prompts/` in numerical order, one prompt per working session.

## Non-negotiables

1. **Brand fidelity.** Use only the palette, fonts, logos and assets in this kit. Never redraw the GLAMOOD wordmark, the G monogram, the mascot or the QR code. Use the provided files.
2. **Colors.** White `#FFFFFF` and petrol `#0F6870` dominate everywhere. Light oak wood appears only in specific places (bands, a few cards, tool details). Brass `#B8935A` only for small details (thin lines, screws, underlines, icons). Red `#C8202A` exists only on the chili. Never put red on petrol (contrast 1.1:1). Oak and brass are never text colors on white (contrast below 3:1).
3. **Two visual registers, one site.**
   - *Glamood register* (trust and sales): real photos, Archivo display, petrol and white, tone-on-tone waves, clean grid. Used for hero, salon, haircuts, price list, products, merch, location.
   - *Character register* (warmth and play): the cartoon mascot, chunky rounded display font, sticker shapes with die-cut white borders, hand-drawn arrows. Used for the hero hover twin, price-list mascot, product stickers, game teaser, 404, easter eggs, footer sign-off.
   - Max one mascot per viewport. The mascot never replaces real photos in sales sections.
4. **Mobile first.** Design for 375 px first, then 768, 1024, 1440, 1920. Every interaction has a touch equivalent.
5. **Performance budget.** LCP under 2.5 s on 4G mobile, CLS under 0.1, INP under 200 ms. Images in AVIF/WebP with responsive `srcset`; the 4096 px PNG masters in `assets/` are never shipped raw. Heavy effects (WebGL, canvas) are lazy, paused off-screen, and capped in DPR.
6. **Reduced motion.** Everything that moves respects `prefers-reduced-motion: reduce` with a static, complete fallback. No content may depend on an animation finishing.
7. **Accessibility.** WCAG 2.2 AA: semantic landmarks, visible focus, keyboard access for every interactive element (shelf, carousel, menu, easter eggs reachable at least once), `alt` text in Italian, contrast verified.
8. **Copy rules.** Italian, informal "tu", warm and direct, a little ironic, never cheesy. No em dashes or en dashes anywhere in visible text (use commas, periods, colons). No invented facts, prices, reviews, awards or numbers: when data is missing, use the `TODO` values in `docs/04-content.md` and list them in `TODO.md`.
9. **No third-party trackers and no embeds that set cookies** (no Google Maps iframe, no Instagram/Facebook embed scripts). This keeps the site free of a cookie banner. Fonts are self-hosted.
10. **Legal.** Footer must show business name, address and P.IVA (placeholder until provided), plus Privacy page.

## Stack (do not change without a reason written in DECISIONS.md)

- **Astro** (static output) + TypeScript, vanilla CSS with custom properties (no Tailwind), small vanilla TS modules for interactions.
- **GSAP 3** (fully free, including ScrollTrigger and SplitText) + **Lenis** for smooth scroll (disabled on reduced motion and on touch if it hurts native feel).
- **WebGL** only for the menu wave background and optional hero accents, written by hand (see `riferimenti/sito-vittorio/onda-shader-menu.js`). Three.js only if a later prompt explicitly needs it.
- **sharp** (Node) for the asset pipeline.
- Deploy: **Cloudflare Pages** with one Pages Function for the social feed.

## Working method

- Before each prompt: re-read the relevant `docs/` sections and the reference files the prompt lists.
- After each prompt: run the build, open the page with Playwright at 375x812 and 1440x900, take screenshots into `qa/`, fix what is broken in one batch, re-check once, then stop.
- Keep `DECISIONS.md` (choices and why) and `TODO.md` (missing data or assets) updated.
- Never delete or overwrite files in `assets/`; generated derivatives go to `public/img/` or `src/assets/`.
