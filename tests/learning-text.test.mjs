import test from 'node:test';
import assert from 'node:assert/strict';
import {germanParts,germanHTML,exampleHTML} from '../src/learning-text.js';

test('authored German mentions preserve prose and prefer complete phrases without matching inside words',()=>{
  const text='Sie ve Ihnen kullan; Liebe Frau Adler, aynı zamanda nazik bir hitaptır. sieben değişmez.';
  const parts=germanParts(text,['Sie','Ihnen','Liebe','Liebe Frau Adler,','sieben']);
  assert.equal(parts.map(part=>part.text).join(''),text);
  assert.deepEqual(parts.filter(part=>part.german).map(part=>part.text),['Sie','Ihnen','Liebe Frau Adler,','sieben']);
  assert.equal(germanParts('diese ve Sieben',['Sie']).some(part=>part.german),false);
});

test('language markup escapes source text and keeps translations outside the German language scope',()=>{
  assert.equal(germanHTML('<script>Sie</script>',['Sie']),'&lt;script&gt;<i lang="de">Sie</i>&lt;/script&gt;');
  assert.match(exampleHTML('der Tisch','masa',{word:true}),/<strong lang="de"[^>]*>der Tisch<\/strong><span class="example-translation">masa<\/span>/);
  assert.doesNotMatch(exampleHTML('Ich komme.','Geliyorum.'),/<i|<em|<strong/);
});
