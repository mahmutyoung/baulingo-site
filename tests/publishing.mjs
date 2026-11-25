import assert from 'node:assert/strict';
import { createCatalog, outputFile, sitemapXml } from '../src/publishing/model.ts';
import { catalog, lessonPages } from '../src/publishing/catalog.ts';

const record = { id: 'pack', format: 'mini_pack', category: 'grammar', level: 'A1', locales: ['tr', 'en'], relatedIds: [] };
const page = {
  id: 'grammar-tr', path: '/almanca/konu/akkusativ/', locale: 'tr', title: 'Akkusativ',
  heading: 'Almanca Akkusativ', description: 'Örnekler', contentId: 'pack', translationGroup: 'pack',
  index: true, sitemap: true,
};
const translated = {
  ...page, id: 'grammar-en', path: '/en/accusative/', locale: 'en', title: 'Accusative',
  heading: 'The German accusative', description: 'Examples',
};
const collection = { id: 'grammar', contentIds: ['pack'] };
const valid = () => createCatalog([record], [collection, { ...collection, id: 'a1' }], [page, translated]);

assert.deepEqual(valid().alternates(page).map(({ locale, path }) => [locale, path]), [
  ['en', '/en/accusative/'], ['tr', '/almanca/konu/akkusativ/'],
]);
assert.equal(outputFile(page.path), 'almanca/konu/akkusativ/index.html');
assert.equal(outputFile('/'), 'index.html');
assert.match(sitemapXml(['https://baulingo.app/en/accusative/']), /<loc>https:\/\/baulingo\.app\/en\/accusative\/<\/loc>/);

assert.throws(() => createCatalog([record, record], [], []), /Duplicate content ID/);
assert.throws(() => createCatalog([{ ...record, relatedIds: ['missing'] }], [], []), /Unknown content/);
assert.throws(() => createCatalog([record], [collection, collection], []), /Duplicate collection ID/);
assert.throws(() => createCatalog([record], [], [page, { ...translated, id: page.id }]), /Duplicate page ID/);
assert.throws(() => createCatalog([record], [], [page, { ...translated, path: page.path }]), /Duplicate page path/);
assert.throws(() => createCatalog([record], [], [{ ...page, path: '/konular/../gizli/' }, translated]), /Invalid page path/);
assert.throws(() => createCatalog([record], [{ ...collection, contentIds: ['missing'] }], []), /Unknown content/);
assert.throws(() => createCatalog([record], [], [{ ...page, contentId: 'missing' }, translated]), /Unknown content/);
assert.throws(() => createCatalog([record], [], [{ ...page, collectionId: 'missing' }, translated]), /Unknown collection/);
assert.throws(() => createCatalog([record], [], [{ ...page, canonicalId: 'missing' }, translated]), /Unknown canonical/);
assert.throws(() => createCatalog([record], [], [page, { ...translated, locale: 'tr' }]), /Duplicate translation locale/);
assert.throws(() => createCatalog([record], [], [page]), /Translation group.*requires/);
assert.throws(() => createCatalog([record], [], [page, { ...translated, contentId: undefined }]), /different content/);
assert.throws(() => createCatalog([record], [], [{ ...page, index: false }, translated]), /Non-indexable page/);
assert.throws(() => createCatalog([record], [], [{ ...page, title: ' ' }, translated]), /Missing title/);

const alias = { ...page, id: 'alias', path: '/alias/', canonicalId: page.id, translationGroup: undefined, sitemap: false };
const unindexed = { ...alias, id: 'unindexed', path: '/unindexed/', canonicalId: undefined, index: false };
const policies = createCatalog([record], [], [page, translated, alias, unindexed]);
assert.equal(policies.canonical(alias).id, page.id);
assert.equal(policies.sitemapLocations().length, 2);

assert.equal([...catalog.content.values()].filter(content => content.format === 'mini_pack').length, 120);
assert.equal(catalog.collections.get('grammar').contentIds.length, 53);
assert.equal(catalog.collections.get('everyday-communication').contentIds.length, 67);
assert.equal(lessonPages.length, 240);
const accusative = catalog.pages.get('DE-A1-G09:tr');
assert.equal(accusative.path, '/konular/almanca-gramer/a1/akkusativ-einen-ve-den/');
assert.equal(catalog.alternates(accusative)[0].path, '/en/german-grammar/a1/the-accusative/');
assert.equal(catalog.canonical(accusative).id, accusative.id);
console.log('Publishing model and existing lesson metadata passed.');
