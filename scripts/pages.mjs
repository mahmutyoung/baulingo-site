import { topics } from '../src/topics.js';
import { dtzWords, dtzPhrases, dtzSentences } from '../src/dtz-study.js';
import { dtzPageContent } from './dtz-page.mjs';

export const origin = 'https://baulingo.app';
const escape = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
const topicURL = topic => `/konular/${topic.id}/`;

function page(title, description, pathname, content, noindex = false) {
  return `<!doctype html>
<html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escape(title)} · Baulingo</title><meta name="description" content="${escape(description)}">
${noindex ? '<meta name="robots" content="noindex">' : `<link rel="canonical" href="${origin}${pathname}">`}
<meta name="theme-color" content="#FAF7F0"><link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<meta property="og:type" content="website"><meta property="og:title" content="${escape(title)} · Baulingo"><meta property="og:description" content="${escape(description)}"><meta property="og:locale" content="tr_TR">
<link rel="stylesheet" href="/style.css"><script type="module" src="/src/navigation.js"></script></head><body>
<a class="skip" href="#main">İçeriğe geç</a><div class="page">
<header class="header"><a class="brand" href="/" aria-label="Baulingo ana sayfa"><img src="/assets/logo.svg" alt="Baulingo" width="240" height="64"></a><button class="menu-toggle" type="button" aria-expanded="false" aria-controls="main-navigation" hidden>Menü <span aria-hidden="true">☰</span></button><nav id="main-navigation" class="navigation" aria-label="Ana menü"><a href="/konular/">Konular</a><a href="/#gunluk">Günlük Almanca</a><a href="/dtz-deneme-sinavi/"${pathname === '/dtz-deneme-sinavi/' ? ' class="active" aria-current="page"' : ''}>Sınavlar</a></nav></header>
<main id="main" class="reading-page">${content}</main>
<footer class="footer"><p>Baulingo</p><div><a href="/">Ana sayfa</a><a href="mailto:mahmutyoung@gmail.com">İletişim</a><a href="/impressum/" lang="de">Impressum</a><a href="/privacy/" lang="de">Datenschutz</a></div></footer>
</div></body></html>`;
}

