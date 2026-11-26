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

// Omit optional markup only in the generated formats that use it.
export function compactGeneratedHTML(file, html) {
  return file === 'dtz-kelime-kalip-cumle/index.html'
    ? html.replace(/(\s(?:class|lang|scope|type|data-[a-z-]+))="([A-Za-z0-9_-]+)"/g, '$1=$2')
      .replace(/(<(?:tr|li) id)="([A-Za-z0-9_-]+)"(?= data-i)/g, '$1=$2')
      .replace(/<\/(?:td|th)>(?=<(?:td|th)(?:[ >])|<\/tr>)/g, '')
      .replace(/<\/tr>(?=<tr[ >]|<\/t(?:head|body)>)/g, '')
      .replace(/<\/li>(?=<li[ >]|<\/[ou]l>)/g, '')
    : file === 'dtz-deneme-sinavi/index.html'
      ? html.replace(/(\s(?:class|lang|scope|type|name|value|data-review))="([A-Za-z0-9_-]+)"/g, '$1=$2')
        .replace(/<\/li>(?=<li[ >]|<\/[ou]l>)/g, '')
      : file.startsWith('dtz-mektup-yazma/')
        ? html.replace(/(\s(?:class|scope|type|data-(?!(?:task|task-kind)=)[a-z-]+))="([A-Za-z0-9_-]+)"/g, '$1=$2')
          .replace(/ lang="de"/g, ' lang=de')
          .replace(/(\s(?:aria-describedby|aria-labelledby|for|rows|maxlength))="([A-Za-z0-9_:-]+)"/g, '$1=$2')
          .replace(/<\/option>(?=<option[ >]|<\/select>)/g, '')
          .replace(/<\/li>(?=<li[ >]|<\/[ou]l>)/g, '')
        : html;
}
