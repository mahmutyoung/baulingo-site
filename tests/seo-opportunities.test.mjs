import test from 'node:test';
import assert from 'node:assert/strict';
import { opportunities } from '../scripts/seo-opportunities.ts';
const meta = { property:'sc-domain:baulingo.app', dimensions:['query','page'], filters:[], dataState:'final', searchType:'web', startDate:'2026-11-01', endDate:'2026-11-23' };
test('small samples do not produce recommendations', () => {
  const report = opportunities({ metadata:meta, rows:[{ keys:['almanca','https://baulingo.app/'], impressions:10, clicks:0, ctr:0, position:8 }] });
  assert.equal(report.opportunities.length, 0);
  assert.match(report.status, /insufficient/i);
});
test('identifies a low CTR investigation only on a mapped page with sufficient exposure', () => {
  const report = opportunities({ metadata:meta, rows:[{ keys:['almanca','https://baulingo.app/'], impressions:120, clicks:1, ctr:1/120, position:8 }] });
  assert.equal(report.opportunities[0].category, 'title_and_metadata');
  assert.equal(report.opportunities[0].page_id, 'home-tr');
  assert.equal(report.opportunities[0].confidence, 'low');
});
test('rejects incompatible inputs and does not recommend changes for unmatched URLs', () => {
  assert.throws(() => opportunities({metadata:{...meta, dimensions:['page']}, rows:[]}), /query.*page/i);
  assert.equal(opportunities({metadata:meta, rows:[{keys:['x','https://other.example/'], impressions:500, clicks:0, ctr:0, position:5}]}).opportunities.length, 0);
});

test('flags multiple visible catalog pages without claiming harmful competition', () => {
  const result = opportunities({ metadata:meta, rows:[
    {keys:['test','https://baulingo.app/'], impressions:40, clicks:2, ctr:.05, position:8},
    {keys:['test','https://baulingo.app/en/'], impressions:35, clicks:1, ctr:1/35, position:10}
  ] });
  assert.equal(result.opportunities[0].category, 'content_overlap_investigations');
  assert.match(result.opportunities[0].problem, /not necessarily harmful/);
});
test('rejects comparison periods of different length', () => {
  assert.throws(() => opportunities({ metadata:meta, rows:[] }, { metadata:{...meta, startDate:'2026-10-01', endDate:'2026-10-31'}, rows:[] }), /equivalent/);
});

test('rejects impossible dates in query-page report metadata', () => {
  assert.throws(() => opportunities({metadata:{...meta, startDate:'2026-02-30'}, rows:[]}), /date/i);
});

test('flags inspected unindexed catalog pages as technical reviews without claiming a live test', () => {
  const indexing = { property:'sc-domain:baulingo.app', extractedAt:'2026-11-26T12:00:00Z', inspections:[{url:'https://baulingo.app/dtz-deneme-sinavi/', pageId:'dtz-mock:tr', inspectedAt:'2026-11-26T12:00:00Z', index:{verdict:'NEUTRAL',coverageState:'Crawled - currently not indexed'}, http:{status:200},findings:['index_verdict_requires_review']}] };
  const r=opportunities({metadata:meta,rows:[]}, undefined, undefined, {indexing});
  assert.equal(r.opportunities[0].category,'indexing_and_technical_fixes');
  assert.match(r.opportunities[0].problem,/indexed information/i);
});
test('compares equal page periods with adequate data, without averaging positions', () => {
  const pmeta={...meta,dimensions:['page']};
  const old={metadata:{...pmeta,startDate:'2026-10-09',endDate:'2026-10-31'},rows:[{keys:['https://baulingo.app/'],impressions:200,clicks:6,ctr:.03,position:8}]};
  const page={metadata:pmeta,rows:[{keys:['https://baulingo.app/'],impressions:80,clicks:2,ctr:.025,position:13}]};
  const r=opportunities({metadata:meta,rows:[]},undefined,undefined,{currentPage:page,previousPage:old});
  assert.equal(r.opportunities[0].category,'visibility_change');
  assert.equal(r.opportunities[0].historical_trend.position_change,5);
});
test('missing GA4 events and unreported impressions do not become zero', () => {
  const combined={metadata:{source:meta},rows:[{page_id:'home-tr',canonical_url:'https://baulingo.app/',google_organic_sessions:50,learning_started:null,impressions:null}]};
  const r=opportunities({metadata:meta,rows:[]},undefined,combined);
  assert.equal(r.opportunities.length,0);
});
test('rejects indexing data for an unrelated property', () => {
  assert.throws(()=>opportunities({metadata:meta,rows:[]},undefined,undefined,{indexing:{property:'sc-domain:other.example',inspections:[]}}),/property/i);
});

test('recognizes improving page position with adequate reported impressions in both periods', () => {
  const pm={...meta,dimensions:['page']};
  const now={metadata:pm,rows:[{keys:['https://baulingo.app/'],impressions:180,clicks:5,ctr:5/180,position:7}]};
  const before={metadata:{...pm,startDate:'2026-10-09',endDate:'2026-10-31'},rows:[{keys:['https://baulingo.app/'],impressions:150,clicks:2,ctr:2/150,position:12}]};
  const r=opportunities({metadata:meta,rows:[]},undefined,undefined,{currentPage:now,previousPage:before});
  assert.equal(r.opportunities[0].historical_trend.position_change,-5);
  assert.match(r.opportunities[0].problem,/improv/i);
});
test('refuses false zero engagement when reported value is unavailable', () => {
  const combined={metadata:{source:meta},rows:[{page_id:'home-tr',canonical_url:'https://baulingo.app/',google_organic_sessions:100,learning_started:null,impressions:200}]};
  assert.equal(opportunities({metadata:meta,rows:[]},undefined,combined).opportunities.length,0);
});

test('records internal-link review only with explicit search and learning evidence', () => {
  const combined={metadata:{source:meta},rows:[{page_id:'home-tr',canonical_url:'https://baulingo.app/',impressions:25,learning_started:22}]};
  const result=opportunities({metadata:meta,rows:[]},undefined,combined);
  assert.equal(result.opportunities[0].category,'internal_linking_improvements');
  assert.equal(result.opportunities[0].ga4_engagement.learning_started,22);
});

test('signals engagement review only when an explicit zero is provided', () => {
  const combined={metadata:{source:meta},rows:[{page_id:'home-tr',canonical_url:'https://baulingo.app/',impressions:200,google_organic_sessions:55,learning_started:0}]};
  const result=opportunities({metadata:meta,rows:[]},undefined,combined);
  assert.equal(result.opportunities[0].category,'content_improvements');
  assert.match(result.opportunities[0].problem,/not a conversion rate/i);
});
