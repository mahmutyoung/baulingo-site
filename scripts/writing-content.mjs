import { taskGuidance, lessonOutcomes, activityRevisions } from './writing-guidance.mjs';

// Build-only snapshot of the owner's book. Never read sibling repositories in a build.
import writingBook from './data/dtz-writing-book.json' with { type: 'json' };
export { writingBook };
export const writingBase = '/dtz-mektup-yazma/';
export const writingGroups = { basics: 'Mektup Yazmaya Giriş', functions: 'Ne söylemek istiyorsun?', types: '11 mektup türü', exam: 'Yazma pratiği', help: 'Yardım ve tekrar' };
const example = (de, tr) => ({ de, tr });
const choice = (question, options, correct, explanation) => ({ kind: 'choice', question, options, answers: [options[correct]], explanation });
const cloze = (question, answer, explanation) => ({ kind: 'cloze', question, answers: [answer], explanation });
const order = (question, words, answer, explanation) => ({ kind: 'order', question, options: words, answers: [answer], explanation });

const definitions = [
  ['kime-yaziyorum', 'Kime yazıyorum?', 'basics', 1, [0,1,2],
    'Hitabın, zamirlerin ve kapanışın aynı kişiye uygun olsun.',
    ['Önce mesajı kimin okuyacağını düşün. Bir şirkete veya tanımadığın kişiye resmî bir dil kullan. Tanıdığın bir görevliye adıyla, arkadaşına samimi bir hitapla yaz.', 'Resmî yazıda Sie, arkadaşına yazarken du kullan. Mektubun ortasında bu biçimi değiştirme. Sie, Ihnen ve Ihr resmî hitapta büyük harfle yazılır. Yakından tanıdığın bir öğretmene Liebe Frau Adler, gibi sıcak bir hitapla yazarken Sie kullanmaya devam edebilirsin. Liebe her durumda du demek değildir; ilişkiniz ve zamirler birlikte düşünülür.'],
    [example('Sehr geehrte Frau Roth, könnten Sie mir bitte antworten?', 'Sayın Roth, bana yanıt verebilir misiniz?'), example('Liebe Aylin, kannst du mir bitte helfen?', 'Sevgili Aylin, bana yardım edebilir misin?')],
    choice('Bir sigorta şirketindeki Frau Roth’a hangi cümle uygun?', ['Liebe Frau Roth, kannst du mir antworten?', 'Sehr geehrte Frau Roth, könnten Sie mir bitte antworten?', 'Hallo Frau Roth, antworte schnell.'], 1, 'Sehr geehrte, Sie ve könnten aynı resmî ve nazik üsluba uyar.')],
  ['baslangic-ve-kapanis', 'Başlangıç ve kapanış', 'basics', 2, [0,1,2],
    'Hitap → içerik → selamlama → ad sırasıyla bir çerçeve kur.',
    ['Kadına Sehr geehrte Frau …, erkeğe Sehr geehrter Herr … yazılır. Alıcının adını bilmiyorsan Sehr geehrte Damen und Herren, kullan.', 'Arkadaşına Liebe Sara, veya Lieber Daniel, yazabilirsin. Almanya’da yaygın olan virgüllü hitaptan sonra yeni paragraf genellikle küçük harfle başlar: ich schreibe … İsimler, özel adlar ve resmî hitap zamirleri Sie, Ihnen, Ihr büyük harflerini korur.', 'Resmî kapanış Mit freundlichen Grüßen, samimi kapanış Viele Grüße olabilir. Kapanışın altına adını yaz; kapanış ifadesinden sonra virgül koyma.'],
    [example('Sehr geehrter Herr Weber,', 'Sayın Weber,'), example('Mit freundlichen Grüßen\nMina Demir', 'Saygılarımla\nMina Demir')],
    cloze('Boşluğu tamamla: Sehr ___ Herr Aksoy,', 'geehrter', 'Herr ile geehrter; Frau ile geehrte kullanılır.')],
  ['dort-maddeyi-planla', 'Dört maddeyi planla', 'basics', 3, [0,1,2],
    'Yazmadan önce her madde için bir anahtar sözcük seç.',
    ['İlk cümlen neden yazdığını söylesin. Ardından görevde istenen dört maddeyi tek tek ele al. Uzun bir plan yerine her madde için kısa bir not yeter. Uzunluktan önce istenen bilgileri karşılamaya odaklan.', 'Bir cümleyi iki ayrı maddenin cevabı saymadan önce ikisini de gerçekten açıklayıp açıklamadığına bak. Tarih, saat ve istediğin sonraki adım somut olsun.'],
    [example('Ich interessiere mich für Ihren Abendkurs.', 'Akşam kursunuzla ilgileniyorum.'), example('Sie erreichen mich werktags ab 16 Uhr.', 'Bana hafta içi saat 16’dan itibaren ulaşabilirsiniz.')],
    choice('Sipariş, sorun ve çözüm yazıldı. İletişim bilgisi için hangi cümle eksik?', ['Ich bin sehr unzufrieden.', 'Sie erreichen mich werktags ab 16 Uhr.', 'Der Wasserkocher ist weiß.'], 1, 'Eksik madde ulaşılabilirliktir. Bu cümle ne zaman ulaşılabileceğini söyler.')],
  ['cumleleri-bagla', 'Cümleleri birbirine bağla', 'basics', 4, [0,1,2,3],
    'Kısa cümlelerden anlamı açık bir metne geç.',
    ['Ana cümlede çekimli fiil ikinci konumda olur. weil ile neden anlatırken fiil yan cümlenin sonuna gider. weil öncesinde virgül kullan.', 'deshalb bir sonuç bildirir ve hemen ardından çekimli fiil gelir. aber karşıtlık, außerdem ek bilgi verir. Bağlaç seçimini anlama göre yap; her cümleyi uzatmak zorunda değilsin.'],
    [example('Ich kann nicht kommen, weil ich arbeiten muss.', 'Çalışmam gerektiği için gelemiyorum.'), example('Die Heizung ist kaputt. Deshalb ist die Wohnung kalt.', 'Kalorifer bozuk. Bu yüzden ev soğuk.')],
    order('Kelimeleri seçerek bir cümle kur.', ['krank ist.', 'Ich kann heute', 'weil meine Tochter', 'nicht kommen,'], 'Ich kann heute nicht kommen, weil meine Tochter krank ist.', 'weil yan cümlesinde ist sona gelir. Ana cümlede kann ikinci konumdadır.')],
  ['soru-rica-ve-iptal', 'Soru, rica ve iptal', 'functions', 5, [0,1,2],
    'Ne istediğini nazik ve açık biçimde söyle.',
    ['Bilgi isterken her soruda belirli bir şeyi sor: başlangıç, gün, süre, ücret veya gerekli belgeler. Rica ederken işi ve zamanı belirt.', 'Bir randevuyu iptal ederken eski randevuyu an, nedenini söyle, kısaca özür dile ve yeni bir zaman öner. A2’de kısa ve anlaşılır yaz; B1’e yaklaşırken bilgiyi ayrıntılandırıp mantıklı biçimde bağla.'],
    [example('Wie hoch ist die Kursgebühr?', 'Kurs ücreti ne kadar?'), example('Wäre Donnerstag um 10 Uhr möglich?', 'Perşembe saat 10 uygun olur mu?')],
    choice('Randevuyu iptal ettikten sonra hangi cümle çözüm önerir?', ['Das tut mir leid.', 'Wäre Donnerstag um 10 Uhr möglich?', 'Mein Sohn ist krank.'], 1, 'Bu cümle yeni ve somut bir randevu önerir. Diğerleri özür ve nedendir.')],
  ['sorun-ve-cozum', 'Sorunu anlat, çözüm iste', 'functions', 6, [0,1,2],
    'Sorun, süre, sonuç, önceki girişim ve istediğin çözümü açıkla.',
    ['Sadece kaputt demek yerine neyin çalışmadığını yaz: bleibt kalt, schließt nicht richtig veya lässt sich nicht einschalten.', 'seit bugün de süren durumu, vor geçmişteki olayı, bis son tarihi anlatır. Daha önce kimi aradığını ve sonuç alamadığını belirt. Sonunda tamir, değişim veya geri ödeme gibi açık bir çözüm iste.'],
    [example('Das Problem besteht seit fünf Tagen.', 'Sorun beş gündür devam ediyor.'), example('Ich habe das Gerät vor drei Monaten gekauft.', 'Cihazı üç ay önce aldım.'), example('Bitte antworten Sie mir bis Freitag.', 'Lütfen cumaya kadar yanıt verin.')],
    cloze('Boşluğu tamamla: Das Problem besteht ___ fünf Tagen.', 'seit', 'Sorun bugün de devam ettiği için seit kullanılır. vor geçmişteki bir zamanı belirtir.')],
  ['bilgi-isteme', 'Kurs hakkında bilgi iste', 'types', 7, [0],
    'İlgini ve hedefini belirt, sonra somut sorular sor.',
    ['Bilgi talebinde dört adım kullan: ilgin, kişisel durumun, ayrıntılı soruların ve ücret veya sonraki adım. Soruları kendi ihtiyacına bağla.', 'Bu görevde akşam çalışıyorsun ve çocuk bakımına ihtiyacın var. Kursun bitiş saatini ve çocuk bakımını sormak bu yüzden önemli.'],
    [example('Ich möchte außerdem wissen, ob es eine Kinderbetreuung gibt.', 'Ayrıca çocuk bakımı olup olmadığını öğrenmek istiyorum.')],
    choice('Çocuk bakımına ihtiyacın var. Hangi soru uygun?', ['Gibt es eine Kinderbetreuung?', 'Welche Farbe hat der Raum?', 'Wie heißt die Stadt?'], 0, 'Soru doğrudan kişisel ihtiyacınla ilgilidir.')],
  ['ev-arama', 'Ev arama ve evi görme', 'types', 7, [1],
    'Taşınma zamanını, ev ihtiyacını, masrafları ve görüşmeyi açıkla.',
    ['Kaç kişi için, kaç odalı ve ne zamandan itibaren ev aradığını yaz. İlandaki bir özelliğin senin için neden önemli olduğunu belirt.', 'Warmmiete genellikle işletme ve ısınma giderleri eklenmiş kirayı anlatır; her masrafın dâhil olduğunu varsayma. Hangi giderlerin dâhil olduğunu ve ayrıca ne ödeneceğini sor. Evi görmek için belirsiz bir zaman yerine iki somut seçenek sun.'],
    [example('Wie hoch ist die Warmmiete?', 'Isınma dâhil kira ne kadar?'), example('Wann wäre eine Besichtigung möglich?', 'Evi ne zaman görebilirim?')],
    choice('Evi görmek için hangi öneri daha açık?', ['Ich habe irgendwann Zeit.', 'Dienstag ab 16 Uhr oder Samstagvormittag.', 'Ich brauche eine Wohnung.'], 1, 'İki somut zaman, karşı tarafın randevu vermesini kolaylaştırır.')],
  ['davete-yanit', 'Davete yanıt ver', 'types', 7, [2],
    'Teşekkür et, katılıp katılmayacağını söyle ve ayrıntıları netleştir.',
    ['Önce davet için teşekkür et. Sonra kabul veya ret yanıtını açıkça yaz. Gerekiyorsa nedenini, yanında gelecek kişiyi veya getireceğin şeyi belirt.', 'Saat, adres veya ulaşım gibi eksik bilgileri sor. Eski iş arkadaşınla du kullanıyorsanız bütün mesajda samimi hitabı koru.'],
    [example('Vielen Dank für deine Einladung. Ich komme sehr gern.', 'Davetin için çok teşekkür ederim. Memnuniyetle gelirim.')],
    cloze('Boşluğu tamamla: Vielen Dank für ___ Einladung. (du)', 'deine', 'Samimi hitapta deine Einladung, resmî hitapta Ihre Einladung denir.')],
  ['yardimlasma', 'Yardım iste veya teklif et', 'types', 7, [3],
    'Yapılacak işi, zamanı, anahtarı ve iletişimi konuş.',
    ['Yardım edeceğini veya yardıma ihtiyacın olduğunu ilk cümlede açıkla. Hangi gün ve saatte müsait olduğunu söyle.', 'İşin ayrıntılarını sor: hayvan ne sıklıkla beslenecek, mama nerede, anahtar nasıl alınacak? Bir sorun olursa nasıl iletişim kurulacağını netleştir.'],
    [example('Wo kann ich den Schlüssel abholen?', 'Anahtarı nereden alabilirim?')],
    choice('Komşunun evindeki işi yapabilmek için hangi soru yararlı?', ['Wo kann ich den Schlüssel abholen?', 'Wie teuer ist dein Auto?', 'Welche Musik magst du?'], 0, 'Anahtar sorusu eve girişin nasıl yapılacağını netleştirir.')],
  ['randevu-degistirme', 'Randevuyu değiştir', 'types', 8, [0,1],
    'Eski randevu, neden, özür ve yeni zaman önerisi.',
    ['İptal ettiğin randevuyu gün ve saatiyle belirt. Nedeni kısa ve anlaşılır yaz; uzun bir savunmaya gerek yok.', 'Nazikçe özür dile, iki yeni zaman öner ve onay iste. Ek alıştırmada kursa gelemeyeceğini bildirip ödevleri sor.'],
    [example('Bitte bestätigen Sie mir einen passenden Termin.', 'Lütfen uygun bir randevuyu bana onaylayın.')],
    choice('İptal mesajında hangisi eksik kalmamalı?', ['Yalnızca uzun bir özür', 'Eski randevu ve yeni zaman önerisi', 'Alıcının yaşı'], 1, 'Karşı taraf hangi randevunun değiştiğini ve ne zaman gelebileceğini bilmelidir.')],
  ['sikayet', 'Şikâyet ve ürün sorunu', 'types', 8, [2],
    'Ürünü, arızayı, önceki iletişimi ve istediğin çözümü anlat.',
    ['Beschwerde ev, gürültü veya hizmetle ilgili olabilir. Reklamation çoğunlukla satın alınan bir ürünün sorununu bildirir.', 'Ne aldığını ve ne zaman aldığını söyle. Arızayı ve sonucunu açıkla. Önceki girişimini an ve tamir, değişim veya geri ödeme iste. Üslubunu sakin ve nazik tut.'],
    [example('Falls eine Reparatur nicht möglich ist, möchte ich ein Ersatzgerät erhalten.', 'Tamir mümkün değilse yeni bir cihaz almak istiyorum.')],
    choice('Hangi cümle somut bir çözüm istiyor?', ['Ich bin unzufrieden.', 'Das ist schlecht.', 'Bitte reparieren Sie den Akku.'], 2, 'Tam olarak hangi işlemin yapılmasını istediğini söylüyor.')],
  ['okul-ve-kres', 'Okula veya kreşe yaz', 'types', 8, [3,4],
    'Çocuğu, devamsızlığı, nedeni, dönüşü ve ödevleri belirt.',
    ['Çocuğunun adını ve hangi günler gelemeyeceğini yaz. Hastalığı veya yaralanmayı ve doktorun önerisini kısaca anlat.', 'Beklenen dönüş gününü belirt. Hangi ödevleri yapması gerektiğini ve çalışma kâğıtlarını nasıl alabileceğini sor.'],
    [example('Voraussichtlich kommt Adam am Donnerstag wieder in die Schule.', 'Adam’ın perşembe günü okula dönmesi bekleniyor.')],
    choice('Devamsızlık bildirimini hangi bilgi tamamlar?', ['Dönüş günü ve ödev isteği', 'Tatil fotoğrafları', 'Alışveriş listesi'], 0, 'Dönüş ve evde yapılacak çalışmalar öğretmenin plan yapmasına yardımcı olur.')],
  ['is-ve-basvuru', 'İş ve kısa başvuru', 'types', 8, [5,6],
    'Pozisyon, deneyim, başlangıç ve görüşme isteği.',
    ['Başvurduğun işi açıkça adlandır. Bu işle ilgili deneyimini somut görevlerle anlat. Ne zaman başlayabileceğini ve hangi saatlerde çalışabileceğini belirt.', 'Sonunda bir görüşme talep et. Vardiya değiştirme alıştırmasında sorunu ve karşılığında sunduğun alternatifi nazikçe yaz.'],
    [example('Hiermit bewerbe ich mich um die Stelle als Küchenhilfe.', 'Mutfak yardımcısı pozisyonuna başvuruyorum.')],
    cloze('Boşluğu tamamla: Ich bewerbe mich ___ die Stelle als Küchenhilfe.', 'um', 'Bir işe başvurmak: sich um eine Stelle bewerben.')],
  ['kurum-ve-sigorta', 'Kurum, sigorta ve kayıp', 'types', 9, [0,1,2],
    'Kim, ne, nerede, ne zaman ve hangi sonraki adım?',
    ['Resmî yazışmada kişiler, eşyalar, tarih ve olay açık olmalı. Olanları sakin ve gerçeğe dayalı anlat; hangi belgeyi veya işlemi istediğini sor.', 'Sigortaya hasarı bildir, kayıp bürosuna eşya ve yeri söyle, kuruma başvurunun hangi aşamada olduğunu sor.'],
    [example('Welche Unterlagen benötigen Sie?', 'Hangi belgelere ihtiyacınız var?'), example('Wie ist der aktuelle Bearbeitungsstand?', 'İşlemin güncel durumu nedir?')],
    choice('Bir kayıp eşyayı bulmayı hangi bilgi kolaylaştırır?', ['Sadece çok üzgün olduğun', 'Eşyanın tanımı, kaybolduğu yer ve zaman', 'Sevdiğin yemek'], 1, 'Somut tanım, yer ve zaman eşyanın belirlenmesine yardımcı olur.')],
  ['alisveris', 'Özel alışveriş ve satış', 'types', 9, [3,4],
    'Ürün, durum, fiyat, ödeme ve teslimi açıkla.',
    ['Satarken ürünü, yaşını, rengini ve durumunu söyle. Satış nedenini ekle. Fiyatı, ödeme biçimini ve teslimi netleştir.', 'Alırken özellikleri, durumunu ve görmek için uygun zamanı sor. Tanıdığın kişiye yazarken uygun samimi hitabı kullan.'],
    [example('Du kannst bar bezahlen, wenn du den Kinderwagen abholst.', 'Bebek arabasını alırken nakit ödeyebilirsin.')],
    choice('Bir satış mesajını hangi ayrıntılar tamamlar?', ['Fiyat, ödeme ve teslim', 'Sadece renk', 'Sadece selamlama'], 0, 'Alıcı ne kadar ve nasıl ödeyeceğini, ürünü nasıl alacağını bilmelidir.')],
  ['deneyim-anlatma', 'Bir deneyimini anlat', 'types', 9, [5],
    'Nerede, kiminle, ne yaptın ve ne düşündün?',
    ['Bir deneyim yazısı sadece soru sormaz; yaşadıklarını anlatır. Önce yeri ve yanında kim olduğunu belirt. Sonra yaptıklarını yaz.', 'Beğendiğin ve beğenmediğin yönlere birer neden ekle. Geçmişte tamamlanan etkinlikleri anlatırken uygun geçmiş zaman kullan.'],
    [example('Gestern haben wir den Hafen besichtigt.', 'Dün limanı gezdik.'), example('Besonders gut gefällt mir das Wasser, weil die Stadt dadurch lebendig wirkt.', 'Özellikle suyu seviyorum; çünkü şehre canlılık katıyor.')],
    cloze('Boşluğu tamamla: Gestern ___ wir ein Museum besucht.', 'haben', 'besuchen fiilinin Perfekt biçimi haben ile kurulur: haben besucht.')],
  ['gorevi-anlama', 'Yazma görevini anla', 'exam', 10, [0,1,2],
    'A veya B’yi seç, dört maddeyi planla ve metnini gözden geçir.',
    ['İki görevden, her maddesi için bir şey söyleyebileceğin görevi seç. Sadece konuyu sevmen yeterli değil; durumu, alıcıyı ve istediğin sonucu anlamalısın.', '30 dakikalık çalışmada yaklaşık 2 dakika seçme, 3 dakika plan, 20 dakika yazma ve 5 dakika kontrol deneyebilirsin. Bu bir çalışma önerisidir.', 'Dört açıdan kontrol et: görev maddeleri; düzen ve hitap; fiiller ve noktalama; konuya uygun sözcükler. Bu kontrol bir resmî seviye sonucu vermez.'],
    [example('Ich wähle Aufgabe B, weil ich ein Lieferproblem gut beschreiben kann.', 'Teslimat sorununu iyi anlatabildiğim için B görevini seçiyorum.')],
    choice('Görev seçerken en yararlı ölçüt hangisi?', ['Hangisinin başlığı daha güzel?', 'Hangisinin dört maddesine de somut yanıt verebilirim?', 'Hangisi önce yazılmış?'], 1, 'Bütün maddeleri karşılayabilmek, yalnızca konu tercihinden daha yararlı bir seçim ölçütüdür.')],
  ['rehberli-yazma', 'Rehberli mektup yazma', 'exam', 11, [0,1],
    'Planını yap, ipuçlarıyla yaz ve sonra kendi metnini geliştir.',
    ['Önce her madde için kısa bir not yaz. Bilgi isteme ve kalorifer şikâyeti görevlerinde ilgili derslerdeki cümle kalıplarından yararlanabilirsin.', 'Örneği açmadan bir mesaj yaz. Dört maddeyi kendi metninde bul. Ardından örnekle karşılaştır ve belirsiz bir bilgiyi veya soruyu geliştir.'],
    [example('Bitte teilen Sie mir außerdem mit, wie hoch die Kursgebühr ist.', 'Lütfen ayrıca kurs ücretinin ne kadar olduğunu bildirin.')],
    choice('Örnek yanıtı ne zaman açmak daha yararlı?', ['Kendi metnini yazıp kontrol ettikten sonra', 'İlk cümleyi yazmadan önce kopyalamak için', 'Kendi metnini yazmak yerine'], 0, 'Önce kendi metnini üretmek, örnekle anlamlı bir karşılaştırma yapmanı sağlar.')],
  ...[1,2,3].map((number) => [`deneme-${number}`, `Yazma denemesi ${number}`, 'exam', 12, [2*(number-1),2*(number-1)+1],
    ['Davet veya teslimat sorunu', 'Okul veya komşuluk sorunu', 'İş veya sigorta'][number-1],
    ['A ve B görevlerini oku; birini seç ve yalnızca o görev için bir mektup yaz. Dört maddeyi de ele al. Hitap ve kapanışı alıcıya uygun seç.', 'İstersen görevleri okumadan önce 30 dakikalık süreyi başlat. Süre dolunca yazın silinmez; çalışmaya devam edebilirsin. Deneme sırasında cümle yardımını ve örnek yanıtı kullanmamaya çalış.', 'Yazdıktan sonra kendi kontrolünü yap, seçtiğin görevin örneğini aç ve bir cümleni geliştir. Bu çalışma otomatik puan veya resmî sınav sonucu vermez.'], [], null]),
  ['cumle-kaliplari', 'Cümle kalıpları', 'help', 13, [],
    'Tek sözcük yerine birlikte kullanılan sözcük gruplarını öğren.',
    ['Sadece Termin sözcüğünü değil, einen Termin vereinbaren ifadesini öğren. Böylece yazarken hangi fiili kullanacağını da hatırlarsın.', 'Bu sayfayı öğrenirken kullan; kendi başına deneme yaparken önce yardım almadan yazmayı dene.'], [], null],
  ['ogrenme-yolum', 'Öğrenme yolum', 'help', 14, [],
    'Kısa ve düzenli yaz, kendi gelişimini karşılaştır.',
    ['Önerilen dört hafta: ilk hafta temeller, ikinci hafta soru ve sorun anlatma, üçüncü hafta 11 mektup türü, dördüncü hafta rehberli çalışma ve denemeler. Daha fazla zamana ihtiyacın varsa aynı haftayı tekrarla.', 'Her mesajdan sonra tarih, mektup türü, dört madde, geliştirdiğin cümle ve sonraki hedefini not et. Zorlanırsan önce dört anahtar sözcük, sonra dört kısa cümle yaz; hitap ve kapanışı ekle.', 'A2 kontrolü: dört madde anlaşılır, hitap uygun, Sie veya du tutarlı ve cümleler açık. B1 yönünde adım: ayrıntıları somutlaştır, cümleleri mantıklı bağla, konuya uygun sözcükler seç ve bir hatanı kendin düzelt.', 'Sonunda ilk yazma görevine dön ve örneğe bakmadan yeniden yaz. İki metni karşılaştır: amaç, ayrıntılar, üslup, bağlaçlar ve istediğin çözüm daha açık mı?'], [], null],
];

