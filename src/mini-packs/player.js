import { trackLearningEvent, beginStudy, stopStudy, trackPageView, analyticsEnabled, miniPackEventContext } from '../analytics.js';
import { escapeLearningText as escape } from '../learning-text.js';
import '../language.js';
import { icon } from './icons.js';
import { sectionsFor, lessonMarkup, progressMarkup, lessonNumber } from './lesson.js';
import { matchesAnswer } from './answers.js';
import { label, language } from './language.js';
import { grammarPath, lessonPath, lessonTitle, readerPath } from './routes.js';

const levels = ['A1', 'A2', 'B1'];
const main = document.querySelector('#main-content');
const libraryPath = readerPath(language);
const canonical = document.querySelector('link[rel="canonical"]');
const description = document.querySelector('meta[name="description"]');
const initialDescription = description.content;
const alternates = [...document.querySelectorAll('head link[rel="alternate"]')];
const publishedReader = main.hasAttribute('data-reader') ||
  (main.classList.contains('lesson-preview') && alternates.length > 0);
const grammarTrack = publishedReader ? main.hasAttribute('data-grammar') : location.pathname.startsWith(grammarPath(language));
const trackContext = miniPackEventContext(grammarTrack, language);
const initialTitle = document.title;
const progress = new Map();
let sidebar, picker, alternateLanguage, topics, outline;
let library;
let active;
let buttons;

function updateProgress(completed, sections) {
  const finished = sections.filter(([id]) => completed.has(id)).length;
  for (const bar of document.querySelectorAll('progress')) bar.value = finished;
  for (const counter of document.querySelectorAll('[data-progress-count]')) counter.textContent = `${finished} / ${sections.length}`;
  for (const link of outline.querySelectorAll('a')) {
    const section = sections.find(([id]) => id === link.hash.slice(1));
    const done = completed.has(section[0]);
    const badge = link.firstElementChild;
    badge.classList.toggle('outline-done', done);
    badge.innerHTML = icon(done ? 'check' : section[2], 15);
  }
}

function initializeExercise(form, exercise, completed, complete, context, start) {
  let attempts = 0;
  const exerciseContext = { ...context, exercise_id: exercise.id };
  const inputs = [...form.querySelectorAll('input')];
  const actions = form.querySelector('.exercise-actions');
  const check = actions.querySelector('.primary');
  const feedback = form.querySelector('.feedback');
  const finish = form.querySelector('[data-finish-review]');
  const indicator = form.querySelector('[data-exercise-done]');
  const id = 'practice/' + exercise.id;
  const read = () => exercise.options.length ? inputs.find(input => input.checked)?.value ?? '' : inputs[0].value;
  const mark = () => {
    indicator.hidden = false;
    finish.hidden = true;
    complete(id);
  };
  indicator.hidden = !completed.has(id);
  form.addEventListener('input', () => {
    check.disabled = !read().trim();
    feedback.hidden = true;
    for (const input of inputs) {
      if (input.type === 'radio') input.parentElement.classList.toggle('selected', input.checked);
    }
  });
  function showResult(heading) {
    for (const input of inputs) input.disabled = true;
    actions.hidden = true;
    feedback.classList.remove('feedback-retry');
    feedback.innerHTML = `<strong>${heading}</strong><p lang="de">${escape(exercise.answers.join(' / '))}</p><p>${escape(exercise.explanation)}</p>`;
    feedback.hidden = false;
  }
  function focusFeedback() {
    feedback.tabIndex = -1;
    feedback.focus();
  }
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (actions.hidden || check.disabled) return;
    start(); attempts++;
    const correct = matchesAnswer(read(), exercise.answers);
    if (attempts > 1) trackLearningEvent('exercise_retried', { ...exerciseContext, attempt_number: attempts });
    trackLearningEvent('exercise_answered', { ...exerciseContext, outcome: correct ? 'correct' : 'incorrect', attempt_number: attempts });
    if (correct) {
      showResult(label('Correct!', 'Doğru!'));
      mark();
      focusFeedback();
    } else {
      feedback.classList.add('feedback-retry');
      feedback.innerHTML = `<strong>${label('Try again or reveal the answer.', 'Tekrar dene veya cevabı aç.')}</strong>`;
      feedback.hidden = false;
    }
  });
  form.querySelector('[data-show-answer]').addEventListener('click', () => {
    start(); trackLearningEvent('answer_revealed', exerciseContext);
    showResult(label('Answer key', 'Cevap anahtarı'));
    finish.hidden = completed.has(id);
    focusFeedback();
  });
  finish.addEventListener('click', () => { mark(); focusFeedback(); });
}

