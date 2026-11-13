import images from './images.json';
const im = images as Record<string, { w: number; h: number; widths: number[] }>;
// Attributes for a plain <img> pointing at the capped WebP (max 1600 px wide) or at a specific width.
export function img(name: string, width?: number) {
  // one tier up for sharp images on high-density screens
  if (width === 480) width = 960; else if (width === 960) width = 1600;
  const m = im[name];
  if (!m) throw new Error(`img: unknown asset ${name}`);
  const cap = Math.min(m.w, width ?? 2400);
  const w = width && m.widths.includes(width) ? width : cap;
  const src = width && m.widths.includes(width) ? `/img/${name}-${width}.webp` : `/img/${name}.webp`;
  return { src, width: w, height: Math.round((m.h * w) / m.w) };
}
export const has = (name: string) => name in im;

// Product photos select an optimized source for the rendered slot and display density.
// Keep the full-size source available for the separate zoom view.
export function productImg(name: string, sizes: string) {
  const m = im[name];
  if (!m) throw new Error(`img: unknown asset ${name}`);
  const widths = [...new Set(m.widths)];
  return { ...img(name, 960), sizes, srcset: widths.map(w => `/img/${name}-${w}.webp ${w}w`).join(', ') };
}
