import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import redirect from '../cloudflare/www-redirect/worker.js';

test('WWW redirects permanently to HTTPS apex while retaining the path and full query', () => {
  for (const url of [
    'http://www.baulingo.app/',
    'https://www.baulingo.app/',
    'http://www.baulingo.app/konular/cases/?q=artikel&from=www',
    'https://www.baulingo.app/downloads/kafede-almanca.txt?one=1&one=2',
    'https://www.baulingo.app/konular/%C3%A7al%C4%B1%C5%9Fma/?q=a%2Bb&empty=',
    'https://www.baulingo.app//example.org/path?next=https%3A%2F%2Fexample.org',
  ]) {
    const source = new URL(url);
    const response = redirect.fetch(new Request(url));
    assert.equal(response.status, 301);
    const destination = new URL(response.headers.get('location'));
    assert.equal(destination.origin, 'https://baulingo.app');
    assert.equal(destination.pathname, source.pathname);
    assert.equal(destination.search, source.search);
  }
});

test('unexpected hostnames cannot use the redirect Worker', () => {
  for (const hostname of ['baulingo.app', 'example.org', 'www.baulingo.app.example.org']) {
    const response = redirect.fetch(new Request(`https://${hostname}/`));
    assert.equal(response.status, 404);
    assert.equal(response.headers.get('location'), null);
  }
});

test('deployment scope is restricted to WWW with workers.dev and previews disabled', async () => {
  const config = JSON.parse(await readFile('cloudflare/www-redirect/wrangler.json', 'utf8'));
  assert.equal(config.name, 'baulingo-www-redirect');
  assert.equal(config.workers_dev, false);
  assert.equal(config.preview_urls, false);
  assert.deepEqual(config.routes, [{ pattern: 'www.baulingo.app/*', zone_name: 'baulingo.app' }]);
});
