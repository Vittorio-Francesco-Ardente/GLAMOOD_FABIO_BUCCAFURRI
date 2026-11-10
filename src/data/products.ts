// Product names and descriptions are placeholders until Fabio confirms the real line (TODO). No e-commerce.
export const top3 = [
  { n: 'Cera', img: 'prodotti/barattolo-cera', bg: '#0F6870', tc: '#83C8C2', ink: '#F4EFE8', parts: ['attrezzi/05_pettine_petrolio', 'attrezzi/07_ciocca_capelli'], desc: 'Tenuta forte, effetto opaco: il capello resta dove lo metti, tutto il giorno.' },
  { n: 'Pomata', img: 'prodotti/barattolo-pomata', bg: '#0A4A50', tc: '#C9A46A', ink: '#F4EFE8', parts: ['attrezzi/02_forbici_chiuse', 'attrezzi/03_rasoio_mano_libera'], desc: 'Lucida e morbida: pettinature pulite che si ripettinano con le dita.' },
  { n: 'Crema', img: 'prodotti/barattolo-crema-styling', bg: '#F4EFE8', tc: '#0F6870', ink: '#17292C', parts: ['attrezzi/01_forbici_aperte', 'attrezzi/07_ciocca_capelli'], desc: 'Crema styling leggera: movimento naturale, niente effetto bagnato.' },
];
export const catalog: Record<string, { n: string; img: string; bg: string; d: string; f: [string, string][] }> = {
  cera: { n: 'Cera', img: 'prodotti/barattolo-cera', bg: '#0A4A50', d: 'Tenuta forte ed effetto opaco: la forma resta tutto il giorno.', f: [['Tenuta', 'Forte'], ['Effetto', 'Opaco'], ['Capelli', 'Corti e medi'], ['Formato', 'Da confermare']] },
  pomata: { n: 'Pomata', img: 'prodotti/barattolo-pomata', bg: '#12757E', d: 'Lucida e morbida, si ripettina con le dita durante la giornata.', f: [['Tenuta', 'Media'], ['Effetto', 'Lucido'], ['Capelli', 'Tutti'], ['Formato', 'Da confermare']] },
  crema: { n: 'Crema styling', img: 'prodotti/barattolo-crema-styling', bg: '#0C5A61', d: 'Leggera, per un movimento naturale senza effetto bagnato.', f: [['Tenuta', 'Leggera'], ['Effetto', 'Naturale'], ['Capelli', 'Medi e lunghi'], ['Formato', 'Da confermare']] },
  balsamo: { n: 'Balsamo barba', img: 'prodotti/barattolo-balsamo-barba', bg: '#08393E', d: 'Ammorbidisce e tiene in ordine la barba, ogni giorno.', f: [['Per', 'Barba'], ['Effetto', 'Morbido'], ['Uso', 'Quotidiano'], ['Formato', 'Da confermare']] },
};
