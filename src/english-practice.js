import { createSentenceBuilder } from './sentence-builder.js';

const dialog = document.querySelector('#practice-dialog');
if (dialog) {
  const builder = createSentenceBuilder(dialog, { language: 'en', initialId: 'en-coffee' });
  let trigger = null;
  for (const link of document.querySelectorAll('[data-practice]')) {
    link.addEventListener('click', event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button > 0) return;
      event.preventDefault();
      trigger = link;
      builder.reset(link.dataset.practice);
      dialog.showModal();
      document.body.classList.add('dialog-open');
      dialog.querySelector('#exercise-title').focus();
    });
  }
  dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    document.body.classList.remove('dialog-open');
    trigger?.focus({ preventScroll: true });
  });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
}
