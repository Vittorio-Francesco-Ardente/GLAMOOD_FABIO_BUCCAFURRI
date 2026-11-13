// Asset pipeline (sharp). Input: assets/web/** (read-only sources, never modified).
// Output: public/img/** with responsive AVIF + WebP widths and a capped WebP used by CSS backgrounds,
// plus src/data/images.json with intrinsic sizes (width/height attributes, no CLS).
// Existing variants are reused only when their source hash matches the restored CI cache.
// For local builds, preserve the modification-time freshness check.
import sharp from 'sharp';
import { readdir, mkdir, stat, writeFile, copyFile, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { join, dirname, relative, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'assets/web');
const OUT = join(ROOT, 'public/img');
const WIDTHS = [480, 960, 1600];
const BG_MAX = 2400; // CSS backgrounds and decorative images
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

// Per-file freshness by content hash: after a partial cache restore (or a git checkout that touches
// every timestamp) only the sources whose bytes changed are converted again.
const HASHES = join(OUT, '.hashes.json');
const prev = existsSync(HASHES) ? JSON.parse(await readFile(HASHES, 'utf8')) : {};
const next = {};
let cur = '';
const fresh = async (src, dst) => existsSync(dst) && prev[cur] === next[cur];

const files = await walk(SRC);
const manifest = {};
let made = 0;
for (const file of files) {
  const rel = relative(SRC, file).replace(/\\/g, '/');
  cur = rel; next[rel] = createHash('sha1').update(await readFile(file)).digest('hex');
  const base = rel.slice(0, -extname(rel).length);
  const meta = await sharp(file).metadata();
  const w = meta.width, h = meta.height;
  await mkdir(dirname(join(OUT, base)), { recursive: true });
  const widths = WIDTHS.filter((x) => x < w);
  manifest[base] = { w, h, widths: [...widths, Math.min(w, 2400)] };
  // capped webp (same name as the source, used by CSS url() and by <img src>)
  const capped = join(OUT, base + '.webp');
  if (!(await fresh(file, capped))) {
    // jar labels: a third of the strip is on screen at once, so keep them sharp on Retina (TODO.md)
    const max = rel.startsWith('pattern/') ? 3200 : rel.includes('prodotti-3d/etichette/') ? 4800 : BG_MAX;
    if (w <= max && extname(file).toLowerCase() === '.webp') await copyFile(file, capped);
    else await sharp(file).resize({ width: Math.min(w, max), withoutEnlargement: true }).webp({ quality: 88, effort: 5 }).toFile(capped);
    made++;
  }
  for (const x of manifest[base].widths) {
    for (const fmt of ['avif', 'webp']) {
      const dst = join(OUT, `${base}-${x}.${fmt}`);
      if (await fresh(file, dst)) continue;
      const img = sharp(file).resize({ width: x, withoutEnlargement: true });
      if (fmt === 'avif') await img.avif({ quality: 62, effort: 3 }).toFile(dst);
      else await img.webp({ quality: 86, effort: 4 }).toFile(dst);
      made++;
    }
  }
}
await writeFile(HASHES, JSON.stringify(next));
await mkdir(join(ROOT, 'src/data'), { recursive: true });
await writeFile(join(ROOT, 'src/data/images.json'), JSON.stringify(manifest, null, 1));
// brand SVGs used by CSS (wave strips)
await mkdir(join(OUT, 'svg'), { recursive: true });
for (const f of await readdir(join(ROOT, 'assets/svg'))) await copyFile(join(ROOT, 'assets/svg', f), join(OUT, 'svg', f));
console.log(`assets: ${files.length} sources, ${made} files generated`);
