import { copyFile, mkdir, rm, lstat, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { publicFiles, generatedFiles } from './public-files.mjs';
import { generatePages } from './pages.mjs';
import { fingerprintAssets, rewriteAssetURLs } from './assets.mjs';

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
    // Remove optional quotes only from safe, unambiguous attributes in the two
    // largest generated pages. Preserve ids, URLs, text, and quoted task selectors.
    const compact = file === 'dtz-kelime-kalip-cumle/index.html'
      ? html.replace(/(\s(?:class|lang|scope|type|data-[a-z-]+))="([A-Za-z0-9_-]+)"/g, '$1=$2')
      : file === 'dtz-deneme-sinavi/index.html'
        ? html.replace(/(\s(?:class|lang|scope|type))="([A-Za-z0-9_-]+)"/g, '$1=$2')
        : html;
    await writeFile(path.join(output, file), compact);
  }
  const mapping = await fingerprintAssets(output);
  for (const file of [...publicFiles, ...generatedFiles].filter(name => /\.(?:html|css)$/.test(name))) {
    const target = path.join(output, file);
    await writeFile(target, rewriteAssetURLs(await readFile(target, 'utf8'), mapping));
  }
  // Cloudflare's default revalidation remains on mutable URLs. Exact paths avoid
  // conflicting Cache-Control rules and never give missing hashes a year-long TTL.
  const headerPath = path.join(output, '_headers');
  const immutableRules = [...mapping.values()].map(file => `/${file}\n  Cache-Control: public, max-age=31536000, immutable`).join('\n\n');
  await writeFile(headerPath, `${await readFile(headerPath, 'utf8')}\n\n${immutableRules}\n`);
  return output;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await build();
  console.log(`Built public files in ${output}`);
}
