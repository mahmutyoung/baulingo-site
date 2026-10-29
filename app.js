import { exercises, newExercise, toggleWord, checkAnswer, nextHint } from './src/exercise.js';
import { topics, searchTopics } from './src/topics.js';

const $ = selector => document.querySelector(selector);
let state = newExercise();
let hintVisible = false;
let modalTrigger = null;

function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}

function chooseWord(wordId, fromAnswer = false) {
  state = toggleWord(state, wordId);
  renderExercise();
  const target = fromAnswer ? `#word-bank [data-word="${wordId}"]` : `#answer-slots [data-word="${wordId}"]`;
  $(target)?.focus({ preventScroll: true });
}

function renderExercise() {
  const exercise = exercises[state.id];
  $('#exercise-title').textContent = exercise.title;
  $('#translation').textContent = exercise.translation;
  const slots = $('#answer-slots');
  slots.replaceChildren();
  for (let index = 0; index < 3; index++) {
    const item = element('li');
    const wordId = state.selected[index];
    if (wordId) {
      const word = exercise.words.find(word => word.id === wordId);
      const button = element('button', word.text, 'selected-word');
      button.type = 'button';
      button.lang = 'de';
      button.dataset.word = word.id;
      button.setAttribute('aria-label', `${word.text} — geri al`);
      button.addEventListener('click', () => chooseWord(word.id, true));
      item.append(button);
    } else {
      const slot = element('span', undefined, 'empty-slot');
      slot.append(element('span', `${index + 1}. kelime boş`, 'visually-hidden'));
      item.append(slot);
    }
    slots.append(item);
  }
  const bank = $('#word-bank');
  bank.replaceChildren();
  for (const word of exercise.words) {
    const used = state.selected.includes(word.id);
    const button = element('button', word.text, `word-tile${used ? ' used' : ''}`);
    button.type = 'button';
    button.dataset.word = word.id;
    button.disabled = used;
    button.setAttribute('aria-label', `${word.text} — cümleye ekle`);
    button.addEventListener('click', () => chooseWord(word.id));
    bank.append(button);
  }
  const messages = {
    idle: '',
    incomplete: 'Önce üç kelimeyi de seçerek cümleyi tamamla.',
    incorrect: 'Henüz olmadı. “Einen” ile başla; sona “bitte” ekle. Kelimelere basarak sıralamayı değiştirebilirsin.',
    correct: `Doğru! ${exercise.sentence} — ${exercise.translation}`,
  };
  $('#feedback').textContent = messages[state.status];
  $('#feedback').dataset.status = state.status;
  $('#check-answer').textContent = state.status === 'correct' ? 'Bir cümle daha' : 'Cümleyi kontrol et';
  $('#reset-exercise').hidden = state.selected.length === 0;
  $('#hint').hidden = !hintVisible;
  $('#hint-toggle').setAttribute('aria-expanded', String(hintVisible));
  $('#hint-toggle').textContent = hintVisible ? 'İpucunu gizle' : 'İpucu göster';
  if (hintVisible) $('#hint').textContent = nextHint(state);
}

$('#check-answer').addEventListener('click', () => {
  if (state.status === 'correct') {
    state = newExercise(state.id === 'coffee' ? 'tea' : 'coffee');
    hintVisible = false;
    renderExercise();
    $('#exercise-title').focus({ preventScroll: true });
  } else {
    state = checkAnswer(state);
    renderExercise();
    $('#check-answer').focus({ preventScroll: true });
  }
});
$('#hint-toggle').addEventListener('click', () => { hintVisible = !hintVisible; renderExercise(); });
$('#reset-exercise').addEventListener('click', () => {
  state = newExercise(state.id);
  hintVisible = false;
  renderExercise();
  $('#word-bank button').focus({ preventScroll: true });
});

function openDialog(dialog, trigger = document.activeElement) {
  modalTrigger = trigger;
  for (const current of document.querySelectorAll('dialog[open]')) current.close();
  dialog.showModal();
  document.body.classList.add('dialog-open');
}

