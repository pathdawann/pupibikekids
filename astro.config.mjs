// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';

import sitemap from '@astrojs/sitemap';

export default defineConfig({
  // <--- Añade tu dominio oficial aquí
  site: 'https://www.pupibikekids.com',

  output: 'server',

  security: {
    checkOrigin: true
  },

  vite: {
    plugins: [tailwindcss()]
  },

  adapter: vercel(),
  integrations: [sitemap()]
});