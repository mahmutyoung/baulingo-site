import test from 'node:test';
import assert from 'node:assert/strict';
import { checkAnswer, restoreProgress, completeLesson, remainingTime, resumeTarget, checkResponses, mergeLesson } from '../src/writing/rules.js';

test('writing activities accept normalized German answers and reject empty or incorrect answers', () => {
  const exercise = { answers: ['Sehr geehrte Frau Roth,'] };
  assert.equal(checkAnswer(exercise, '  sehr  geehrte Frau Roth, '), true);
  assert.equal(checkAnswer(exercise, 'Liebe Frau Roth,'), false);
  assert.equal(checkAnswer(exercise, ''), false);
  assert.equal(checkAnswer({ answers: ['Straße'] }, 'STRASSE'), false);
});

test('writing progress recovers malformed data and whitelists current lesson and task IDs', () => {
  const lessons = [{ id: 'ton', tasks: [{ id: 'one' }, { id: 'two' }] }, { id: 'schule', tasks: [] }];
  for (const raw of ['', 'bad JSON', 'null', '[]', '{"version":9}']) {
    assert.deepEqual(restoreProgress(raw, lessons), { version: 1, last: '', lessons: {} });
  }
  const restored = restoreProgress(JSON.stringify({ version: 1, last: 'ton', lessons: {
    ton: { complete: true, tasks: { one: { draft: 'Mein Brief', revised: 'Besser', checks: [true, false], deadline: 1234 }, two: { draft: 'Anderer Brief' }, unknown: { draft: 'ignored' } } },
    foreign: { complete: true },
  } }), lessons);
  assert.equal(restored.last, 'ton');
  assert.equal(restored.lessons.ton.tasks.one.draft, 'Mein Brief');
  assert.equal(restored.lessons.ton.tasks.two.draft, 'Anderer Brief');
  assert.equal(restored.lessons.foreign, undefined);
  assert.equal(restored.lessons.ton.tasks.unknown, undefined);
  assert.equal(restored.lessons.ton.tasks.one.deadline, 1234);
  assert.equal(restoreProgress(JSON.stringify({version:1,last:'unknown',lessons:{ton:{tasks:{one:{draft:'x'.repeat(20001),deadline:Infinity}}}}}),lessons).lessons.ton.tasks.one.draft, '');
});

test('only deliberate lesson completion affects progress and preserves separate drafts', () => {
  const original = { version: 1, last: 'ton', lessons: { ton: { tasks: { one: { draft: 'abc' } } } } };
  const complete = completeLesson(original, 'ton', true);
  assert.equal(complete.lessons.ton.complete, true);
  assert.equal(original.lessons.ton.complete, undefined);
  assert.equal(complete.lessons.ton.tasks.one.draft, 'abc');
  assert.equal(completeLesson(complete, 'ton', false).lessons.ton.complete, false);
});

test('practice timer uses an absolute deadline, catches up after reload and never locks writing', () => {
  assert.equal(remainingTime(null, 1000), null);
  assert.equal(remainingTime(61000, 1000), 60);
  assert.equal(remainingTime(61000, 61001), 0);
});

test('structured response migration preserves legacy writing, checks and bounded answers', () => {
  const lessons = [{id:'ton',tasks:[{id:'c1-t1'}]}];
  const result = restoreProgress(JSON.stringify({version:1,last:'ton',lessons:{ton:{lastTask:'c1-t1',tasks:{'c1-t1':{draft:'Eski yanıt',responses:['formell',42,'x'.repeat(20001)],reviewed:true,updatedAt:123}}}}}),lessons);
  const task=result.lessons.ton.tasks['c1-t1'];
  assert.equal(task.draft,'Eski yanıt');
  assert.deepEqual(task.responses,['formell','','']);
  assert.equal(task.reviewed,true);
  assert.equal(result.lessons.ton.lastTask,'c1-t1');
});

test('resume chooses unfinished meaningful work over a visited reference or a completed lesson', () => {
  const lessons=[{id:'first',tasks:[{id:'a'},{id:'b'}]},{id:'second',tasks:[{id:'c'}]},{id:'reference',reference:true,tasks:[]}];
  const progress={version:1,last:'reference',lessons:{first:{complete:true,tasks:{a:{draft:'done'}}},second:{tasks:{c:{responses:['still working'],updatedAt:20}}},reference:{note:'read'}}};
  assert.deepEqual(resumeTarget(progress,lessons),{lessonId:'second',taskId:'c'});
  progress.lessons.second.tasks.c.reviewed=true;
  assert.deepEqual(resumeTarget(progress,lessons),{lessonId:'second',taskId:''});
  assert.deepEqual(resumeTarget({lessons:{}},lessons),{lessonId:'first',taskId:''});
});

test('structured checking reports each item independently and never grades free writing', () => {
  const items=[{answers:['formell']},{answers:['geehrter']},{answers:['A B C']}];
  assert.deepEqual(checkResponses(items,['formell','geehrte','']),[true,false,null]);
  assert.deepEqual(checkResponses([{label:'Kendi cümlen'}],['another valid sentence']),[null]);
});

test('saving one tab task or checkbox retains another tabs text and lesson metadata', () => {
  const fresh={complete:true,selected:'b',deadline:123,tasks:{a:{draft:'new from tab A',revised:'new revision',guidanceVersion:2},b:{draft:'new from tab B',guidanceVersion:2}}};
  const stale={complete:false,selected:'a',tasks:{a:{draft:'stale',checks:[true],guidanceVersion:2},b:{draft:'my edit',guidanceVersion:2}}};
  const checkbox=mergeLesson(fresh,stale,{taskId:'a',taskFields:['checks']});
  assert.equal(checkbox.tasks.a.draft,'new from tab A');
  assert.equal(checkbox.tasks.a.revised,'new revision');
  assert.equal(checkbox.complete,true);
  const text=mergeLesson(checkbox,stale,{taskId:'b',taskFields:['draft'],lessonFields:['complete']});
  assert.equal(text.tasks.a.draft,'new from tab A');
  assert.equal(text.tasks.b.draft,'my edit');
  assert.equal(text.deadline,123);
  assert.equal(text.selected,'b');
  assert.equal(text.complete,false);
  assert.equal(fresh.tasks.b.draft,'new from tab B');
});
