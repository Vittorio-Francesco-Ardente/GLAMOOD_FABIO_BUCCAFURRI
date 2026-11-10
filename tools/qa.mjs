// QA: serves dist/, opens each page with Playwright at several sizes, collects console errors,
// horizontal overflow and broken images, and saves screenshots into qa/.
// Usage: npm run build && node tools/qa.mjs [--full] [--only=375,1440]
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
const req = createRequire(import.meta.url);
let pw; try { pw = req('playwright'); } catch { pw = req(execSync('npm root -g').toString().trim() + '/playwright'); }
const { chromium } = pw;
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { join, extname } from 'node:path';
const DIST = 'dist', PORT = 4329;
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.avif': 'image/avif', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.json': 'application/json', '.xml': 'application/xml', '.txt': 'text/plain', '.webmanifest': 'application/manifest+json' };
const server = createServer(async (req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (p.startsWith('/api/')) { res.writeHead(404); return res.end('[]'); }
  if (p.endsWith('/')) p += 'index.html'; else if (!extname(p)) p += '.html';
  try { const b = await readFile(join(DIST, p)); res.writeHead(200, { 'content-type': types[extname(p)] || 'application/octet-stream' }); res.end(b); }
  catch { const b = await readFile(join(DIST, '404.html')); res.writeHead(404, { 'content-type': 'text/html' }); res.end(b); }
}).listen(PORT);
const args = process.argv.slice(2);
const full = args.includes('--full');
const only = (args.find((a) => a.startsWith('--only=')) || '').slice(7).split(',').filter(Boolean).map(Number);
let sizes = [[375, 812], [768, 1024], [1440, 900], [1920, 1080]];
if (only.length) sizes = sizes.filter(([w]) => only.includes(w));
const pages = ['/', '/salone', '/tagli', '/listino', '/prodotti', '/dove', '/storia', '/privacy', '/nope'];
await mkdir('qa', { recursive: true });
const browser = await chromium.launch();
const report = [];
for (const [w, h] of sizes) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, hasTouch: w < 800, isMobile: w < 800 });
  await ctx.addInitScript(() => { try { sessionStorage.setItem('glamood-intro', '1'); } catch (e) {} });
  for (const path of pages) {
    const page = await ctx.newPage(); const errs = [];
    page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
    page.on('pageerror', (e) => errs.push('PAGEERROR ' + e.message));
    page.on('requestfailed', (r) => errs.push('FAILED ' + r.url()));
    page.on('response', (r) => { if (r.status() >= 400 && !r.url().includes('/api/') && !r.url().endsWith('/nope')) errs.push(r.status() + ' ' + r.url()); });
    await page.goto(`http://localhost:${PORT}${path}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    const name = (path === '/' ? 'home' : path.slice(1)) + `-${w}`;
    await page.screenshot({ path: `qa/${name}-top.png` });
    if (path !== '/nope' && path !== '/privacy') {
      // walk down the page to trigger every section, screenshot each viewport step
      const H = await page.evaluate(() => document.documentElement.scrollHeight);
      let i = 0;
      for (let y = h; y < H; y += Math.round(h * (full ? 0.9 : 1.6))) {
        await page.evaluate((yy) => { window.lenis ? window.lenis.scrollTo(yy, { immediate: true }) : scrollTo(0, yy); }, y);
        await page.waitForTimeout(full ? 900 : 500);
        if (full) await page.screenshot({ path: `qa/${name}-s${String(++i).padStart(2, '0')}.png` });
      }
    }
    const over = await page.evaluate(() => { const W = document.documentElement.clientWidth; const out = []; document.querySelectorAll('body *').forEach((el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); if (r.width && r.right > W + 2 && cs.position !== 'fixed') { let p = el.parentElement, clipped = false; while (p && p !== document.body) { const pc = getComputedStyle(p); if (pc.overflowX !== 'visible' || pc.overflow === 'hidden' || pc.overflow === 'clip') { clipped = true; break; } p = p.parentElement; } if (!clipped) out.push((el.id ? '#' + el.id : el.className?.toString().slice(0, 40)) + ' ' + Math.round(r.right)); } }); return { sw: document.documentElement.scrollWidth, W, out: out.slice(0, 8) }; });
    const broken = await page.evaluate(() => [...document.images].filter((i) => i.complete && i.naturalWidth === 0 && i.src).map((i) => i.src).slice(0, 5));
    report.push({ path, size: `${w}x${h}`, errors: errs.slice(0, 8), overflow: over.sw > over.W ? over : null, broken });
    await page.close();
  }
  await ctx.close();
}
await browser.close(); server.close();
for (const r of report) console.log(r.size, r.path, r.errors.length ? 'ERR ' + JSON.stringify(r.errors) : 'ok', r.overflow ? 'OVERFLOW ' + JSON.stringify(r.overflow) : '', r.broken.length ? 'BROKEN ' + r.broken : '');
