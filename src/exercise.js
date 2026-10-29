export const exercises = {
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
  if (next === -1) return 'Cümlen hazır. Kontrol ederek devam edebilirsin.';
  const word = exercise.words.find(word => word.id === exercise.answer[next]);
  if (next === 0) return '“Einen” ile başla. Kaffee ve Tee eril isimlerdir; bu istekte einen kullanılır.';
  if (next === 1) return `Sıradaki kelime “${word.text.replace(',', '')}”. Ne istediğini söyle.`;
  return 'İsteğini kibarca tamamlamak için sona “bitte” ekle.';
}
