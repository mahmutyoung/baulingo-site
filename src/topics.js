export const topics = [
  {
    id: 'articles', title: 'Der, die, das', subtitle: 'İsimlerin cinsiyeti',
    keywords: 'artikel artikeller isimlerin cinsiyeti eril dişil nötr',
    paragraphs: [
      'Almancada isimler bir artikel ile kullanılır: der, die veya das. Türkçede bu ayrım olmadığı için yeni bir kelimeyi artikeliyle birlikte öğrenmek işini kolaylaştırır.',
      'Örneğin: der Kaffee (kahve), die Rechnung (hesap), das Wasser (su). Bir nesnenin görünüşünden hangi artikeli aldığını her zaman anlayamazsın.',
      'Belirsiz artikel, eril ve nötr isimlerde ein, dişil isimlerde eine olur: ein Kaffee, eine Rechnung, ein Wasser. Cümledeki göreve göre bu biçimler değişebilir.',
    ],
    examples: ['der Kaffee — kahve', 'die Rechnung — hesap', 'das Wasser — su'],
    practice: true,
  },
  {
    id: 'cases', title: 'Akkusativ ve Dativ', subtitle: 'Neyi, kime, nerede?',
    keywords: 'akkusativ dativ farkı hal hâl durum einen einem',
    paragraphs: [
      'Almancada artikel, ismin cümledeki görevine göre değişebilir. Akkusativ çoğu zaman bir eylemin doğrudan nesnesini gösterir: Ich bestelle einen Kaffee. (Bir kahve sipariş ediyorum.)',
      'Dativ, bir şeyin kime verildiğini gösterebilir: Ich gebe dem Mann einen Kaffee. (Adama bir kahve veriyorum.) Burada dem Mann alıcı, einen Kaffee ise verilen şeydir.',
      'Bazı fiiller ve edatlar belirli bir hâl ister. Örneğin mit her zaman Dativ ile kullanılır: mit dem Bus. Türkçedeki eklerle bire bir eşleştirmek yerine kelimeyi örnek cümlesiyle öğren.',
    ],
    examples: ['der Kaffee → einen Kaffee', 'Ich bestelle einen Kaffee.', 'Ich fahre mit dem Bus.'],
    practice: true,
  },
  {
    id: 'word-order', title: 'Almanca cümle sırası', subtitle: 'Almanca cümle nasıl kurulur?',
    keywords: 'cümle sırası fiil kelime dizilişi cumle sirasi soru',
    paragraphs: [
      'Düz bir ana cümlede çekimli fiil ikinci ögedir: Ich trinke einen Kaffee. (Bir kahve içiyorum.) İkinci öge, mutlaka ikinci kelime demek değildir.',
      'Cümleye zaman ifadesiyle de başlayabilirsin: Heute trinke ich einen Kaffee. (Bugün bir kahve içiyorum.) Fiil yine ikinci ögedir; özne fiilden sonra gelir.',
      'Evet/hayır sorusunda çekimli fiil başa geçer: Trinkst du einen Kaffee? Kafede kısa ve doğal bir istek de yeterlidir: Einen Kaffee, bitte.',
    ],
    examples: ['Ich trinke einen Kaffee.', 'Heute trinke ich einen Kaffee.', 'Trinkst du einen Kaffee?'],
    practice: true,
  },
  {
    id: 'doctor', practice: true, title: 'Doktorda Almanca', subtitle: 'Şikâyetini anlat, randevu iste',
    keywords: 'doktor hastane randevu sağlık konuşma günlük hayat',
    paragraphs: [
      'Randevu isterken Ich möchte einen Termin vereinbaren. diyebilirsin. Anlamı: Bir randevu almak istiyorum.',
      'Şikâyetini kısa bir cümleyle anlat: Ich habe Kopfschmerzen. (Başım ağrıyor.) Ne zamandır sürdüğünü eklemek için Seit gestern. (Dünden beri.) diyebilirsin.',
      'Bir şeyi anlamadığında tekrar istemek de iletişimin bir parçasıdır: Können Sie das bitte wiederholen? (Bunu tekrar eder misiniz?)',
    ],
    examples: ['Ich möchte einen Termin vereinbaren.', 'Ich habe Kopfschmerzen.', 'Können Sie das bitte wiederholen?'],
  },
  {
    id: 'exams', title: 'DTZ denemesi ve sınava hazırlık', subtitle: 'DTZ denemesi ve Türkçe açıklamalı mektup dersleri',
    keywords: 'a1 b1 aile birleşimi mektup yazma schreiben sprechen goethe telc dtz sınav',
    planned: true,
    paragraphs: [
      'Ücretsiz DTZ A2–B1 denemesinde tam dinleme kaydı, 20 dinleme ve 25 okuma sorusu, yazma ve konuşma görevleri bulunur. Otomatik sonuç yalnızca dinleme ve okumayı kapsar; resmî sınav sonucu değildir.',
      'DTZ Mektup Yazma bölümünde Türkçe açıklamalar, kısa alıştırmalar ve 11 mektup türüyle kendi hızında çalışabilirsin. Taslaklar yalnızca tarayıcında saklanır; serbest yazılar otomatik puanlanmaz.',
      'A1 aile birleşimi hazırlığı ve diğer B1 yazma paketleri planlanıyor; henüz tamamlanmış paketler olarak sunulmuyor.',
      'Goethe, telc ve DTZ aynı sınav değildir.',
    ],
    examples: [],
    links: [{ href: '/sinavlar/', label: 'Sınavları tanı' }, { href: '/dtz-deneme-sinavi/', label: 'Ücretsiz DTZ denemesine başla' }, { href: '/dtz-kelime-kalip-cumle/', label: 'DTZ kelime, kalıp ve cümleler' }, { href: '/dtz-mektup-yazma/', label: 'DTZ mektup yazmayı öğren' }],
    practice: true,
  },
];