function openPractice(trigger = $('#launch-practice')) {
  state = newExercise();
  hintVisible = false;
  renderExercise();
  openDialog($('#practice-dialog'), trigger);
}
for (const dialog of document.querySelectorAll('dialog')) {
  dialog.addEventListener('close', () => {
    if (document.querySelector('dialog[open]')) return;
    document.body.classList.remove('dialog-open');
    if (modalTrigger?.isConnected) modalTrigger.focus({ preventScroll: true });
  });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
}
for (const button of document.querySelectorAll('[data-open]')) {
  button.addEventListener('click', () => {
    if (button.dataset.open === 'practice-dialog') openPractice(button);
    else openDialog(document.getElementById(button.dataset.open), button);
  });
}

function openTopic(topicId, trigger = document.activeElement) {
  const topic = topics.find(topic => topic.id === topicId);
  if (!topic) return;
  $('#topic-dialog-title').textContent = topic.title;
  $('#topic-dialog-subtitle').textContent = topic.subtitle;
  const content = $('#topic-content');
  content.replaceChildren();
  for (const text of topic.paragraphs) content.append(element('p', text));
  if (topic.examples.length) {
    const list = element('ul', undefined, 'topic-examples');
    list.lang = 'de';
    for (const text of topic.examples) list.append(element('li', text));
    content.append(list);
  }
  $('#topic-practice').hidden = !topic.practice;
  const returnTarget = trigger?.closest('#search-dialog') ? $('#search-query') : trigger;
  openDialog($('#topic-dialog'), returnTarget);
  $('#topic-dialog').scrollTop = 0;
}
for (const button of document.querySelectorAll('[data-topic]')) {
  button.addEventListener('click', () => openTopic(button.dataset.topic, button));
}
$('#topic-practice').addEventListener('click', () => {
  openPractice($('#launch-practice'));
});

const phraseAudio = $('#phrase-audio');
const playButton = $('#play-phrase');
function resetAudioButton() {
  playButton.setAttribute('aria-busy', 'false');
  playButton.setAttribute('aria-label', 'Einen Kaffee, bitte. Dinle');
}
playButton.addEventListener('click', async () => {
  $('#audio-status').textContent = '';
  if (!phraseAudio.paused) {
    phraseAudio.pause();
    phraseAudio.currentTime = 0;
    resetAudioButton();
    return;
  }
  try {
    phraseAudio.currentTime = 0;
    await phraseAudio.play();
    playButton.setAttribute('aria-busy', 'true');
    playButton.setAttribute('aria-label', 'Sesi durdur');
  } catch {
    resetAudioButton();
    $('#audio-status').textContent = 'Ses açılamadı. Yeniden dene.';
  }
});
phraseAudio.addEventListener('ended', resetAudioButton);
phraseAudio.addEventListener('error', () => {
  resetAudioButton();
  $('#audio-status').textContent = 'Ses açılamadı. Yeniden dene.';
});

function renderResults() {
  const results = searchTopics($('#dialog-query').value);
  $('#search-count').textContent = `${results.length} konu bulundu.`;
  const list = $('#search-results');
  list.replaceChildren();
  for (const topic of results) {
    const item = element('li');
    const button = element('button', undefined, 'search-result');
    button.type = 'button';
    button.setAttribute('aria-haspopup', 'dialog');
    button.append(element('strong', topic.title), element('span', topic.subtitle));
    button.addEventListener('click', () => openTopic(topic.id, button));
    item.append(button);
    list.append(item);
  }
  $('#empty-search').hidden = results.length > 0;
}
function openSearch() {
  $('#dialog-query').value = $('#search-query').value;
  renderResults();
  openDialog($('#search-dialog'), $('#search-query'));
  $('#dialog-query').focus();
}
$('#topic-search').addEventListener('submit', event => { event.preventDefault(); openSearch(); });
$('#dialog-query').addEventListener('input', renderResults);
$('#dialog-query').addEventListener('keydown', event => {
  if (event.key === 'ArrowDown' || event.key === 'Enter') {
    event.preventDefault();
    $('#search-results button')?.focus();
  }
});
$('#show-all-topics').addEventListener('click', () => {
  $('#dialog-query').value = '';
  renderResults();
  $('#dialog-query').focus();
});
renderExercise();
