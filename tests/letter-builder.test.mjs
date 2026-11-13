import test from 'node:test';
import assert from 'node:assert/strict';
import { assembleLetter, editLetterPart, transferLetterParts, letterStartStep } from '../src/writing/letter-rules.js';
import { restoreProgress, mergeLesson, resumeTarget } from '../src/writing/rules.js';

test('letter assembly preserves section order without filling blank answers', () => {
  const parts=['Sehr geehrter Herr Brandt,','ich interessiere mich für den Kurs.','Ich möchte lernen.','Ich habe A2.','Wann beginnt der Kurs?','Wie viel kostet er?','Mit freundlichen Grüßen','Mina'];
  assert.equal(assembleLetter(parts),'Sehr geehrter Herr Brandt,\n\nich interessiere mich für den Kurs.\n\nIch möchte lernen.\n\nIch habe A2.\n\nWann beginnt der Kurs?\n\nWie viel kostet er?\n\nMit freundlichen Grüßen\nMina');
  assert.equal(assembleLetter(['','Mein Satz.']),'Mein Satz.');
  assert.equal(assembleLetter([]),'');
});

test('editing guided parts synchronizes a generated draft but preserves independently edited text', () => {
  const first=editLetterPart({draft:'',letterParts:[]},0,'Liebe Aylin,');
  const second=editLetterPart(first,1,'vielen Dank.');
  assert.equal(second.draft,'Liebe Aylin,\n\nvielen Dank.');
  const edited={...second,draft:'Meine eigene überarbeitete Fassung'};
  const third=editLetterPart(edited,2,'Ich komme gern.');
  assert.equal(third.draft,edited.draft);
  assert.equal(third.letterParts[2],'Ich komme gern.');
  assert.equal(second.letterParts[2],'');
  const transferred=transferLetterParts(third);
  assert.equal(transferred.draft,assembleLetter(third.letterParts));
  assert.equal(transferred.letterPrevious,edited.draft);
});

test('old drafts open at review and guided progress resumes at its saved step', () => {
  assert.equal(letterStartStep({draft:'Alte Fassung'}),8);
  assert.equal(letterStartStep({draft:''}),0);
  assert.equal(letterStartStep({draft:'Liebe Aylin,',letterParts:['Liebe Aylin,'],letterStep:3}),3);
  assert.equal(letterStartStep({draft:'Manuell geändert',letterParts:['Liebe Aylin,'],letterStep:3}),3);
});

test('guided parts survive validation, merging and resuming without dropping an older draft', () => {
  const lessons=[{id:'guided',tasks:[{id:'one'},{id:'two'}]}];
  const raw={version:1,last:'guided',lessons:{guided:{tasks:{one:{draft:'Existing',letterParts:['Liebe Aylin,',42,'x'.repeat(20001)],letterStep:3,letterPrevious:'Before',updatedAt:100}}}}};
  const progress=restoreProgress(JSON.stringify(raw),lessons);
  const task=progress.lessons.guided.tasks.one;
  assert.equal(task.draft,'Existing');
  assert.deepEqual(task.letterParts.slice(0,3),['Liebe Aylin,','','']);
  assert.equal(task.letterStep,3);
  assert.equal(task.letterPrevious,'Before');
  const merged=mergeLesson({tasks:{one:task,two:{draft:'Other tab'}}},{tasks:{one:{...task,letterStep:4}}},{taskId:'one',taskFields:['letterStep']});
  assert.equal(merged.tasks.one.draft,'Existing');
  assert.equal(merged.tasks.two.draft,'Other tab');
  const partial={lessons:{guided:{tasks:{one:{letterParts:['Only a section'],updatedAt:200}}}}};
  assert.deepEqual(resumeTarget(partial,lessons),{lessonId:'guided',taskId:'one'});
});
