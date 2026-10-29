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
    id: 'doctor', title: 'Doktorda Almanca', subtitle: 'Şikâyetini anlat, randevu iste',
    keywords: 'doktor hastane randevu sağlık konuşma günlük hayat',
    paragraphs: [
      'Randevu isterken Ich möchte einen Termin vereinbaren. diyebilirsin. Anlamı: Bir randevu almak istiyorum.',
      'Şikâyetini kısa bir cümleyle anlat: Ich habe Kopfschmerzen. (Başım ağrıyor.) Ne zamandır sürdüğünü eklemek için Seit gestern. (Dünden beri.) diyebilirsin.',
      'Bir şeyi anlamadığında tekrar istemek de iletişimin bir parçasıdır: Können Sie das bitte wiederholen? (Bunu tekrar eder misiniz?)',
    ],
    examples: ['Ich möchte einen Termin vereinbaren.', 'Ich habe Kopfschmerzen.', 'Können Sie das bitte wiederholen?'],
  },
  {
    id: 'exams', title: 'A1 ve B1 sınavlarına hazırlık', subtitle: 'Sınav içerikleri hazırlanıyor',
    keywords: 'a1 b1 aile birleşimi mektup yazma schreiben sprechen goethe telc dtz sınav',
    planned: true,
    paragraphs: [
      'Türkçe konuşan öğrenenler için A1 aile birleşimi hazırlığı ve B1 düzeyinde yazma çalışmaları planlıyoruz. Bu ilk sürümde tamamlanmış bir sınav paketi veya deneme sınavı bulunmuyor.',
      'Goethe, telc ve DTZ aynı sınav değildir. Hazırlık içeriği, ilgili sınavın görevleri ve değerlendirme ölçütleri incelendikten sonra yayımlanacak.',
      'Bu sırada günlük istek kurma, artikeller ve cümle sırası gibi temel konularla çalışabilirsin. Bu alıştırmalar resmî sınav soruları değildir.',
    ],
    examples: [],
    practice: true,
  },
];

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
