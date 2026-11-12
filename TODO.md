# TODO: dati e asset da Fabio

Nessun dato è stato inventato. Finché manca, il sito usa un testo neutro o nasconde l'elemento.
Tutti i valori si cambiano in un solo posto: `src/data/business.ts` (e listino/tagli/prodotti in `src/data/`).

## Dati attività (obbligatori prima della pubblicazione)
- [ ] **P.IVA** (obbligatoria nel footer, art. 35 DPR 633/72) e REA se presente. Ora: "P.IVA in aggiornamento".
- [ ] **Telefono / WhatsApp** (formato 39XXXXXXXXXX). Ora i link WhatsApp aprono la scelta della chat con il testo già scritto; i pulsanti "Chiama" sono nascosti.
- [ ] **Orari** di apertura. Ora: "Chiedi su WhatsApp" (hero, dove siamo, footer). Poi aggiungere `openingHoursSpecification` nel JSON-LD.
- [ ] **CAP** dell'indirizzo.
- [ ] **Coordinate** (5+ decimali) per il JSON-LD.
- [ ] **Handle Instagram**. Ora le icone e i link Instagram sono nascosti e il pulsante social punta a Facebook.
- [ ] **Pagina Facebook di Glamood** (oggi c'è solo il profilo personale): serve per mostrare i post Facebook nel sito.
- [ ] **Dominio** definitivo (es. glamood.it): aggiornare `astro.config.mjs`, `src/data/business.ts`, `public/robots.txt`.
- [ ] **Nome dell'architetto** degli interni (la ricerca cita "arch. Manguso", da verificare). Ora: "nome dell'architetto da confermare".

## Contenuti
- [ ] Conferma del **listino** (copiato dal volantino stampato) e della voce **più richiesta** (per l'adesivo "PIÙ RICHIESTO", oggi non mostrato).
- [ ] **Tagli reali**: nomi, descrizione, a chi stanno bene, mantenimento, durata, foto. Ora 8 tagli segnaposto con le copertine VHS generate.
- [ ] **Prodotti reali**: nomi, descrizioni, formati, prezzi. Ora 4 barattoli segnaposto (Cera, Pomata, Crema styling, Balsamo barba).
- [ ] **Merch**: taglie, prezzi, disponibilità.
- [ ] **Storia di Fabio** (pagina `/storia`): testi e foto degli inizi, della formazione, dei primi attrezzi.
- [ ] **Recensioni Google**: valutazione reale se si vuole mostrarla (mai inventata, niente aggregateRating fatto in casa).

## Social (Cloudflare)
- [ ] Account Instagram Business o Creator, token long-lived salvato come secret `IG_TOKEN`, KV `SOCIAL` collegato.

## Asset
- [ ] I master PNG 4096 px (circa 220 MB) non sono nel repository: le derivate vengono dai WebP del kit (`assets/web`). Se servono qualità superiori, rigenerare da `assets/masters` del kit.
- [ ] Render dedicati "salone al buio / luce accesa" per un eventuale loader alternativo (il loader attuale è l'intro del link tree, come da demo).

## Prodotti 3D (aggiornamento 11)
- [ ] Prezzi di Pomata, Cera, Balsamo barba e Crema styling (oggi: "Prezzo da confermare").
- [ ] Elenco completo degli ingredienti: le etichette dicono "in arrivo"; il sito mostra solo l'ingrediente principale (cedro, miele di zagara e cera d'api, bergamotto e argan, fico d'India con aloe e menta).
- [ ] Etichette in alta risoluzione (oggi 2172x724, consigliato 6000x2000) per barattoli più nitidi sugli schermi retina.
