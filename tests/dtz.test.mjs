import test from 'node:test';
import assert from 'node:assert/strict';
import { examData } from '../src/dtz/content.js';
import { createAttempt, selectAnswer, finishListening, nextSection, syncClock, remainingSeconds, scoreAttempt, validateAttempt } from '../src/dtz/rules.js';

const questions = section => examData[`${section}Tasks`].filter(t => !t.isExample).flatMap(t => t.questions);

test('DTZ export preserves all scored questions, examples and original media references', () => {
  assert.equal(questions('listening').length, 20);
  assert.equal(questions('reading').length, 25);
  const all = [...questions('listening'), ...questions('reading')];
  assert.equal(new Set(all.map(q => q.id)).size, 45);
  assert.deepEqual(all.map(q => q.number), Array.from({ length: 45 }, (_, i) => i + 1));
  for (const q of all) assert.ok(Number.isInteger(q.correctAnswer) && q.correctAnswer >= 0 && q.correctAnswer < q.choices.length);
  assert.deepEqual(examData.listeningTasks.filter(t => t.isExample).map(t => t.part), [1, 3, 4]);
  assert.equal(examData.writingPrompts.length, 2);
  assert.notEqual(examData.speakingPicturePrompts[0].image, examData.speakingPicturePrompts[1].image);
  assert.equal(examData.listeningAudio, '/assets/dtz/dtz-mock-01-listening.mp3');
});

test('DTZ selections reject invalid, example and out-of-section answers without mutation', () => {
  const original = createAttempt(1000);
  const q = questions('listening')[0];
  const answered = selectAnswer(original, q.id, q.correctAnswer);
  assert.deepEqual(original.answers, {});
  assert.equal(answered.answers[q.id], q.correctAnswer);
  for (const [id, answer] of [[q.id, -1], [q.id, 99], [q.id, '1'], ['unknown', 0], [questions('reading')[0].id, 0], [examData.listeningTasks[0].questions[0].id, 0]]) {
    assert.deepEqual(selectAnswer(original, id, answer), original);
  }
  assert.equal(nextSection(original, 2000).phase, 'listening');
});

test('DTZ clocks retain deadlines across reload and expiry catches up without granting extra time', () => {
  const reading = nextSection(finishListening(createAttempt(1000)), 2000);
  assert.equal(reading.phase, 'reading');
  assert.equal(reading.deadline, 2000 + 45 * 60_000);
  assert.equal(remainingSeconds(reading, 2500), 2700);
  const restored = validateAttempt(JSON.parse(JSON.stringify(reading)));
  assert.deepEqual(restored, reading);
  const writing = syncClock(restored, reading.deadline + 1000);
  assert.equal(writing.phase, 'writing');
  assert.equal(writing.deadline, reading.deadline + 30 * 60_000);
  assert.equal(syncClock(restored, reading.deadline + 31 * 60_000).phase, 'speaking');
  assert.equal(nextSection(writing, writing.deadline - 500).phase, 'speaking');
});

test('DTZ result scores only original receptive answers and preserves published boundaries', () => {
  const all = [...questions('listening'), ...questions('reading')];
  for (const [correct, expected] of [[0, 'unter A2'], [19, 'unter A2'], [20, 'A2'], [32, 'A2'], [33, 'B1'], [45, 'B1']]) {
    const attempt = createAttempt(1000);
    for (const q of all.slice(0, correct)) attempt.answers[q.id] = q.correctAnswer;
    attempt.answers['unknown'] = 0;
    attempt.answers[examData.listeningTasks[0].questions[0].id] = 0;
    const score = scoreAttempt(attempt);
    assert.equal(score.total, correct);
    assert.equal(score.level, expected);
    assert.ok(score.listening <= 20 && score.reading <= 25);
  }
});

test('DTZ restore rejects malformed state and oversized drafts while retaining valid writing', () => {
  const valid = nextSection(nextSection(finishListening(createAttempt(1000)), 2000), 3000);
  valid.writing = 'Guten Tag, ich möchte einen Termin vereinbaren.';
  assert.deepEqual(validateAttempt(valid), valid);
  const q = questions('listening')[0];
  for (const bad of [null, [], {}, { ...valid, version: 99 }, { ...valid, phase: 'bad' }, { ...valid, deadline: null }, { ...valid, deadline: Infinity }, { ...valid, answers: { [q.id]: 999 } }, { ...valid, answers: { invented: 0 } }, { ...valid, writing: 'x'.repeat(20_001) }, { ...valid, candidate: 'c' }]) {
    assert.equal(validateAttempt(bad), null);
  }
});
