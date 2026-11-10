// One-off generator for favicons, app icons and the Open Graph image (outputs committed in public/).
import sharp from 'sharp';
import { writeFile } from 'node:fs/promises';
const G = 'assets/web/brand/G-rasoio-crema-trasparente.webp';
const PET = { r: 15, g: 104, b: 112, alpha: 1 };
async function icon(size, pad = 0.16, round = true) {
  const inner = Math.round(size * (1 - pad * 2));
  const g = await sharp(G).resize(inner, inner, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  const mask = Buffer.from(`<svg width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${round ? size * 0.22 : 0}" fill="#fff"/></svg>`);
  const bg = await sharp({ create: { width: size, height: size, channels: 4, background: PET } }).composite([{ input: mask, blend: 'dest-in' }]).png().toBuffer();
  return sharp(bg).composite([{ input: g, gravity: 'center' }]).png();
}
await (await icon(32, 0.1)).toFile('public/favicon-32.png');
await (await icon(180, 0.14, false)).toFile('public/apple-touch-icon.png');
await (await icon(192)).toFile('public/icon-192.png');
await (await icon(512)).toFile('public/icon-512.png');
const b64 = (await (await icon(128, 0.1)).toBuffer()).toString('base64');
await writeFile('public/favicon.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><image width="128" height="128" href="data:image/png;base64,${b64}"/></svg>`);
// OG 1200x630: petrol, giant GLAMOOD, Fabio on the right
const fab = await sharp('assets/web/hero/fabio-foto.webp').resize({ height: 600 }).png().toBuffer();
const wmA = sharp('assets/web/brand/wordmark-petrolio-trasparente.webp').resize({ width: 620 });
const { width: ww, height: wh } = await wmA.clone().png().toBuffer({ resolveWithObject: true }).then((r) => r.info);
const alpha = await wmA.clone().extractChannel('alpha').raw().toBuffer();
const wm = await sharp({ create: { width: ww, height: wh, channels: 3, background: '#F4EFE8' } }).joinChannel(alpha, { raw: { width: ww, height: wh, channels: 1 } }).png().toBuffer();
const txt = Buffer.from(`<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg"><style>.k{font:700 26px sans-serif;fill:#F4EFE8;letter-spacing:4px}.h{font:900 64px sans-serif;fill:#F4EFE8}</style><rect x="70" y="268" width="40" height="3" fill="#B8935A"/><text class="k" x="124" y="279">BARBER SHOP A REGGIO CALABRIA</text><text class="h" x="70" y="380">TI PRENDO</text><text class="h" x="70" y="450">LE MISURE.</text><text class="k" x="70" y="540">VIA SBARRE CENTRALI 282/G</text></svg>`);
const stripe = await sharp('assets/svg/onde-bande-striscia.svg').resize(1200, 70, { fit: 'cover' }).png().toBuffer();
await sharp({ create: { width: 1200, height: 630, channels: 4, background: PET } })
  .composite([{ input: wm, left: 70, top: 120 }, { input: txt, left: 0, top: 0 }, { input: fab, left: 760, top: 30 }, { input: stripe, left: 0, top: 560 }])
  .jpeg({ quality: 84 }).toFile('public/og.jpg');
console.log('brand assets written');
