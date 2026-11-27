import test from 'node:test';
import assert from 'node:assert/strict';
import { contentReport } from '../scripts/cloudflare-content.ts';
const metadata={dataset:'rumPageloadEventsAdaptiveGroups',status:'complete',timeZone:'UTC'};
test('catalog rollups preserve language, unknown fields and existing exact mapping',()=>{
 const r=contentReport({metadata,rows:[{requestHost:'baulingo.app',requestPath:'/',count:3,visits:1,sampleInterval:10},{requestHost:'baulingo.app',requestPath:'/en/',count:2,visits:0,sampleInterval:1},{requestHost:'baulingo.app',requestPath:'/gone/',count:1}]});
 assert.equal(r.rows[0].page_id,'home-tr');assert.equal(r.rows[1].page_id,'home-en');assert.equal(r.unmatched.length,1);
 assert.equal(r.rollups.content_language.length,2);assert.equal(r.rollups.content_language.find(x=>x.content_language==='tr').count,3);
 assert.equal(r.rollups.level[0].level,null);assert.equal(r.rollups.level[0].sampleIntervalMax,10);
 assert.throws(()=>contentReport({metadata:{...metadata,dataset:'rumWebVitalsEventsAdaptiveGroups'},rows:[]}),/dataset/);
});
test('HTTP redirects and non-content are separate and failed reports never become zeros',()=>{
 const r=contentReport({metadata:{...metadata,dataset:'httpRequestsAdaptiveGroups'},rows:[{clientRequestHTTPHost:'www.baulingo.app',clientRequestPath:'/en/',edgeResponseStatus:301,count:2},{clientRequestHTTPHost:'baulingo.app',clientRequestPath:'/src/app.js',edgeResponseStatus:200,count:5}]});
 assert.equal(r.redirects.length,1);assert.equal(r.unmatched.length,2);assert.equal(r.nonContent.length,2);
 assert.equal(r.rollups.page_id.length,0);
 assert.throws(()=>contentReport({metadata:{...metadata,status:'unavailable'},rows:[]}),/unavailable/);
});
test('rollups preserve unknown measures instead of adding them as zero',()=>{
 const r=contentReport({metadata,rows:[{requestHost:'baulingo.app',requestPath:'/',count:1,visits:1},{requestHost:'baulingo.app',requestPath:'/',count:2}]});
 assert.equal(r.rollups.page_id[0].count,3);assert.equal(r.rollups.page_id[0].visits,null);
});
