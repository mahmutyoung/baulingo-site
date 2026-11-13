# DTZ mektup yazma — son inceleme

3 Kasım 2026. Product Design denetimindeki düzeltmeler yerel sürüme uygulandı. Son içerik incelemesini site sahibi yapacak. Canlı siteye yayımlanmadı.

## Neler değişti?

- 22 ders ve 2 yardımcı kaynak ayrı gösteriliyor. Kaynakları okumak ders ilerlemesini artırmıyor.
- 47 kaynak görevi korundu; seçenek, eşleştirme, boşluk, sıralama, kısa yazma ve tam mektup biçimleri ayrıldı. Kısa sorular için mektup editörü veya ilgisiz hitap kontrolü yok.
- Gerekli seçenekler, cümleler ve örnek parçalar doğrudan görünüyor. Ek Almanca özgün görev metni ayrıca açılabiliyor.
- Tam mektuplarda gerçek görev maddelerine bağlı plan, kontrol ve örnek yanıt açıklaması var. Karmaşık örnek yapıları Türkçe anlam ve örneklerle açıklanıyor.
- Yanlış seçenekler konuya uygun ayrımları çalıştırıyor. Yeni seçenekler için yanlış yanıta özel açıklamalar bulunuyor.
- Kaydetme durumu ve kayıt engeli uyarısı yazma alanının yanında. Eski serbest yanıtlar, düzeltmeler ve planlar korunuyor. Önceki genel kontrol işaretleri yeni görev maddeleri işaretlenmiş gibi yorumlanmıyor.
- “Devam et” ziyaret edilen son kaynak yerine üzerinde yazılmış ve henüz gözden geçirilmemiş çalışmaya dönüyor. Bir ders tamamlandıktan sonra yazı değiştirilirse yeniden çalışılıyor olarak açılıyor.
- A/B konuları ve dört maddeleri seçimden önce birlikte okunabiliyor; seçimden sonra bir editör gösteriliyor. Taslaklar ayrı kalıyor. Süre isteğe bağlı.
- Kalıplarda Türkçe anlam ve tamamlanmış Almanca kullanım örneği var; kod yazı tipi kaldırıldı.

## İçerik incelemesi için sıra

1. `/dtz-mektup-yazma/kime-yaziyorum/`: sınıflandırma ve Frau Roth sorusu anlaşılır mı? Herr Klein için hem adıyla nazik hem resmî hitap kabul ediliyor. Sıcak bir `Liebe Frau …` hitabının `Sie` ile kullanılabileceği açıklanıyor.
2. `/dtz-mektup-yazma/baslangic-ve-kapanis/`: dört hitap, mesaj sıralama ve Aylin için üç kısa alan görevle uyumlu mu? Virgülden sonra küçük harf açıklamasında isimler, özel adlar ve resmî hitap zamirleri istisnası var.
3. `/dtz-mektup-yazma/cumleleri-bagla/#task-c4-t4`: `weil` gereği Türkçe yönergede ve kontrolde görünüyor mu? c4-t3 örneği verilen bağlaçlardan `aber` ve `deshalb` kullanacak biçimde düzeltildi.
4. `/dtz-mektup-yazma/rehberli-yazma/`: iki mektubun dört maddesi, plan alanları, kontrol listesi ve açıklamalı örnekleri birbiriyle örtüşüyor mu? Her maddeyi öğrencinin kendi yazısında bulması kolay mı?
5. Kurs, ev, davet, yardım, randevu, şikâyet, okul, iş, kurum/sigorta, satış ve deneyim dersleri: Türkçe görev özeti Almanca kaynakla aynı işi istiyor mu? Özellikle kurs görevinde kişinin kendi hedefini/çalışma saatini anlatması ile kurs hakkında soru sorması ayrıldı.
6. `/dtz-mektup-yazma/deneme-1/`, `/deneme-2/`, `/deneme-3/`: A/B kıyaslaması ve tek editör anlaşılır mı? Deneme 1/A örneğine kabul nedeni eklendi. Üç denemenin dili ve zorluğu hedeflediğiniz öğrenciye uygun mu?
7. `/dtz-mektup-yazma/cumle-kaliplari/`: Türkçe anlamlar ve bağlamlı örnekler doğal mı? Kalıplar örneğe bakmadan kendi yazısına uyarlanabilir mi?
8. Telefonda bir kısa çalışmayı ve bir tam mektubu bitirin: görev, kontrol, örnekle karşılaştırma ve tek cümle düzeltmesi yeterince açık mı?

## Dil ve sınav yapısı için kontrol edilen kaynaklar

- [g.a.s.t. DTZ SSS](https://www.gast.de/de/forschung-entwicklung/entwicklung/auftraege/deutsch-test-fuer-zuwanderer-dtz/faq): yazma bölümünün 30 dakikalık yapısı, A/B seçimi ve dört içerik maddesi. Baulingo görevleri özgün çalışma materyalidir; resmî görev veya değerlendirilmiş sınav eşdeğeri olarak sunulmuyor.
- [GfdS: hitap ve kapanış](https://gfds.de/anreden-grussformeln-schlusssaetze-in-briefen-und-e-mails/), [Duden: virgül](https://www.duden.de/sprachwissen/rechtschreibregeln/komma), [Duden: Sie](https://www.duden.de/sprachwissen/sprachratgeber/Gross-oder-Kleinschreibung-von-sieSie): hitap, virgül ve büyük/küçük harf açıklamaları için.

Kaynak kontrolü, bütün örneklerin bir DTZ öğretmeni tarafından değerlendirildiği veya gerçek öğrencilerle öğrenme etkisinin ölçüldüğü anlamına gelmez. Son dil, zorluk ve anlatım kararları bu incelemede verilecek.

## Teknik sınırlar

Taslaklar bu tarayıcıya aittir. Başka cihazla eşitleme veya hesap yok. Aynı derste farklı alanların iki sekmeden kaydı alan bazında birleştirilir; aynı alanın eşzamanlı düzenlenmesi ortak metin düzenleme özelliği değildir. Serbest yazılar otomatik puanlanmaz. Geçmiş kaynak kitap `scripts/data/dtz-writing-book.json` içinde değişmeden tutulur; ders anlatımı ve iki örnek metin yukarıdaki gerekçelerle uyarlandı.

Gerçek öğrenci gözlemi, fiziksel telefon klavyesi ve ekran okuyucuyla kullanıcı denemesi yapılmış olarak raporlanmıyor. Yerel teknik doğrulama sonuçları [üretim notlarında](../production.md) kayıtlıdır.
