"""Liquid backgrounds (rif. Vittorio, 13/11): the reference rasters in assets/src-pattern/liquido/ are traced
into vector SVG and recoloured to the Glamood palette. Vector output = sharp at any size (4K, Retina),
so no resolution is lost. Each palette level of the source (sorted dark -> light) maps to one brand colour.
Usage: python3 tools/vectorize_liquid.py   ->   assets/svg/liquido-<name>.svg"""
import cv2, numpy as np
from PIL import Image

# name: (source, colours, ramp dark->light, crop box or None)
JOBS = {
 'petrolio-crema': ('rif-1', 2, ['#0F6870', '#F4EFE8'], None),          # bold two-tone, section bands
 'crema-tono':     ('rif-1', 2, ['#DCE8E3', '#F4EFE8'], None),          # quiet tone-on-tone for light pages
 'miele':          ('rif-2', 2, ['#EDCF8C', '#F5E4B8'], None),          # cera: honey two-tone
 'miele-ricco':    ('rif-3', 4, ['#D9AD5B', '#E7C57C', '#F1DCA8', '#F8EDD0'], None),
 'petrolio-tono':  ('rif-4', 4, ['#07343A', '#0A4A50', '#0C5A61', '#11717A'], None),  # crema styling (dark)
 'salvia':         ('rif-5', 2, ['#C6DCD6', '#E7F0ED'], None),          # balsamo barba (bergamotto)
 'gocce':          ('rif-6', 2, ['#CFE3DE', '#F4EFE8'], (0, 0, 1080, 1560)),  # crop: drop the shadow artefact
 'abisso':         ('rif-7', 4, ['#05292D', '#0A4A50', '#0F6870', '#3E9A9F'], None),  # the whole line, dark
}
SCALE = 2  # trace on an upscaled copy: smoother contours

def smooth_path(c):
    pts = c.reshape(-1, 2).astype(float) / SCALE
    if len(pts) < 3: return ''
    for _ in range(2):  # Chaikin corner cutting removes raster wobble
        q = np.roll(pts, -1, axis=0)
        pts = np.vstack([0.75 * pts + 0.25 * q, 0.25 * pts + 0.75 * q]).reshape(2, -1, 2).transpose(1, 0, 2).reshape(-1, 2)
    mids = (pts + np.roll(pts, -1, axis=0)) / 2
    d = f'M{mids[-1][0]:.1f} {mids[-1][1]:.1f}'
    for p, m in zip(pts, mids): d += f'Q{p[0]:.1f} {p[1]:.1f} {m[0]:.1f} {m[1]:.1f}'
    return d + 'Z'

for name, (src, k, ramp, crop) in JOBS.items():
    im = Image.open(f'assets/src-pattern/liquido/{src}.png').convert('RGB')
    if crop: im = im.crop(crop)
    w, h = im.size
    a = cv2.resize(np.asarray(im), (w * SCALE, h * SCALE), interpolation=cv2.INTER_CUBIC)
    a = cv2.bilateralFilter(a, 9, 40, 9)  # flatten gradients/noise inside the shapes
    q = Image.fromarray(a).quantize(k, method=Image.Quantize.MEDIANCUT)
    pal = np.array(q.getpalette()[:k * 3]).reshape(k, 3).astype(float); idx = np.asarray(q)
    lum = pal @ [0.2126, 0.7152, 0.0722]
    order = np.argsort(lum)  # dark -> light
    colour = {int(ci): ramp[r] for r, ci in enumerate(order)}
    counts = np.bincount(idx.ravel(), minlength=k)
    base = int(np.argmax(counts))  # most frequent level becomes the background rect
    parts = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" preserveAspectRatio="xMidYMid slice"><rect width="{w}" height="{h}" fill="{colour[base]}"/>']
    for ci in [int(c) for c in order if int(c) != base]:
        mask = (idx == ci).astype(np.uint8) * 255
        mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))
        mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8))
        cs, _ = cv2.findContours(mask, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_NONE)
        d = ''.join(smooth_path(cv2.approxPolyDP(c, 2.0, True)) for c in cs if cv2.contourArea(c) > 400)
        if d: parts.append(f'<path fill="{colour[ci]}" stroke="{colour[ci]}" stroke-width="1.6" stroke-linejoin="round" fill-rule="evenodd" d="{d}"/>')
    parts.append('</svg>')
    out = f'assets/svg/liquido-{name}.svg'
    open(out, 'w').write(''.join(parts))
    print(out, w, h, round(len(''.join(parts)) / 1024), 'KB')
