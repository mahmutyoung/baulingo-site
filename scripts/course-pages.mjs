import { escapeLearningText as e } from '../src/learning-text.js';
import { grammarPath, turkishLessonPath as lessonURL } from '../src/mini-packs/routes.js';

const testRoute = '/konular/almanca-a1-test/';
const levels = {
  A1: 'Kendini tanıt, kafede sipariş ver, saat söyle ve yol sor. Kısa diyaloglarla Almanca öğrenmeye başla.',
  A2: 'Randevunu değiştir, alışverişte sorununu anlat ve günlük planlar yap. Kısa konuşmalarda daha ayrıntılı yanıt ver.',
  B1: 'Deneyimlerini anlat, bir seçimi gerekçelendir ve günlük sorunlara yazılı yanıt ver. Her derste bir senaryo üzerinde çalış.',
};
const levelRoute = level => `/konular/almanca-${level.toLowerCase()}/`;
export const courseRoutes = [...Object.keys(levels).map(levelRoute), testRoute];

const questions = [
  ['Kendini tanıtırken boşluğu tamamla.', 'Hallo, ich ___ Mina.', ['bin', 'bist', 'ist'], 0, 'Ich ile sein fiilinin biçimi bin olur. Bist, du ile kullanılır.', 'DE-A1-001'],
  ['Nereli olduğunu söylerken hangi kelimeyi kullanırsın?', 'Ich komme ___ der Türkei.', ['bei', 'aus', 'um'], 1, 'Bir yerden geldiğini söylemek için aus kullanılır. Ich komme aus der Türkei, Türkiye’den geliyorum demektir.', 'DE-A1-001'],
  ['Kafede bir fincan çay istemek için ne söylersin?', '', ['Die Tasse ist leer.', 'Trinkst du Kaffee?', 'Eine Tasse Tee, bitte.'], 2, 'Eine Tasse Tee bir fincan çay demektir. Bitte, siparişi nazikçe istemek için kullanılır.', 'DE-A1-002'],
  ['İki küçük ekmek ne kadar?', 'Zwei Brötchen kosten 1,80 Euro. Ein Brot kostet 3 Euro.', ['3 Euro', '1,80 Euro', '2 Euro'], 1, 'İlk cümlede fiyatı verilen ürün iki Brötchen. İkinci cümle bir somun ekmeğin fiyatını söylüyor.', 'DE-A1-004'],
  ['Saat yedide kalktığını söylemek için cümleyi tamamla.', 'Morgens stehe ich um sieben Uhr ___.', ['auf', 'an', 'ein'], 0, 'Aufstehen kalkmak demektir. Ana cümlede stehe çekimlenir ve ayrılabilen auf sona gider.', 'DE-A1-007'],
  ['Hangi gün ve saat öneriliyor?', 'Am Montag kann ich nicht. Passt Dienstag um fünf?', ['Montag um fünf', 'Dienstag um sechs', 'Dienstag um fünf'], 2, 'İlk cümlede pazartesinin uygun olmadığı söyleniyor. Öneri, ikinci cümledeki salı saat beş.', 'DE-A1-003'],
  ['Bu tarifte hangi yöne, hangi sırayla gidersin?', 'Gehen Sie geradeaus und dann nach links.', ['Erst links, dann geradeaus.', 'Erst geradeaus, dann links.', 'Erst geradeaus, dann rechts.'], 1, 'Geradeaus düz, nach links sola demektir. Dann, ikinci adımı gösterir.', 'DE-A1-005'],
  ['Köln’e bir tren bileti isterken boşluğu tamamla.', 'Eine Fahrkarte ___ Köln, bitte.', ['nach', 'von', 'bei'], 0, 'Gidilecek şehri belirtirken nach kullanılır. Von, nereden geldiğini belirtir.', 'DE-A1-006'],
  ['Resepsiyon görevlisi rezervasyonun kimin adına olduğunu soruyor. Hangi yanıt uygun?', 'Auf welchen Namen?', ['Um acht Uhr.', 'Für zwei Nächte.', 'Auf den Namen Deniz Yılmaz.'], 2, 'Auf welchen Namen? “Hangi isimle?” demektir. Yanıtta rezervasyondaki adı söylersin.', 'DE-A1-009'],
  ['Bir ceketi denemek için hangi soruyu sorarsın?', '', ['Was kostet die Jacke?', 'Kann ich die Jacke anprobieren?', 'Haben Sie eine blaue Jacke?'], 1, 'Anprobieren, bir giysiyi üzerine giyip denemek demektir. Was kostet …? ile fiyat sorulur.', 'DE-A1-010'],
  ['Erkek kardeşinden söz ederken boşluğu tamamla.', 'Das ist mein Bruder. ___ heißt Tim.', ['Er', 'Sie', 'Wir'], 0, 'Mein Bruder yerine er kullanılır. Er heißt Tim, “Onun adı Tim” demektir.', 'DE-A1-013'],
  ['İlandaki daireyi hangisi doğru anlatıyor?', 'Meine Wohnung hat zwei Zimmer, aber keinen Balkon.', ['Ein Zimmer und ein Balkon.', 'Zwei Zimmer und ein Balkon.', 'Zwei Zimmer, kein Balkon.'], 2, 'Zwei Zimmer iki oda demektir. Keinen Balkon, balkonu olmadığını söyler.', 'DE-A1-015'],
];

