import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel/serverless'; // ← add this
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import icon from 'unplugin-icons/vite';

export default defineConfig({
  site: 'https://your-vercel-url.vercel.app', // set your real domain or Vercel URL (needed for sitemap)
  output: 'hybrid',                           // ← enables API/server routes + static pages
  adapter: vercel(),                          // ← deploy to Vercel Serverless (Node)
  integrations: [tailwind(), react(), mdx(), sitemap()],
  vite: {
    plugins: [icon({ compiler: 'astro' })],
  },
});