function initializeChallenge(panel, completed, complete) {
  const checks = [...panel.querySelectorAll('input')];
  const finish = panel.querySelector('.primary');
  function showComplete() {
    for (const check of checks) {
      check.checked = true;
      check.disabled = true;
    }
    finish.disabled = true;
    finish.lastElementChild.textContent = label('Challenge complete', 'Görev tamamlandı');
  }
  if (completed.has('challenge')) showComplete();
  panel.addEventListener('change', () => { finish.disabled = !checks.every(check => check.checked); });
  finish.addEventListener('click', () => { complete('challenge'); showComplete(); });
}

function initializeScenario(panel, id, completed, complete, context) {
  const form = panel.querySelector('form');
  const response = panel.querySelector('textarea');
  const review = form.querySelector('button');
  const checklist = panel.querySelector('fieldset');
  const checks = [...checklist.querySelectorAll('input')];
  const model = panel.querySelector('details');
  const finish = panel.querySelector('[data-finish-scenario]');
  const success = panel.querySelector('[role="status"]');
  if (completed.has(id)) {
    form.hidden = true;
    model.hidden = false;
    success.hidden = false;
    return;
  }
  function updateFinish() {
    finish.disabled = !response.value.trim() || !checks.every(check => check.checked);
  }
  response.addEventListener('input', () => {
    review.disabled = !response.value.trim();
    for (const check of checks) check.checked = false;
    updateFinish();
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (review.disabled || review.hidden) return;
    review.hidden = true;
    checklist.hidden = false;
    model.hidden = false;
    finish.hidden = false;
    checks[0].focus();
  });
  checklist.addEventListener('change', updateFinish);
  model.addEventListener('toggle', () => { if (model.open && !completed.has(id)) trackLearningEvent('answer_revealed', { ...context, section_id: id }); });
  finish.addEventListener('click', () => {
    complete(id);
    response.disabled = true;
    for (const check of checks) check.disabled = true;
    finish.hidden = true;
    success.hidden = false;
    success.tabIndex = -1;
    success.focus();
  });
}

function renderTopics(level) {
  const entries = library.filter(({ pack }) => pack.cefr === level);
  topics.setAttribute('aria-label', `${level} ${label('lesson topics', 'ders konuları')}`);
  topics.innerHTML = entries.map(({ pack, title = pack.title, icon: topicIcon, category, sequelTo }, index) => `
    <a href="${lessonPath(pack.id, language)}" data-topic="${pack.id}">
      <span class="topic-symbol">${icon(topicIcon, 18)}</span>
      <span class="topic-label"><small>${label('Lesson', 'Ders')} ${lessonNumber(index)}${sequelTo ? label(' · A1 sequel', ' · A1 devamı') : ''}</small>
      <strong>${escape(title)}</strong>${category ? `<small>${escape(category)}</small>` : ''}</span>
      <span class="topic-angle">${icon('angle', 15)}</span>
    </a>`).join('');
  buttons = [...topics.querySelectorAll('a')];
}

