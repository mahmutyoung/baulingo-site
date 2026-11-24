import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import './build-fixture.mjs';

test('GA4 consent module is present on learning pages, not loaded directly from templates', async () => {
  for (const file of ['index.html', 'en/index.html', 'konular/index.html', 'dtz-deneme-sinavi/index.html']) {
    const html = await readFile(`dist/${file}`, 'utf8');
    assert.match(html, /src="(?:\.\/|\/)src\/analytics\.js"/, file);
    assert.doesNotMatch(html, /<script[^>]+src="https:\/\/www\.googletagmanager\.com/, file);
  }
  const asset = await readFile('dist/src/analytics.js', 'utf8');
  assert.match(asset, /G-R1YH6T64JM/);
  assert.doesNotMatch(asset, /G-3XSNDN7FE4/);
  assert.match(asset, /choice === 'granted'/);
  assert.match(asset, /location\.hostname !== 'baulingo\.app'/);
  assert.match(asset, /allowedEvents = new Set/);
  assert.doesNotMatch(asset, /localStorage\.setItem\([^,]+,\s*JSON\.stringify\(attempt\)/);
});

test('the site permits only necessary GA4 endpoints and discloses opt-in collection', async () => {
  const [headers, homepage, privacy] = await Promise.all([
    readFile('dist/_headers', 'utf8'),
    readFile('dist/index.html', 'utf8'),
    readFile('dist/privacy/index.html', 'utf8'),
  ]);
  for (const content of [headers, homepage]) {
    assert.match(content, /www\.googletagmanager\.com/);
    assert.match(content, /www\.google-analytics\.com/);
    assert.match(content, /region1\.google-analytics\.com/);
    assert.match(content, /static\.cloudflareinsights\.com/);
  }
  assert.match(privacy, /Google Analytics 4/);
  assert.match(privacy, /G-R1YH6T64JM/);
  assert.match(privacy, /ausdrücklich zustimmst/);
  assert.match(privacy, /Einwilligung/);
});


test('expanded analytics accepts only supported event parameters and values', async () => {
  const { sanitizeLearningEvent } = await import('../src/analytics.js');
  assert.deepEqual(sanitizeLearningEvent('exercise_answered', {
    activity_id:'DE-A1-G09', activity_type:'grammar', exercise_id:'q-1', level:'A1',
    content_language:'tr', outcome:'correct', attempt_number:2,
    answer:'private answer', search_term:'private query', draft:'private text', user_id:'private ID',
  }), { activity_type:'grammar', content_language:'tr', level:'A1', outcome:'correct',
    activity_id:'DE-A1-G09', exercise_id:'q-1', attempt_number:2 });
  assert.deepEqual(sanitizeLearningEvent('study_time', { duration_seconds:30, activity_id:'bad/id', level:'unknown', result_count:-1 }), { duration_seconds:30 });
  assert.equal(sanitizeLearningEvent('arbitrary_event', {}), null);
  for (const event of ['topic_selected','level_selected','search_performed','search_no_results','hint_used',
    'answer_revealed','exercise_retried','audio_played','audio_completed','section_completed','study_time',
    'feedback_submitted','language_changed','download_clicked','app_store_clicked','learning_error']) {
    assert.notEqual(sanitizeLearningEvent(event, {}), null, event);
  }
});
