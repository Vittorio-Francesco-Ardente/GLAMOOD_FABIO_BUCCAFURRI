// Post-build: removes from dist/img the responsive variants no page references (fewer files to upload).
// Keeps every base WebP (used by runtime-built paths such as the VHS sleeves and the storia book).
import { readdir, readFile, unlink } from 'node:fs/promises';
import { join, extname, relative } from 'node:path';
async function walk(d) { const o = []; for (const e of await readdir(d, { withFileTypes: true })) { const p = join(d, e.name); e.isDirectory() ? o.push(...(await walk(p))) : o.push(p); } return o; }
const files = await walk('dist');
let text = '';
for (const f of files) if (['.html', '.css', '.js'].includes(extname(f)) && !f.includes('/img/')) text += await readFile(f, 'utf8');
const used = new Set([...text.matchAll(/img\/([^"'`)\s,]+?\.(?:webp|avif|png|jpg))/g)].map((m) => m[1]));
let n = 0, kept = 0;
for (const f of files) {
  const rel = relative('dist/img', f).replace(/\\/g, '/');
  if (rel.startsWith('..') || rel.startsWith('svg/')) continue;
  const isVariant = /-\d+\.(webp|avif)$/.test(rel);
  // hero cartoon is chosen at runtime from the photo URL: keep its variants
  if (isVariant && !used.has(rel) && !rel.startsWith('hero/') && !rel.startsWith('v2/hero/fabio/')) { await unlink(f); n++; } else kept++;
}
console.log(`prune: removed ${n} unused variants, kept ${kept} images`);
