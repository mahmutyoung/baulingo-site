import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { gunzipSync } from 'node:zlib';
import './build-fixture.mjs';

test('English and Turkish grammar hubs list all 53 packs and link back to the language courses', async () => {
  const sitemap = await readFile('dist/sitemap.xml', 'utf8');
  for (const [lang, hub, course, archive] of [
    ['tr', '/konular/almanca-gramer/', '/konular/almanca-a1/', 'grammar-tr.gz'],
    ['en', '/en/german-grammar/', '/en/german-a1/', 'grammar.gz'],
  ]) {
    const html = await readFile('dist' + hub + 'index.html', 'utf8');
    const overview = await readFile('dist' + course + 'index.html', 'utf8');
    const records = JSON.parse(gunzipSync(await readFile('dist/src/mini-packs/' + archive)));
    const entries = records.map(({pack}) => pack.cefr);
    assert.deepEqual(['A1', 'A2', 'B1'].map(level => entries.filter(item => item === level).length), [21, 16, 16]);
    assert.equal(new Set(records.map(record => record.pack.id)).size, 53);
    assert.ok(html.includes('href="' + course + '"'));
    assert.ok(overview.includes('href="' + hub + '#a1"'));
    assert.equal([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].filter(([,url]) => url.startsWith('https://baulingo.app' + hub)).length, 54);
    for (const {pack, related} of records) {
      assert.ok(pack.grammar.example[lang]);
      assert.match(related[0].id, /^DE-[AB][12]-\d{3}$/);
    }
  }
});

test('modal verb pages have readable canonical URLs and contextual practice links', async () => {
  for (const [route, practice, text] of [
    ['/konular/almanca-gramer/a1/modal-fiiller/', '/konular/almanca-a1/arkadasina-bir-etkinlik-oner/', 'Modal fiiller'],
    ['/en/german-grammar/a1/modal-verbs/', '/en/german-a1/invite-a-friend-to-do-something/', 'Modal verbs'],
  ]) {
    const html = await readFile('dist' + route + 'index.html', 'utf8');
    assert.ok(html.includes('rel="canonical" href="https://baulingo.app' + route + '"'));
    assert.ok(html.includes(text));
    assert.ok(html.includes('href="' + practice + '"'));
  }
});