export function generatePages(homepage) {
  const output = new Map();
  for (const topic of topics) {
    const examples = topic.examples.length ? `<ul class="topic-examples" lang="de">${topic.examples.map(text => `<li>${escape(text)}</li>`).join('')}</ul>` : '';
    output.set(`konular/${topic.id}/index.html`, page(topic.title, topic.subtitle, topicURL(topic),
      `<p><a href="/konular/">← Tüm konular</a></p><article><h1>${escape(topic.title)}</h1><p class="dialog-subtitle">${escape(topic.subtitle)}</p>${topic.paragraphs.map(text => `<p>${escape(text)}</p>`).join('')}${examples}${(topic.links || []).map(link => `<p><a class="button button-primary" href="${escape(link.href)}">${escape(link.label)}</a></p>`).join('')}</article>${topic.practice ? '<p><a class="button button-primary" href="/#alistirma">Cümle kurmayı dene</a></p>' : ''}`));
  }
  output.set('konular/index.html', page('Almanca konuları', 'Türkçe açıklamalarla Almanca konuları.', '/konular/',
    `<h1>İhtiyacına göre başla</h1><p>Almancayı hedeflerine uygun konularla adım adım öğren.</p><ul class="topic-index">${topics.map(topic => `<li><a href="${topicURL(topic)}">${escape(topic.title)}</a><p>${escape(topic.subtitle)}</p></li>`).join('')}<li><a href="/konular/kafede-siparis/">Kafede sipariş</a></li></ul>`));
  output.set('konular/kafede-siparis/index.html', page('Kafede sipariş', 'Bir kahve, lütfen. Kafede kullanabileceğin Almanca bir istek.', '/konular/kafede-siparis/',
    '<h1>Kafede sipariş</h1><p>Bu cümleyi Almanca söyle:</p><p class="topic-examples" lang="de">Einen Kaffee, bitte.</p><p>Anlamı: Bir kahve, lütfen.</p><audio controls preload="none" src="/assets/audio/einen-kaffee-bitte.mp3" aria-label="Einen Kaffee, bitte. Dinle"></audio><p><a class="button button-primary" href="/#alistirma">Cümleyi kur</a></p><p>Kelime seçme alıştırması JavaScript ile çalışır.</p>'));
  const studySection = (id, title, rows, hasTypes = false) => {
    const topicNames = [...new Set(rows.map(row => row.topic))].sort((a, b) => a.localeCompare(b, 'tr'));
    const options = topicNames.map(topic => `<option value="${escape(topic)}">${escape(topic)}</option>`).join('');
    const groups = topicNames.map(topic => `<details class="study-topic" open><summary>${escape(topic)}</summary><ul>${rows.filter(row => row.topic === topic).map(row => `<li data-study-item data-topic="${escape(topic)}" data-parts="${escape(row.parts.join('|'))}"${row.type ? ` data-type="${escape(row.type)}"` : ''}><span lang="de">${escape(row.text)}</span>${row.meaning ? ` <span class="study-meaning">— ${escape(row.meaning)}</span>` : ''}${row.level ? ` <small>· ${escape(row.level)}</small>` : ''}</li>`).join('')}</ul></details>`).join('');
    const types = hasTypes ? '<label>Kelime türü <select data-study-type><option value="">Tüm türler</option><option value="isim">İsim</option><option value="fiil">Fiil</option><option value="sifat">Sıfat</option><option value="zarf">Zarf</option></select></label>' : '';
    return `<section id="${id}" data-study-section><h2>${title}</h2><div class="study-filters" hidden>${types}<label>Sınav bölümü <select data-study-part><option value="">Tüm bölümler</option><option value="Hören">Dinleme · Hören</option><option value="Lesen">Okuma · Lesen</option><option value="Schreiben">Yazma · Schreiben</option><option value="Sprechen">Konuşma · Sprechen</option></select></label><label>Konu <select data-study-topic><option value="">Tüm konular</option>${options}</select></label></div><p class="study-empty" hidden>Bu seçimle eşleşen içerik bulunamadı.</p>${groups}</section>`;
  };
  output.set('dtz-kelime-kalip-cumle/index.html', page('DTZ kelime, kalıp ve cümleler', 'DTZ için konulara ayrılmış kelimeler, kalıplar ve örnek cümleler.', '/dtz-kelime-kalip-cumle/', `<h1>DTZ kelime, kalıp ve cümleler</h1><p>DTZ’ye hazırlanırken kelimeleri, kalıpları ve örnek cümleleri konu ve sınav bölümüne göre çalış.</p><nav aria-label="Bu sayfadaki başlıklar"><a href="#kelimeler">Kelimeler</a> · <a href="#kaliplar">Kalıplar</a> · <a href="#cumleler">Cümleler</a></nav>${studySection('kelimeler', 'DTZ’de çıkabilecek kelimeler', dtzWords, true)}${studySection('kaliplar', 'DTZ’de çıkabilecek kalıplar', dtzPhrases)}${studySection('cumleler', 'DTZ’de çıkabilecek cümleler', dtzSentences)}<p><a href="/dtz-deneme-sinavi/">Ücretsiz DTZ denemesine geç →</a></p>`).replace('</body>', '<script type="module" src="/src/dtz-study-filter.js"></script></body>'));
  output.set('404.html', page('Sayfa bulunamadı', 'Aradığın sayfa bulunamadı.', '/404.html', '<h1>Sayfa bulunamadı</h1><p>Aradığın sayfa taşınmış veya kaldırılmış olabilir.</p><p><a class="button button-primary" href="/">Ana sayfaya dön</a></p><p><a href="/konular/">Konulara göz at</a></p>', true));
  output.set('dtz-deneme-sinavi/index.html', page('Ücretsiz DTZ deneme sınavı A2–B1', 'Türkçe yönergelerle ücretsiz DTZ denemesi: tam dinleme kaydı, 45 soru, yazma ve konuşma görevleri. Üyelik gerekmez.', '/dtz-deneme-sinavi/', dtzPageContent())
    .replace('class="reading-page"', 'class="reading-page dtz-main"')
    .replace('<script type="module" src="/src/navigation.js"></script></head>', '<link rel="stylesheet" href="/dtz.css"><script type="module" src="/src/navigation.js"></script></head>')
    .replace('</body>', '<script type="module" src="/src/dtz/player.js"></script></body>'));
  const urls = ['/', '/konular/', ...topics.map(topicURL), '/konular/kafede-siparis/', '/dtz-kelime-kalip-cumle/', '/dtz-deneme-sinavi/'];
  output.set('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(url => `<url><loc>${origin}${url}</loc></url>`).join('')}</urlset>\n`);
  output.set('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`);
  return output;
}
