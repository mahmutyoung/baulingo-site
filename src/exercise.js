import { englishExercises } from './english-exercises.js';

export const exercises = {
  ...englishExercises,
  coffee: {
    title: 'Bir kahve isteyelim.',
    translation: 'Bir kahve, lütfen.',
    sentence: 'Einen Kaffee, bitte.',
    words: [
      { id: 'bitte', text: 'bitte.' },
      { id: 'einen', text: 'Einen' },
      { id: 'coffee', text: 'Kaffee,' },
    ],
    answer: ['einen', 'coffee', 'bitte'],
  },
  articles: { title: 'Artikeli isimle kullan.', translation: 'Kahvenin tadı güzel.', sentence: 'Der Kaffee schmeckt.', words: [{ id: 'kaffee', text: 'Kaffee' }, { id: 'der', text: 'Der' }, { id: 'schmeckt', text: 'schmeckt.' }], answer: ['der', 'kaffee', 'schmeckt'] },
  cases: { title: 'Akkusativ ile bir cümle kur.', translation: 'Bir kahve, lütfen.', sentence: 'Einen Kaffee, bitte.', words: [{ id: 'bitte', text: 'bitte.' }, { id: 'einen', text: 'Einen' }, { id: 'kaffee', text: 'Kaffee,' }], answer: ['einen', 'kaffee', 'bitte'] },
  'word-order': { title: 'Fiili ikinci sıraya yerleştir.', translation: 'Bugün öğreniyorum.', sentence: 'Heute lerne ich.', words: [{ id: 'ich', text: 'ich.' }, { id: 'heute', text: 'Heute' }, { id: 'lerne', text: 'lerne' }], answer: ['heute', 'lerne', 'ich'] },
  doctor: { title: 'Doktorda şikâyetini anlat.', translation: 'Başım ağrıyor.', sentence: 'Ich habe Kopfschmerzen.', words: [{ id: 'habe', text: 'habe' }, { id: 'schmerzen', text: 'Kopfschmerzen.' }, { id: 'ich', text: 'Ich' }], answer: ['ich', 'habe', 'schmerzen'] },
  tea: {
    title: 'Şimdi de bir çay isteyelim.',
    translation: 'Bir çay, lütfen.',
    sentence: 'Einen Tee, bitte.',
    words: [
      { id: 'tea', text: 'Tee,' },
      { id: 'bitte', text: 'bitte.' },
      { id: 'einen', text: 'Einen' },
    ],
    answer: ['einen', 'tea', 'bitte'],
  },
};

export function newExercise(id = 'coffee') {
  return { id: Object.hasOwn(exercises, id) ? id : 'coffee', selected: [], status: 'idle' };
}

export function toggleWord(state, wordId) {
  if (!exercises[state.id].words.some(word => word.id === wordId)) return state;
  const selected = state.selected.includes(wordId)
    ? state.selected.filter(id => id !== wordId)
    : [...state.selected, wordId];
  return { ...state, selected, status: 'idle' };
}

export function checkAnswer(state) {
  const { answer } = exercises[state.id];
  const status = state.selected.length !== answer.length ? 'incomplete'
    : answer.every((id, index) => state.selected[index] === id) ? 'correct' : 'incorrect';
  return { ...state, status };
}

export function nextHint(state) {
  const exercise = exercises[state.id];
  const next = exercise.answer.findIndex((id, index) => state.selected[index] !== id);
  if (exercise.hints) return next === -1 ? 'Your sentence is ready. Check your answer to continue.' : exercise.hints[next];
  if (next === -1) return 'Cümlen hazır. Kontrol ederek devam edebilirsin.';
  const word = exercise.words.find(word => word.id === exercise.answer[next]);
  if (!['coffee', 'tea'].includes(state.id)) return `Sıradaki kelime “${word.text}”.`;
  if (next === 0) return '“Einen” ile başla. Kaffee ve Tee eril isimlerdir; bu istekte einen kullanılır.';
  if (next === 1) return `Sıradaki kelime “${word.text.replace(',', '')}”. Ne istediğini söyle.`;
  return 'İsteğini kibarca tamamlamak için sona “bitte” ekle.';
}
