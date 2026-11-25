import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://baulingo.app',
  output: 'static',
  outDir: './.dev/astro-dist',
  vite: { publicDir: false },
  trailingSlash: 'always',
  build: { format: 'directory' },
});
