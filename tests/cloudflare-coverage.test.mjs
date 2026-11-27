import test from 'node:test';
import assert from 'node:assert/strict';
import { coverage, joinCloudflare } from '../scripts/cloudflare-coverage.ts';
const cf={metadata:{dataset:'rumPageloadEventsAdaptiveGroups',status:'complete',start:'2026-11-27',end:'2026-11-27',timeZone:'UTC',filter:'requestHost:"baulingo.app"'},rows:[{requestHost:'baulingo.app',requestPath:'/',count:10,sampleInterval:1}]};
test('coverage requires clean finalized matching UTC page-view evidence',()=>{
 const ga={metadata:{property:'565704627',start:'2026-11-27',end:'2026-11-27',timeZone:'UTC',metric:'page_view_eventCount',complete:true,duplicatePageViewsVerified:true,thresholded:false,sampled:false,dataLoss:false},rows:[{page_id:'home-tr',page_views:4}]};
 assert.equal(coverage(cf,ga).rows[0].relative_measurement_coverage,0.4);
 assert.throws(()=>coverage(cf,{...ga,metadata:{...ga.metadata,timeZone:'Europe/Berlin'}}),/compatible/);
 assert.throws(()=>coverage(cf,{...ga,metadata:{...ga.metadata,duplicatePageViewsVerified:false}}),/duplicate/);
 assert.equal(coverage({...cf,rows:[{...cf.rows[0],count:0}]},ga).rows[0].relative_measurement_coverage,null);
});
test('combined evidence preserves CF-only pages and missing measurements',()=>{
 const r=joinCloudflare([{page_id:'home-en',impressions:2}],cf,{startDate:'2026-11-27',endDate:'2026-11-27'});
 assert.equal(r.rows.length,2);assert.equal(r.rows.find(r=>r.page_id==='home-tr').cloudflare_page_views,10);assert.equal(r.rows.find(r=>r.page_id==='home-en').cloudflare_page_views,null);
 assert.throws(()=>joinCloudflare([],cf,{startDate:'2026-11-26',endDate:'2026-11-27'}),/period/);
});
