import { topics } from '../src/topics.js';

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
<link rel="stylesheet" href="/style.css"></head><body>
<a class="skip" href="#main">İçeriğe geç</a><div class="page">
<header class="header"><a class="brand" href="/" aria-label="Baulingo ana sayfa"><img src="/assets/logo.svg" alt="Baulingo" width="240" height="64"></a><nav class="navigation" aria-label="Ana menü"><a href="/konular/">Konular</a><a href="/kaynaklar/">Ücretsiz kaynaklar</a></nav></header>
<main id="main" class="reading-page">${content}</main>
<footer class="footer"><p>Baulingo</p><div><a href="/">Ana sayfa</a><a href="mailto:mahmutyoung@gmail.com">İletişim</a><a href="/impressum/" lang="de">Impressum</a><a href="/privacy/" lang="de">Datenschutz</a></div></footer>
</div></body></html>`;
}

export function generatePages(homepage) {
  const output = new Map();
  for (const topic of topics) {
    const examples = topic.examples.length ? `<ul class="topic-examples" lang="de">${topic.examples.map(text => `<li>${escape(text)}</li>`).join('')}</ul>` : '';
    output.set(`konular/${topic.id}/index.html`, page(topic.title, topic.subtitle, topicURL(topic),
      `<p><a href="/konular/">← Tüm konular</a></p><article><h1>${escape(topic.title)}</h1><p class="dialog-subtitle">${escape(topic.subtitle)}</p>${topic.paragraphs.map(text => `<p>${escape(text)}</p>`).join('')}${examples}</article>${topic.practice ? '<p><a class="button button-primary" href="/#alistirma">Cümle kurmayı dene</a></p>' : ''}`));
  }
  output.set('konular/index.html', page('Almanca konuları', 'Türkçe açıklamalarla Almanca konuları.', '/konular/',
    `<h1>İhtiyacına göre başla</h1><p>Almancayı hedeflerine uygun konularla adım adım öğren.</p><ul class="topic-index">${topics.map(topic => `<li><a href="${topicURL(topic)}">${escape(topic.title)}</a><p>${escape(topic.subtitle)}</p></li>`).join('')}<li><a href="/konular/kafede-siparis/">Kafede sipariş</a></li></ul>`));
  output.set('konular/kafede-siparis/index.html', page('Kafede sipariş', 'Bir kahve, lütfen. Kafede kullanabileceğin Almanca bir istek.', '/konular/kafede-siparis/',
    '<h1>Kafede sipariş</h1><p>Bu cümleyi Almanca söyle:</p><p class="topic-examples" lang="de">Einen Kaffee, bitte.</p><p>Anlamı: Bir kahve, lütfen.</p><audio controls preload="none" src="/assets/audio/einen-kaffee-bitte.mp3" aria-label="Einen Kaffee, bitte. Dinle"></audio><p><a class="button button-primary" href="/#alistirma">Cümleyi kur</a></p><p>Kelime seçme alıştırması JavaScript ile çalışır. Çevrimdışı çalışmak için <a href="/downloads/kafede-almanca.txt" download>çalışma notunu indir</a>.</p>'));
  // Reuse the selected resource wording and real download links instead of maintaining two copies.
  const resources = homepage.match(/<h2 id="resources-title">([\s\S]*?)<\/dialog>/)?.[0].replace(/<\/dialog>$/, '').replaceAll('./downloads/', '/downloads/');
  if (!resources) throw new Error('Resource dialog content is missing.');
  output.set('kaynaklar/index.html', page('Ücretsiz çalışma notları', 'Telefona kaydet, yazdır veya kendi notlarına ekle. Üyelik gerekmez.', '/kaynaklar/', resources.replace('<h2 id="resources-title">', '<h1>').replace('</h2>', '</h1>')));
  output.set('404.html', page('Sayfa bulunamadı', 'Aradığın sayfa bulunamadı.', '/404.html', '<h1>Sayfa bulunamadı</h1><p>Aradığın sayfa taşınmış veya kaldırılmış olabilir.</p><p><a class="button button-primary" href="/">Ana sayfaya dön</a></p><p><a href="/konular/">Konulara göz at</a></p>', true));
  const urls = ['/', '/konular/', ...topics.map(topicURL), '/konular/kafede-siparis/', '/kaynaklar/'];
  output.set('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(url => `<url><loc>${origin}${url}</loc></url>`).join('')}</urlset>\n`);
  output.set('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`);
  return output;
}
