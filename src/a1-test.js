import { trackLearningEvent, beginStudy, stopStudy } from './analytics.js';
const context = { activity_id: 'a1-practice-test', activity_type: 'a1_test', level: 'A1', content_language: 'tr' };
const form = document.querySelector('[data-a1-test]');
const questions = [...form.querySelectorAll('fieldset')].map(field => ({
  field,
  choices: [...field.querySelectorAll('input')],
  feedback: field.querySelector('details'),
  lesson: field.querySelector('[data-review-lesson]'),
}));
const submit = form.querySelector('[type="submit"]');
const result = form.querySelector('[data-result]');
const score = form.querySelector('[data-score]');
const summary = form.querySelector('[data-summary]');
const recommended = form.querySelector('[data-recommended]');

function prepare() {
  for (const { field, choices, feedback, lesson } of questions) {
    field.classList.remove('a1-correct', 'a1-retry');
    feedback.hidden = true;
    feedback.open = false;
    lesson.hidden = false;
    for (const choice of choices) choice.disabled = false;
  }
  submit.hidden = false;
  result.hidden = true;
}

form.addEventListener('change', () => { if (result.hidden) beginStudy(context); });
form.addEventListener('submit', event => {
  event.preventDefault();
  if (!result.hidden || !form.reportValidity()) return;
  beginStudy(context);
  let correct = 0;
  const missed = new Map();
  for (const { field, choices, feedback, lesson } of questions) {
    const passed = choices.some(choice => choice.checked && choice.value === field.dataset.answer);
    if (passed) correct++;
    trackLearningEvent('exercise_answered', { ...context, exercise_id: 'question-' + (questions.findIndex(q => q.field === field) + 1), outcome: passed ? 'correct' : 'incorrect' });
    field.classList.toggle('a1-correct', passed);
    field.classList.toggle('a1-retry', !passed);
    feedback.querySelector('summary').textContent = passed ? 'Doğru · Açıklama' : 'Yanlış · Doğru cevap ve açıklama';
    feedback.hidden = false;
    feedback.open = !passed;
    lesson.hidden = passed;
    if (!passed) {
      const link = lesson.querySelector('a');
      missed.set(link.href, link);
    }
    for (const choice of choices) choice.disabled = true;
  }
  score.textContent = `Sonucun: ${correct} / ${questions.length} doğru`;
  summary.textContent = correct === questions.length
    ? 'Tüm soruları doğru yanıtladın.'
    : 'Kaçırdığın soruların altında açıklamalar ve ilgili dersler var.';
  recommended.replaceChildren(...Array.from(missed.values(), link => {
    const item = document.createElement('li');
    item.append(link.cloneNode(true));
    return item;
  }));
  recommended.hidden = !missed.size;
  submit.hidden = true;
  result.hidden = false;
  trackLearningEvent('learning_completed', { ...context, completion_type: 'checked', questions_answered: questions.length, correct_answers: correct });
  stopStudy();
  score.focus();
});

form.addEventListener('reset', () => {
  trackLearningEvent('exercise_retried', context);
  stopStudy(); prepare();
  questions[0].choices[0].focus();
});
prepare();
