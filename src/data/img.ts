import images from './images.json';
const im = images as Record<string, { w: number; h: number; widths: number[] }>;
// Attributes for a plain <img> pointing at the capped WebP (max 1600 px wide) or at a specific width.
export function img(name: string, width?: number) {
  const m = im[name];
  if (!m) throw new Error(`img: unknown asset ${name}`);
  const cap = Math.min(m.w, width ?? 1600);
  const w = width && m.widths.includes(width) ? width : cap;
  const src = width && m.widths.includes(width) ? `/img/${name}-${width}.webp` : `/img/${name}.webp`;
  return { src, width: w, height: Math.round((m.h * w) / m.w) };
}
export const has = (name: string) => name in im;
