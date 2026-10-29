import { cp, mkdir, rm, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { publicFiles, publicDirectories } from './public-files.mjs';

const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const output = path.resolve(root, 'dist');
if (output !== path.join(root, 'dist') || path.dirname(output) !== root) throw new Error('Invalid build output directory.');
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const file of [...publicFiles, ...publicDirectories]) {
  await cp(path.join(root, file), path.join(output, file), { recursive: true, dereference: false });
}
console.log(`Built public files in ${output}`);
console.log(`Public entries: ${(await readdir(output)).join(', ')}`);
