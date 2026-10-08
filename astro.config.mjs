// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';

export default defineConfig({
  output: 'server', // <--- Agregamos esta línea
  vite: {
    plugins: [tailwindcss()]
  },
  adapter: vercel()
});