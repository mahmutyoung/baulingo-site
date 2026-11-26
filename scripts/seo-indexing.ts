import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { catalog } from '../src/publishing/catalog.ts';
import { siteOrigin } from '../src/publishing/model.ts';

type Json = Record<string, any>;
export function compareSitemap(expected: string[], actual: string[]) {
  const a = new Set(actual), e = new Set(expected);
  return { missing: expected.filter(url => !a.has(url)), unexpected: actual.filter(url => !e.has(url)) };
}
export function parseSitemap(xml: string) {
  if (/<(?:\w+:)?sitemapindex\b/i.test(xml)) throw new Error('Sitemap index is not supported; supply a URL-set sitemap.');
  if (!/<(?:\w+:)?urlset\b/i.test(xml) || /<!DOCTYPE/i.test(xml)) throw new Error('Invalid or unsupported sitemap XML.');
  return [...xml.matchAll(/<(?:\w+:)?loc\s*>\s*([^<]+?)\s*<\/(?:\w+:)?loc\s*>/gi)].map(match => match[1].replaceAll('&amp;', '&').replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&quot;', '"').replaceAll('&apos;', "'"));
}
export function summarizeInspection(response: Json) {
  const result = response.inspectionResult?.indexStatusResult ?? {};
  return Object.fromEntries(['verdict', 'coverageState', 'lastCrawlTime', 'googleCanonical', 'userCanonical', 'robotsTxtState', 'pageFetchState', 'indexingState', 'referringUrls', 'sitemap'].map(key => [key, result[key] ?? null]));
}
export function inspectionFindings(url: string, index: Json, http: Json) {
  const findings: string[] = [];
  if (index.googleCanonical && index.googleCanonical !== url) findings.push('google_canonical_differs');
  if (index.userCanonical && index.userCanonical !== url) findings.push('user_canonical_differs');
  if (http.status && http.status !== 200) findings.push('unexpected_http_status');
  if (http.canonical && new URL(http.canonical, url).href !== url) findings.push('live_canonical_differs');
  if (index.verdict && index.verdict !== 'PASS') findings.push('index_verdict_requires_review');
  return findings;
}
export function selectUrls(inventory: string[], requested: string[], limit: number) {
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) throw new Error('Inspection limit must be between 1 and 100.');
  const allowed = new Set(inventory);
  const unique = [...new Set(requested)];
  if (unique.some(url => !allowed.has(url))) throw new Error('Inspection URL is not in the catalog sitemap inventory.');
  if (unique.length > limit) throw new Error('Selected URLs exceed the inspection limit.');
  return unique;
}
async function main() {
  const args = process.argv.slice(2), opts: Record<string, string> = {};
  for (let i = 0; i < args.length; i++) { if (!args[i].startsWith('--') || !args[i + 1] || args[i + 1].startsWith('--')) throw new Error('Options require values.'); opts[args[i].slice(2)] = args[++i]; }
  for (const key of Object.keys(opts)) if (!['property', 'urls', 'limit', 'cache-days', 'output', 'performance'].includes(key)) throw new Error('Unknown option: --' + key);
  const limit = Number(opts.limit ?? '5'), cacheDays = Number(opts['cache-days'] ?? '7');
  if (!Number.isFinite(cacheDays) || cacheDays < 0 || cacheDays > 90) throw new Error('Cache days must be between 0 and 90.');
  const property = opts.property ?? 'sc-domain:baulingo.app';
  const token = process.env.BAULINGO_GA4_ACCESS_TOKEN?.trim();
  if (!token) throw new Error('Set BAULINGO_GA4_ACCESS_TOKEN using docs/analytics.md.');
  const quota = process.env.BAULINGO_GA4_QUOTA_PROJECT?.trim();
  const inventory = catalog.sitemapLocations();
  const defaults = ['/', '/en/', '/konular/', '/dtz-deneme-sinavi/', '/almanca-kursu/'].map(path => siteOrigin + path).filter(url => inventory.includes(url));
  const selected = selectUrls(inventory, opts.urls ? opts.urls.split(',').map(url => url.trim()) : defaults.slice(0, limit), limit);
  const root = opts.output ?? '.dev/seo-indexing';
  const run = join(root, new Date().toISOString().replace(/[:.]/g, '-'));
  const cache = join(root, 'cache'); await mkdir(cache, { recursive: true }); await mkdir(run);
  async function api(url: string, body?: Json) {
    for (let attempt = 0; attempt < 4; attempt++) {
      const response = await fetch(url, { method: body ? 'POST' : 'GET', headers: { Authorization: 'Bearer ' + token, ...(quota && { 'x-goog-user-project': quota }), ...(body && { 'Content-Type': 'application/json' }) }, body: body && JSON.stringify(body), redirect: 'error', signal: AbortSignal.timeout(30000) });
      if (response.ok) return await response.json() as Json;
      let quotaError = response.status === 429;
      if (response.status === 403) { const detail = await response.json().catch(() => ({})) as Json; quotaError = (detail.error?.errors ?? []).some((item: Json) => ['rateLimitExceeded', 'userRateLimitExceeded', 'quotaExceeded'].includes(item.reason)) || detail.error?.status === 'RESOURCE_EXHAUSTED'; }
      if ((quotaError || response.status >= 500) && attempt < 3) { await new Promise(resolve => setTimeout(resolve, 1000 * 2 ** attempt)); continue; }
      throw new Error(`Search Console HTTP ${response.status}. ${quotaError ? 'Quota exhausted; retry later.' : response.status === 401 ? 'Token expired or invalid.' : response.status === 403 ? 'Check property access, scope, API and quota project.' : 'Check request and service availability.'}`);
    }
    throw new Error('Search Console request failed.');
  }
  const sitemaps = await api('https://www.googleapis.com/webmasters/v3/sites/' + encodeURIComponent(property) + '/sitemaps');
  const live = await fetch(siteOrigin + '/sitemap.xml', { redirect: 'error', signal: AbortSignal.timeout(30000) });
  if (!live.ok) throw new Error(`Production sitemap returned HTTP ${live.status}.`);
  const locations = parseSitemap(await live.text());
  const comparison = compareSitemap(inventory, locations);
  let visibility: Json | null = null;
  if (opts.performance) {
    const report = JSON.parse(await readFile(opts.performance, 'utf8'));
    if (report.metadata?.property !== property || JSON.stringify(report.metadata?.dimensions) !== '["page"]' || JSON.stringify(report.metadata?.filters) !== '[]' || !Array.isArray(report.rows)) throw new Error('Performance input must be a page report for the selected property.');
    const seen = new Set(report.rows.map((row: Json) => row.keys?.[0]));
    visibility = { startDate: report.metadata.startDate, endDate: report.metadata.endDate, unmatchedReportedUrls: [...seen].filter(url => !inventory.includes(String(url))), noReportedImpressions: inventory.filter(url => !seen.has(url)), limitation: 'No reported row is not proof of zero impressions: API row limits and aggregation can omit data.' };
  }
  const inspections = [];
  for (const url of selected) {
    const file = join(cache, createHash('sha256').update(property + '\n' + url).digest('hex') + '.json');
    let entry: Json | undefined;
    try { const saved = JSON.parse(await readFile(file, 'utf8')); if (saved.property === property && saved.url === url && Date.now() - Date.parse(saved.inspectedAt) >= 0 && Date.now() - Date.parse(saved.inspectedAt) < cacheDays * 86400000) entry = saved; } catch { /* Missing or invalid cache is a miss. */ }
    let cached = true;
    if (!entry) { cached = false; const response = await api('https://searchconsole.googleapis.com/v1/urlInspection/index:inspect', { inspectionUrl: url, siteUrl: property }); entry = { property, url, inspectedAt: new Date().toISOString(), response }; await writeFile(file, JSON.stringify(entry, null, 2) + '\n'); }
    let http: Json;
    try { const res = await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(30000) }); const html = res.status === 200 ? await res.text() : ''; const canonical = html.match(/<link\b(?=[^>]*\brel=["']canonical["'])(?=[^>]*\bhref=["']([^"']+)["'])[^>]*>/i)?.[1] ?? null; http = { status: res.status, location: res.headers.get('location'), canonical }; } catch (error) { http = { error: error instanceof Error ? error.message : 'HTTP request failed' }; }
    const index = summarizeInspection(entry.response);
    inspections.push({ url, pageId: catalog.paths.get(new URL(url).pathname)?.id ?? null, cached, inspectedAt: entry.inspectedAt, index, http, findings: inspectionFindings(url, index, http) });
    console.log(`${cached ? 'Cached' : 'Inspected'} ${url}`);
  }
  const output = { extractedAt: new Date().toISOString(), property, sitemapUrl: siteOrigin + '/sitemap.xml', inventoryCount: inventory.length, productionSitemapCount: locations.length, sitemaps: sitemaps.sitemap ?? [], comparison, visibility, inspections, limitations: ['URL Inspection describes Google indexed information, not a live test.', 'Live HTTP checks cover selected URLs only and do not prove indexability or indexing.', 'Unmatched search report URLs are candidates for review, not proof that they were removed.', 'Publication dates are not present in the catalog; newly published status cannot be inferred.'] };
  await writeFile(join(run, 'indexing.json'), JSON.stringify(output, null, 2) + '\n');
  console.log(`Output: ${join(run, 'indexing.json')}; sitemap missing: ${comparison.missing.length}, unexpected: ${comparison.unexpected.length}`);
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main().catch(error => { console.error(error instanceof Error ? error.message : 'Indexing command failed.'); process.exitCode = 1; });