function render(record) {
  const { pack } = record;
  if (active?.pack.id === pack.id) return;
  if (active?.pack.cefr !== pack.cefr) renderTopics(pack.cefr);
  stopStudy();
  active = record;
  const context = { ...trackContext, activity_id: pack.id, level: pack.cefr };
  trackLearningEvent('topic_selected', context);
  for (const button of picker.children) button.setAttribute('aria-pressed', String(button.textContent === pack.cefr));
  for (const button of buttons) {
    if (button.dataset.topic === pack.id) button.setAttribute('aria-current', 'true');
    else button.removeAttribute('aria-current');
  }

  const sections = sectionsFor(pack);
  const index = buttons.findIndex(button => button.dataset.topic === pack.id);
  const completed = progress.get(pack.id) ?? new Set();
  progress.set(pack.id, completed);
  outline.innerHTML = `<div class="side-rule"></div><div class="sidebar-caption">${label('In this lesson', 'Bu derste')}</div>
    <nav class="outline" aria-label="${label('Lesson sections', 'Ders bölümleri')}">${sections.map(([id, name]) => `<a href="#${id}"><span></span>${name}</a>`).join('')}</nav>
    ${progressMarkup('sidebar-progress', sections.length)}`;
  main.innerHTML = lessonMarkup(record, index, sections);
  const counter = main.querySelector('[data-exercise-count]');
  function update() {
    const exercisesDone = pack.exercises.filter(exercise => completed.has('practice/' + exercise.id)).length;
    counter.textContent = exercisesDone;
    if (exercisesDone === pack.exercises.length) completed.add('practice');
    updateProgress(completed, sections);
  }
  let finished = sections.every(([id]) => completed.has(id));
  const start = () => { if (!finished) beginStudy(context); };
  main.oninput = start;
  main.onclick = event => { if (event.target.closest('button, summary, input, textarea')) start(); };
  function complete(id) {
    if (completed.has(id)) return;
    start();
    const practiceWasComplete = completed.has('practice');
    completed.add(id);
    update();
    if (!id.startsWith('practice/')) trackLearningEvent('section_completed', { ...context, section_id: id });
    if (!practiceWasComplete && completed.has('practice')) trackLearningEvent('section_completed', { ...context, section_id: 'practice' });
    if (!finished && sections.every(([section]) => completed.has(section))) {
      finished = true;
      trackLearningEvent('learning_completed', { ...context, completion_type: 'self_review' });
      stopStudy();
      if (analyticsEnabled()) {
        const panel = document.createElement('section');
        panel.className = 'panel';
        const prompt = document.createElement('p');
        prompt.textContent = label('Was this lesson useful?', 'Bu ders faydalı mıydı?');
        panel.append(prompt);
        for (const [feedback, text] of [['helpful', label('Yes', 'Evet')], ['not_helpful', label('No', 'Hayır')]]) {
          const button = document.createElement('button'); button.type = 'button'; button.className = 'text-button'; button.textContent = text;
          button.addEventListener('click', () => {
            trackLearningEvent('feedback_submitted', { ...context, feedback });
            panel.replaceChildren(document.createTextNode(label('Thank you.', 'Teşekkürler.')));
          }, { once: true });
          panel.append(button);
        }
        main.append(panel);
      }
    }
  }
  update();
  for (const button of main.querySelectorAll('[data-review]')) {
    const id = button.closest('section').id;
    function showReviewed() {
      button.disabled = true;
      button.classList.add('reviewed');
      button.lastElementChild.textContent = label('Reviewed', 'Gözden geçirildi');
    }
    if (completed.has(id)) showReviewed();
    button.addEventListener('click', () => { complete(id); showReviewed(); });
  }
  for (const form of main.querySelectorAll('[data-exercise]')) {
    initializeExercise(form, pack.exercises[form.dataset.exercise], completed, complete, context, start);
  }
  if (pack.scenario) initializeScenario(main.querySelector('.scenario-response'), sections.at(-1)[0], completed, complete, context);
  else initializeChallenge(main.querySelector('.challenge'), completed, complete);
  sidebar.hidden = false;
}

function fromLocation() {
  const query = new URLSearchParams(location.search);
  return library.find(({ pack }) => lessonPath(pack.id, language) === location.pathname)
    ?? library.find(({ pack }) => pack.id === query.get('topic'))
    ?? library.find(({ pack }) => pack.cefr === query.get('level')) ?? library[0];
}

function canonicalize(record) {
  const url = new URL(location.href);
  const path = lessonPath(record.pack.id, language);
  if (url.pathname === libraryPath && url.searchParams.get('topic') === record.pack.id) {
    url.pathname = path;
    url.searchParams.delete('topic');
    url.searchParams.delete('level');
    history.replaceState(null, '', url);
  }
  const lesson = url.pathname === path;
  canonical.href = new URL(lesson ? path : libraryPath, 'https://baulingo.app');
  description.content = lesson ? record.pack.objective : initialDescription;
  document.title = lesson ? lessonTitle(record.pack, language)
    : publishedReader ? initialTitle : `${record.pack.title} · Baulingo`;
  for (const link of alternates) {
    if (publishedReader) {
      link.href = new URL(lesson ? lessonPath(record.pack.id, link.hreflang) : readerPath(link.hreflang), canonical.href);
    } else if (lesson) link.remove();
    else if (!link.isConnected) document.head.append(link);
  }
}

function showLocation() {
  const record = fromLocation();
  canonicalize(record);
  trackPageView();
  render(record);
  updateLanguageLink();
  if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView();
  else window.scrollTo({ top: 0, behavior: 'instant' });
}

