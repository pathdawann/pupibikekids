// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';

import sitemap from '@astrojs/sitemap';

export default defineConfig({
  // Dominio oficial
  site: 'https://www.pupibikekids.com',

  output: 'server',

  security: {
    checkOrigin: true
  },

  vite: {
    plugins: [tailwindcss()]
  },

  adapter: vercel(),
  integrations: [
    sitemap({
      filter: (page) =>
        !page.includes('/admin') &&
        !page.includes('/dashboard') &&
        !page.includes('/historial') &&
        !page.includes('/login')
    })
  ]
});