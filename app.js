import { createSentenceBuilder } from './src/sentence-builder.js';
import { topics, searchTopics } from './src/topics.js';

const $ = selector => document.querySelector(selector);
let modalTrigger = null;
let currentTopic = 'coffee';

function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}

const builder = createSentenceBuilder($('#practice-dialog'));

function openDialog(dialog, trigger = document.activeElement) {
  modalTrigger = trigger;
  for (const current of document.querySelectorAll('dialog[open]')) current.close();
  dialog.showModal();
  document.body.classList.add('dialog-open');
}

function openPractice(trigger = $('#launch-practice'), id = 'coffee') {
  builder.reset(id);
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
  button.addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button > 0) return;
    event.preventDefault();
    if (button.dataset.open === 'practice-dialog') openPractice(button);
    else openDialog(document.getElementById(button.dataset.open), button);
  });
}

function openTopic(topicId, trigger = document.activeElement) {
  const topic = topics.find(topic => topic.id === topicId);
  if (!topic) return;
  currentTopic = topic.id;
  $('#topic-dialog-title').textContent = topic.title;
  $('#topic-dialog-subtitle').textContent = topic.subtitle;
  const content = $('#topic-content');
  content.replaceChildren();
  for (const text of topic.paragraphs) content.append(element('p', text));
  for (const link of topic.links || []) {
    const anchor = element('a', link.label, 'button button-primary');
    anchor.href = link.href;
    const paragraph = element('p'); paragraph.append(anchor); content.append(paragraph);
  }
  if (topic.examples.length) {
    const list = element('ul', undefined, 'topic-examples');
    list.lang = 'de';
    for (const text of topic.examples) list.append(element('li', text));
    content.append(list);
  }
  $('#topic-practice').hidden = !topic.practice || topic.id === 'exams';
  const returnTarget = trigger?.closest('#search-dialog') ? $('#search-query') : trigger;
  openDialog($('#topic-dialog'), returnTarget);
  $('#topic-dialog').scrollTop = 0;
}
for (const button of document.querySelectorAll('[data-topic]')) {
  button.addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button > 0) return;
    event.preventDefault();
    openTopic(button.dataset.topic, button);
  });
}
$('#topic-practice').addEventListener('click', () => {
  openPractice($('#launch-practice'), currentTopic);
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
if (location.hash === '#alistirma') openPractice($('#launch-practice'), new URLSearchParams(location.search).get('practice') || 'coffee');
