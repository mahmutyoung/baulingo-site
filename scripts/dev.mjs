import { build } from './build.mjs';
import { createPreviewServer } from './server.mjs';

const args = process.argv.slice(2);
const flag = (name, fallback) => args.includes(name) ? args[args.indexOf(name) + 1] : fallback;
const port = Number(flag('--port', process.env.PORT || 4173));
const host = flag('--host', '127.0.0.1');
if (!args.includes('--production')) await build();
const server = await createPreviewServer();
server.listen(port, host, () => console.log(`Baulingo build preview: http://${host}:${port}`));