// Each Turkish brief corresponds to an original <details> answer, in source order.
const briefs = {
  1: ['Müşteri hizmetleri, Nora, ev sahibi Herr Klein ve Bürgerbüro için uygun üslubu seç: resmî, adıyla nazik veya samimi.', 'Frau Roth’a yazarken uygun cümleyi seç. Hitap, zamir ve fiilin birbiriyle uyumuna dikkat et.', 'Bürgerbüro’daki Herr Weber’e uygun bir hitap ve salı sabahı için nazik bir randevu isteği yaz.'],
  2: ['Frau Neumann, Herr Aksoy, Daniel ve Sara için eksik hitap sözcüklerini tamamla.', 'Karışık verilen dört parçayı hitap, içerik, kapanış ve ad sırasına koy.', 'Komşun Aylin’den cumartesi yardım iste. Hitap, bir rica cümlesi, kapanış ve adını yaz.'],
  3: ['Sipariş, sorun ve çözüm zaten var. Ulaşılabilirlik maddesini tamamlayan cümleyi seç.', 'Salı günkü danışma randevusuna gelemiyorsun. Eski randevu, neden, yeni öneri ve onay için not al; neden ve yeni öneri için iki cümle yaz.', 'Yatak odasındaki pencere üç gündür kapanmıyor. Neden yazdığını, sorunu ve süresini, sonucunu ve tamir isteğini dört cümleyle anlat.'],
  4: ['İki cümleyi verilen parçalarla doğru sıraya koy. weil sonrası fiilin yerini kontrol et.', 'Üç boşluğu sırayla aber, deshalb veya außerdem ile tamamla.', 'İki hafta önce verdiğin sipariş gelmedi ve pazartesi gerekiyor. Bilgileri en az iki uygun bağlaçla birleştir.', 'Lea cumartesi taşınıyor. Saat 14’ten sonra yardım edebilirsin. Kişisel hitap ve uygun kapanışla tam bir mesaj yaz. weil ile nedenini açıkla; araç gereç ve başka yardımcıları sor.'],
  5: ['Bilgisayar kursunun başlangıcı ve ücreti hakkında iki Almanca soru yaz.', 'Hasta komşuna bugün alışveriş yapabileceğini söyle ve gerekli ayrıntıyı sor.', 'Oğlun hasta olduğu için yarınki danışma randevusuna gelemiyorsun. İptal ve neden, özür ve perşembe sabahı için yeni öneri yaz.'],
  6: ['Üç boşluğa sırayla seit, vor veya bis yaz.', 'Yanlış fatura için önce aradın, sonra e-posta gönderdin; yanıt gelmedi. zuerst, danach ve aber ile iki cümle yaz.', 'Beş gündür sıcak su yok, ailen duş alamıyor, yönetimi iki kez aradın. Herr König’e sorunu ve önceki girişimi anlat, tamir ve yanıt iste.'],
  7: ['Frau Hansen’e bilgisayar kursuyla ilgilendiğini yaz. Öğrenme hedefini ve akşam çalışma saatini anlat. Kurs günlerini, bitiş saatini, çocuk bakımı olup olmadığını ve ücreti sor.', 'Herr Braun’un ağustosta boşalacak üç odalı eviyle ilgileniyorsun. İki çocuğunla yaşayacağını, taşınma zamanını yaz; toplam kirayı sor ve evi görmek için iki zaman öner.', 'Derya’nın pazar günkü bahçe davetini kabul et. Teşekkür et, geliş saatini ve salata getirebileceğini söyle; adresi ve otobüsü sor.', 'Omar cuma–pazartesi yok. Tavşanına ve bitkilerine bakabileceğini söyle. Saatlerini yaz; mama, görevler, anahtar ve iletişimi sor.'],
  8: ['Çarşamba saat 11’deki fizyoterapi randevuna çocuğunu kreşten alman gerektiği için gelemiyorsun. Özür dile; cuma 14’ten sonra veya pazartesi sabahını öner.', 'Yarın Almanca kursuna gelemiyorsun. Bir özür cümlesi yaz ve ödevleri iste.', 'Dört ay önce aldığın elektrikli süpürgenin pili iki gündür şarj olmuyor. Dün arayıp ulaşamadın. Müşteri hizmetlerine tamir veya değişim isteği yaz.', 'Oğlun Adam futbol oynarken ayağını yaraladı; çarşambaya kadar evde kalmalı. Herr Seidel’e devamsızlık, neden, dönüş ve ödev isteğini yaz.', 'Kızının ateşi var. Kreşe gelemeyeceğini ve beklenen dönüşünü iki cümleyle yaz.', 'Stadtblick restoranındaki sabah mutfak yardımcısı işine Herr Peters üzerinden başvur. Üç yıllık yemekhane deneyimini, 1 Eylül başlangıcını, saatlerini ve görüşme isteğini yaz.', 'Cuma sadece 15’e kadar çalışabilirsin; karşılığında perşembe 18’e kadar kalabilirsin. İki nazik cümle yaz.'],
  9: ['Kızın 18 Haziran’da bisikletiyle Herr Bako’nun arabasına çarptı, kapı çizildi. Sigortaya kişiler ve eşyaları, tarihi, olayı, hasarı ve sonraki adım sorusunu yaz.', 'Dün 42 numaralı otobüste siyah cüzdanını kaybettin. Kayıp bürosuna eşya, yer ve zamanı iki cümleyle yaz; bundan sonra ne yapacağını sor.', 'Üç hafta önce başvuru belgelerini gönderdin; yanıt gelmedi. İşlemin durumunu nazikçe sor.', 'Lina’ya üç yaşında, gri ve iyi durumdaki bebek arabasını satıyorsun. Artık gerekmediğini, 80 avroluk fiyatı, ödeme ve teslimi yaz.', 'İkinci el çocuk montlarıyla ilgileniyorsun. Beden, durum ve görmek için uygun zamanı sor.', 'Kız kardeşinle Hamburg’da arkadaşlarını ziyaret ediyorsun. Liman ve müzeyi gezdiniz. Frau Keller’e yer, kişiler, etkinlikler, sevdiğin ve sevmediğin yönleri nedenleriyle yaz.'],
  10: ['Frau Berg’in daveti ve geciken kitap siparişini karşılaştır. Her görev için alıcı, amaç, üslup ve gerekli sözcükleri belirle. Hangisini seçtiğini nedeniyle yaz.', 'Sami ayağını yaraladığı için üç gün yok. Verilen notları devamsızlık, yaralanma, dönüş ve materyal başlıklarına sırala.', 'Gece piyano çalan komşuyla ilgili zayıf metni geliştir: somut zaman ekle, açık bir çözüm iste ve weil cümlesini düzelt.'],
  11: ['Herr Brandt’a “Deutsch für den Beruf” akşam kursu için yaz. Hedefin, mevcut Almancan, gün ve saatler, ücret hakkında dört maddeyi planlayıp mektup yaz.', 'Ev sahibin Frau Vogt’a altı gündür düzgün çalışmayan kalorifer için yaz. Sorun ve süre, ailen üzerindeki etkisi, önceki aramalar ve istediğin tamir zamanını anlat.'],
  12: ['A: Eski öğretmenin Frau Adler yeni dil okulunun açılışına davet etti. Teşekkür, gerekçeli kabul veya ret, yanındaki kişi veya hediye, başlangıç ve yol bilgisi hakkında yaz.', 'B: KinderZeit’tan iki hafta önce sipariş edip ödediğin çocuk sırt çantası gelmedi. Sipariş ve ödeme, gecikme, aciliyet, teslim tarihi veya geri ödeme hakkında yaz.', 'A: Kızın hafta sonu kolunu yaraladı, perşembeye kadar okula gidemiyor. Herr Seidel’e neden, doktor önerisi, dönüş ve spor, materyal ve ödevler hakkında yaz.', 'B: Komşun haftada birkaç kez 23’ten sonra yüksek sesli müzik dinliyor. Konuşman sonuç vermedi. Frau Kranz’a gürültü, uyku ve işe etkisi, önceki konuşma ve çözüm isteğini yaz.', 'A: Herr Winter cumartesi ek vardiya istiyor. Sabah çalışabilirsin; sonraki hafta bir öğleden sonra izin gerekiyor. Yanıt, cumartesi saatlerin, izin nedeni ve zamanı, onay isteğini yaz.', 'B: Kızın bir tanıdığının dizüstü bilgisayarını düşürüp bozdu. Sigortaya eşya ve sahibi, olayın zamanı ve oluşu, hasar ve sahibinin tepkisi, sigortadan isteğin hakkında yaz.'],
};

