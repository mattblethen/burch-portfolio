// astro.config.mjs
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';        // ✅ new import
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import icon from 'unplugin-icons/vite';

export default defineConfig({
  site: 'https://your-vercel-url.vercel.app', // update to your real URL/domain later
  output: 'server',                            // ✅ required for API routes
  adapter: vercel(),                           // ✅ Vercel adapter (per-route runtime set in your API files)
  integrations: [tailwind(), react(), mdx(), sitemap()],
  vite: {
    plugins: [icon({ compiler: 'astro' })],
  },
});
