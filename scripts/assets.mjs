import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { cacheableAssets, cachedAssetPath } from './public-files.mjs';

export async function fingerprintAssets(output) {
  const mapping = new Map();
  for (const source of cacheableAssets) {
    const bytes = await readFile(path.join(output, source));
    const hash = createHash('sha256').update(bytes).digest('hex').slice(0, 12);
    const target = cachedAssetPath(source, hash);
    await mkdir(path.dirname(path.join(output, target)), { recursive: true });
    await writeFile(path.join(output, target), bytes);
    mapping.set(source, target);
  }
  return mapping;
}

export function rewriteAssetURLs(text, mapping) {
  for (const [source, target] of mapping) text = text.replaceAll(source, target);
  return text;
}
