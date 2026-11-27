import test from 'node:test';
import assert from 'node:assert/strict';
import { cloudflareFindings } from '../scripts/cloudflare-opportunities.ts';
import { opportunities } from '../scripts/seo-opportunities.ts';
const period={startDate:'2026-11-20',endDate:'2026-11-26'};
const report=(dataset,rows)=>({metadata:{dataset,start:period.startDate,end:period.endDate,status:'complete',timeZone:'UTC'},rows});
test('small samples and absent search rows do not become low visibility claims',()=>{
 const r=cloudflareFindings({traffic:report('rumPageloadEventsAdaptiveGroups',[{requestHost:'baulingo.app',requestPath:'/',count:25,sampleInterval:1}])},period);
 assert.equal(r.length,0);
});
test('referrer evidence is observed, not attributed to a page without path dimensions',()=>{
 const r=cloudflareFindings({referrals:report('rumPageloadEventsAdaptiveGroups',[{refererHost:'chatgpt.com',count:5}])},period);
 assert.equal(r[0].category,'observed_ai_referral');assert.equal(r[0].page_id,null);assert.match(r[0].problem,/not exhaustive/);
});
test('performance requires metric-specific samples and periods must match',()=>{
 const row={requestHost:'baulingo.app',requestPath:'/',largestContentfulPaintP75:3000000,lcpTotal:20};
 assert.equal(cloudflareFindings({performance:report('rumWebVitalsEventsAdaptiveGroups',[row])},period)[0].category,'field_performance_review');
 assert.equal(cloudflareFindings({performance:report('rumWebVitalsEventsAdaptiveGroups',[{...row,lcpTotal:1}])},period).length,0);
 assert.throws(()=>cloudflareFindings({performance:report('rumWebVitalsEventsAdaptiveGroups',[])},{...period,endDate:'2026-11-25'}),/period/);
});
test('existing opportunity command accepts the Cloudflare bundle',()=>{
 const r=opportunities({metadata:{...period,property:'sc-domain:baulingo.app',dimensions:['query','page'],filters:[],dataState:'final',searchType:'web'},rows:[]},undefined,undefined,{cloudflare:{referrals:report('rumPageloadEventsAdaptiveGroups',[{refererHost:'chatgpt.com',count:5}])}});
 assert.equal(r.opportunities[0].category,'observed_ai_referral');
});
test('category growth uses adjacent equivalent periods and catalog categories',()=>{
 const row={requestHost:'baulingo.app',requestPath:'/konular/almanca-gramer/a1/akkusativ-einen-ve-den/',count:20,sampleInterval:1};
 const prior=report('rumPageloadEventsAdaptiveGroups',[{...row,count:10}]);prior.metadata.start='2026-11-13';prior.metadata.end='2026-11-19';
 const result=cloudflareFindings({traffic:report('rumPageloadEventsAdaptiveGroups',[row]),previousTraffic:prior},period);
 assert.equal(result[0].category,'aggregate_category_growth');
});
