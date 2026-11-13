// Pages that also have sub-pages (/prodotti and /prodotti/<slug>) exist both as a file and as a folder.
// Static hosts (GitHub Pages too) resolve "/prodotti" to the folder, so the folder needs its own index.html.
import { readdir, copyFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
for (const e of await readdir('dist')) {
  if (!e.endsWith('.html')) continue;
  const dir = 'dist/' + e.slice(0, -5);
  if (existsSync(dir) && (await stat(dir)).isDirectory() && !existsSync(dir + '/index.html')) { await copyFile('dist/' + e, dir + '/index.html'); console.log('dirindex:', dir + '/index.html'); }
}
