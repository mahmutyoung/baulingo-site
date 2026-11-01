import { studyPageContent } from './study-page.mjs';
import { englishPages } from './english-pages.mjs';
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
<header class="header"><a class="brand" href="/" aria-label="Baulingo ana sayfa"><img src="/assets/logo.svg" alt="Baulingo" width="240" height="64"></a><button class="menu-toggle" type="button" aria-expanded="false" aria-controls="main-navigation" hidden>Menü <span aria-hidden="true">☰</span></button><nav id="main-navigation" class="navigation" aria-label="Ana menü"><a href="/konular/">Konular</a><a href="/#gunluk">Günlük Almanca</a><a href="/sinavlar/"${['/sinavlar/','/dtz-deneme-sinavi/','/dtz-kelime-kalip-cumle/','/konular/exams/'].includes(pathname) ? ' class="active" aria-current="page"' : ''}>Sınavlar</a></nav></header>
<main id="main" class="reading-page">${content}</main>
<footer class="footer"><p>Baulingo</p><div><a href="/">Ana sayfa</a><a href="mailto:mahmutyoung@gmail.com">İletişim</a><a href="/impressum/" lang="de">Impressum</a><a href="/privacy/" lang="de">Datenschutz</a></div></footer>
</div></body></html>`;
}

export function generatePages(homepage) {
  const output = englishPages();
  for (const topic of topics) {
    const examples = topic.examples.length ? `<ul class="topic-examples" lang="de">${topic.examples.map(text => `<li>${escape(text)}</li>`).join('')}</ul>` : '';
    output.set(`konular/${topic.id}/index.html`, page(topic.title, topic.subtitle, topicURL(topic),
      `<p><a href="/konular/">← Tüm konular</a></p><article><h1>${escape(topic.title)}</h1><p class="dialog-subtitle">${escape(topic.subtitle)}</p>${topic.paragraphs.map(text => `<p>${escape(text)}</p>`).join('')}${examples}${(topic.links || []).map(link => `<p><a class="button button-primary" href="${escape(link.href)}">${escape(link.label)}</a></p>`).join('')}</article>${topic.practice && topic.id !== 'exams' ? `<p><a class="button button-primary" href="/?practice=${escape(topic.id)}#alistirma">Cümle kurmayı dene</a></p>` : ''}`));
  }
  output.set('konular/index.html', page('Almanca konuları', 'Türkçe açıklamalarla Almanca konuları.', '/konular/',
    `<h1>İhtiyacına göre başla</h1><p>Almancayı hedeflerine uygun konularla adım adım öğren.</p><ul class="topic-index">${topics.map(topic => `<li><a href="${topicURL(topic)}">${escape(topic.title)}</a><p>${escape(topic.subtitle)}</p></li>`).join('')}<li><a href="/konular/kafede-siparis/">Kafede sipariş</a></li></ul>`));
  output.set('konular/kafede-siparis/index.html', page('Kafede sipariş', 'Bir kahve, lütfen. Kafede kullanabileceğin Almanca bir istek.', '/konular/kafede-siparis/',
    '<h1>Kafede sipariş</h1><p>Bu cümleyi Almanca söyle:</p><p class="topic-examples" lang="de">Einen Kaffee, bitte.</p><p>Anlamı: Bir kahve, lütfen.</p><audio controls preload="none" src="/assets/audio/einen-kaffee-bitte.mp3" aria-label="Einen Kaffee, bitte. Dinle"></audio><p><a class="button button-primary" href="/#alistirma">Cümleyi kur</a></p><p>Kelime seçme alıştırması JavaScript ile çalışır.</p>'));
  output.set('sinavlar/index.html', page('DTZ denemesi ve Almanca çalışma içerikleri', 'Ücretsiz DTZ A2–B1 denemesini çöz. Kelimeler, ifadeler ve cümle kalıplarını Türkçe anlamlar ve Almanca örneklerle çalış.', '/sinavlar/', `
