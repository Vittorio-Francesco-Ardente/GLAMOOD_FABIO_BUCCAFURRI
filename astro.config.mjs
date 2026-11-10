import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
// TODO: replace with the final domain when Fabio confirms it (also in src/data/business.ts and public/robots.txt).
const BASE = process.env.BASE || '/';
export default defineConfig({
  site: process.env.SITE || 'https://glamood.pages.dev',
  base: BASE,
  output: 'static',
  trailingSlash: 'ignore',
  build: { format: 'file', inlineStylesheets: 'auto' },
  integrations: [sitemap({ filter: (p) => !p.includes('/404') })],
  vite: { build: { assetsInlineLimit: 0 } },
});
