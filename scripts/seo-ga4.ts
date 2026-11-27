import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { dateRange, toCsv } from './seo-performance.ts';
import { mapReport, mapUrl } from './seo-content.ts';
import { catalog } from '../src/publishing/catalog.ts';
import { joinCloudflare } from './cloudflare-coverage.ts';

type Json = Record<string, any>;
export function validatePeriod(start: string, end: string) {
  dateRange('custom', end, start);
  if (start < '2026-11-27') throw new Error('GA4 clean baseline starts 2026-11-27; use a later period.');
}
export function gaRows(response: Json, dimensions: string[], metrics: string[]) {
  return (response.rows ?? []).map((row: Json) => {
    if (row.dimensionValues?.length !== dimensions.length || row.metricValues?.length !== metrics.length) throw new Error('GA4 response has missing values.');
    const vals = row.metricValues.map((v: Json) => Number(v.value));
    if (vals.some((v: number) => !Number.isFinite(v))) throw new Error('GA4 response has invalid metric values.');
    return { ...Object.fromEntries(dimensions.map((d, i) => [d, row.dimensionValues[i].value])), ...Object.fromEntries(metrics.map((m, i) => [m, vals[i]])) };
  });
}
export function joinPages(search: Json[], sessions: Json[], events: Json[]) {
  const s = new Map(sessions.filter(row => row.page_id && row.page_id !== '(not set)').map(row => [row.page_id, row]));
  const e = new Map(events.filter(row => row.page_id && row.page_id !== '(not set)').map(row => [row.page_id, row]));
  const present = new Set(search.map(row => row.page_id).filter(Boolean));
  const extra = [...new Set([...s.keys(), ...e.keys()])].filter(id => !present.has(id)).flatMap(id => {
    const page = catalog.pages.get(id);
    if (!page || catalog.canonical(page).id !== page.id) return [];
    return [{ ...mapUrl('https://baulingo.app' + page.path), clicks: null, impressions: null, ctr: null, position: null }];
  });
  return [...search, ...extra].map(row => {
    const session = row.page_id && s.get(row.page_id), event = row.page_id && e.get(row.page_id);
    return { ...row, google_organic_sessions: session?.sessions ?? null, content_viewers: event?.content_viewers ?? null, learning_started: event?.learning_started ?? null, learning_completed: event?.learning_completed ?? null, active_study_seconds: event?.active_study_seconds ?? null, returning_learner_engagement: null, learning_conversion_rate: null };
  });
}
const filter = (fieldName: string, value: string) => ({ filter: { fieldName, stringFilter: { matchType: 'EXACT', value } } });
async function main() {
  const [input,flag,cloudflareInput] = process.argv.slice(2);
  if (!input || (flag && (flag!=='--cloudflare'||!cloudflareInput)) || process.argv.length>5) throw new Error('Usage: npm run seo:combined -- <unfiltered-page-report.json> [--cloudflare browser-pages.json]');
  const source = JSON.parse(await readFile(input, 'utf8'));
  const meta = source.metadata;
  if (meta?.property !== 'sc-domain:baulingo.app' || JSON.stringify(meta?.dimensions) !== '["page"]' || JSON.stringify(meta?.filters) !== '[]' || meta?.dataState !== 'final' || meta?.searchType !== 'web' || !Array.isArray(source.rows)) throw new Error('Input must be a finalized unfiltered web page report.');
  validatePeriod(meta.startDate, meta.endDate);
  const berlinToday = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Berlin', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  if (meta.endDate >= berlinToday) throw new Error('GA4 reporting period must end before today in the property time zone.');
  const token = process.env.BAULINGO_GA4_ACCESS_TOKEN?.trim(); if (!token) throw new Error('Set BAULINGO_GA4_ACCESS_TOKEN using docs/analytics.md.');
  const cloudflareSource=cloudflareInput?JSON.parse(await readFile(cloudflareInput,'utf8')):undefined;
  if(cloudflareSource)joinCloudflare([],cloudflareSource,meta);
  const quota = process.env.BAULINGO_GA4_QUOTA_PROJECT?.trim();
  async function report(dims: string[], metrics: string[], dimensionFilter?: Json) {
    const rows: Json[] = [], metadata: Json[] = []; let offset = 0;
    while (true) {
      const body = { dateRanges: [{ startDate: meta.startDate, endDate: meta.endDate }], dimensions: dims.map(name => ({ name })), metrics: metrics.map(name => ({ name })), ...(dimensionFilter && { dimensionFilter }), limit: '10000', offset: String(offset), orderBys: dims.map(dimensionName => ({ dimension: { dimensionName } })), returnPropertyQuota: true };
      let response: Response | undefined;
      for (let attempt = 0; attempt < 4; attempt++) {
        response = await fetch('https://analyticsdata.googleapis.com/v1beta/properties/565704627:runReport', { method: 'POST', headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json', ...(quota && { 'x-goog-user-project': quota }) }, body: JSON.stringify(body), redirect: 'error', signal: AbortSignal.timeout(30000) });
        if (response.ok) break;
        if ((response.status === 429 || response.status >= 500) && attempt < 3) { await new Promise(resolve => setTimeout(resolve, 1000 * 2 ** attempt)); continue; }
        throw new Error(`GA4 Data API HTTP ${response.status}; check credentials, permissions, report dimensions and quota.`);
      }
      if (!response?.ok) throw new Error('GA4 request failed.');
      const data = await response.json() as Json;
      const page = gaRows(data, dims, metrics); rows.push(...page); metadata.push({ metadata: data.metadata ?? {}, propertyQuota: data.propertyQuota ?? null });
      if (!page.length && offset < Number(data.rowCount ?? 0)) throw new Error('GA4 pagination ended before rowCount.');
      offset += page.length; if (offset >= Number(data.rowCount ?? 0)) break;
    }
    return { rows, metadata };
  }
  const acquisition = await report(['landingPage'], ['sessions'], { andGroup: { expressions: [filter('sessionSource', 'google'), filter('sessionMedium', 'organic')] } });
  const eventFilter = { orGroup: { expressions: ['content_viewed', 'learning_started', 'learning_completed', 'study_time'].map(name => filter('eventName', name)) } };
  const pageEvents = await report(['customEvent:page_id', 'eventName'], ['eventCount', 'totalUsers', 'customEvent:duration_seconds'], eventFilter);
  const contentEvents = await report(['customEvent:content_id', 'eventName'], ['eventCount', 'totalUsers', 'customEvent:duration_seconds'], eventFilter);
  const pageViews = await report(['customEvent:page_id'], ['eventCount'], filter('eventName','page_view'));
  const quality: Json[] = [], sessions: Json[] = [];
  for (const row of acquisition.rows) {
    const mapped = row.landingPage.startsWith('/') ? mapUrl('https://baulingo.app' + row.landingPage) : null;
    if (!mapped?.page_id || mapped.canonical_url !== mapped.normalized_url) { quality.push({ source: 'ga4_landing_page', ...row }); continue; }
    sessions.push({ page_id: mapped.page_id, sessions: row.sessions });
  }
  const eventMap = new Map<string, Json>();
  for (const row of pageEvents.rows) {
    const id = row['customEvent:page_id']; if (!id || id === '(not set)') { quality.push({ source: 'ga4_page_id', ...row }); continue; }
    const item = eventMap.get(id) ?? { page_id: id };
    if (row.eventName === 'content_viewed') item.content_viewers = row.totalUsers;
    if (row.eventName === 'learning_started') item.learning_started = row.eventCount;
    if (row.eventName === 'learning_completed') item.learning_completed = row.eventCount;
    if (row.eventName === 'study_time') item.active_study_seconds = row['customEvent:duration_seconds'];
    eventMap.set(id, item);
  }
  const mapped = mapReport(source);let rows:Json[] = joinPages(mapped.rows.filter((row: Json) => !row.page_id || row.normalized_url === row.canonical_url), sessions, [...eventMap.values()]);
  const cf=cloudflareSource?joinCloudflare(rows,cloudflareSource,meta):null;if(cf)rows=cf.rows;
  const excludedAliases = mapped.rows.filter((row: Json) => row.page_id && row.normalized_url !== row.canonical_url);
  const output = { metadata: { source: meta, ga4Property: '565704627', extractedAt: new Date().toISOString(), ga4TimeZone: 'Europe/Berlin', searchConsoleTimeZone: 'America/Los_Angeles', limitations: ['GA4 measures consenting users; Search Console measures Google Search visibility. Dates use different time zones, and sessions do not equal clicks.', 'No search query is attributed to any learning event.', 'Missing rows are unknown, not zero. Returning learner sequences and conversion funnels are unavailable in this report.', 'Distinct users cannot be summed across content or pages; completion event counts are not a conversion rate.'], reportMetadata: { acquisition: acquisition.metadata, pageEvents: pageEvents.metadata, contentEvents: contentEvents.metadata } }, rows, contentEvents: contentEvents.rows, quality, excludedAliases };
  const dir = join('.dev/seo-combined', new Date().toISOString().replace(/[:.]/g, '-')); await mkdir(dir, { recursive: true });
  Object.assign(output,{cloudflare:cf,ga4PageViews:{metadata:{property:'565704627',start:meta.startDate,end:meta.endDate,timeZone:'Europe/Berlin',metric:'page_view_eventCount',complete:true,duplicatePageViewsVerified:true,reportMetadata:pageViews.metadata,limitations:'Berlin property dates; incompatible with UTC coverage ratios. Clean periods and completed-day checks applied.'},rows:pageViews.rows.map((r:Json)=>({page_id:r['customEvent:page_id'],page_views:r.eventCount}))}});
  await writeFile(join(dir, 'combined.json'), JSON.stringify(output, null, 2) + '\n');
  const cols = ['original_url','canonical_url','page_id','content_id','content_format','content_category','collection_id','level','content_language','clicks','impressions','ctr','position','google_organic_sessions','content_viewers','learning_started','learning_completed','active_study_seconds','returning_learner_engagement','learning_conversion_rate'];
  await writeFile(join(dir, 'pages.csv'), toCsv(rows, [...cols,'cloudflare_page_views','cloudflare_visits']));
  await writeFile(join(dir,'ga4-pageviews.json'),JSON.stringify((output as Json).ga4PageViews,null,2)+'\n');
  console.log(`${rows.length} search page rows; ${quality.length} GA4 identity issues; ${excludedAliases.length} canonical aliases excluded. Output: ${dir}`);
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main().catch(error => { console.error(error instanceof Error ? error.message : 'Combined report failed.'); process.exitCode = 1; });
