import test from 'node:test';
import assert from 'node:assert/strict';
import { validatePeriod, joinPages, gaRows } from '../scripts/seo-ga4.ts';

test('requires a valid clean reporting period', () => {
  assert.throws(() => validatePeriod('2026-11-26', '2026-11-28'), /baseline/i);
  assert.throws(() => validatePeriod('2026-12-02', '2026-11-28'), /date/i);
  assert.doesNotThrow(() => validatePeriod('2026-11-27', '2026-11-28'));
});
test('preserves unmatched search rows and leaves missing GA data unknown', () => {
  const result = joinPages([{ original_url:'https://baulingo.app/', page_id:'home-tr', clicks:2, impressions:10 }, { original_url:'http://baulingo.app/', page_id:null, clicks:1 }], [{ page_id:'home-tr', sessions:3 }], [{ page_id:'home-tr', learning_started:4 }]);
  assert.equal(result[0].google_organic_sessions, 3);
  assert.equal(result[0].learning_started, 4);
  assert.equal(result[0].learning_completed, null);
  assert.equal(result[1].google_organic_sessions, null);
});
test('GA response parser retains numeric values without treating unset dimensions as identities', () => {
  const rows = gaRows({ rows: [{ dimensionValues:[{ value:'(not set)' }], metricValues:[{ value:'5' }] }] }, ['page_id'], ['eventCount']);
  assert.equal(rows[0].page_id, '(not set)');
  assert.equal(rows[0].eventCount, 5);
});

test('includes catalog pages with GA engagement even without a search row', () => {
  const result = joinPages([], [{ page_id:'home-en', sessions:2 }], []);
  assert.equal(result[0].page_id, 'home-en');
  assert.equal(result[0].google_organic_sessions, 2);
  assert.equal(result[0].impressions, null);
});
