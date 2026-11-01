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
