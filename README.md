# Glamood, sito ufficiale

Sito del barber shop **Glamood** di Fabio Buccafurri (Via Sbarre Centrali 282/G, Reggio Calabria).
Astro (output statico) + JS vanilla, GSAP 3 (ScrollTrigger, Flip) + Lenis, WebGL scritto a mano, sharp per le immagini.
Le istruzioni del kit di design sono in `docs/` (master) e `docs/sezioni/` (una per sezione).

## Comandi
```bash
npm install
npm run dev       # genera le immagini (solo la prima volta è lenta) e avvia il server locale
npm run build     # immagini + build statica in dist/
node tools/qa.mjs # dopo la build: screenshot in qa/, errori console, overflow orizzontale
```

## Struttura
- `assets/web/` sorgenti immagini (WebP del kit, mai modificate); `assets/svg/` bande e marchi vettoriali
- `tools/assets.mjs` pipeline sharp: `public/img/**` (AVIF + WebP 480/960/1600 + originale) e `src/data/images.json`
- `tools/brand.mjs` favicon, icone app e immagine Open Graph (già generate in `public/`)
- `src/data/` unica fonte dei contenuti: dati attività, listino, tagli, prodotti
- `src/components/` una componente per sezione (Loader, Header, Hero, Fasce, Salone, Tagli, Taglio, Listino, Prodotti, Merch, Social, Gioco, Dove, Footer)
- `src/pages/` home, `/storia` (easter egg: libro di Fabio), `/privacy`, `404`
- `functions/api/social.ts` Pages Function per gli ultimi post Instagram/Facebook

## Deploy (Cloudflare Pages)
- Build command `npm run build`, output `dist`, Node 20+.
- Secrets: `IG_TOKEN` (token long-lived Instagram API with Instagram Login), opzionali `FB_PAGE_TOKEN`, `FB_PAGE_ID`.
- KV namespace legato come `SOCIAL`.
- Senza token il sito mostra i post statici: funziona comunque.

Dati mancanti: vedi `TODO.md`. Scelte tecniche: vedi `DECISIONS.md`.

## Deploy su GitHub Pages
Il workflow `.github/workflows/pages.yml` costruisce e pubblica a ogni push su `main` (o sul branch di sviluppo).
Il sito è servito sotto `/GLAMOOD_FABIO_BUCCAFURRI/`: `BASE` e `SITE` nel workflow, `tools/rebase.mjs` aggiunge il prefisso ai percorsi assoluti.
Su GitHub Pages non ci sono funzioni server: la sezione social mostra i post statici.