// Explicit language annotations keep the authored prose and search data intact.
const topicGerman = {
  articles: ['der Kaffee','die Rechnung','das Wasser','ein Kaffee','eine Rechnung','ein Wasser','der','die','das','ein','eine'],
  cases: ['Akkusativ','Dativ','Ich bestelle einen Kaffee.','Ich gebe dem Mann einen Kaffee.','dem Mann','einen Kaffee','mit dem Bus','mit'],
  'word-order': ['Ich trinke einen Kaffee.','Heute trinke ich einen Kaffee.','Trinkst du einen Kaffee?','Einen Kaffee, bitte.'],
  doctor: ['Ich möchte einen Termin vereinbaren.','Ich habe Kopfschmerzen.','Seit gestern.','Können Sie das bitte wiederholen?'],
};
const topicTranslations = {
  articles: ['kahve','hesap','su'],
  cases: ['Artikelin cümledeki değişimi','Bir kahve sipariş ediyorum.','Otobüsle gidiyorum.'],
  'word-order': ['Bir kahve içiyorum.','Bugün bir kahve içiyorum.','Bir kahve içer misin?'],
  doctor: ['Bir randevu almak istiyorum.','Başım ağrıyor.','Bunu tekrar eder misiniz?'],
};
for (const topic of topics) {
  topic.germanMentions = topicGerman[topic.id] || [];
  topic.learningExamples = topic.examples.map((text,index) => ({
    de: text.split(' — ')[0], translation: topicTranslations[topic.id]?.[index] || '', word: topic.id === 'articles',
  }));
}

function normalize(value) {
  return String(value).toLocaleLowerCase('tr-TR').replaceAll('ı', 'i')
    .normalize('NFD').replace(/\p{M}/gu, '').replaceAll('ß', 'ss');
}

export function searchTopics(query) {
  const terms = normalize(query).trim().split(/\s+/).filter(Boolean);
  return topics.filter(topic => {
    const text = normalize(`${topic.title} ${topic.subtitle} ${topic.keywords}`);
    return terms.every(term => text.includes(term));
  });
}
