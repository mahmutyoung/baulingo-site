import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://baulingo.app',
  output: 'static',
  outDir: './.dev/astro-render',
  vite: { publicDir: false },
  trailingSlash: 'always',
  build: { format: 'directory' },
});
