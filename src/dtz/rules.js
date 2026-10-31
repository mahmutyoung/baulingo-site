import { examData } from './content.js';

const stages = ['listening', 'reading', 'writing', 'speaking', 'result'];
const questions = Object.fromEntries(['listening', 'reading'].map(section => [section,
  examData[`${section}Tasks`].filter(task => !task.isExample).flatMap(task => task.questions),
]));
const allQuestions = [...questions.listening, ...questions.reading];
const byId = new Map(allQuestions.map(question => [question.id, question]));
const validTime = value => Number.isSafeInteger(value) && value >= 0;

export function createAttempt(now) {
  return { version: 1, exam: examData.id, startedAt: now, phase: 'listening', deadline: null,
    answers: {}, writing: '', prompt: 'a', candidate: 'a', listeningFinished: false };
}

export function selectAnswer(attempt, id, answer) {
  const question = questions[attempt.phase]?.find(item => item.id === id);
  if (!question || (attempt.phase === 'listening' && attempt.listeningFinished) || !Number.isInteger(answer) || answer < 0 || answer >= question.choices.length) return attempt;
  return { ...attempt, answers: { ...attempt.answers, [id]: answer } };
}

export function finishListening(attempt) {
  return attempt.phase === 'listening' ? { ...attempt, listeningFinished: true } : attempt;
}

export function nextSection(attempt, now) {
  if (attempt.phase === 'listening' && !attempt.listeningFinished) return attempt;
  const index = stages.indexOf(attempt.phase);
  if (index < 0 || index === stages.length - 1) return attempt;
  const phase = stages[index + 1];
  const minutes = phase === 'reading' ? 45 : phase === 'writing' ? 30 : 0;
  return { ...attempt, phase, deadline: minutes ? now + minutes * 60_000 : null };
}

export function remainingSeconds(attempt, now) {
  return attempt.deadline === null ? null : Math.max(0, Math.ceil((attempt.deadline - now) / 1000));
}

export function syncClock(attempt, now) {
  let next = attempt;
  // Carry the original deadline forward: a background tab does not earn extra time.
  while (['reading', 'writing'].includes(next.phase) && next.deadline !== null && now >= next.deadline) {
    next = nextSection(next, next.deadline);
  }
  return next;
}

export function scoreAttempt(attempt) {
  const count = section => questions[section].filter(q => attempt.answers[q.id] === q.correctAnswer).length;
  const listening = count('listening'), reading = count('reading'), total = listening + reading;
  return { listening, reading, total, level: total >= 33 ? 'B1' : total >= 20 ? 'A2' : 'unter A2' };
}

export function validateAttempt(value) {
  if (!value || Array.isArray(value) || value.version !== 1 || value.exam !== examData.id || !stages.includes(value.phase) || !validTime(value.startedAt)) return null;
  if (!['a', 'b'].includes(value.prompt) || !['a', 'b'].includes(value.candidate) || typeof value.listeningFinished !== 'boolean') return null;
  if (value.phase !== 'listening' && !value.listeningFinished) return null;
  if (['reading', 'writing'].includes(value.phase) ? !validTime(value.deadline) || value.deadline < value.startedAt : value.deadline !== null) return null;
  if (typeof value.writing !== 'string' || value.writing.length > 20_000 || !value.answers || Array.isArray(value.answers) || typeof value.answers !== 'object') return null;
  for (const [id, answer] of Object.entries(value.answers)) {
    const q = byId.get(id);
    if (!q || !Number.isInteger(answer) || answer < 0 || answer >= q.choices.length) return null;
  }
  // Return only our schema; never restore arbitrary properties from browser storage.
  return { version: 1, exam: value.exam, startedAt: value.startedAt, phase: value.phase, deadline: value.deadline,
    answers: { ...value.answers }, writing: value.writing, prompt: value.prompt, candidate: value.candidate, listeningFinished: value.listeningFinished };
}
