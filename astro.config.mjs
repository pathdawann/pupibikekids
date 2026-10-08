// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';

export default defineConfig({
  output: 'server',
  security: {
    checkOrigin: true // Activa un escudo para que nadie envíe formularios a tu web desde sitios maliciosos
  },
  vite: {
    plugins: [tailwindcss()]
  },
  adapter: vercel()
});