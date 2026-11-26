import test from 'node:test';
import assert from 'node:assert/strict';
import { dateRange, previousRange, fetchRows, toCsv } from '../scripts/seo-performance.ts';

test('date ranges validate dates and compute equivalent previous periods', () => {
  assert.deepEqual(dateRange('7', '2026-11-25'), { startDate: '2026-11-19', endDate: '2026-11-25' });
  assert.deepEqual(previousRange({ startDate: '2026-11-19', endDate: '2026-11-25' }), { startDate: '2026-11-12', endDate: '2026-11-18' });
  assert.throws(() => dateRange('custom', '2026-11-25', '2026-02-30'), /date/i);
});
test('paginates and preserves empty results', async () => {
  const offsets = [];
  const rows = await fetchRows(async body => { offsets.push(body.startRow); return { rows: body.startRow === 0 ? [{ keys: ['a'], clicks: 1 }] : [] }; }, { dimensions: ['query'] }, 1);
  assert.deepEqual(offsets, [0, 1]);
  assert.equal(rows.length, 1);
});
test('CSV quotes commas, quotes and newlines', () => {
  assert.equal(toCsv([{ query: 'a,"b"\nc', clicks: 2 }], ['query', 'clicks']), 'query,clicks\n"a,""b""\nc",2\n');
});

test('reports missing dimensions and inconsistent aggregation across pages', async () => {
  await assert.rejects(fetchRows(async () => ({ rows: [{ keys: [], clicks: 1 }] }), { dimensions: ['page'] }), /dimension/);
  await assert.rejects(fetchRows(async body => ({ responseAggregationType: body.startRow ? 'byPage' : 'byProperty', rows: body.startRow ? [] : [{ keys: ['a'] }] }), { dimensions: ['query'] }, 1), /aggregation/i);
});
test('retries transient quota failures and distinguishes authentication and permission errors', async () => {
  const { createRequest } = await import('../scripts/seo-performance.ts');
  let calls = 0;
  const request = createRequest('p', 'secret', 'quota', async () => { calls++; return new Response(calls === 1 ? '' : '{}', { status: calls === 1 ? 429 : 200 }); }, async () => {});
  assert.deepEqual(await request({}), {});
  assert.equal(calls, 2);
  for (const [status, message] of [[401, /expired/i], [403, /access.*scope/i], [429, /quota/i]]) {
    const fail = createRequest('p', 'secret', '', async () => new Response('', { status }), async () => {});
    await assert.rejects(fail({}), message);
  }
});
test('maximum history starts at least 16 calendar months before the requested end', () => {
  assert.equal(dateRange('max', '2026-11-23').startDate, '2025-07-01');
});

test('retries quota-exceeded responses reported as HTTP 403', async () => {
  const { createRequest } = await import('../scripts/seo-performance.ts');
  let calls = 0;
  const request = createRequest('p', 'secret', '', async () => {
    calls++;
    return calls === 1 ? new Response(JSON.stringify({ error: { errors: [{ reason: 'rateLimitExceeded' }] } }), { status: 403 }) : new Response('{}');
  }, async () => {});
  await request({});
  assert.equal(calls, 2);
});