function sourceTasks(chapter) {
  const markdown = writingBook.chapters[chapter].markdown;
  const details = [...markdown.matchAll(/<details>\s*<summary>(.*?)<\/summary>([\s\S]*?)<\/details>/g)];
  return details.map((match, index) => {
    const before = markdown.slice(0, match.index);
    const headers = [...before.matchAll(/^#{2,3} (?:Übung\b|Teil-1-Aufgabe\b|Mini-Übung\b|Deine Nachricht\b|10\.4\b|Aufgabe \d\b).*$/gm)];
    let prompt = before.slice(headers.at(-1)?.index ?? 0).split(/^#{3,4} Selbstkontrolle/m)[0];
    // Simulations show the original A/B task separately; each gets its own draft.
    if (chapter === 12) {
      const simulation = markdown.split(/^# Simulation \d\s*$/m)[1 + Math.floor(index / 2)];
      const letter = index % 2 ? 'B' : 'A';
      prompt = simulation.split(new RegExp(`^## Aufgabe ${letter}[^\\n]*\\n`, 'm'))[1].split(/^## Aufgabe |^<details>/m)[0];
    }
    prompt = prompt.replace(/<details>[\s\S]*?<\/details>/g, '').trim();
    return { id: `c${chapter}-t${index + 1}`, sourceChapter: chapter, sourceIndex: index,
      brief: briefs[chapter][index], prompt, model: match[2].trim() };
  });
}

const turkishActivities = new Set(['randevu-degistirme', 'okul-ve-kres', 'kurum-ve-sigorta', 'alisveris', 'gorevi-anlama', 'rehberli-yazma']);
export const writingLessons = definitions.map(([id,title,group,chapter,indices,intro,learn,examples,activity]) => ({
  id, title, group, chapter, intro, learn, examples, outcome:lessonOutcomes[id], reference:group==='help',
  activity: activityRevisions[id] ? {kind:'choice',...activityRevisions[id],answers:[activityRevisions[id].options[activityRevisions[id].correct]],language:id==='gorevi-anlama'||id==='rehberli-yazma'?'tr':'de'} : activity ? { ...activity, language: turkishActivities.has(id) ? 'tr' : 'de' } : null,
  simulation: chapter === 12,
  tasks: indices.map(index => {
    const task=sourceTasks(chapter)[index];
    if(task.id==='c4-t3') task.model=task.model.replace(/Da ich sie am Montag brauche,[\s\S]*?Liefertermin mit\./,'Ich brauche sie am Montag. Deshalb möchte ich den Liefertermin wissen.');
    if(task.id==='c12-t1') task.model=task.model.replace('komme gern.','komme gern, weil ich Ihre neue Schule kennenlernen möchte.');
    return {...task,...taskGuidance[task.id]};
  }),
}));
