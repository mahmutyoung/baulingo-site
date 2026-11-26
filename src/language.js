import { redirectToLocale, trackLearningEvent } from './analytics.js';
import { isAcquisitionQuery, localeEntryQuery } from './analytics-attribution.js';
import { otherLanguagePath, preferredLanguage } from './language-choice.js';

const key = 'baulingo-language';
if (globalThis.document) initialize();

function initialize() {
  const language = document.documentElement.lang;
  document.addEventListener('click', event => {
    const link = event.target.closest?.('a[href]');
    if (!link || link.origin !== location.origin) return;
    const selected = link.dataset.languageChoice;
    if (selected === 'tr' || selected === 'en') {
      if (selected !== language) trackLearningEvent('language_changed', { activity_type: 'site', content_language: language, target_language: selected });
      try { localStorage.setItem(key, selected); } catch { /* The language URL still works. */ }
      if (link.hasAttribute('data-match-language')) {
        const url = new URL(otherLanguagePath(location.pathname, selected, location.hash), location.origin);
        const review = new URLSearchParams(location.search).get('__review');
        if (review) url.searchParams.set('__review', review);
        link.href = url;
      }
    }
    if (language === 'tr' && link.pathname === '/' && !link.search && !link.hash) link.search = '?lang=tr';
  });
  if (location.pathname === '/' && !location.hash && isAcquisitionQuery(location.search)) {
    let saved;
    try { saved = localStorage.getItem(key); } catch { /* Use the browser locale. */ }
    if (preferredLanguage(saved, navigator.languages || [navigator.language]) === 'en') {
      redirectToLocale('/en/' + localeEntryQuery(location.search, document.referrer));
      return;
    }
  }

  // The Turkish homepage uses app.js to open its existing language dialog.
  if (!document.querySelector('.language, [data-language-choice]') && ['tr','en'].includes(language)) {
    const container = document.querySelector('.header, .reading-page');
    if (container) {
      const other = language === 'tr' ? 'en' : 'tr';
      const link = document.createElement('a');
      link.className = 'language';
      link.lang = link.hreflang = link.dataset.languageChoice = other;
      link.dataset.matchLanguage = '';
      link.textContent = other === 'en' ? 'English' : 'Türkçe';
      link.href = otherLanguagePath(location.pathname, other, location.hash);
      if (container.matches('main')) container.prepend(link);
      else container.append(link);
    }
  }
  connectDialog();
}

function connectDialog() {
  const trigger = document.querySelector('[data-language-open]');
  const dialog = document.querySelector('#language-dialog');
  if (!trigger || !dialog) return;
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
