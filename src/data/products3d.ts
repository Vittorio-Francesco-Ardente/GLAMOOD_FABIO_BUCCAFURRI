// Scroll-driven 3D jars (aggiornamento 11). Names, formats, usage and key ingredient are copied from the
// real labels (etichette/etichetta-<k>-completa). Prices and the full ingredient list are not known yet:
// the labels themselves say "in arrivo", so the site says "da confermare" (TODO in TODO.md).
export type Product3D = {
  k: 'cera' | 'balsamo' | 'crema';
  n: string;          // short name
  full: string;       // name on the label
  note: string;       // key ingredient line on the label
  ml: string;         // format on the label
  use: string;        // "Modo d'uso" on the label
  desc: string;       // short description (existing site copy)
  ing: string[];      // ingredient names shown on the label / in the asset kit
  pics: string[];     // floating ingredient images (assets/web/v2/prodotti-3d/ingredienti/<k>/)
  ink: string;        // text colour over the product background
  accent: string;
};
export const P3D: Product3D[] = [
  { k: 'cera', n: 'Cera', full: 'Cera opaca', note: 'al miele di zagara', ml: '100 ml',
    use: 'Lavora poca cera tra le dita e modella le ciocche asciutte.',
    desc: 'Tenuta forte, effetto opaco: il capello resta dove lo metti, tutto il giorno.',
    ing: ['Cera d’api', 'Miele di zagara'], pics: ['cera-api-01', 'miele-zagara-01', 'miele-zagara-03', 'cera-api-03', 'miele-zagara-05', 'cera-api-05'],
    ink: '#08393E', accent: '#9A6B1F' },
  { k: 'balsamo', n: 'Balsamo barba', full: 'Balsamo barba', note: 'con bergamotto di Reggio', ml: '50 ml',
    use: 'Scalda poco balsamo tra le mani e distribuiscilo sulla barba asciutta, poi pettina.',
    desc: 'Barba morbida e profumata al bergamotto, l’agrume di Reggio Calabria.',
    ing: ['Bergamotto di Reggio', 'Olio di argan'], pics: ['bergamotto-01', 'argan-01', 'bergamotto-03', 'argan-03', 'bergamotto-05', 'bergamotto-07'],
    ink: '#08393E', accent: '#0F6870' },
  { k: 'crema', n: 'Crema styling', full: 'Crema styling', note: 'al fico d’India', ml: '150 ml',
    use: 'Distribuisci una noce di crema sui capelli e modella con le dita.',
    desc: 'Crema styling leggera: movimento naturale, niente effetto bagnato.',
    ing: ['Fico d’India', 'Aloe', 'Menta'], pics: ['fico-india-01', 'aloe-menta-01', 'aloe-menta-04', 'texture-prodotto-02', 'aloe-menta-02', 'texture-prodotto-03'],
    ink: '#F4EFE8', accent: '#ECC46C' },
];
