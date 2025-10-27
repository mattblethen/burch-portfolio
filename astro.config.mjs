import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import icon from 'unplugin-icons/vite';

export default defineConfig({
  site: 'https://your-vercel-url.vercel.app', // set later
  integrations: [tailwind(), react(), mdx(), sitemap()],
  vite: {
    plugins: [icon({ compiler: 'astro' })],
  },
});
