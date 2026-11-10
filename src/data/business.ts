// Single source of truth for business data. Values marked TODO are NOT invented: they are listed in TODO.md
// and the UI hides or neutralises them until Fabio confirms (see docs/04-content.md).
export const business = {
  name: 'Glamood',
  owner: 'Fabio Buccafurri',
  legalName: 'Glamood di Fabio Buccafurri',
  address: 'Via Sbarre Centrali 282/G',
  city: 'Reggio Calabria',
  cap: null as string | null, // TODO: CAP da confermare
  country: 'IT',
  phone: null as string | null, // TODO: telefono / WhatsApp in formato 39XXXXXXXXXX
  instagram: null as string | null, // TODO: handle Instagram
  facebook: 'https://www.facebook.com/fabio.buccafurri.3/',
  linktree: 'https://glamood-links.pages.dev/',
  piva: null as string | null, // TODO: P.IVA (obbligatoria nel footer)
  hours: null as null | { days: string; time: string }[], // TODO: orari
  architect: null as string | null, // TODO: nome dell'architetto degli interni
  site: 'https://glamood.pages.dev', // TODO: dominio definitivo
  geo: null as null | { lat: number; lng: number }, // TODO: coordinate (5+ decimali)
};

export const waText = {
  generic: 'Ciao Fabio, vorrei prenotare un taglio.',
  cut: (name: string) => `Ciao Fabio, vorrei prenotare: ${name}.`,
  info: (what: string) => `Ciao Fabio, vorrei qualche informazione su: ${what}.`,
};

// wa.me link. Without a confirmed number it opens WhatsApp with the text only (the user picks the chat).
export function wa(text: string = waText.generic): string {
  const t = encodeURIComponent(text);
  return business.phone ? `https://wa.me/${business.phone}?text=${t}` : `https://wa.me/?text=${t}`;
}
export const tel = (): string | null => (business.phone ? `tel:+${business.phone}` : null);
export const instagramUrl = (): string => (business.instagram ? `https://www.instagram.com/${business.instagram}/` : 'https://www.instagram.com/');
export const hoursLabel = (): string => (business.hours ? business.hours.map((h) => `${h.days} ${h.time}`).join(', ') : 'Chiedi su WhatsApp');
