import test from 'node:test';
import assert from 'node:assert/strict';
import { snapshotStatus } from '../scripts/cloudflare-output.ts';
test('snapshot status distinguishes empty successful reports from missing datasets',()=>{
 assert.equal(snapshotStatus([{status:'complete',rows:0}]),'complete');
 assert.equal(snapshotStatus([{status:'unavailable'}]),'unavailable');
 assert.equal(snapshotStatus([{status:'complete'},{status:'unavailable'}]),'partial');
 assert.equal(snapshotStatus([]),'unavailable');
});
