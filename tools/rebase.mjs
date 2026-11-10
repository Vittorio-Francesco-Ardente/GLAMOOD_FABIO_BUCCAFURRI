// Post-build for hosting under a sub-path (GitHub Pages project site): prefixes the absolute URLs
// written in the source (/img, /fonts, /storia, ...) with BASE. Astro already prefixes /_astro itself.
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, extname } from 'node:path';
const BASE = (process.env.BASE || '').replace(/\/$/, '');
if (!BASE) process.exit(0);
const roots = '(?:salone|tagli|listino|prodotti|dove)(?=["\'`/#?.]|$)|img|fonts|favicon|apple-touch-icon|icon-|site\\.webmanifest|og\\.jpg|storia|privacy|api/|sitemap';
const re = new RegExp(`([("'\`\\s=,])/(?=(?:${roots}))`, 'g');
async function walk(d) { const o = []; for (const e of await readdir(d, { withFileTypes: true })) { const p = join(d, e.name); if (e.isDirectory()) { if (e.name !== 'img') o.push(...(await walk(p))); } else if (['.html', '.css', '.js', '.webmanifest', '.txt', '.xml'].includes(extname(p))) o.push(p); } return o; }
let n = 0;
for (const f of await walk('dist')) {
  let s = await readFile(f, 'utf8'); const before = s;
  s = s.replace(re, `$1${BASE}/`);
  s = s.replace(/href="\/"/g, `href="${BASE}/"`).replace(/"start_url": "\/"/, `"start_url": "${BASE}/"`);
  if (s !== before) { await writeFile(f, s); n++; }
}
console.log(`rebase: ${n} files prefixed with ${BASE}`);
