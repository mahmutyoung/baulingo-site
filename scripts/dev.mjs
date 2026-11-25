import { build } from './build.mjs';
import { createPreviewServer } from './server.mjs';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
const flag = (name, fallback) => args.includes(name) ? args[args.indexOf(name) + 1] : fallback;
const astro = args.includes('--astro');
const review = !astro && !args.includes('--production');
const port = Number(flag('--port', process.env.PORT || 4173));
const host = flag('--host', '127.0.0.1');
if (review) await build();
const root = astro ? fileURLToPath(new URL('../.dev/astro-dist', import.meta.url)) : undefined;
const server = await createPreviewServer({ review, root });
server.listen(port, host, () => {
  console.log(`Baulingo ${astro ? 'Astro candidate' : 'build'} preview: http://${host}:${port}`);
  if (review) console.log(`Review my work: http://${host}:${port}/dev/review/`);
});
