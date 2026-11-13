// Pure practice rules. Free writing is deliberately never scored.
const normalize = value => String(value ?? '').normalize('NFC').trim().replace(/\s+/g, ' ').toLocaleLowerCase('de');
export const checkAnswer = (exercise, value) => !!normalize(value) && exercise.answers.some(answer => normalize(answer) === normalize(value));
export const checkResponses = (items, values) => items.map((item,index) => !item.answers || !normalize(values[index]) ? null : checkAnswer(item,values[index]));
export const remainingTime = (deadline, now = Date.now()) => Number.isFinite(deadline) && deadline > 0 ? Math.max(0, Math.ceil((deadline - now) / 1000)) : null;
export function completeLesson(progress, id, complete) {
  return { ...progress, lessons: { ...progress.lessons, [id]: { ...progress.lessons[id], complete: complete === true } } };
}
const text = value => typeof value === 'string' && value.length <= 20000 ? value : '';
const deadline = value => Number.isFinite(value) && value > 0 && value < 1e15 ? value : null;
export function restoreProgress(raw, lessons) {
  const empty = { version: 1, last: '', lessons: {} };
  try {
    const value = JSON.parse(raw);
    if (!value || value.version !== 1 || !value.lessons || Array.isArray(value.lessons) || typeof value.lessons !== 'object') return empty;
    empty.last = lessons.some(lesson => lesson.id === value.last) ? value.last : '';
    for (const lesson of lessons) {
      if (!Object.hasOwn(value.lessons, lesson.id)) continue;
      const saved = value.lessons[lesson.id];
      if (!saved || typeof saved !== 'object') continue;
      const tasks = {};
      for (const task of lesson.tasks || []) {
        const entry = saved.tasks?.[task.id];
        if (!entry || typeof entry !== 'object') continue;
        tasks[task.id] = { draft: text(entry.draft), revised: text(entry.revised),
          checks: Array.isArray(entry.checks) ? entry.checks.slice(0, 8).map(check => check === true) : [],
          plan: Array.isArray(entry.plan) ? entry.plan.slice(0, 4).map(text) : [], deadline: deadline(entry.deadline),
          responses: Array.isArray(entry.responses) ? entry.responses.slice(0, 12).map(text) : [],
          letterParts: Array.isArray(entry.letterParts) ? entry.letterParts.slice(0,8).map(value=>typeof value==='string'&&value.length<=2000?value:'') : [],
          letterStep: Number.isInteger(entry.letterStep)&&entry.letterStep>=0&&entry.letterStep<=8?entry.letterStep:0,
          letterPrevious: text(entry.letterPrevious),
          legacyChecks: Array.isArray(entry.legacyChecks) ? entry.legacyChecks.slice(0,8).map(check=>check===true) : [],
          guidanceVersion: entry.guidanceVersion===2?2:1,
          reviewed: entry.reviewed === true, updatedAt: deadline(entry.updatedAt) || 0 };
      }
      empty.lessons[lesson.id] = { complete: saved.complete === true, tasks, note: text(saved.note),
        selected: (lesson.tasks || []).some(task => task.id === saved.selected) ? saved.selected : '',
        lastTask: (lesson.tasks || []).some(task => task.id === saved.lastTask) ? saved.lastTask : '',
        deadline: deadline(saved.deadline) };
    }
    return empty;
  } catch { return empty; }
}

export function resumeTarget(progress, lessons) {
  const learning = lessons.filter(lesson=>!lesson.reference);
  const candidates = [];
  for (const lesson of learning) {
    const saved = progress.lessons[lesson.id];
    if (!saved || saved.complete) continue;
    for (const task of lesson.tasks || []) {
      const work = saved.tasks?.[task.id];
      if (!work || work.reviewed || !(work.draft?.trim() || work.letterParts?.some(value=>value.trim()) || work.revised?.trim() || work.plan?.some(value=>value.trim()) || work.responses?.some(value=>value.trim()))) continue;
      candidates.push({lessonId:lesson.id, taskId:task.id, time:work.updatedAt || 0,
        preferred:progress.last===lesson.id && saved.lastTask===task.id});
    }
  }
  candidates.sort((a,b)=>b.time-a.time || Number(b.preferred)-Number(a.preferred));
  if (candidates.length) return {lessonId:candidates[0].lessonId,taskId:candidates[0].taskId};
  const next = learning.find(lesson=>!progress.lessons[lesson.id]?.complete) || learning[0];
  return {lessonId:next?.id || '',taskId:''};
}

// Apply only changed fields to the latest stored lesson, including between tabs.
export function mergeLesson(saved = {}, local, {taskId,taskFields=[],lessonFields=[]} = {}) {
  const result={...saved,tasks:{...saved.tasks}};
  for(const [id,task] of Object.entries(local.tasks||{})) {
    const previous=result.tasks[id];
    if(task.guidanceVersion===2 && previous?.guidanceVersion!==2) {
      result.tasks[id]={...previous,guidanceVersion:2,legacyChecks:previous?.checks||task.legacyChecks||[],checks:[]};
    }
  }
  if(taskId && local.tasks?.[taskId]) {
    const patch=Object.fromEntries(taskFields.map(field=>[field,local.tasks[taskId][field]]));
    result.tasks[taskId]={...result.tasks[taskId],...patch};
  }
  for(const field of lessonFields)result[field]=local[field];
  return result;
}
