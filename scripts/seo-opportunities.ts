import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { catalog } from '../src/publishing/catalog.ts';
import { mapUrl } from './seo-content.ts';
import { dateRange } from './seo-performance.ts';
import { cloudflareFindings } from './cloudflare-opportunities.ts';

type Json = Record<string, any>;
const key = (query: string, page: string) => JSON.stringify([query, page]);
function validReport(report: Json) {
  const m = report.metadata;
  if (m?.property !== 'sc-domain:baulingo.app' || JSON.stringify(m?.dimensions) !== '["query","page"]' || JSON.stringify(m?.filters) !== '[]' || m?.dataState !== 'final' || m?.searchType !== 'web' || !Array.isArray(report.rows)) throw new Error('Expected an unfiltered finalized web query and page report for sc-domain:baulingo.app.');
  dateRange('custom', m.endDate ?? '', m.startDate ?? '');
}
export function opportunities(current: Json, previous?: Json, combined?: Json, inputs: Json = {}) {
  validReport(current);
  if (previous) {
    validReport(previous);
    const a = current.metadata, b = previous.metadata;
    const duration = (m: Json) => Date.parse(m.endDate + 'T00:00:00Z') - Date.parse(m.startDate + 'T00:00:00Z');
    if (duration(a) !== duration(b) || Date.parse(b.endDate + 'T00:00:00Z') + 86400000 !== Date.parse(a.startDate + 'T00:00:00Z')) throw new Error('Previous period must be the adjacent equivalent period.');
  }
  if (combined) {
    const a = current.metadata, b = combined.metadata?.source;
    if (!b || b.property !== a.property || b.startDate !== a.startDate || b.endDate !== a.endDate || b.searchType !== a.searchType || !Array.isArray(combined.rows)) throw new Error('Combined GA4 report must use the same property and period.');
  }
  const prior = new Map((previous?.rows ?? []).map((r: Json) => [key(r.keys?.[0], r.keys?.[1]), r]));
  const engagement = new Map((combined?.rows ?? []).filter((r: Json) => r.page_id).map((r: Json) => [r.page_id, r]));
  const candidates: Json[] = [], unmatched: Json[] = [], groups = new Map<string, Json[]>();
  for (const row of current.rows) {
    if (!Array.isArray(row.keys) || row.keys.length !== 2 || !row.keys.every((v: unknown) => typeof v === 'string') || !Number.isFinite(row.impressions) || !Number.isFinite(row.clicks) || !Number.isFinite(row.ctr) || !Number.isFinite(row.position)) throw new Error('Invalid query-page row or metrics.');
    const [query, page] = row.keys, mapping = mapUrl(page);
    if (!mapping.page_id || mapping.canonical_url !== mapping.normalized_url) { unmatched.push({ query, page, impressions: row.impressions, clicks: row.clicks }); continue; }
    const item = { query, page, ...mapping, impressions: row.impressions, clicks: row.clicks, ctr: row.ctr, position: row.position };
    const group = groups.get(query) ?? []; group.push(item); groups.set(query, group);
    if (row.impressions >= 100 && row.position <= 20 && row.ctr < 0.02) {
      const old = prior.get(key(query, page)) as Json | undefined;
      const ga = engagement.get(mapping.page_id) as Json | undefined;
      const catalogPage = catalog.pages.get(mapping.page_id);
      candidates.push({ category:'title_and_metadata', query, ranking_page:page, page_id:mapping.page_id, content_id:mapping.content_id, existing_content:catalogPage?.title ?? null, impressions:row.impressions, clicks:row.clicks, ctr:row.ctr, position:row.position,
        historical_trend: old ? { previous_impressions:old.impressions, previous_clicks:old.clicks, previous_position:old.position, position_change:row.position-old.position } : null,
        ga4_engagement: ga ? { google_organic_sessions:ga.google_organic_sessions, content_viewers:ga.content_viewers, learning_started:ga.learning_started, learning_completed:ga.learning_completed, active_study_seconds:ga.active_study_seconds } : null,
        problem:'Low observed CTR for this disclosed query-page row; relevance and search-result presentation require review.', proposed_improvement:'Review the existing title and description against the query and the educational page; test a precise change if the mismatch is real.', evidence:`${row.impressions} impressions, ${row.clicks} clicks, position ${row.position.toFixed(1)}; CTR ${(100*row.ctr).toFixed(1)}%.`, confidence:'low', effort:'low', priority:'review' });
    }
  }
  for (const [query, entries] of groups) {
    const visible = entries.filter(item => item.impressions >= 30);
    if (visible.length < 2) continue;
    candidates.push({ category:'content_overlap_investigations', query, ranking_pages:visible.map(item => ({page:item.page, page_id:item.page_id, impressions:item.impressions, clicks:item.clicks, ctr:item.ctr, position:item.position})), historical_trend:null, ga4_engagement:null, problem:'More than one page appears for this query; overlap is not necessarily harmful.', proposed_improvement:'Review search intent, page roles and internal links before changing either page.', evidence:`${visible.length} catalog pages each have at least 30 reported impressions for this query.`, confidence:'low', effort:'medium', priority:'review' });
  }
  const indexing = inputs.indexing;
  if (indexing) {
    if (indexing.property !== current.metadata.property || !Array.isArray(indexing.inspections)) throw new Error('Indexing report property or inspections do not match.');
    for (const inspection of indexing.inspections) {
      const mapping = mapUrl(inspection.url), time = Date.parse(inspection.inspectedAt);
      const age = Date.now() - time;
      if (!mapping.page_id || mapping.page_id !== inspection.pageId || mapping.canonical_url !== mapping.normalized_url || !Number.isFinite(age) || age < 0 || age > 30 * 86400000) continue;
      const coverage = String(inspection.index?.coverageState ?? '');
      const findings = Array.isArray(inspection.findings) ? inspection.findings : [];
      const excluded = /not indexed|unknown to google/i.test(coverage);
      const technical = findings.some((f: string) => ['google_canonical_differs','user_canonical_differs','live_canonical_differs','unexpected_http_status'].includes(f));
      if (!excluded && !technical) continue;
      candidates.push({ category:'indexing_and_technical_fixes', query:null, ranking_page:inspection.url, page_id:mapping.page_id, content_id:mapping.content_id, existing_content:catalog.pages.get(mapping.page_id)?.title ?? null,
        impressions:null, clicks:null, ctr:null, position:null, historical_trend:null, ga4_engagement:null, inspected_at:inspection.inspectedAt,
        problem:'Google indexed information or the sampled HTTP check indicates an issue that needs review; URL Inspection is not a live indexing test.',
        proposed_improvement:'Recheck the current URL and Google inspection status, then investigate the stated exclusion, redirect or canonical before changing the site.',
        evidence:`Google coverage: ${coverage || 'unavailable'}; HTTP status: ${inspection.http?.status ?? 'unavailable'}; findings: ${findings.join(', ') || 'none'}.`, confidence:'medium', effort:'unknown', priority:'review' });
    }
  }
  const pageNow = inputs.currentPage, pageBefore = inputs.previousPage;
  if (!!pageNow !== !!pageBefore) throw new Error('Provide both current and previous page reports.');
  if (pageNow && pageBefore) {
    for (const r of [pageNow,pageBefore]) {
      const m=r.metadata;
      if (m?.property !== current.metadata.property || JSON.stringify(m.dimensions) !== '["page"]' || JSON.stringify(m.filters) !== '[]' || m.dataState !== 'final' || m.searchType !== current.metadata.searchType || !Array.isArray(r.rows)) throw new Error('Page trend inputs must be unfiltered finalized page reports for the same property and search type.');
      dateRange('custom',m.endDate ?? '',m.startDate ?? '');
    }
    const a=pageNow.metadata,b=pageBefore.metadata,c=current.metadata;
    if (a.startDate !== c.startDate || a.endDate !== c.endDate || Date.parse(a.endDate)-Date.parse(a.startDate) !== Date.parse(b.endDate)-Date.parse(b.startDate) || Date.parse(b.endDate)+86400000 !== Date.parse(a.startDate)) throw new Error('Page trend periods must match the current report and its adjacent equivalent period.');
    const earlier=new Map(pageBefore.rows.map((row: Json)=>[row.keys?.[0],row]));
    for (const row of pageNow.rows) {
      const url=row.keys?.[0], old=earlier.get(url) as Json | undefined, mapping=typeof url === 'string' ? mapUrl(url) : null;
      if (!mapping?.page_id || mapping.canonical_url !== mapping.normalized_url || !old || !Number.isFinite(row.impressions) || !Number.isFinite(old.impressions) || !Number.isFinite(row.position) || !Number.isFinite(old.position) || row.impressions < 50 || old.impressions < 100) continue;
      const declined = row.impressions <= old.impressions * 0.6;
      const improved = row.impressions >= 100 && row.position <= old.position - 3;
      if (!declined && !improved) continue;
      candidates.push({ category:'visibility_change', query:null, ranking_page:url, page_id:mapping.page_id, content_id:mapping.content_id, existing_content:catalog.pages.get(mapping.page_id)?.title ?? null, impressions:row.impressions, clicks:row.clicks, ctr:row.ctr, position:row.position,
        historical_trend:{previous_impressions:old.impressions,previous_clicks:old.clicks,previous_position:old.position,position_change:row.position-old.position}, ga4_engagement:engagement.get(mapping.page_id) ?? null,
        problem: declined ? 'Reported page impressions fell substantially between equivalent periods; the cause is not established.' : 'Reported average page position improved between equivalent periods; query mix and result types can affect this measure.', proposed_improvement: declined ? 'Review search appearance, index status, affected queries and seasonality before making changes.' : 'Review relevant queries and the page for opportunities to sustain visibility; do not assume a specific change caused the improvement.', evidence:`Impressions changed from ${old.impressions} to ${row.impressions}; average position changed from ${old.position} to ${row.position}.`, confidence:'low', effort:'medium', priority:'review' });
    }
  }
  if (combined) {
    for (const row of combined.rows) {
      if (!row.page_id || !row.canonical_url || mapUrl(row.canonical_url).page_id !== row.page_id) continue;
      if (Number.isFinite(row.google_organic_sessions) && row.google_organic_sessions >= 50 && row.learning_started === 0) {
        candidates.push({ category:'content_improvements', query:null, ranking_page:row.canonical_url, page_id:row.page_id, content_id:row.content_id ?? null, existing_content:catalog.pages.get(row.page_id)?.title ?? null, impressions:row.impressions ?? null, clicks:row.clicks ?? null, ctr:row.ctr ?? null, position:row.position ?? null, historical_trend:null, ga4_engagement:{google_organic_sessions:row.google_organic_sessions,learning_started:0}, problem:'Organic landing sessions and learning-start events use different scopes; this is not a conversion rate or proof of poor engagement.', proposed_improvement:'First verify event coverage and whether this page offers an instrumented learning activity, then review its next step if appropriate.', evidence:`${row.google_organic_sessions} Google organic landing sessions and an explicitly reported zero learning-start events on this page.`, confidence:'low', effort:'medium', priority:'review' });
      }
      if (Number.isFinite(row.impressions) && row.impressions < 50 && Number.isFinite(row.learning_started) && row.learning_started >= 20) {
        candidates.push({ category:'internal_linking_improvements', query:null, ranking_page:row.canonical_url, page_id:row.page_id, content_id:row.content_id ?? null, existing_content:catalog.pages.get(row.page_id)?.title ?? null, impressions:row.impressions, clicks:row.clicks ?? null, ctr:row.ctr ?? null, position:row.position ?? null, historical_trend:null, ga4_engagement:{learning_started:row.learning_started}, problem:'The page has recorded learning starts but limited reported Google visibility; this does not establish demand or a linking defect.', proposed_improvement:'Review whether relevant existing pages link to this material in context; check search intent before changing links.', evidence:`${row.learning_started} learning-start events and ${row.impressions} reported search impressions over the same named dates.`, confidence:'low', effort:'low', priority:'review' });
      }
    }
  }
  if(inputs.cloudflare)candidates.push(...cloudflareFindings(inputs.cloudflare,current.metadata));
  candidates.sort((a,b) => (b.impressions ?? 0) - (a.impressions ?? 0));
  return { metadata:{ extractedAt:new Date().toISOString(), search:current.metadata, previous:previous?.metadata ?? null, ga4Available:!!combined, indexingExtractedAt:indexing?.extractedAt ?? null, pageComparison:pageNow ? {current:pageNow.metadata,previous:pageBefore.metadata} : null, thresholds:{ lowCtrImpressions:100, lowCtr:0.02, maxPosition:20, overlapPageImpressions:30, indexingMaxAgeDays:30, previousPageImpressions:100, currentPageImpressions:50, declineRatio:0.6, improvedPositionDelta:3, organicSessionsForReview:50, learningStartsForLinkReview:20 }, futureKeywordPlanner:null, limitations:['Search Console impressions are visibility, not total keyword search volume.', 'Query rows can be anonymized or omitted; page/query aggregation differs from property totals.', 'Thresholds flag review candidates, not causal findings or ranking guarantees.', 'Engagement is page-level and cannot be attributed to an individual query.', 'No inference is made for missing GA4 data or absent prior rows.'] }, status:candidates.length ? 'Review candidates found; validate intent and search results before action.' : 'Insufficient evidence for automated opportunities under the current thresholds.', opportunities:candidates, unmatched };
}
async function main() {
  const args = process.argv.slice(2), positional: string[] = [], options: Record<string,string> = {};
  for (let i=0;i<args.length;i++) { if (args[i].startsWith('--')) { const name=args[i].slice(2); if (!['indexing','page-current','page-previous','cloudflare'].includes(name) || !args[i+1] || args[i+1].startsWith('--')) throw new Error('Invalid option: '+args[i]); options[name]=args[++i]; } else positional.push(args[i]); }
  if (!positional[0] || positional.length > 3) throw new Error('Usage: npm run seo:opportunities -- <query-page.json> [previous-query-page.json|-] [combined.json] [--indexing file] [--page-current file --page-previous file]');
  const current = JSON.parse(await readFile(positional[0], 'utf8'));
  const previous = positional[1] && positional[1] !== '-' ? JSON.parse(await readFile(positional[1], 'utf8')) : undefined;
  const combined = positional[2] ? JSON.parse(await readFile(positional[2], 'utf8')) : undefined;
  const inputs = Object.fromEntries(await Promise.all(Object.entries(options).map(async ([name,file]) => [name === 'page-current' ? 'currentPage' : name === 'page-previous' ? 'previousPage' : name, JSON.parse(await readFile(file,'utf8'))])));
  const result = opportunities(current, previous, combined, inputs);
  Object.assign(result.metadata,{cloudflareEvidence:inputs.cloudflare?Object.fromEntries(Object.entries(inputs.cloudflare).map(([name,report])=>[name,(report as Json).metadata])):null});
  const dir = join('.dev/seo-opportunities', new Date().toISOString().replace(/[:.]/g, '-')); await mkdir(dir, { recursive:true });
  await writeFile(join(dir, 'opportunities.json'), JSON.stringify(result, null, 2) + '\n');
  const lines = ['# SEO opportunity review', '', result.status, '', `Period: ${result.metadata.search.startDate} to ${result.metadata.search.endDate}.`, `GA4 evidence: ${combined ? 'available at page level' : 'unavailable'}.`, '', ...result.opportunities.flatMap((item: Json) => [`## ${item.category}: ${item.query ?? item.page_id ?? 'Page review'}`, '', item.evidence, '', `Page: ${item.ranking_page ?? item.ranking_pages.map((page: Json) => page.page).join(', ')}`, '', `Existing content: ${item.existing_content ?? 'See individual pages in JSON.'}`, '', `Historical comparison: ${item.historical_trend ? JSON.stringify(item.historical_trend) : 'unavailable'}.`, '', `Page-level GA4: ${item.ga4_engagement ? JSON.stringify(item.ga4_engagement) : 'unavailable'}.`, '', item.problem, '', item.proposed_improvement, '', `Confidence: ${item.confidence}; effort: ${item.effort}.`, '']), 'Review the JSON for source details, unmatched URLs and limitations.', ''];
  await writeFile(join(dir, 'report.md'), lines.join('\n'));
  console.log(`${result.status} ${result.opportunities.length} candidates; ${result.unmatched.length} unmatched rows. Output: ${dir}`);
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main().catch(error => { console.error(error instanceof Error ? error.message : 'Opportunity analysis failed.'); process.exitCode = 1; });