<h1>DTZ’ye hazırlan</h1><p>Denemeyle kendini dene veya kelimeler, ifadeler ve cümle kalıplarıyla çalış. Baulingo içeriklerine ücretsiz, üye olmadan ulaş.</p>
<section id="dtz" class="exam-section"><h2>DTZ çalışma içerikleri</h2><div class="exam-materials"><article><h3>DTZ A2–B1 deneme sınavı</h3><p>Tam dinleme kaydı, 20 dinleme ve 25 okuma sorusu, yazma ve konuşma görevleriyle sınavı dene.</p><a class="button button-primary" href="/dtz-deneme-sinavi/">Denemeye başla →</a></article><article><h3>Kelimeler, ifadeler ve cümle kalıpları</h3><p>A1, A2 ve B1 düzeylerinde; günlük durumlara göre Türkçe anlamlar ve Almanca örneklerle çalış.</p><a class="button button-primary" href="/dtz-kelime-kalip-cumle/">Çalışma listelerini aç →</a></article></div></section>
<section class="exam-info exam-section"><h2>Sınavlar hakkında</h2><details id="hangi-sinav"><summary>Hangi sınav kimin için?</summary><article>
<p>Deutsch-Test für Zuwanderer (DTZ), entegrasyon kursunun dil sınavıdır. Almanya’daki günlük yaşamı konu alır; dinleme, okuma, yazma ve konuşma becerilerini A2–B1 aralığında ölçer.</p>
<p><strong>Entegrasyon kursuna katılıyorsan: DTZ.</strong> Kursun sonunda günlük Almanca becerilerini göstermek için girilen dil sınavıdır. <a href="https://www.integrationsbeauftragte.de/integration/sprache/faq-integrationskurse">Entegrasyon kursları hakkında resmî bilgi</a>.</p>
<p><strong>Almanca düzeyini belgelemek istiyorsan: Goethe veya telc.</strong> Bunlar tek bir sınavın adı değil, farklı düzeylerde sınav sunan kuruluşlardır. Genel Almanca, iş veya eğitim hedefin için istenen düzeye uygun sınavı seçersin. <a href="https://www.goethe.de/de/spr/prf.html">Goethe sınavları</a> · <a href="https://www.telc.net/sprachpruefungen/zertifikatspruefung/deutsch/">telc sınavları</a>.</p>
<p><strong>Meslek dili kursuna katılıyorsan: DTB.</strong> Deutsch-Test für den Beruf, meslek dili kurslarının sonunda iş yaşamındaki Almanca becerilerini ölçer. <a href="https://www.telc.net/sprachpruefungen/zertifikatspruefung/deutsch/deutsch-test-fuer-den-beruf/">DTB hakkında resmî bilgi</a>.</p>
<p><strong>Almanca bir üniversite programına başvuruyorsan: TestDaF veya DSH.</strong> Akademik ortamda Almanca kullanabildiğini göstermek isteyen üniversite adaylarına yöneliktir. Kabul edilen sınav ve sonuç, başvurulan programa göre kontrol edilir. <a href="https://www.testdaf.de/de/teilnehmende/warum-testdaf/das-muessen-sie-koennen/">TestDaF</a> · <a href="https://www.llc.uni-hannover.de/testen-pruefen/deutschpruefungen/dsh">DSH</a>.</p>
</article></details></section>`));
  output.set('dtz-kelime-kalip-cumle/index.html', page('A1–B1 Almanca kelime, ifade ve cümle kalıpları', 'CEFR düzeyine ve günlük durumlara göre Almanca kelimeler, ifadeler ve cümle kalıpları. Türkçe anlamlar ve örneklerle çalış.', '/dtz-kelime-kalip-cumle/', '<p><a href="/sinavlar/">← Sınavlar</a></p>'+studyPageContent(dtzWords, dtzPhrases, dtzSentences)).replace('</body>', '<script type="module" src="/src/dtz-study-filter.js"></script></body>'));
  output.set('uygulama/index.html', page('Baulingo uygulaması', 'Günlük Almanca pratiği için Baulingo Android uygulaması.', '/uygulama/', '<h1>Baulingo uygulaması</h1><p>Resimler, kısa konuşmalar ve alıştırmalarla günlük Almanca çalış. Cevabını seç, kelimelerle cümle kur ve yazmayı dene.</p><p>Android uygulaması açık alfa test aşamasındadır.</p><p><a class="button button-primary" href="https://play.google.com/store/apps/details?id=com.baulingo.app">Google Play’de açık alfa testini incele</a></p>'));
  output.set('404.html', page('Sayfa bulunamadı', 'Aradığın sayfa bulunamadı.', '/404.html', '<h1>Sayfa bulunamadı</h1><p>Aradığın sayfa taşınmış veya kaldırılmış olabilir.</p><p><a class="button button-primary" href="/">Ana sayfaya dön</a></p><p><a href="/konular/">Konulara göz at</a></p>', true));
  output.set('dtz-deneme-sinavi/index.html', page('Ücretsiz DTZ deneme sınavı A2–B1', 'Türkçe yönergelerle ücretsiz DTZ denemesi: tam dinleme kaydı, 45 soru, yazma ve konuşma görevleri. Üyelik gerekmez.', '/dtz-deneme-sinavi/', '<p><a href="/sinavlar/">← Sınavlar</a></p>'+dtzPageContent())
    .replace('class="reading-page"', 'class="reading-page dtz-main"')
    .replace('<script type="module" src="/src/navigation.js"></script></head>', '<link rel="stylesheet" href="/dtz.css"><script type="module" src="/src/navigation.js"></script></head>')
    .replace('</body>', '<script type="module" src="/src/dtz/player.js"></script></body>'));
  const urls = ['/', '/en/', '/en/word-order/', '/en/articles/', '/en/appointments/', '/uygulama/', '/konular/', '/sinavlar/', ...topics.map(topicURL), '/konular/kafede-siparis/', '/dtz-kelime-kalip-cumle/', '/dtz-deneme-sinavi/'];
  output.set('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(url => `<url><loc>${origin}${url}</loc></url>`).join('')}</urlset>\n`);
  output.set('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`);
  return output;
}
