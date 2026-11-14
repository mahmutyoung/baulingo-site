import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import './build-fixture.mjs';

test('study filters start with level and content, retain all advanced controls and name each level header', async () => {
  const html=await readFile('dist/dtz-kelime-kalip-cumle/index.html','utf8');
  const basic=html.match(/class="?study-basic-filters"?>([\s\S]*?)<\/div>/)?.[1];
  assert.ok(basic,'basic filters are available');
  assert.match(basic,/data-study-level/);
  assert.match(basic,/data-study-kind/);
  assert.doesNotMatch(basic,/data-study-(list|topic|type|part)/);
  assert.match(html,/<details class="?study-advanced"?>/);
  for(const name of ['level','kind','list','topic','type','part']) assert.equal((html.match(new RegExp(`<select data-study-${name}\\b`,'g'))||[]).length,1);
  assert.equal((html.match(/class="?study-level-heading"?(?=[\s>])/g)||[]).length,3);
});

test('writing pages omit the separate phrase sidebar and initial privacy notices while retaining inline help sources', async () => {
  for(const id of ['','dort-maddeyi-planla/','rehberli-yazma/','deneme-1/']){
    const html=await readFile(`dist/dtz-mektup-yazma/${id}index.html`,'utf8');
    assert.doesNotMatch(html,/<aside class="writing-toolbox"/);
    assert.doesNotMatch(html,/Yanıt(?:ların|ın) yalnızca bu tarayıcı/);
    assert.match(html,/<p[^>]*data-storage[^>]*hidden/);
    assert.match(html,/data-phrase-toolbox/);
    assert.match(html,/data-export/);
  }
});
