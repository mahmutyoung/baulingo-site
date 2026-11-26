import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

type Range = { startDate: string; endDate: string };
type Json = Record<string, any>;
const day = 86400000;
function parseDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error('Invalid date: use YYYY-MM-DD.');
  const result = new Date(value + 'T00:00:00Z');
  if (!Number.isFinite(result.valueOf()) || result.toISOString().slice(0, 10) !== value) throw new Error('Invalid date: ' + value);
  return result.valueOf();
}
const format = (value: number) => new Date(value).toISOString().slice(0, 10);
export function dateRange(preset: string, endDate: string, startDate?: string): Range {
  const end = parseDate(endDate);
  if (!['7', '28', '90', 'max', 'custom'].includes(preset)) throw new Error('Invalid range: choose 7, 28, 90, max or custom.');
  const endParts = new Date(end);
  const maxStart = Date.UTC(endParts.getUTCFullYear(), endParts.getUTCMonth() - 16, 1);
  const start = preset === 'custom' ? parseDate(startDate ?? '') : preset === 'max' ? maxStart : end - (Number(preset) - 1) * day;
  if (start > end) throw new Error('Start date must not follow end date.');
  return { startDate: format(start), endDate };
}
export function previousRange(range: Range): Range {
  const start = parseDate(range.startDate), end = parseDate(range.endDate);
  if (start > end) throw new Error('Start date must not follow end date.');
  return { startDate: format(start - (end - start + day)), endDate: format(start - day) };
}
export async function fetchRows(request: (body: Json) => Promise<Json>, body: Json, limit = 25000) {
  const rows: Json[] = [];
  let aggregation: string | undefined;
  for (let startRow = 0; ; startRow += limit) {
    const response = await request({ ...body, rowLimit: limit, startRow });
    if (response.responseAggregationType && aggregation && response.responseAggregationType !== aggregation) throw new Error('Inconsistent aggregation across pages.');
    aggregation ??= response.responseAggregationType;
    if (response.rows !== undefined && !Array.isArray(response.rows)) throw new Error('Invalid Search Console rows.');
    const page = response.rows ?? [];
    for (const row of page) {
      if ((body.dimensions?.length ?? 0) !== (row.keys?.length ?? 0)) throw new Error('Search Console returned missing dimension values.');
      rows.push(row);
    }
    if (page.length < limit) return rows;
  }
}
export function toCsv(rows: Json[], columns: string[]) {
  const cell = (value: unknown) => { const s = String(value ?? ''); return /[",\r\n]/.test(s) ? '"' + s.replaceAll('"', '""') + '"' : s; };
  return [columns.map(cell).join(','), ...rows.map(row => columns.map(column => cell(row[column])).join(','))].join('\n') + '\n';
}
const reports: Record<string, string[]> = { total: [], date: ['date'], query: ['query'], page: ['page'], query_page: ['query', 'page'], country: ['country'], device: ['device'], query_date: ['query', 'date'], page_date: ['page', 'date'], appearance: ['searchAppearance'] };
export function createRequest(property: string, token: string, quota: string, fetcher: typeof fetch = fetch, sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms))) {
  return async (body: Json) => {
    for (let attempt = 0; attempt < 4; attempt++) {
      const response = await fetcher('https://www.googleapis.com/webmasters/v3/sites/' + encodeURIComponent(property) + '/searchAnalytics/query', { method: 'POST', headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json', ...(quota && { 'x-goog-user-project': quota }) }, body: JSON.stringify(body), redirect: 'error', signal: AbortSignal.timeout(30000) });
      if (response.ok) return await response.json() as Json;
      let quotaError = response.status === 429;
      if (response.status === 403) {
        const detail = await response.json().catch(() => ({})) as Json;
        quotaError = (detail.error?.errors ?? []).some((item: Json) => ['rateLimitExceeded', 'userRateLimitExceeded', 'quotaExceeded'].includes(item.reason)) || detail.error?.status === 'RESOURCE_EXHAUSTED';
      }
      if ((quotaError || response.status >= 500) && attempt < 3) { await sleep(1000 * 2 ** attempt); continue; }
      throw new Error(`Search Console HTTP ${response.status}. ${response.status === 401 ? 'Token expired or invalid.' : quotaError ? 'Quota exhausted; retry later.' : response.status === 403 ? 'Check property access, scope, API and quota project.' : 'Check the request and API availability.'}`);
    }
    throw new Error('Search Console request failed.');
  };
}
async function main() {
  const args = process.argv.slice(2); const opts: Record<string, string> = {};
  for (let i = 0; i < args.length; i++) { if (!args[i].startsWith('--') || !args[i + 1] || args[i + 1].startsWith('--')) throw new Error('Options require values.'); opts[args[i].slice(2)] = args[++i]; }
  const allowed = ['range', 'start', 'end', 'property', 'type', 'compare', 'output'];
  for (const key of Object.keys(opts)) if (!allowed.includes(key)) throw new Error('Unknown option: --' + key);
  if (opts.compare && !['true', 'false'].includes(opts.compare)) throw new Error('--compare must be true or false.');
  const token = process.env.BAULINGO_GA4_ACCESS_TOKEN?.trim();
  if (!token) throw new Error('Set BAULINGO_GA4_ACCESS_TOKEN using docs/analytics.md authentication steps.');
  const property = opts.property ?? 'sc-domain:baulingo.app';
  const end = opts.end ?? format(Date.now() - 3 * day);
  const range = dateRange(opts.range ?? '28', end, opts.start);
  const type = opts.type ?? 'web';
  if (!['web', 'image', 'video', 'news', 'discover', 'googleNews'].includes(type)) throw new Error('Unsupported search type.');
  const quota = process.env.BAULINGO_GA4_QUOTA_PROJECT?.trim();
  const request = createRequest(property, token, quota ?? '');
  const root = opts.output ?? '.dev/seo'; await mkdir(root, { recursive: true });
  const output = join(root, new Date().toISOString().replace(/[:.]/g, '-')); await mkdir(output);
  console.log('Output: ' + output);
  for (const [period, dates] of Object.entries({ current: range, ...(opts.compare === 'true' && { previous: previousRange(range) }) })) {
    for (const [name, dimensions] of Object.entries(reports)) {
      const body = { ...dates, type, dataState: 'final', dimensions };
      let responseAggregationType: string | null = null;
      const rows = await fetchRows(async pageBody => {
        const response = await request(pageBody);
        responseAggregationType = response.responseAggregationType ?? responseAggregationType;
        return response;
      }, body);
      const metadata = { extractedAt: new Date().toISOString(), property, ...dates, searchType: type, dimensions, responseAggregationType, filters: [], dataState: 'final', period, limitations: 'Finalized data only. Recent dates may be incomplete; anonymized queries, aggregation differences and API row limits mean detailed rows can differ from totals. Maximum history begins before the 16-month window; Google determines availability.' };
      const flat = rows.map(row => ({ ...Object.fromEntries(dimensions.map((key, index) => [key, row.keys[index]])), clicks: row.clicks, impressions: row.impressions, ctr: row.ctr, position: row.position }));
      const file = join(output, `${period}-${name}`);
      await writeFile(file + '.json', JSON.stringify({ metadata, rows }, null, 2) + '\n');
      await writeFile(file + '.csv', toCsv(flat, [...dimensions, 'clicks', 'impressions', 'ctr', 'position']));
      console.log(`${period} ${name}: ${rows.length} rows`);
    }
  }
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main().catch(error => { console.error(error.message); process.exitCode = 1; });
