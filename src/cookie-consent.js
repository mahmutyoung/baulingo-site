const copy = {
  en: {
    title: 'Cookie settings', intro: 'Essential storage remembers your choices and progress. With your permission, Google Analytics measures visits and use of learning activities.',
    reject: 'Reject all', configure: 'Configure', accept: 'Accept all',
    essential: 'Essential storage', always: 'Always on', analytics: 'Google Analytics',
    details: 'Measures visits, referral sources, exercise outcomes and approximate study time.',
    back: 'Back', save: 'Save preferences', privacy: 'Privacy policy', legal: 'Legal notice',
  },
  tr: {
    title: 'Çerez ayarları', intro: 'Zorunlu depolama tercihlerini ve ilerlemeni hatırlar. İzin verirsen Google Analytics ziyaretleri ve alıştırmaların kullanımını ölçer.',
    reject: 'Tümünü reddet', configure: 'Ayarla', accept: 'Tümünü kabul et',
    essential: 'Zorunlu depolama', always: 'Her zaman açık', analytics: 'Google Analytics',
    details: 'Ziyaretleri, yönlendirme kaynaklarını, alıştırma sonuçlarını ve yaklaşık çalışma süresini ölçer.',
    back: 'Geri', save: 'Tercihleri kaydet', privacy: 'Gizlilik politikası', legal: 'Yasal bildirim',
  },
  de: {
    title: 'Cookie-Einstellungen', intro: 'Notwendige Speicherung merkt sich deine Auswahl und deinen Lernfortschritt. Mit deiner Zustimmung misst Google Analytics Besuche und die Nutzung von Übungen.',
    reject: 'Alle ablehnen', configure: 'Konfigurieren', accept: 'Alle akzeptieren',
    essential: 'Notwendige Speicherung', always: 'Immer aktiv', analytics: 'Google Analytics',
    details: 'Misst Besuche, Verweisquellen, Übungsergebnisse und die ungefähre Lernzeit.',
    back: 'Zurück', save: 'Auswahl speichern', privacy: 'Datenschutz', legal: 'Impressum',
  },
};

export function mountCookieConsent(readChoice, saveChoice) {
  const t = copy[document.documentElement.lang] || copy.tr;
  const style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = '/src/cookie-consent.css';
  document.head.append(style);

  const dialog = document.createElement('dialog');
  dialog.id = 'cookie-consent';
  dialog.setAttribute('aria-labelledby', 'cookie-title');
  dialog.innerHTML = `<h2 id="cookie-title" tabindex="-1" autofocus>${t.title}</h2>
    <div data-cookie-summary><p>${t.intro}</p>
      <div class="cookie-actions"><button type="button" data-cookie="reject">${t.reject}</button>
      <button type="button" data-cookie="configure">${t.configure}</button>
      <button type="button" data-cookie="accept">${t.accept}</button></div>
    </div>
    <div data-cookie-config hidden>
      <div class="cookie-category"><strong>${t.essential}</strong><span>${t.always}</span></div>
      <div class="cookie-category"><label><input type="checkbox" aria-describedby="cookie-analytics-info"> ${t.analytics}</label>
        <p id="cookie-analytics-info">${t.details}</p></div>
      <div class="cookie-actions"><button type="button" data-cookie="back">${t.back}</button>
        <button type="button" data-cookie="save">${t.save}</button></div>
    </div>
    <div class="cookie-links"><a href="/privacy/">${t.privacy}</a><a href="/impressum/">${t.legal}</a></div>`;
  document.body.append(dialog);
  const summary = dialog.querySelector('[data-cookie-summary]');
  const config = dialog.querySelector('[data-cookie-config]');
  const checkbox = config.querySelector('input');
  const button = name => dialog.querySelector(`[data-cookie=${name}]`);
  function showConfig(configure) {
    summary.hidden = configure;
    config.hidden = !configure;
    checkbox.checked = readChoice() === 'granted';
  }
  function open(configure = false) {
    showConfig(configure);
    if (!dialog.open) dialog.showModal();
  }
  button('configure').onclick = () => { showConfig(true); checkbox.focus(); };
  button('back').onclick = () => { showConfig(false); button('configure').focus(); };
  button('reject').onclick = () => saveChoice('denied');
  button('accept').onclick = () => saveChoice('granted');
  button('save').onclick = () => saveChoice(checkbox.checked ? 'granted' : 'denied');

  const settings = document.createElement('button');
  settings.type = 'button';
  settings.className = 'cookie-settings';
  settings.setAttribute('aria-haspopup', 'dialog');
  settings.setAttribute('aria-controls', dialog.id);
  settings.textContent = t.title;
  settings.onclick = () => open(true);
  const footer = document.querySelector('footer');
  if (footer) footer.append(settings);
  else {
    const fallback = document.createElement('footer');
    fallback.className = 'cookie-footer';
    fallback.append(settings);
    document.body.append(fallback);
    if (document.querySelector('.lesson-preview')) {
      const observer = new MutationObserver(() => {
        const readerFooter = document.querySelector('footer:not(.cookie-footer)');
        if (!readerFooter) return;
        readerFooter.append(settings);
        fallback.remove();
        observer.disconnect();
      });
      observer.observe(document.body, { childList: true });
    }
  }
  return { open, close: () => dialog.close() };
}
