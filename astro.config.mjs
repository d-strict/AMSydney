// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  site: 'https://sydney.artemuseum.com',
  output: 'static',
  // Vercel adapter when deploying there (VERCEL=1 is set by the platform and
  // by our deploy step); node standalone otherwise (local prod / self-hosting).
  adapter: process.env.VERCEL ? vercel() : node({ mode: 'standalone' }),
});
