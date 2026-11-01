import { exercises, newExercise, toggleWord, checkAnswer, nextHint } from './exercise.js';

function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}


export function createSentenceBuilder(root, { language = 'tr', initialId = 'coffee' } = {}) {
  const $ = selector => root.querySelector(selector);
  const english = language === 'en';
  let state = newExercise(initialId);
  let hintVisible = false;
  function chooseWord(wordId, fromAnswer = false) {
    state = toggleWord(state, wordId);
    renderExercise();
    const target = fromAnswer ? `#word-bank [data-word="${wordId}"]` : `#answer-slots [data-word="${wordId}"]`;
    $(target)?.focus({ preventScroll: true });
  }

  function renderExercise() {
    const exercise = exercises[state.id];
    root.dataset.wordCount = exercise.answer.length;
    root.dataset.longWords = String(exercise.words.some(word => word.text.length > 11));
    if ($('.dialog-brand')) $('.dialog-brand').textContent = english ? 'Sentence practice' : ['coffee', 'tea'].includes(state.id) ? 'Kafede sipariş' : 'Cümle alıştırması';
    $('#exercise-title').textContent = exercise.title;
    $('#translation').textContent = exercise.translation;
    const slots = $('#answer-slots');
    slots.replaceChildren();
    for (let index = 0; index < exercise.answer.length; index++) {
      const item = element('li');
      const wordId = state.selected[index];
      if (wordId) {
        const word = exercise.words.find(word => word.id === wordId);
        const button = element('button', word.text, 'selected-word');
        button.classList.toggle('long-word', word.text.length > 11);
        button.type = 'button';
        button.lang = 'de';
        button.dataset.word = word.id;
        button.setAttribute('aria-label', `${word.text} — ${english ? 'remove' : 'geri al'}`);
        button.addEventListener('click', () => chooseWord(word.id, true));
        item.append(button);
      } else {
        const slot = element('span', undefined, 'empty-slot');
        slot.append(element('span', english ? `Word ${index + 1} empty` : `${index + 1}. kelime boş`, 'visually-hidden'));
        item.append(slot);
      }
      slots.append(item);
    }
    const bank = $('#word-bank');
    bank.replaceChildren();
    for (const word of exercise.words) {
      const used = state.selected.includes(word.id);
      const button = element('button', word.text, `word-tile${used ? ' used' : ''}`);
      button.classList.toggle('long-word', word.text.length > 11);
      button.type = 'button';
      button.dataset.word = word.id;
      button.disabled = used;
      button.setAttribute('aria-label', `${word.text} — ${english ? 'add to sentence' : 'cümleye ekle'}`);
      button.addEventListener('click', () => chooseWord(word.id));
      bank.append(button);
    }
    const messages = {
      idle: '',
      incomplete: english ? 'Choose all the words to finish your sentence.' : 'Önce üç kelimeyi de seçerek cümleyi tamamla.',
      incorrect: english ? 'Not quite. Select a word in your answer to return it, then try a different order.' : 'Henüz olmadı. Kelimelere basarak sıralamayı değiştirebilirsin.',
      correct: `${english ? 'Correct!' : 'Doğru!'} ${exercise.sentence} — ${exercise.translation}`,
    };
    $('#feedback').textContent = messages[state.status];
    $('#feedback').dataset.status = state.status;
    $('#check-answer').textContent = english ? (state.status === 'correct' ? (exercise.next ? 'Another sentence' : 'Try again') : 'Check sentence') : state.status === 'correct' ? (['coffee', 'tea'].includes(state.id) ? 'Bir cümle daha' : 'Yeniden dene') : 'Cümleyi kontrol et';
    $('#reset-exercise').hidden = state.selected.length === 0;
    $('#hint').hidden = !hintVisible;
    $('#hint-toggle').setAttribute('aria-expanded', String(hintVisible));
    $('#hint-toggle').textContent = english ? (hintVisible ? 'Hide hint' : 'Show hint') : hintVisible ? 'İpucunu gizle' : 'İpucu göster';
    if (hintVisible) $('#hint').textContent = nextHint(state);
  }

  $('#check-answer').addEventListener('click', () => {
    if (state.status === 'correct') {
      state = newExercise(exercises[state.id].next || (state.id === 'coffee' ? 'tea' : state.id === 'tea' ? 'coffee' : state.id));
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


  renderExercise();
  return { reset(id = initialId) { state = newExercise(id); hintVisible = false; renderExercise(); } };
}
