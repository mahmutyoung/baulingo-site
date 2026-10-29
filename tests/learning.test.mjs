import test from 'node:test';
import assert from 'node:assert/strict';
import { newExercise, toggleWord, checkAnswer, nextHint } from '../src/exercise.js';
import { searchTopics } from '../src/topics.js';

const select = (words, id = 'coffee') => words.reduce(toggleWord, newExercise(id));

test('words can be selected and returned without duplicates or mutation', () => {
  const original = newExercise();
  const selected = toggleWord(original, 'einen');
  assert.deepEqual(original.selected, []);
  assert.deepEqual(selected.selected, ['einen']);
  assert.deepEqual(toggleWord(selected, 'einen').selected, []);
  assert.deepEqual(toggleWord(selected, 'unknown'), selected);
});

test('empty and incomplete requests are not marked correct', () => {
  assert.equal(checkAnswer(newExercise()).status, 'incomplete');
  assert.equal(checkAnswer(select(['einen', 'coffee'])).status, 'incomplete');
});

test('a complete wrong order gives a repair opportunity', () => {
  const checked = checkAnswer(select(['coffee', 'einen', 'bitte']));
  assert.equal(checked.status, 'incorrect');
  const repaired = toggleWord(checked, 'coffee');
  assert.equal(repaired.status, 'idle');
  assert.deepEqual(repaired.selected, ['einen', 'bitte']);
});

test('the authored request is accepted and the tea continuation is independent', () => {
  const coffee = checkAnswer(select(['einen', 'coffee', 'bitte']));
  assert.equal(coffee.status, 'correct');
  const tea = newExercise('tea');
  assert.deepEqual(tea.selected, []);
  assert.equal(checkAnswer(select(['einen', 'tea', 'bitte'], 'tea')).status, 'correct');
  assert.equal(checkAnswer(toggleWord(tea, 'coffee')).status, 'incomplete');
});

test('hints depend on the answer so far and reset starts a clean task', () => {
  assert.match(nextHint(newExercise()), /Einen/);
  assert.match(nextHint(select(['einen'])), /Kaffee/);
  assert.match(nextHint(select(['einen', 'coffee'])), /bitte/);
  assert.match(nextHint(select(['coffee'])), /Einen/);
  assert.deepEqual(newExercise().selected, []);
  assert.equal(newExercise().status, 'idle');
});

test('Turkish topic search supports case, diacritics and multiple terms', () => {
  assert.equal(searchTopics('CÜMLE SIRASI')[0].id, 'word-order');
  assert.equal(searchTopics('cumle sirasi')[0].id, 'word-order');
  assert.equal(searchTopics('İSİMLERİN CİNSİYETİ')[0].id, 'articles');
  assert.equal(searchTopics('akkusativ dativ')[0].id, 'cases');
  assert.equal(searchTopics('B1 mektup')[0].id, 'exams');
  assert.equal(searchTopics('doktor')[0].id, 'doctor');
});

test('empty search offers all topics; arbitrary text produces a real empty state', () => {
  assert.ok(searchTopics('  ').length >= 5);
  assert.deepEqual(searchTopics('<script>alert(1)</script>'), []);
  assert.deepEqual(searchTopics('zzzzzzzz'), []);
});
