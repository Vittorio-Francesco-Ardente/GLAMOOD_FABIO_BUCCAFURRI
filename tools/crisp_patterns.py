"""Rebuilds the flat-colour patterns at higher resolution with crisp edges.
The kit sources are small (about 1600 px) and look soft when stretched full screen. These patterns use
2 to 5 flat colours, so: upscale smoothly, snap every pixel to the nearest palette colour (sharp edges),
render at 2x and downsample (clean anti-aliasing). Tileable patterns are processed as a 3x3 tile so they
stay seamless. Run once: python3 tools/crisp_patterns.py (overwrites assets/web/pattern files)."""
import sys, numpy as np
from PIL import Image, ImageFilter
ROOT = 'assets/web/pattern/'
# name: (target width, tileable, number of palette colours)
JOBS = {
 'ref/corallo.webp': (3200, False, 2), 'ref/corallo-tono.webp': (3200, False, 2),
 'ref/liquido-crema.webp': (3200, False, 2), 'ref/liquido-tono.webp': (3200, False, 2),
 'ref/macchie.webp': (3200, False, 2), 'ref/macchie-tono.webp': (3200, False, 2),
 'ref/geometrico.webp': (3200, False, 2), 'ref/swirl-retro.webp': (3200, False, 4),
 'ref/swirl-teal.webp': (3200, False, 4), 'ref/agrumi.webp': (2652, False, 3), 'ref/agrumi-tono.webp': (2652, False, 3),
 'ref/onde-strati.webp': (2166, True, 5),
 'labirinto-petrolio.webp': (2048, True, 2), 'meandri-crema.webp': (2048, True, 2), 'meandri-petrolio.webp': (2048, True, 2),
 'meandri-tono.webp': (2048, True, 2), 'vermicelli-crema.webp': (2048, True, 2), 'vermicelli-petrolio.webp': (2048, True, 2),
 'vermicelli-tono.webp': (2048, True, 2), 'swirl-petrolio.webp': (2048, True, 4),
}
def palette(im, k):
    q = im.resize((500, int(500 * im.height / im.width))).quantize(k, method=Image.Quantize.MEDIANCUT)
    p = np.array(q.getpalette()[:k * 3]).reshape(k, 3)
    return p.astype(np.float32)
def crisp(im, W, tile, k):
    pal = palette(im, k)
    w, h = im.size; H = round(h * W / w); s = 2 * W / w
    src = im
    if tile:
        big = Image.new('RGB', (w * 3, h * 3))
        for i in range(3):
            for j in range(3): big.paste(im, (i * w, j * h))
        src = big
    up = src.resize((round(src.width * s), round(src.height * s)), Image.LANCZOS).filter(ImageFilter.GaussianBlur(s * 0.6))
    if tile: up = up.crop((round(w * s), round(h * s), round(2 * w * s), round(2 * h * s)))
    a = np.asarray(up, dtype=np.float32)
    d = ((a[:, :, None, :] - pal[None, None]) ** 2).sum(-1)
    out = pal[d.argmin(-1)].astype(np.uint8)
    return Image.fromarray(out).resize((W, H), Image.LANCZOS)
for name, (W, tile, k) in JOBS.items():
    im = Image.open(ROOT + name).convert('RGB')
    res = crisp(im, W, tile, k)
    res.save(ROOT + name, 'WEBP', quality=88, method=6)
    print(name, im.size, '->', res.size)
