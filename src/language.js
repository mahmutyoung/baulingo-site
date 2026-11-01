import { preferredLanguage } from './language-choice.js';

let saved = null;
try { saved = localStorage.getItem('baulingo-language'); } catch { /* The links remain usable without storage. */ }
for (const link of document.querySelectorAll('[data-language-choice]')) {
  link.addEventListener('click', () => {
    try { localStorage.setItem('baulingo-language', link.dataset.languageChoice); } catch { /* Keep navigation available. */ }
  });
}
if (location.pathname === '/' && !location.search && !location.hash && preferredLanguage(saved, navigator.languages || [navigator.language]) === 'en') {
  location.replace('/en/');
}

// app.js handles Turkish homepage dialogs.
const trigger = document.querySelector('[data-language-open]');
const dialog = document.querySelector('#language-dialog');
if (trigger && dialog) {
  trigger.addEventListener('click', () => {
    dialog.showModal();
    document.body.classList.add('dialog-open');
  });
  dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    document.body.classList.remove('dialog-open');
    trigger.focus({ preventScroll: true });
  });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
}