function courseContent(level, entries) {
  const { pack } = entries[0];
  const sample = pack.exercises.find(exercise => exercise.options.length);
  const browse = Object.keys(levels).map(other => other === level
    ? `<strong aria-current="page">${other}</strong>`
    : `<a href="${levelRoute(other)}">${other}</a>`).join(' · ');
  return `<nav aria-label="Kurs düzeyi"><p>${browse}</p></nav>
<h1>Almanca ${level} Kursu</h1><p>${levels[level]}</p><p>Türkçe açıklamalı ${entries.length} ders. Ücretsiz ve üyelik gerektirmez. <a href="${grammarPath('tr')}#${level.toLowerCase()}">${level} gramer derslerine git</a>.</p>
<p class="course-actions"><a class="button button-primary" href="${lessonURL(pack.id)}">İlk derse başla →</a>${level === 'A1' ? `<a href="${testRoute}">Almanca A1 testi çöz</a>` : ''}</p>
<section class="exam-section"><h2>Örnek alıştırma</h2><p>${e(sample.prompt)}</p><ul lang="de">${sample.options.map(option => `<li>${e(option)}</li>`).join('')}</ul>
<details><summary>Cevabı gör</summary><p lang="de"><strong>${e(sample.answers[0])}</strong></p><p>${e(sample.explanation)}</p></details></section>
<section class="exam-section"><h2>${level} dersleri</h2><ol class="topic-index">${entries.map(({ pack, title = pack.title }) => `<li><a href="${lessonURL(pack.id)}">${e(title)}</a></li>`).join('')}</ol></section>`;
}

function testContent(entries) {
  const titles = new Map(entries.map(({ pack, title = pack.title }) => [pack.id, title]));
  return `<p><a href="${levelRoute('A1')}">← Almanca A1 Kursu</a></p>
<h1>Almanca A1 Testi</h1><p>12 soruda temel kelimeleri, cümle yapısını ve kısa Almanca metinleri anlama becerini dene. Her soru için bir cevap seç. Sonuç, bu alıştırmadaki doğru sayını gösterir.</p>
<noscript><p>Cevap anahtarını her sorunun altında açabilirsin. Otomatik puan için JavaScript gerekir.</p></noscript>
<form class="a1-test" data-a1-test>
${questions.map(([prompt, german, choices, answer, explanation, id], index) => {
    if (!titles.has(id)) throw new Error(`Unknown A1 practice lesson: ${id}`);
    return `<fieldset data-answer="${answer}"><legend>${index + 1}. ${e(prompt)}</legend>
${german ? `<p lang="de">${e(german)}</p>` : ''}${choices.map((choice, i) => `<label lang="de"><input type="radio" name="q${index + 1}" value="${i}" required> ${e(choice)}</label>`).join('')}
<details><summary>Cevap ve açıklama</summary><p lang="de"><strong>${e(choices[answer])}</strong></p><p data-explanation>${e(explanation)}</p><p data-review-lesson><a href="${lessonURL(id)}">Dersi çalış · ${e(titles.get(id))}</a></p></details></fieldset>`;
  }).join('\n')}
<p><button class="button button-primary" type="submit" hidden>Testi değerlendir</button></p>
<section data-result hidden><h2 tabindex="-1" data-score></h2><p data-summary></p><ul data-recommended aria-label="Tekrar edebileceğin dersler"></ul><button class="button button-primary" type="reset">Yeniden çöz</button> <a href="${levelRoute('A1')}">A1 kursuna dön</a></section>
</form>`;
}

export function coursePages(library, page) {
  const pages = new Map();
  for (const level of Object.keys(levels)) {
    const route = levelRoute(level);
    const entries = library.filter(({ pack }) => pack.cefr === level);
    pages.set(`${route.slice(1)}index.html`, page(`Almanca ${level} Kursu: Türkçe Açıklamalı ${entries.length} Ücretsiz Ders`, levels[level], route, courseContent(level, entries)));
  }
  const a1 = library.filter(({ pack }) => pack.cefr === 'A1');
  pages.set(`${testRoute.slice(1)}index.html`, page('Almanca A1 Testi: 12 Soru ve Türkçe Açıklama',
    'Ücretsiz Almanca A1 testi. 12 soruyu çöz, sonucunu gör ve Türkçe açıklamalarla yanlışlarını çalış.', testRoute, testContent(a1))
    .replace('</body>', '<script type="module" src="/src/a1-test.js"></script></body>'));
  return pages;
}
