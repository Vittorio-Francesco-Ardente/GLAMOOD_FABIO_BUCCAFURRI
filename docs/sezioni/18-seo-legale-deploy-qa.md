# SEO, legal, deploy, QA

- JSON-LD `HairSalon`: name Glamood, address Via Sbarre Centrali 282/G, Reggio Calabria, IT; telephone, openingHours, geo: TODO (never invent).
- Title/description per page, OG image 1200x630 from the hero, `lang="it"`, canonical, sitemap, robots.
- Footer: P.IVA (TODO), privacy page. No third-party embeds (maps open externally, Instagram via own Pages Function), so no cookie banner is needed.
- Deploy: Astro static build on Cloudflare Pages; `_headers` with long cache for /assets, security headers (CSP self + wa.me/maps links).
- QA before release: no horizontal overflow at 360/390/768/820/1024/1366/1440/1920, Lighthouse 95+ (LCP < 2.5 s: hero photo preloaded AVIF), reduced motion path, keyboard and focus, contrast AA, every sticker whole, no text covered.
