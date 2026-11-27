import test from 'node:test';
import assert from 'node:assert/strict';
import { ranges, graphql, mapCloudflarePage, flatten, ensureComplete, classifyHttp, extractWindows, performanceValues, selectedFields, httpEvidence, workerValues, resourceIdentity, datasetAccess } from '../scripts/cloudflare-report.ts';

test('date windows use complete UTC days and equivalent previous periods', () => {
  assert.deepEqual(ranges('7', '2026-11-26'), { start:'2026-11-20', end:'2026-11-26', previousStart:'2026-11-13', previousEnd:'2026-11-19' });
  assert.throws(() => ranges('custom', '2026-11-20', '2026-11-21'));
  assert.throws(() => ranges('custom', '2026-02-30', '2026-02-01'));
});
test('GraphQL errors are rejected even with HTTP 200 and credentials are never copied into error', async () => {
  const fake=async()=>new Response(JSON.stringify({errors:[{message:'denied'}]}),{status:200});
  await assert.rejects(graphql('secret','{}',fake), /GraphQL/);
  await assert.rejects(graphql('secret','{}',async()=>new Response('',{status:401})), /HTTP 401/);
});
test('mapping respects exact production URLs and preserves localized pages', () => {
  assert.equal(mapCloudflarePage('baulingo.app','/en/').page_id,'home-en');
  assert.equal(mapCloudflarePage('www.baulingo.app','/en/').page_id,null);
  assert.equal(mapCloudflarePage('baulingo.app','/en/?x=y').page_id,null);
});
test('flatten preserves sampling and detects truncated pages', () => {
  assert.deepEqual(flatten({dimensions:{requestPath:'/'},avg:{sampleInterval:10},count:20}),{requestPath:'/',sampleInterval:10,count:20});
  assert.throws(()=>ensureComplete([{},{},{}],3),/truncated/i);
  assert.doesNotThrow(()=>ensureComplete([],3));
});
test('HTTP request categories do not infer human visits', () => {
  assert.equal(classifyHttp({clientRequestPath:'/cdn-cgi/rum',edgeResponseStatus:204}), 'beacon');
  assert.equal(classifyHttp({clientRequestPath:'/en/',edgeResponseStatus:200,edgeResponseContentTypeName:'text/html'}), 'html');
  assert.equal(classifyHttp({clientRequestPath:'/x',edgeResponseStatus:301}), 'redirect');
  assert.equal(classifyHttp({clientRequestPath:'/unknown',edgeResponseStatus:404}), 'missing');
  assert.equal(classifyHttp({clientRequestPath:'/unknown',edgeResponseStatus:200}), 'unknown');
});
test('query windows split at duration and row limits without averaging percentiles', async()=>{
 const calls=[];
 const rows=await extractWindows(0,4*86400000,2*86400,2,86400000,async(a,b)=>{calls.push([a,b]);return b-a>86400000?[{p75:5},{p75:9}]:[{p75:a+1}];});
 assert.equal(rows.length,4);assert.equal(calls.length,6);
 assert.deepEqual(rows.map(r=>r.windowStart),[0,1,2,3].map(n=>new Date(n*86400000).toISOString()));
 await assert.rejects(extractWindows(0,86400000,86400,1,86400000,async()=>[{}]),/truncated/);
});
test('performance conversion keeps raw values and missing observations unknown',()=>{
 const r=performanceValues({largestContentfulPaintP75:2500000,interactionToNextPaintP75:-1,cumulativeLayoutShiftP75:0.1});
 assert.equal(r.largestContentfulPaintP75_ms,2500);assert.equal(r.interactionToNextPaintP75_ms,null);assert.equal(r.cumulativeLayoutShiftP75,0.1);assert.equal(r.largestContentfulPaintP75,2500000);
});
test('selection discovery checks nested leaf fields against entitlements',()=>{
 assert.deepEqual(selectedFields('count avg { sampleInterval } dimensions { requestPath }'),['count','avg_sampleInterval','dimensions_requestPath']);
});
test('HTTP evidence excludes unexpected hosts and never labels empty bot categories human',()=>{
 assert.equal(httpEvidence({clientRequestHTTPHost:'test.baulingo.app',verifiedBotCategory:''}).host_scope,'unintended');
 assert.equal(httpEvidence({clientRequestHTTPHost:'baulingo.app',verifiedBotCategory:''}).automation,'unknown');
 assert.equal(httpEvidence({clientRequestHTTPHost:'www.baulingo.app',verifiedBotCategory:'AI Crawler'}).automation,'verified_bot');
 const missing=httpEvidence({clientRequestHTTPHost:'baulingo.app',edgeResponseStatus:404,edgeResponseContentTypeName:'html',clientRequestPath:'/missing/'});
 assert.equal(missing.is_html_response,true);assert.equal(missing.is_missing,true);assert.equal(missing.request_class,'missing');
 assert.equal(httpEvidence({edgeResponseStatus:503}).is_server_error,true);
});
test('Worker timings use schema units and response status zero is not an HTTP failure',()=>{
 const r=workerValues({cpuTimeUs:2000,requestDuration:4000,cpuTimeP75:1000,requestDurationP75:3000,durationP75:7,httpResponseStatus:0,requests:2,errors:0});
 assert.equal(r.cpuTimeUs_ms,2);assert.equal(r.requestDuration_ms,4);assert.equal(r.cpuTimeP75_ms,1);assert.equal(r.requestDurationP75_ms,3);
 assert.equal(r.durationP75_ms,undefined);assert.equal(r.http_outcome,'no_http_response');assert.equal(r.requests,2);
 assert.equal(workerValues({httpResponseStatus:503}).http_outcome,'server_error');
});
test('read-only requests reject missing permissions and partial GraphQL errors',async()=>{
 await assert.rejects(graphql('private','{}',async()=>new Response('',{status:403})),/403/);
 await assert.rejects(graphql('private','{}',async()=>new Response(JSON.stringify({data:{viewer:{}},errors:[{message:'private unsupported field'}]}))),e=>!e.message.includes('private')&&/GraphQL/.test(e.message));
});
test('rate limits and server errors retry with a bounded policy',async()=>{
 let n=0;const sleeps=[];
 const result=await graphql('private','{}',async()=>{n++;return n===1?new Response('',{status:429}):n===2?new Response('',{status:503}):new Response(JSON.stringify({data:{ok:true}}));},async ms=>{sleeps.push(ms)});
 assert.equal(result.ok,true);assert.equal(n,3);assert.deepEqual(sleeps,[1000,2000]);
 n=0;await assert.rejects(graphql('private','{}',async()=>{n++;return new Response('',{status:500})},async()=>{}),/500/);assert.equal(n,4);
});
test('resource identities cannot silently select another account, zone or hostname',()=>{
 const zone={name:'baulingo.app',id:'a'.repeat(32),account:{id:'b'.repeat(32)}};
 assert.equal(resourceIdentity(zone).account,'b'.repeat(32));
 assert.throws(()=>resourceIdentity(zone,{account:'c'.repeat(32)}),/match/);
 assert.throws(()=>resourceIdentity(zone,{zone:'c'.repeat(32)}),/match/);
 assert.throws(()=>resourceIdentity({...zone,name:'other.example'}),/baulingo/);
});
test('disabled datasets, unsupported fields and retention boundaries fail explicitly',()=>{
 const s={enabled:true,availableFields:['count'],maxNumberOfFields:1,notOlderThan:86400};
 assert.doesNotThrow(()=>datasetAccess(s,'count',0,86400000));
 assert.throws(()=>datasetAccess({...s,enabled:false},'count',0,1),/unavailable/);
 assert.throws(()=>datasetAccess(s,'sum { visits }',0,1),/Unsupported/);
 assert.throws(()=>datasetAccess(s,'count count',0,1),/field limit/);
 assert.throws(()=>datasetAccess(s,'count',0,86400001),/retention/);
});
