import test from 'node:test';
import assert from 'node:assert/strict';
import { checkConnection } from '../scripts/seo-check.ts';

test('checks target permission and queries finalized totals', async () => {
  let queried = false;
  const result = await checkConnection('sc-domain:baulingo.app', async () => ({ siteEntry:[{siteUrl:'sc-domain:baulingo.app', permissionLevel:'siteOwner'}] }), async body => { queried = true; assert.equal(body.dataState, 'final'); return { rows:[] }; }, '2026-11-23');
  assert.equal(result.permissionLevel, 'siteOwner');
  assert.equal(result.rows, 0);
  assert.equal(queried, true);
});
test('rejects wrong and unverified property without issuing performance request', async () => {
  let queried = false;
  const list = async () => ({siteEntry:[{siteUrl:'sc-domain:other.example', permissionLevel:'siteOwner'}, {siteUrl:'sc-domain:baulingo.app', permissionLevel:'siteUnverifiedUser'}]});
  for (const property of ['sc-domain:missing.example', 'sc-domain:baulingo.app']) await assert.rejects(checkConnection(property, list, async () => { queried = true; return {}; }, '2026-11-23'), /property|permission/i);
  assert.equal(queried, false);
});
