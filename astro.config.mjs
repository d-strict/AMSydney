// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  site: 'https://sydney.artemuseum.com',
  output: 'static',
  adapter: node({ mode: 'standalone' }),
});
