# Decisioni

- **Fonte di verità: le demo del kit.** Dove i documenti master (`docs/0x-*.md`) e le demo divergono (petrolio dominante, niente legno, niente corsivo, loader stile link tree, foto della facciata invece della mappa disegnata) seguo le demo e i README di sezione più recenti, che le sostituiscono esplicitamente.
- **Stack**: Astro statico come richiesto. Il codice delle interazioni è portato quasi 1:1 dalle demo (stessi tempi, easing, formule), dentro `<script>` per componente. GSAP e Lenis da npm (stesse versioni free del kit), un solo ticker GSAP che guida Lenis (`src/scripts/motion.js`: lerp .075, touch nativo).
- **CSS**: token e "reference kit" del kit copiati in `src/styles/`. Ogni sezione ha il CSS della sua demo annidato sotto un wrapper `.sx-<sezione>` con `display:contents` (nessun box in più), così i nomi di classe delle demo (`.card`, `.head`, `.stage`...) non si scontrano e il DOM generato via JS resta stilizzato.
- **JavaScript**: i moduli condivisi sono JS (porting fedele); i componenti usano TS leggero. Budget: circa 80 KB gzip in totale (GSAP + ScrollTrigger + Flip + Lenis = 60 KB).
- **Immagini**: le derivate si generano da `assets/web` (WebP del kit, già ottimizzati fino a 2400 px), non dai master PNG da 220 MB, per tenere il repository leggero. Pipeline sharp: AVIF + WebP a 480/960/1600 (+ larghezza originale), `<picture>` con `srcset` e width/height. Per sfondi CSS e decorazioni: WebP con larghezza massima 1600. `public/img` è generata in build e non è versionata (prima build circa 6 minuti, poi incrementale).
- **Hero**: foto e cartoon sono già allineate nel kit (`docs/asset-report.json`), stesse dimensioni 1800x2396; il cartoon si carica solo alla prima interazione o allo sweep iniziale, scegliendo la stessa larghezza della foto mostrata.
- **Loop pesanti** (onde WebGL, scaffale VHS, marquee) girano solo quando sono visibili; le onde del menu solo a menu aperto.
- **Listino**: la demo attuale non aveva la mascotte, il README di sezione sì (colonna destra, sotto ai biglietti su mobile): l'ho aggiunta, con lo scambio occhiolino all'ingresso e al passaggio. Aggiunte anche le pinzette sui biglietti (README).
- **Transizione Tagli → Listino**: la forbice che taglia lo schermo (kit 03), versione da 200vh.
- **Dati mancanti**: niente "Oggi aperto", niente orari, telefono o Instagram inventati; dove la demo mostrava "TODO" metto un testo neutro ("Chiedi su WhatsApp") o nascondo l'elemento. Elenco completo in `TODO.md`.
- **WhatsApp senza numero**: `https://wa.me/?text=...` (si apre WhatsApp con il messaggio già scritto e si sceglie la chat) finché il numero non arriva.
- **Easter egg**: un solo libro (`/storia`) raggiungibile da 3 tocchi sulla G del footer, Konami code o digitando "fabio"; il 404 accenna ai segreti.
- **Privacy**: niente cookie né tracker, niente iframe; l'unico dato salvato è il flag del loader in sessionStorage. Per questo non serve il banner cookie.
- **Contrasto**: le poche scritte ottone su crema delle demo (es. kicker nella scheda del listino, etichette "Sbarre/Orari") sono diventate petrolio, per rispettare la regola "ottone mai come testo su chiaro".
