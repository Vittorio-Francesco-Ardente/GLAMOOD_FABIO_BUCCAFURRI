import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
// TODO: replace with the final domain when Fabio confirms it (also in src/data/business.ts and public/robots.txt).
export default defineConfig({
  site: 'https://glamood.pages.dev',
  output: 'static',
  trailingSlash: 'ignore',
  build: { format: 'file', inlineStylesheets: 'auto' },
  integrations: [sitemap({ filter: (p) => !p.includes('/404') })],
  vite: { build: { assetsInlineLimit: 0 } },
});
