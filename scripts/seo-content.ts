import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { catalog, coursePages } from '../src/publishing/catalog.ts';
import { siteOrigin } from '../src/publishing/model.ts';
import { toCsv } from './seo-performance.ts';

type Json = Record<string, any>;
export function mapUrl(original_url: string) {
  let normalized_url: string | null = null;
  try { normalized_url = new URL(original_url).href; } catch { /* Preserve invalid input for review. */ }
  const u = normalized_url && new URL(normalized_url);
  const page = u && u.origin === siteOrigin && !u.username && !u.password && !u.search && !u.hash ? catalog.paths.get(u.pathname) : undefined;
  const content = page?.contentId ? catalog.content.get(page.contentId) : undefined;
  const canonical = page ? catalog.canonical(page) : undefined;
  return { original_url, normalized_url, canonical_url: canonical ? siteOrigin + canonical.path : null,
    page_id: page?.id ?? null, content_id: page?.contentId ?? null, content_format: content?.format ?? null,
    content_category: content?.category ?? null, collection_id: page?.collectionId ?? null,
    level: content?.level ?? coursePages.find(course => course.id === page?.id)?.level ?? null,
    content_language: page?.locale ?? null };
}
export function mapReport(report: Json) {
  const dimensions = report.metadata?.dimensions;
  if (!Array.isArray(dimensions) || dimensions.filter((d: string) => d === 'page').length !== 1 || !Array.isArray(report.rows)) throw new Error('Input must contain exactly one page dimension and a rows array.');
  const pageIndex = dimensions.indexOf('page');
  const rows = report.rows.map((row: Json) => {
    if (!Array.isArray(row.keys) || row.keys.length !== dimensions.length || typeof row.keys[pageIndex] !== 'string') throw new Error('Report row has missing dimension values.');
    return { ...Object.fromEntries(dimensions.map((key: string, index: number) => [key, row.keys[index]])), ...mapUrl(row.keys[pageIndex]), clicks: row.clicks, impressions: row.impressions, ctr: row.ctr, position: row.position };
  });
  return { metadata: { ...report.metadata, mappedAt: new Date().toISOString(), mapping: 'Exact catalog URL after standard URL parsing; query strings, fragments, alternate hosts and unmatched paths remain unmatched.', unmatchedRows: rows.filter((row: Json) => !row.page_id).length }, rows };
}
async function main() {
  const [input] = process.argv.slice(2);
  if (!input || process.argv.length !== 3) throw new Error('Usage: npm run seo:map -- <page-report.json>');
  const report = mapReport(JSON.parse(await readFile(input, 'utf8')));
  const dir = join('.dev/seo-mapped', new Date().toISOString().replace(/[:.]/g, '-')); await mkdir(dir, { recursive: true });
  const file = join(dir, basename(input, '.json'));
  const columns = [...report.metadata.dimensions, 'original_url', 'normalized_url', 'canonical_url', 'page_id', 'content_id', 'content_format', 'content_category', 'collection_id', 'level', 'content_language', 'clicks', 'impressions', 'ctr', 'position'];
  await writeFile(file + '.json', JSON.stringify(report, null, 2) + '\n');
  await writeFile(file + '.csv', toCsv(report.rows, columns));
  console.log(`${report.rows.length} rows; ${report.metadata.unmatchedRows} unmatched. Output: ${file}.json and .csv`);
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main().catch(error => { console.error(error instanceof Error ? error.message : 'Content mapping failed.'); process.exitCode = 1; });
