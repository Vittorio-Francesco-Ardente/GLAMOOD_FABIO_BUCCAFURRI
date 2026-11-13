// Catalogo prodotti (aggiornamento 12): categorie, una pagina per prodotto.
// Nomi, formati, modo d'uso e ingrediente chiave vengono dalle etichette e dalle confezioni del kit.
// Prezzi, disponibilità e INCI completi non sono noti: il sito dice "da confermare in salone" (TODO.md).
const V = 'v2/prodotti-3d';
export type Cat = 'styling' | 'barba' | 'capelli' | 'dopobarba';
export const CATS: { k: Cat; n: string; d: string; bg: string; ink: string; accent: string }[] = [
  { k: 'styling', n: 'Styling', d: 'Cere e creme per dare forma al taglio e farlo durare tutto il giorno.', bg: '#F4EFE8', ink: '#0F6870', accent: '#B8935A' },
  { k: 'barba', n: 'Barba', d: 'Balsamo, olio e crema da rasatura: la barba morbida e in ordine, come dopo la poltrona.', bg: '#DDEAE7', ink: '#08393E', accent: '#0F6870' },
  { k: 'capelli', n: 'Capelli', d: 'Lavaggio e texture: la base giusta prima dello styling.', bg: '#0F6870', ink: '#F4EFE8', accent: '#ECC46C' },
  { k: 'dopobarba', n: 'Dopobarba', d: 'Il gesto finale del barbiere, con il profumo del bergamotto di Reggio.', bg: '#08393E', ink: '#F4EFE8', accent: '#B8935A' },
];
export type Tile = { v: string; l: string };
export type Product = {
  slug: string; cat: Cat; n: string; sub: string; ml: string;
  kind: 'jar' | 'pack'; jar?: 'cera' | 'balsamo' | 'crema';
  pack?: string; splash?: string;
  desc: string; long: string; use: string; ing: string[];
  tiles: Tile[];             // three info tiles (Hippeas-style), facts from the label/type only
  pics: string[];            // floating ingredients (asset paths)
  hero: string;              // large ingredient composition / illustration
  pattern: string;           // CSS class of a site pattern (ref-kit) for the page background
  bg: string; bg2: string; ink: string; accent: string;
};
const ing = (k: string, f: string) => `${V}/ingredienti/${k}/${f}`;
export const PRODUCTS: Product[] = [
  { slug: 'cera-opaca', cat: 'styling', n: 'Cera opaca', sub: 'al miele di zagara', ml: '100 ml', kind: 'jar', jar: 'cera',
    desc: 'Tenuta forte, effetto opaco: il capello resta dove lo metti, tutto il giorno.',
    long: 'Per crop, texturizzati e tagli corti con volume. La cera si lavora tra le dita, separa le ciocche e le tiene ferme senza l’effetto bagnato.',
    use: 'Lavora poca cera tra le dita e modella le ciocche asciutte.', ing: ['Cera d’api', 'Miele di zagara'],
    tiles: [{ v: 'Opaco', l: 'Effetto' }, { v: 'Forte', l: 'Tenuta' }, { v: '100 ml', l: 'Formato' }],
    pics: [ing('cera', 'miele-zagara-01'), ing('cera', 'cera-api-01'), ing('cera', 'miele-zagara-03'), ing('cera', 'cera-api-03'), ing('cera', 'miele-zagara-05')],
    hero: `${V}/ingredienti/cera/scheda-cera-ingredienti-01`, pattern: 'r-geometrico', bg: '#F1DEAE', bg2: '#EAD39B', ink: '#08393E', accent: '#9A6B1F' },
  { slug: 'crema-styling', cat: 'styling', n: 'Crema styling', sub: 'al fico d’India', ml: '150 ml', kind: 'jar', jar: 'crema',
    desc: 'Crema styling leggera: movimento naturale, niente effetto bagnato.',
    long: 'Per chi vuole i capelli in ordine ma liberi. Si distribuisce su capello umido o asciutto e lascia un movimento morbido, facile da rifare.',
    use: 'Distribuisci una noce di crema sui capelli e modella con le dita.', ing: ['Fico d’India', 'Aloe', 'Menta'],
    tiles: [{ v: 'Naturale', l: 'Effetto' }, { v: 'Leggera', l: 'Tenuta' }, { v: '150 ml', l: 'Formato' }],
    pics: [ing('crema', 'fico-india-01'), ing('crema', 'aloe-menta-01'), ing('crema', 'texture-prodotto-02'), ing('crema', 'aloe-menta-04')],
    hero: `${V}/illustrazioni/illustrazione-crema`, pattern: 'r-liquido-tono', bg: '#0F6870', bg2: '#0C5A61', ink: '#F4EFE8', accent: '#ECC46C' },
  { slug: 'balsamo-barba', cat: 'barba', n: 'Balsamo barba', sub: 'con bergamotto di Reggio', ml: '50 ml', kind: 'jar', jar: 'balsamo', splash: `${V}/banner/splash-balsamo`,
    desc: 'Barba morbida e profumata al bergamotto, l’agrume di Reggio Calabria.',
    long: 'Ammorbidisce la barba, la tiene in forma e la profuma con il bergamotto, l’agrume che cresce solo qui. Ideale dopo la sistemata in salone.',
    use: 'Scalda poco balsamo tra le mani e distribuiscilo sulla barba asciutta, poi pettina.', ing: ['Bergamotto di Reggio', 'Olio di argan'],
    tiles: [{ v: 'Morbida', l: 'Barba' }, { v: 'Bergamotto', l: 'Profumo' }, { v: '50 ml', l: 'Formato' }],
    pics: [ing('balsamo', 'bergamotto-01'), ing('balsamo', 'argan-01'), ing('balsamo', 'bergamotto-03'), ing('balsamo', 'bergamotto-05'), ing('balsamo', 'argan-03')],
    hero: `${V}/illustrazioni/illustrazione-balsamo`, pattern: 'r-agrumi-tono', bg: '#DDEAE7', bg2: '#CFE2DE', ink: '#08393E', accent: '#0F6870' },
  { slug: 'olio-barba', cat: 'barba', n: 'Olio barba', sub: 'all’argan', ml: '30 ml', kind: 'pack', pack: `${V}/confezioni/olio-barba`,
    desc: 'Poche gocce per una barba lucida e la pelle sotto idratata.',
    long: 'L’olio leggero per la barba lunga o appena cresciuta: nutre il pelo, calma il prurito e lascia un lucido naturale.',
    use: 'Tre o quattro gocce sul palmo, massaggia la barba fino alla pelle.', ing: ['Olio di argan', 'Bergamotto'],
    tiles: [{ v: 'Gocce', l: 'Formato' }, { v: 'Argan', l: 'Base' }, { v: '30 ml', l: 'Contagocce' }],
    pics: [ing('balsamo', 'argan-02'), ing('balsamo', 'argan-04'), ing('balsamo', 'bergamotto-07')],
    hero: `${V}/ingredienti/balsamo/scheda-balsamo-ingredienti-02`, pattern: 'r-macchie-tono', bg: '#0C5A61', bg2: '#0A4A50', ink: '#F4EFE8', accent: '#ECC46C' },
  { slug: 'crema-da-barba', cat: 'barba', n: 'Crema da barba', sub: 'per una rasatura morbida', ml: '150 ml', kind: 'pack', pack: `${V}/confezioni/crema-barba`,
    desc: 'Schiuma densa, lama che scorre, pelle che non tira.',
    long: 'La crema che Fabio usa per la rasatura con il panno caldo: si monta con il pennello e protegge la pelle durante il passaggio della lama.',
    use: 'Monta una nocciola di crema con pennello umido e stendi sul viso.', ing: ['Aloe', 'Menta'],
    tiles: [{ v: 'Densa', l: 'Schiuma' }, { v: 'Pennello', l: 'Uso' }, { v: '150 ml', l: 'Tubo' }],
    pics: [ing('crema', 'aloe-menta-02'), ing('crema', 'texture-prodotto-03'), ing('crema', 'aloe-menta-05')],
    hero: `${V}/ingredienti/crema/scheda-crema-ingredienti-05`, pattern: 'r-liquido-crema', bg: '#F4EFE8', bg2: '#E9E2D6', ink: '#0F6870', accent: '#B8935A' },
  { slug: 'shampoo', cat: 'capelli', n: 'Shampoo', sub: 'aloe e menta', ml: '250 ml', kind: 'pack', pack: `${V}/confezioni/shampoo`,
    desc: 'Lavaggio fresco per ogni giorno, prepara il capello allo styling.',
    long: 'Pulisce senza seccare e lascia una sensazione fresca grazie alla menta. È la base da cui parte ogni piega fatta bene.',
    use: 'Massaggia su capelli bagnati, risciacqua bene. Ripeti se serve.', ing: ['Aloe', 'Menta'],
    tiles: [{ v: 'Fresco', l: 'Lavaggio' }, { v: 'Ogni giorno', l: 'Uso' }, { v: '250 ml', l: 'Dosatore' }],
    pics: [ing('crema', 'aloe-menta-01'), ing('crema', 'aloe-menta-03'), ing('crema', 'texture-prodotto-04')],
    hero: `${V}/ingredienti/crema/aloe-menta-03`, pattern: 'r-liquido-crema', bg: '#E3ECE8', bg2: '#D2E3DE', ink: '#0F6870', accent: '#0F6870' },
  { slug: 'spray-al-sale', cat: 'capelli', n: 'Spray al sale', sub: 'effetto mare', ml: '200 ml', kind: 'pack', pack: `${V}/confezioni/spray-sale`,
    desc: 'Volume e texture come dopo un bagno al Lungomare.',
    long: 'Si spruzza sul capello umido prima dell’asciugatura: dà corpo, separa le ciocche e un finish opaco da spiaggia.',
    use: 'Agita, spruzza su capelli umidi da 20 cm e asciuga con le dita.', ing: ['Sale marino'],
    tiles: [{ v: 'Volume', l: 'Effetto' }, { v: 'Opaco', l: 'Finish' }, { v: '200 ml', l: 'Spray' }],
    pics: [ing('crema', 'aloe-menta-02'), ing('crema', 'texture-prodotto-02')],
    hero: `${V}/ingredienti/crema/texture-prodotto-02`, pattern: 'r-strati', bg: '#12757E', bg2: '#0F6870', ink: '#F4EFE8', accent: '#ECC46C' },
  { slug: 'dopobarba', cat: 'dopobarba', n: 'Dopobarba', sub: 'al bergamotto', ml: '100 ml', kind: 'pack', pack: `${V}/confezioni/dopobarba`,
    desc: 'Rinfresca la pelle dopo la rasatura con il profumo di Reggio.',
    long: 'Il gesto con cui finisce ogni rasatura in salone: chiude, rinfresca e lascia una scia di bergamotto e agrumi.',
    use: 'Poche gocce sui palmi, picchietta su viso e collo dopo la rasatura.', ing: ['Bergamotto di Reggio'],
    tiles: [{ v: 'Fresco', l: 'Effetto' }, { v: 'Bergamotto', l: 'Note' }, { v: '100 ml', l: 'Flacone' }],
    pics: [ing('balsamo', 'bergamotto-02'), ing('balsamo', 'bergamotto-04'), ing('balsamo', 'bergamotto-06')],
    hero: `${V}/ingredienti/balsamo/scheda-balsamo-ingredienti-01`, pattern: 'r-agrumi-tono', bg: '#08393E', bg2: '#0A4A50', ink: '#F4EFE8', accent: '#B8935A' },
];
export const bySlug = (s: string) => PRODUCTS.find((p) => p.slug === s)!;
export const imgOf = (p: Product) => (p.kind === 'pack' ? p.pack! : `${V}/confezioni/barattolo-${p.jar}`);
