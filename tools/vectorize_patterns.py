"""Vectorizes the flat-colour patterns into SVG (sharp at any resolution, 4K included).
Input: assets/web/pattern/**/*.webp (already rebuilt with crisp edges by crisp_patterns.py).
Output: assets/svg/pattern-<name>.svg. Each palette colour becomes one even-odd path traced from the
image contours, simplified to sub-pixel tolerance and drawn as smooth quadratic curves."""
import cv2, numpy as np
from PIL import Image
JOBS = {  # file: number of colours
 'ref/liquido-tono': 2, 'ref/liquido-crema': 2, 'ref/corallo-tono': 2, 'ref/corallo': 2,
 'ref/macchie-tono': 2, 'ref/macchie': 2, 'ref/geometrico': 2, 'ref/onde-strati': 5,
 'ref/swirl-retro': 4, 'ref/swirl-teal': 4, 'ref/agrumi': 3, 'ref/agrumi-tono': 3,
}
def palette(a, k):
    im = Image.fromarray(a).quantize(k, method=Image.Quantize.MEDIANCUT)
    p = np.array(im.getpalette()[:k * 3]).reshape(k, 3); idx = np.asarray(im)
    return p, idx
def smooth_path(c):
    pts = c.reshape(-1, 2).astype(float)
    if len(pts) < 3: return ''
    for _ in range(2):  # Chaikin corner cutting: removes the raster wobble
        q = np.roll(pts, -1, axis=0); pts = np.vstack([0.75 * pts + 0.25 * q, 0.25 * pts + 0.75 * q]).reshape(2, -1, 2).transpose(1, 0, 2).reshape(-1, 2)
    # quadratic curves through midpoints: smooth and compact
    mids = (pts + np.roll(pts, -1, axis=0)) / 2
    d = f'M{mids[-1][0]:.1f} {mids[-1][1]:.1f}'
    for p, m in zip(pts, mids): d += f'Q{p[0]:.1f} {p[1]:.1f} {m[0]:.1f} {m[1]:.1f}'
    return d + 'Z'
for name, k in JOBS.items():
    a = np.asarray(Image.open(f'assets/web/pattern/{name}.webp').convert('RGB'))
    h, w = a.shape[:2]
    pal, idx = palette(a, k)
    counts = np.bincount(idx.ravel(), minlength=k); order = np.argsort(-counts)
    hexc = lambda c: '#%02x%02x%02x' % tuple(int(v) for v in c)
    parts = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" preserveAspectRatio="xMidYMid slice"><rect width="{w}" height="{h}" fill="{hexc(pal[order[0]])}"/>']
    for ci in order[1:]:
        mask = (idx == ci).astype(np.uint8) * 255
        mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
        cs, _ = cv2.findContours(mask, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_NONE)
        d = ''.join(smooth_path(cv2.approxPolyDP(c, 2.2, True)) for c in cs if cv2.contourArea(c) > 30)
        if d: parts.append(f'<path fill="{hexc(pal[ci])}" stroke="{hexc(pal[ci])}" stroke-width="2.5" stroke-linejoin="round" fill-rule="evenodd" d="{d}"/>')
    parts.append('</svg>')
    out = f'assets/svg/pattern-{name.split("/")[-1]}.svg'
    open(out, 'w').write(''.join(parts))
    print(out, w, h, round(len(''.join(parts)) / 1024), 'KB')
