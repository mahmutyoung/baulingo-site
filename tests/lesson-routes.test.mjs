import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import './build-fixture.mjs';

test('the A1 course and test link to a crawlable Kendini tanıt lesson', async () => {
  const route = '/konular/almanca-a1/kendini-tanit/';
  const [lesson, course, testPage, sitemap] = await Promise.all([
    readFile('dist' + route + 'index.html', 'utf8'),
    readFile('dist/konular/almanca-a1/index.html', 'utf8'),
    readFile('dist/konular/almanca-a1-test/index.html', 'utf8'),
    readFile('dist/sitemap.xml', 'utf8'),
  ]);
  assert.ok(lesson.includes('rel="canonical" href="https://baulingo.app' + route + '"'));
  assert.match(lesson, /<h1[^>]*>Kendini tanıt<\/h1>/);
  assert.match(lesson, /Hallo, ich bin Deniz/);
  assert.ok(course.includes('href="' + route + '"'));
  assert.ok(testPage.includes('href="' + route + '"'));
  assert.ok(sitemap.includes('https://baulingo.app' + route + '</loc>'));
  assert.equal([...sitemap.matchAll(/<loc>https:\/\/baulingo\.app\/konular\/almanca-(?:a1|a2|b1)\/[a-z0-9-]+\/<\/loc>/g)].length, 67);
});

test('English level pages expose all 67 lesson URLs and each example is readable in HTML', async () => {
  const route = '/en/german-a1/introduce-yourself/';
  const [lesson, level, home, sitemap] = await Promise.all([
    readFile('dist' + route + 'index.html', 'utf8'),
    readFile('dist/en/german-a1/index.html', 'utf8'),
    readFile('dist/en/index.html', 'utf8'),
    readFile('dist/sitemap.xml', 'utf8'),
  ]);
  assert.match(lesson, /<html lang="en">/);
  assert.ok(lesson.includes('rel="canonical" href="https://baulingo.app' + route + '"'));
  assert.match(lesson, /<h1[^>]*>Introduce yourself<\/h1>/);
  assert.match(lesson, /Hallo, ich bin Lea/);
  assert.ok(level.includes('href="' + route + '"'));
  assert.ok(home.includes('href="/en/german-a1/"'));
  assert.equal([...sitemap.matchAll(/<loc>https:\/\/baulingo\.app\/en\/german-(?:a1|a2|b1)\/[a-z0-9-]+\/<\/loc>/g)].length, 67);
});
