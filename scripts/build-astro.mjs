import { cp, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { build as buildAstro } from 'astro';
import { transform } from 'lightningcss';
import { minify } from 'vite';
import { build as buildLegacy } from './build.mjs';
import { compactGeneratedHTML, rewriteAssetURLs } from './assets.mjs';
import { generatedFiles, isFingerprintedAsset, publicFiles } from './public-files.mjs';
import { catalog } from '../src/publishing/catalog.ts';
import { outputFile, sitemapXml } from '../src/publishing/model.ts';

const candidate = fileURLToPath(new URL('../.dev/astro-dist', import.meta.url));
const rendered = new Set([...catalog.paths.keys()].map(outputFile));
const legacy = await buildLegacy();
const legacySitemap = await readFile(path.join(legacy, 'sitemap.xml'), 'utf8');
const legacyLocations = new Set([...legacySitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, url]) => url));
const catalogLocations = catalog.sitemapLocations();
if (legacyLocations.size !== catalogLocations.length || catalogLocations.some(url => !legacyLocations.has(url))) {
  throw new Error('The catalog must preserve all indexed public URLs');
}
await buildAstro({});

// Reuse only the legacy builder's public artifact during the incremental cutover.
await cp(legacy, candidate, {
  recursive: true,
  filter: source => !rendered.has(path.relative(legacy, source).split(path.sep).join('/')),
});

const redirects = await readFile(path.join(legacy, '_redirects'), 'utf8');
const fingerprints = new Map();
for (const line of redirects.trim().split(/\r?\n/)) {
  const [source, target, status] = line.trim().split(/\s+/);
  if (status === '200' && isFingerprintedAsset(target.slice(1))) {
    fingerprints.set(source.slice(1), target.slice(1));
  }
}
for (const file of rendered) {
  const target = path.join(candidate, file);
  const html = await readFile(target, 'utf8');
  const rewritten = rewriteAssetURLs(compactGeneratedHTML(file, html), fingerprints);
  if (rewritten !== html) await writeFile(target, rewritten);
}

await writeFile(path.join(candidate, 'sitemap.xml'), sitemapXml(catalogLocations));

// Compile only allowlisted browser assets, retaining their URLs and module boundaries.
for (const file of [...publicFiles, ...generatedFiles].filter(name => /\.(?:js|css)$/.test(name))) {
  const source = publicFiles.includes(file) && !['src/dtz/content.js', 'src/analytics.js'].includes(file)
    ? new URL(`../${file}`, import.meta.url) : path.join(legacy, file);
  const text = await readFile(source, 'utf8');
  if (file.endsWith('.css')) {
    const { code } = transform({
      filename: file,
      code: Buffer.from(rewriteAssetURLs(text, fingerprints)),
      minify: true,
    });
    await writeFile(path.join(candidate, file), code);
  } else {
    const result = await minify(file, text, { compress: true, mangle: true });
    if (result.errors?.length) throw new Error(`Could not compile ${file}: ${JSON.stringify(result.errors)}`);
    await writeFile(path.join(candidate, file), result.code);
  }
}
console.log(`Built Astro candidate in ${candidate}`);
