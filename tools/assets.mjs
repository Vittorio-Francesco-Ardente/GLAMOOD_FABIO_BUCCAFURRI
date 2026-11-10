// Asset pipeline (sharp). Input: assets/web/** (read-only sources, never modified).
// Output: public/img/** with responsive AVIF + WebP widths and a capped WebP used by CSS backgrounds,
// plus src/data/images.json with intrinsic sizes (width/height attributes, no CLS).
// Files already generated are skipped, so re-runs are fast.
import sharp from 'sharp';
import { readdir, mkdir, stat, writeFile, copyFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname, relative, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'assets/web');
const OUT = join(ROOT, 'public/img');
const WIDTHS = [480, 960, 1600];
const BG_MAX = 1600; // CSS backgrounds and decorative images
sharp.concurrency(2);

async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else if (/\.(webp|png|jpe?g)$/i.test(e.name)) out.push(p);
  }
  return out;
}

const fresh = async (src, dst) => existsSync(dst) && (await stat(dst)).mtimeMs >= (await stat(src)).mtimeMs;

const files = await walk(SRC);
const manifest = {};
let made = 0;
for (const file of files) {
  const rel = relative(SRC, file).replace(/\\/g, '/');
  const base = rel.slice(0, -extname(rel).length);
  const meta = await sharp(file).metadata();
  const w = meta.width, h = meta.height;
  await mkdir(dirname(join(OUT, base)), { recursive: true });
  const widths = WIDTHS.filter((x) => x < w);
  manifest[base] = { w, h, widths: [...widths, Math.min(w, 2400)] };
  // capped webp (same name as the source, used by CSS url() and by <img src>)
  const capped = join(OUT, base + '.webp');
  if (!(await fresh(file, capped))) {
    if (w <= BG_MAX && extname(file).toLowerCase() === '.webp') await copyFile(file, capped);
    else await sharp(file).resize({ width: Math.min(w, BG_MAX), withoutEnlargement: true }).webp({ quality: 80, effort: 4 }).toFile(capped);
    made++;
  }
  for (const x of manifest[base].widths) {
    for (const fmt of ['avif', 'webp']) {
      const dst = join(OUT, `${base}-${x}.${fmt}`);
      if (await fresh(file, dst)) continue;
      const img = sharp(file).resize({ width: x, withoutEnlargement: true });
      if (fmt === 'avif') await img.avif({ quality: 52, effort: 3 }).toFile(dst);
      else await img.webp({ quality: 78, effort: 4 }).toFile(dst);
      made++;
    }
  }
}
await mkdir(join(ROOT, 'src/data'), { recursive: true });
await writeFile(join(ROOT, 'src/data/images.json'), JSON.stringify(manifest, null, 1));
// brand SVGs used by CSS (wave strips)
await mkdir(join(OUT, 'svg'), { recursive: true });
for (const f of await readdir(join(ROOT, 'assets/svg'))) await copyFile(join(ROOT, 'assets/svg', f), join(OUT, 'svg', f));
console.log(`assets: ${files.length} sources, ${made} files generated`);
