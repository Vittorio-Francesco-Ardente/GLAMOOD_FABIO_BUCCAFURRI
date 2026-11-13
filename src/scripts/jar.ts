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
// Reuse decoded glass/light textures across products instead of downloading and decoding each again.
const sourceCache = new Map<string, Promise<HTMLImageElement>>();
const load = (src: string) => {
  let pending = sourceCache.get(src);
  if (!pending) {
    pending = new Promise<HTMLImageElement>((ok) => { const i = new Image(); i.decoding = 'async'; i.onload = () => ok(i); i.onerror = () => { sourceCache.delete(src); ok(i); }; i.src = src; });
    sourceCache.set(src, pending);
  }
  return pending;
};
export const loadArt = async (s: { jar: string; light: string; shadow: string; label: string }): Promise<JarArt> => {
  const [jar, light, shadow, label] = await Promise.all([load(s.jar), load(s.light), load(s.shadow), load(s.label)]);
  return { jar, light, shadow, label };
};

const artCache = new WeakMap<JarArt, { tw: number; scaled: HTMLCanvasElement | null; lays: Map<string, HTMLCanvasElement> }>();
/** Draw the jar so that its opaque box fits (w x h) centred at (cx, bottom), rot in turns (0 = label front). */
export function drawJar(ctx: CanvasRenderingContext2D, art: JarArt | undefined, cx: number, bottom: number, w: number, h: number, rot: number, lift = 0) {
  if (!art?.jar.naturalWidth) return;
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
  const L0 = art.label; if (!L0.naturalWidth) return;
  const pixelRatio = Math.max(1, ctx.getTransform().a);
  const ly0 = oy + J.y0 * k, bandH = (J.y1 - J.y0) * k;
  const r = R * k, mid = ox + MID * k;
  // the wrapped label is built in the jar's own coordinates (independent of where the jar is on screen)
  const smile = bandH * .045, LW = Math.ceil(2 * r + 2), LH = Math.ceil(bandH + smile + 2), lx0 = mid - r - 1;
  // Performance: (1) the 4800px label is pre-scaled once to the size it is shown at, so each column samples a
  // small bitmap; (2) the wrapped label is cached per rotation and size, so sliding a jar costs one drawImage.
  let cache = artCache.get(art); if (!cache) { cache = { tw: 0, scaled: null, lays: new Map() }; artCache.set(art, cache); }
  const need = Math.min(L0.naturalWidth, Math.ceil((COVER * Math.PI * 2 * r * pixelRatio * 1.25) / 128) * 128);
  if (cache.tw !== need) {
    const sc2 = document.createElement('canvas'); sc2.width = need; sc2.height = Math.round(need * L0.naturalHeight / L0.naturalWidth);
    const sg = sc2.getContext('2d')!; sg.imageSmoothingQuality = 'high'; sg.drawImage(L0, 0, 0, sc2.width, sc2.height);
    cache.tw = need; cache.scaled = sc2; cache.lays.clear();
  }
  const L = cache.scaled!;
  const rq = Math.round(rot * 800) / 800;
  const lkey = `${rq.toFixed(5)}|${r.toFixed(1)}|${LH}|${pixelRatio}`;
  let lay = cache.lays.get(lkey);
  if (!lay) {
    lay = document.createElement('canvas');
    lay.width = Math.ceil(LW * pixelRatio); lay.height = Math.ceil(LH * pixelRatio);
    const g = lay.getContext('2d')!; g.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0); g.imageSmoothingQuality = 'high';
    const lw = L.width, lh = L.height;
    for (let xl = 0; xl < LW; xl += 1 / pixelRatio) {
      const px = (xl + .5 - (r + 1)) / r; if (px <= -1 || px >= 1) continue;
      const th = Math.asin(px);
      let u = th / (Math.PI * 2) + rq; u -= Math.round(u);              // -0.5 … 0.5 around the cylinder
      const lu = u / COVER + .5; if (lu < 0 || lu >= 1) continue;          // outside the label: frosted glass
      const footprint = Math.max(1, lw / (COVER * Math.PI * 2 * r * Math.sqrt(1 - px * px) * pixelRatio));
      const sx = Math.max(0, Math.min(lw - 1, lu * lw - footprint / 2));
      const sourceWidth = Math.min(footprint, lw - sx);
      const dy = (1 - Math.cos(th)) * smile;                               // labels follow the cylinder (slight smile)
      g.drawImage(L, sx, 0, sourceWidth, lh, xl, dy, 1.2 / pixelRatio, bandH);
    }
    g.globalCompositeOperation = 'source-atop';
    const gr = g.createLinearGradient(1, 0, 2 * r + 1, 0);
    gr.addColorStop(0, 'rgba(5,27,30,.62)'); gr.addColorStop(.14, 'rgba(5,27,30,.2)'); gr.addColorStop(.34, 'rgba(5,27,30,0)');
    gr.addColorStop(.7, 'rgba(5,27,30,0)'); gr.addColorStop(.88, 'rgba(5,27,30,.22)'); gr.addColorStop(1, 'rgba(5,27,30,.66)');
    g.fillStyle = gr; g.fillRect(0, 0, LW, LH);
    if (cache.lays.size > 24) cache.lays.delete(cache.lays.keys().next().value!);
    cache.lays.set(lkey, lay);
  }
  ctx.drawImage(lay, lx0, ly0, LW, LH);
  // fixed glass light (highlight + side shade), same 2048 frame as the jar
  if (art.light.naturalWidth) { ctx.save(); ctx.globalAlpha = .9; ctx.drawImage(art.light, ox, oy, J.S * k, J.S * k); ctx.restore(); }
  void sc;
}