function updateLanguageLink() {
  if (!active) return;
  const url = new URL(alternateLanguage.href);
  url.pathname = lessonPath(active.pack.id, alternateLanguage.hreflang);
  url.searchParams.delete('topic');
  url.hash = location.hash;
  alternateLanguage.href = url.href;
}

function select(record) {
  if (!record || active === record) return;
  const url = new URL(location.href);
  url.pathname = lessonPath(record.pack.id, language);
  url.searchParams.delete('topic');
  url.searchParams.delete('level');
  url.hash = '';
  history.pushState(null, '', url);
  showLocation();
  const selected = topics.querySelector('[aria-current]');
  selected.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'instant' });
}

async function loadLibrary() {
  if (!main.classList.contains('lesson-preview')) {
    main.innerHTML = `<p class="loading" role="status">${label('Loading lesson…', 'Ders yükleniyor…')}</p>`;
  }
  try {
    const archive = (grammarTrack ? 'grammar' : 'library') + label('.gz', '-tr.gz');
    const [response, shell] = await Promise.all([fetch(`/src/mini-packs/${archive}`), readShell()]);
    if (!response.ok) throw new Error('Library request failed');
    const data = new Response(response.body.pipeThrough(new DecompressionStream('gzip')));
    library = await data.json();
    if (!sidebar) connectReader(shell);
    showLocation();
  } catch {
    trackLearningEvent('learning_error', { ...trackContext, error_code: 'library_failed' });
    if (!main.classList.contains('lesson-preview')) main.replaceChildren();
    main.insertAdjacentHTML('beforeend', `<section class="panel loading" data-load-error>
      <p role="alert">${label('The interactive lesson could not load.', 'Etkileşimli ders yüklenemedi.')}</p>
      <button type="button" class="primary">${label('Try again', 'Tekrar dene')}</button></section>`);
    const error = main.querySelector('[data-load-error]');
    error.querySelector('button').addEventListener('click', () => { error.remove(); loadLibrary(); }, { once: true });
  }
}

async function readShell() {
  if (document.querySelector('.sidebar')) return null;
  const url = new URL(libraryPath, location.origin);
  const review = new URLSearchParams(location.search).get('__review');
  if (review) url.searchParams.set('__review', review);
  const response = await fetch(url);
  if (!response.ok) throw new Error('Lesson reader request failed');
  return new DOMParser().parseFromString(await response.text(), 'text/html');
}

function connectReader(shell) {
  if (shell) {
    const workspace = shell.querySelector('.workspace');
    main.className = 'min-w-0';
    main.tabIndex = -1;
    workspace.querySelector('main').replaceWith(main);
    document.body.prepend(shell.querySelector('.skip'), shell.querySelector('header'), workspace, shell.querySelector('footer'));
  }
  sidebar = document.querySelector('.sidebar');
  picker = sidebar.querySelector('.level-picker');
  alternateLanguage = sidebar.querySelector('.language-picker a[hreflang]');
  alternateLanguage.dataset.languageChoice = alternateLanguage.hreflang;
  topics = sidebar.querySelector('.topic-list');
  outline = sidebar.querySelector('#lesson-outline');
  document.querySelector('.brand').insertAdjacentHTML('afterbegin', `<span class="brand-icon">${icon('book', 20)}</span>`);
  const nav = document.querySelectorAll('.top-nav a');
  if (grammarTrack) {
    const url = new URL(nav[0].href);
    url.pathname = grammarPath(language);
    nav[0].href = url;
    nav[0].textContent = label('Grammar', 'Gramer');
  }
  nav[0].insertAdjacentHTML('afterbegin', icon('book', 16));
  nav[1].insertAdjacentHTML('afterbegin', icon('angle', 16));
  picker.innerHTML = levels.map(level => `<button type="button" aria-pressed="false">${level}</button>`).join('');
  picker.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (button && button.getAttribute('aria-pressed') === 'false') {
      trackLearningEvent('level_selected', { ...trackContext, level: button.textContent });
      select(library.find(({ pack }) => pack.cefr === button.textContent));
    }
  });
  topics.addEventListener('click', event => {
    const link = event.target.closest('a[data-topic]');
    if (!link || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    select(library.find(({ pack }) => pack.id === link.dataset.topic));
  });
  window.addEventListener('popstate', showLocation);
  window.addEventListener('hashchange', updateLanguageLink);
}

loadLibrary();
