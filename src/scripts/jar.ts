// Jar renderer (aggiornamento 11): blank frontal jar photo + flat 3:1 label wrapped on the body cylinder
// (per-column asin mapping, like the prototype), fixed glass light on top, contact shadow under.
// Only the label turns; light and reflections stay put. One frame = jar width (device px) small drawImage calls.

// geometry of barattolo-nudo-fronte (2048x2048): opaque jar 128..1919 x, 334..1813 y;
// cylindrical body 129..1917; label band from just under the brass ring to above the rounded base
export const J = { S: 2048, bx0: 128, bx1: 1919, by0: 334, by1: 1813, x0: 129, x1: 1917, y0: 785, y1: 1600 };
const R = (J.x1 - J.x0) / 2, MID = (J.x0 + J.x1) / 2;
// the label keeps its proportions: 3:1 on an 815px band = 2445px of a 5617px circumference
export const COVER = ((J.y1 - J.y0) * 3) / (Math.PI * (J.x1 - J.x0));

export type JarArt = { jar: HTMLImageElement; light: HTMLImageElement; shadow: HTMLImageElement; label: HTMLImageElement };
const load = (src: string) => new Promise<HTMLImageElement>((ok) => { const i = new Image(); i.decoding = 'async'; i.onload = () => ok(i); i.onerror = () => ok(i); i.src = src; });
export const loadArt = async (s: { jar: string; light: string; shadow: string; label: string }): Promise<JarArt> => {
  const [jar, light, shadow, label] = await Promise.all([load(s.jar), load(s.light), load(s.shadow), load(s.label)]);
  return { jar, light, shadow, label };
};

const layers = new WeakMap<HTMLCanvasElement, HTMLCanvasElement>();
/** Draw the jar so that its opaque box fits (w x h) centred at (cx, bottom), rot in turns (0 = label front). */
export function drawJar(ctx: CanvasRenderingContext2D, art: JarArt, cx: number, bottom: number, w: number, h: number, rot: number, lift = 0) {
  if (!art.jar.naturalWidth) return;
  const k = Math.min(w / (J.bx1 - J.bx0), h / (J.by1 - J.by0));       // canvas px per source px
  const ox = cx - (J.S / 2) * k, oy = bottom - J.by1 * k - lift;      // where source (0,0) lands
  const sc = art.jar.naturalWidth / J.S;
  // contact shadow: its centre (1024,1024) sits under the base, a bit wider when the jar lifts
  if (art.shadow.naturalWidth) {
    const s = 2.15 * k * (1 + lift / (h * 2)), a = Math.max(.35, 1 - lift / h);
    ctx.save(); ctx.globalAlpha = a; ctx.drawImage(art.shadow, cx - (J.S / 2) * s, bottom - (J.S / 2) * s * .6 + 4, J.S * s, J.S * s * .6); ctx.restore();
  }
  ctx.drawImage(art.jar, ox, oy, J.S * k, J.S * k);
  // label layer, shaded with source-atop so only the paper darkens toward the edges
  const L = art.label; if (!L.naturalWidth) return;
  const cv = ctx.canvas; const pixelRatio = Math.max(1, ctx.getTransform().a); let lay = layers.get(cv);
  if (!lay) { lay = document.createElement('canvas'); layers.set(cv, lay); }
  const lx0 = Math.floor(ox + J.x0 * k), lx1 = Math.ceil(ox + J.x1 * k), ly0 = oy + J.y0 * k, bandH = (J.y1 - J.y0) * k;
  const smile = bandH * .045, LW = lx1 - lx0 + 2, LH = Math.ceil(bandH + smile + 2);
  lay.width = Math.ceil(LW * pixelRatio); lay.height = Math.ceil(LH * pixelRatio);
  const g = lay.getContext('2d')!; g.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0); g.clearRect(0, 0, LW, LH); g.imageSmoothingQuality = 'high';
  const r = R * k, mid = ox + MID * k, lw = L.naturalWidth, lh = L.naturalHeight;
  for (let x = lx0; x < lx1; x += 1 / pixelRatio) {
    const px = (x + .5 - mid) / r; if (px <= -1 || px >= 1) continue;
    const th = Math.asin(px);
    let u = th / (Math.PI * 2) + rot; u -= Math.round(u);              // -0.5 … 0.5 around the cylinder
    const lu = u / COVER + .5; if (lu < 0 || lu >= 1) continue;          // outside the label: frosted glass
    const sx = Math.min(lw - 1, Math.floor(lu * lw));
    const dy = (1 - Math.cos(th)) * smile;                               // labels follow the cylinder (slight smile)
    g.drawImage(L, sx, 0, 1, lh, x - lx0, dy, 1.2 / pixelRatio, bandH);
  }
  g.globalCompositeOperation = 'source-atop';
  const gr = g.createLinearGradient(mid - r - lx0, 0, mid + r - lx0, 0);
  gr.addColorStop(0, 'rgba(5,27,30,.62)'); gr.addColorStop(.14, 'rgba(5,27,30,.2)'); gr.addColorStop(.34, 'rgba(5,27,30,0)');
  gr.addColorStop(.7, 'rgba(5,27,30,0)'); gr.addColorStop(.88, 'rgba(5,27,30,.22)'); gr.addColorStop(1, 'rgba(5,27,30,.66)');
  g.fillStyle = gr; g.fillRect(0, 0, LW, LH); g.globalCompositeOperation = 'source-over';
  ctx.drawImage(lay, lx0, ly0, LW, LH);
  // fixed glass light (highlight + side shade), same 2048 frame as the jar
  if (art.light.naturalWidth) { ctx.save(); ctx.globalAlpha = .9; ctx.drawImage(art.light, ox, oy, J.S * k, J.S * k); ctx.restore(); }
  void sc;
}
