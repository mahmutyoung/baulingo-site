import { copyFile, mkdir, rm, lstat, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { publicFiles } from './public-files.mjs';
import { generatePages } from './pages.mjs';

const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const output = path.resolve(root, 'dist');
if (output !== path.join(root, 'dist') || path.dirname(output) !== root) throw new Error('Invalid build output directory.');
export async function build() {
  // Check every source and parent before copying; never follow a symlink outside this repo.
  for (const file of [...publicFiles, '_headers', '_redirects']) {
    let entry = path.join(root, file);
    while (entry !== root) {
      if ((await lstat(entry)).isSymbolicLink()) throw new Error(`Refusing to publish symlink: ${file}`);
      entry = path.dirname(entry);
    }
  }
  await rm(output, { recursive: true, force: true });
  await mkdir(output, { recursive: true });
  for (const file of [...publicFiles, '_headers', '_redirects']) {
    await mkdir(path.dirname(path.join(output, file)), { recursive: true });
    await copyFile(path.join(root, file), path.join(output, file));
  }
  const homepage = await readFile(path.join(root, 'index.html'), 'utf8');
  for (const [file, html] of generatePages(homepage)) {
    await mkdir(path.dirname(path.join(output, file)), { recursive: true });
    await writeFile(path.join(output, file), html);
  }
  return output;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await build();
  console.log(`Built public files in ${output}`);
}
