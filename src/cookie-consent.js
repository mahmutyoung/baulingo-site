const copy = {
  en: {
    title: 'Help us improve Baulingo', intro: 'Optional analytics help us understand which learning materials are useful.',
    reject: 'Decline', configure: 'Privacy settings', accept: 'Accept analytics', settings: 'Cookie settings',
    essential: 'Essential storage', always: 'Always on', analytics: 'Google Analytics',
    details: 'Measures visits, referral sources, exercise outcomes and approximate study time.',
    back: 'Back', save: 'Save preferences', privacy: 'Privacy policy', legal: 'Legal notice',
  },
  tr: {
    title: 'Baulingo’yu geliştirmemize yardımcı ol', intro: 'İsteğe bağlı analizler, hangi öğrenme materyallerinin faydalı olduğunu anlamamıza yardımcı olur.',
    reject: 'Reddet', configure: 'Gizlilik ayarları', accept: 'Analizi kabul et', settings: 'Çerez ayarları',
    essential: 'Zorunlu depolama', always: 'Her zaman açık', analytics: 'Google Analytics',
    details: 'Ziyaretleri, yönlendirme kaynaklarını, alıştırma sonuçlarını ve yaklaşık çalışma süresini ölçer.',
    back: 'Geri', save: 'Tercihleri kaydet', privacy: 'Gizlilik politikası', legal: 'Yasal bildirim',
  },
  de: {
    title: 'Hilf uns, Baulingo zu verbessern', intro: 'Optionale Analysen helfen uns zu verstehen, welche Lernmaterialien nützlich sind.',
    reject: 'Ablehnen', configure: 'Datenschutzeinstellungen', accept: 'Analyse akzeptieren', settings: 'Cookie-Einstellungen',
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

  const dialog = document.createElement('section');
  dialog.id = 'cookie-consent';
  dialog.setAttribute('aria-labelledby', 'cookie-title');
  dialog.hidden = true;
  dialog.innerHTML = `<h2 id="cookie-title">${t.title}</h2>
    <div data-cookie-summary><p>${t.intro}</p>
      <div class="cookie-actions"><button type="button" data-cookie="reject">${t.reject}</button>
      <button type="button" data-cookie="accept">${t.accept}</button></div>
      <button type="button" class="cookie-configure" data-cookie="configure">${t.configure}</button>
    </div>
    <div data-cookie-config hidden>
      <div class="cookie-category"><strong>${t.essential}</strong><span>${t.always}</span></div>
      <div class="cookie-category"><label><input type="checkbox" aria-describedby="cookie-analytics-info"> ${t.analytics}</label>
        <p id="cookie-analytics-info">${t.details}</p></div>
      <div class="cookie-actions"><button type="button" data-cookie="back">${t.back}</button>
        <button type="button" data-cookie="save">${t.save}</button></div>
      <div class="cookie-links"><a href="/privacy/">${t.privacy}</a><a href="/impressum/">${t.legal}</a></div>
    </div>`;
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
    dialog.hidden = false;
  }
  button('configure').onclick = () => { showConfig(true); checkbox.focus(); };
  button('back').onclick = () => { showConfig(false); button('configure').focus(); };
  button('reject').onclick = () => saveChoice('denied');
  button('accept').onclick = () => saveChoice('granted');
  button('save').onclick = () => saveChoice(checkbox.checked ? 'granted' : 'denied');

  const settings = document.createElement('button');
  settings.type = 'button';
  settings.className = 'cookie-settings';
  settings.setAttribute('aria-controls', dialog.id);
  settings.textContent = t.settings;
  settings.onclick = () => { open(true); checkbox.focus(); };
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
  return { open, close: () => { dialog.hidden = true; } };
}
