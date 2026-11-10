// Prices exactly as on the printed flyer (docs/04-content.md). Confirm before launch.
export type Row = [name: string, price: string, detail: string];
export const listino: { k: string; title: string; kicker: string; lead: string; rows: Row[]; wave?: boolean }[] = [
  {
    k: 'tagli', title: 'Tagli', kicker: 'Capelli e combo',
    lead: 'Il taglio e le combinazioni con shampoo, conditioner e barba. Scegli la formula, il resto lo decidiamo insieme in poltrona.',
    rows: [
      ['Taglio', '15 €', 'Il taglio su misura, rifinito a forbice e macchinetta.'],
      ['Taglio + shampoo', '18 €', 'Lavaggio prima del taglio, capelli puliti e più facili da lavorare.'],
      ['Taglio + shampoo + conditioner', '20 €', 'Con il conditioner, per capelli morbidi e districati.'],
      ['Taglio + rifinitura barba', '18 €', 'Taglio più una sistemata veloce ai contorni della barba.'],
      ['Taglio + delineatura barba + shampoo', '20 €', 'Contorni della barba definiti, più lavaggio.'],
      ['Taglio + modellatura barba', '23 €', 'La barba viene ridisegnata e sfumata insieme al taglio.'],
      ['Taglio + modellatura barba + shampoo', '25 €', 'La formula completa.'],
    ],
  },
  {
    k: 'barba', title: 'Barba', kicker: 'Rasoio e forbice', wave: true,
    lead: 'Rasoio e forbice: dalla rifinitura dei contorni alla rasatura completa.',
    rows: [
      ['Rifinitura barba (delineatura)', '3 €', 'Contorni puliti su guance e collo.'],
      ['Modellatura + sfumatura barba', '10 €', 'La forma della barba viene ridisegnata, con la sfumatura verso i capelli.'],
      ['Rasatura totale barba', '10 €', 'Barba tolta completamente, viso liscio.'],
    ],
  },
  {
    k: 'trattamenti', title: 'Trattamenti', kicker: 'Cura in più',
    lead: 'I servizi in più, da aggiungere al taglio o da fare da soli.',
    rows: [
      ['Shampoo', '4 €', 'Lavaggio dei capelli.'],
      ['Tonalizzante', '8 €', 'Ravviva o corregge il colore dei capelli.'],
      ['Maschera viso', '10 €', 'Trattamento per la pelle del viso.'],
      ['Stiratura in crema', 'da 50 €', 'Capelli lisci e disciplinati; il prezzo dipende dalla lunghezza.'],
    ],
  },
];
