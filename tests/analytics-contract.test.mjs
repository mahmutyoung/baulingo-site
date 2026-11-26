import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyEntry, localeEntryQuery, resumeVisit } from '../src/analytics-attribution.js';
import { sanitizeLearningEvent } from '../src/analytics-contract.js';

const activity = { activity_id: 'practice', activity_type: 'sentence', content_language: 'tr' };

test('event-specific contracts reject missing required fields and discard unrelated and private values', () => {
  assert.equal(sanitizeLearningEvent('exercise_answered', activity), null);
  assert.equal(sanitizeLearningEvent('exercise_answered', { ...activity, outcome: 'unknown' }), null);
  assert.deepEqual(sanitizeLearningEvent('exercise_answered', {
    ...activity, outcome: 'correct', attempt_number: 2, duration_seconds: 17, answer: 'private',
  }), { ...activity, outcome: 'correct', attempt_number: 2 });
  assert.equal(sanitizeLearningEvent('learning_completed', {
    ...activity, completion_type: 'checked', questions_answered: 1, correct_answers: 2,
  }), null);
  assert.equal(sanitizeLearningEvent('study_time', { ...activity, duration_seconds: 0 }), null);
  assert.equal(sanitizeLearningEvent('toString', activity), null);
});

test('entry attribution accepts known signals and rejects duplicate, lookalike and conflicting tags', () => {
  const ai = { campaign_source: 'chatgpt.com', campaign_medium: 'referral', ai_source: 'chatgpt' };
  assert.deepEqual(classifyEntry('', 'https://chatgpt.com/c/private?prompt=private'), ai);
  assert.deepEqual(classifyEntry('?utm_source=chatgpt.com&utm_medium=prompt&utm_campaign=private', ''), ai);
  assert.deepEqual(classifyEntry('?utm_source=chatgpt.com&utm_source=chatgpt.com', ''), {});
  assert.deepEqual(classifyEntry('?utm_source=unknown', 'https://chatgpt.com.example.com/'), {});
  assert.deepEqual(classifyEntry('', ''), {});
  const ordinary = '?utm_source=baulingo&utm_medium=referral&utm_campaign=german-courses';
  assert.deepEqual(classifyEntry(ordinary, ''), {
    campaign_source: 'baulingo', campaign_medium: 'referral', campaign_name: 'german-courses',
  });
  assert.deepEqual(classifyEntry(ordinary, 'https://chatgpt.com/'), {});
  assert.equal(localeEntryQuery('?utm_source=chatgpt.com&utm_campaign=private', ''), '?utm_source=chatgpt.com&utm_medium=referral');
});

test('in-window internal navigation retains a validated landing context', () => {
  const previous = { landing: '/en/', attribution: classifyEntry('?utm_source=chatgpt.com', ''), time: 1000 };
  assert.deepEqual(resumeVisit(JSON.stringify(previous), true, 1200), previous);
  assert.equal(resumeVisit(JSON.stringify(previous), false, 1200), null);
  assert.equal(resumeVisit(JSON.stringify(previous), true, 1801000), null);
  assert.equal(resumeVisit(JSON.stringify({ ...previous, landing: '/en/?secret=1' }), true, 1200), null);
  assert.deepEqual(resumeVisit(JSON.stringify({ ...previous, attribution: { ...previous.attribution, secret: 'x' } }), true, 1200), previous);
});
