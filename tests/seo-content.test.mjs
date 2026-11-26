import test from 'node:test';
import assert from 'node:assert/strict';
import { mapUrl, mapReport } from '../scripts/seo-content.ts';

test('maps localized canonical URLs to distinct catalog pages', () => {
  const tr = mapUrl('https://baulingo.app/');
  const en = mapUrl('https://BAULINGO.app/en/');
  assert.equal(tr.page_id, 'home-tr');
  assert.equal(en.page_id, 'home-en');
  assert.equal(en.content_language, 'en');
  assert.equal(en.original_url, 'https://BAULINGO.app/en/');
});
test('does not guess identities for query strings, different origins or slash variants', () => {
  for (const url of ['https://baulingo.app/?lang=en', 'https://www.baulingo.app/', 'https://baulingo.app/en', 'invalid']) assert.equal(mapUrl(url).page_id, null);
});
test('maps page dimension in arbitrary position while preserving search data', () => {
  const report = { metadata: { dimensions: ['query', 'page'] }, rows: [{ keys: ['test', 'https://baulingo.app/en/'], clicks: 1, impressions: 10 }] };
  const result = mapReport(report);
  assert.equal(result.rows[0].page_id, 'home-en');
  assert.equal(result.rows[0].clicks, 1);
  assert.equal(result.rows[0].query, 'test');
  assert.throws(() => mapReport({ metadata: { dimensions: ['query'] }, rows: [] }), /page dimension/i);
});

test('does not map a URL containing embedded credentials', () => {
  assert.equal(mapUrl('https://user@baulingo.app/').page_id, null);
});
