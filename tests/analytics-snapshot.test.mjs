import test from 'node:test';
import assert from 'node:assert/strict';
import { datasetStatus, snapshotPlan, reusableRun, jobCacheKey } from '../scripts/analytics-snapshot.ts';
import { ga4Status, fetchGa4Report } from '../scripts/ga4-report.ts';
import { localReportRoot, snapshotStatus } from '../scripts/cloudflare-output.ts';

test('snapshot completeness follows datasets even when the process exits successfully',()=>{
 assert.equal(datasetStatus(0,{status:'partial',reports:[{status:'complete'},{status:'unavailable'}]}),'partial');
 assert.equal(datasetStatus(1,{status:'complete'}),'unavailable');
 assert.equal(datasetStatus(0,null),'unavailable');
 assert.equal(snapshotStatus([{status:'partial'}]),'partial');
});
test('generated reporting output cannot target tracked documents or production assets',()=>{
 assert.ok(localReportRoot('.dev/snapshots').endsWith('snapshots'));
 assert.throws(()=>localReportRoot('dist/reports'),/\.dev/);
 assert.throws(()=>localReportRoot('.dev/../docs/reports'),/\.dev/);
});
test('daily plan uses disjoint source days and defers pre-baseline GA4',()=>{
 const early=snapshotPlan('daily',new Date('2026-11-27T10:00:00Z'));
 assert.equal(early.find(j=>j.id==='ga4').blocked,true);
 assert.deepEqual(early.find(j=>j.id==='search').range,{startDate:'2026-11-24',endDate:'2026-11-24'});
 assert.deepEqual(early.find(j=>j.id==='traffic').range,{startDate:'2026-11-26',endDate:'2026-11-26'});
 const weekly=snapshotPlan('weekly',new Date('2026-12-10T10:00:00Z'));
 assert.equal(weekly.find(j=>j.id==='search').compare,true);
 assert.throws(()=>snapshotPlan('hourly',new Date()),/cadence/i);
});
test('reusing a snapshot requires exact job key, complete datasets and intact files',()=>{
 const previous={key:'daily:2026-11-24',status:'complete',files:[{path:'raw.json',sha256:'a'}]};
 assert.equal(reusableRun(previous,'daily:2026-11-24',true),true);
 assert.equal(reusableRun(previous,'daily:2026-11-25',true),false);
 assert.equal(reusableRun({...previous,status:'partial'},previous.key,true),false);
 assert.equal(reusableRun(previous,previous.key,false),false);
});
test('changed source evidence and research settings invalidate cached derived results',()=>{
 const deps=[{id:'search',status:'complete',files:[{path:'page.json',sha256:'old'}]}];
 const a=jobCacheKey({job:'opportunities'},deps,'config-one');
 assert.notEqual(a,jobCacheKey({job:'opportunities'},[{...deps[0],files:[{path:'page.json',sha256:'new'}]}],'config-one'));
 assert.notEqual(a,jobCacheKey({job:'opportunities'},deps,'config-two'));
});
test('GA4 thresholding, sampling and data-loss flags cannot produce a complete extraction',()=>{
 assert.equal(ga4Status([{metadata:{timeZone:'Europe/Berlin'}}]),'complete');
 assert.equal(ga4Status([{metadata:{subjectToThresholding:true}}]),'partial');
 assert.equal(ga4Status([{metadata:{samplingMetadatas:[{samplesReadCount:'2',samplingSpaceSize:'10'}]}}]),'partial');
 assert.equal(ga4Status([{metadata:{dataLossFromOtherRow:true}}]),'partial');
});
test('GA4 extraction preserves API metadata and fails rather than accepting truncated pages',async()=>{
 const report=await fetchGa4Report(async()=>({rowCount:1,rows:[{dimensionValues:[{value:'google / organic'}],metricValues:[{value:'2'}]}],metadata:{timeZone:'Europe/Berlin',subjectToThresholding:true}}),{dimensions:[{name:'sessionSourceMedium'}],metrics:[{name:'sessions'}]});
 assert.equal(report.rows[0].sessions,2);assert.equal(report.status,'partial');
 await assert.rejects(fetchGa4Report(async()=>({rowCount:2,rows:[],metadata:{}}),{}),/pagination/i);
});
