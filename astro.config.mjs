// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  // Your site's address: used for canonical links, the sitemap and RSS.
  // SITE_URL and BASE_PATH let a build override it, as the GitHub Pages workflow does.
  site: process.env.SITE_URL ?? 'https://your-name.example',
  // The folder the site is served from: '/' at a domain's root, '/repo' for a GitHub project page.
  base: process.env.BASE_PATH ?? '/',
  trailingSlash: 'never',
  build: { format: 'file' },
  integrations: [sitemap()],
});
