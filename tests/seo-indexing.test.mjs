import test from 'node:test';
import assert from 'node:assert/strict';
import { compareSitemap, summarizeInspection, parseSitemap, selectUrls } from '../scripts/seo-indexing.ts';

test('compares exact localized sitemap URLs without conflating pages', () => {
  assert.deepEqual(compareSitemap(['https://baulingo.app/', 'https://baulingo.app/en/'], ['https://baulingo.app/', 'https://baulingo.app/old/']), { missing: ['https://baulingo.app/en/'], unexpected: ['https://baulingo.app/old/'] });
});
test('parses sitemap locations and rejects sitemap indexes', () => {
  assert.deepEqual(parseSitemap('<urlset><url><loc>https://baulingo.app/a/</loc></url></urlset>'), ['https://baulingo.app/a/']);
  assert.throws(() => parseSitemap('<sitemapindex></sitemapindex>'), /sitemap index/i);
});
test('reports Google index fields without treating unknown as indexed', () => {
  const result = summarizeInspection({ inspectionResult: { indexStatusResult: { verdict: 'NEUTRAL', coverageState: 'URL is unknown to Google', robotsTxtState: 'ALLOWED', pageFetchState: 'SUCCESSFUL', googleCanonical: 'https://baulingo.app/a/', userCanonical: 'https://baulingo.app/b/', referringUrls: ['https://example.com/'] } } });
  assert.equal(result.verdict, 'NEUTRAL');
  assert.equal(result.coverageState, 'URL is unknown to Google');
  assert.equal(result.googleCanonical, 'https://baulingo.app/a/');
  assert.deepEqual(result.referringUrls, ['https://example.com/']);
});
test('selects only unique catalog URLs and respects quota limit', () => {
  assert.deepEqual(selectUrls(['https://baulingo.app/', 'https://baulingo.app/a/'], ['https://baulingo.app/a/', 'https://baulingo.app/a/'], 2), ['https://baulingo.app/a/']);
  assert.throws(() => selectUrls(['https://baulingo.app/'], ['https://other.example/'], 2), /catalog/i);
  assert.throws(() => selectUrls(['https://baulingo.app/'], ['https://baulingo.app/'], 0), /limit/i);
});

test('flags canonical mismatches and unexpected redirects for review', async () => {
  const { inspectionFindings } = await import('../scripts/seo-indexing.ts');
  assert.deepEqual(inspectionFindings('https://baulingo.app/a/', { googleCanonical: 'https://baulingo.app/b/', userCanonical: 'https://baulingo.app/a/' }, { status: 301, location: '/b/' }), ['google_canonical_differs', 'unexpected_http_status']);
  assert.deepEqual(inspectionFindings('https://baulingo.app/a/', { googleCanonical: null, userCanonical: null }, { status: 200, canonical: 'https://baulingo.app/a/' }), []);
});
