// Turkish meanings describe the variable template, rather than one particular example.
export const sentenceMeanings = Object.fromEntries(`
{zaman / öneri} passt mir gut.|{zaman / öneri} benim için uygun.
Können Sie {Akkusativ nesne} wiederholen?|{nesne} tekrar edebilir misiniz?
Könnten Sie bitte {mastar fiil grubu}?|Lütfen {eylem} yapabilir misiniz?
Was bedeutet {özne}?|{özne} ne demek?
Wie wäre es mit {Dativ isim grubu}?|{öneri} nasıl olur?
Ich schlage vor, dass {yan cümle: fiil sonda}.|{önerilen eylem} yapmayı öneriyorum.
Was hältst du von {Dativ isim grubu}?|{konu} hakkında ne düşünüyorsun?
Ich schreibe Ihnen wegen {neden isim grubu}.|Size {neden} nedeniyle yazıyorum.
Könnten Sie mir mitteilen, ob {yan cümle: fiil sonda}?|{durum} olup olmadığını bana bildirebilir misiniz?
Wie viel kostet {service}?|{araç / hizmet} ne kadar?
Wie komme ich zu {place}?|{yer} nasıl gidebilirim?
Es sieht so aus, als ob {yan cümle: fiil sonda}.|{durum} gibi görünüyor.
Ich finde {topic} {evaluation}.|{konu} bence {değerlendirme}.
Ein Vorteil ist, dass {yan cümle: fiil sonda}.|Bir avantajı, {durum} olmasıdır.
Ich heiße {name}.|Benim adım {isim}.
Ich komme aus {country}.|{ülke} ülkesinden geliyorum.
Ich wohne in {Stadt}.|{şehir} şehrinde oturuyorum.
Ich spreche {languages}.|{diller} konuşuyorum.
Ich hätte gern {Getränk}.|{içecek} rica ediyorum.
Ich suche {Gegenstand}.|{nesne} arıyorum.
Haben Sie {Ware}?|Sizde {ürün} var mı?
Das ist zu {Adjektiv}.|Bu, gereğinden fazla {sıfat}.
Ich nehme {Ware}.|{ürün} alıyorum.
Wo ist {Ort}?|{yer} nerede?
Ich möchte nach {Stadt}.|{şehir} şehrine gitmek istiyorum.
Wann kommt {Verkehrsmittel}?|{araç} ne zaman geliyor?
Ich habe {tamamlayıcı}.|Benim {sahip olunan şey} var.
Das ist mein / meine {tamamlayıcı}.|Bu benim {kişi / nesne}.
{Person} ist {Alter} Jahre alt.|{kişi}, {yaş} yaşında.
{Person} wohnt bei {Person im Dativ}.|{kişi}, {başka kişi} ile aynı evde yaşıyor.
Ich habe um {Uhrzeit} Zeit.|Saat {saat} için müsaitim.
{ana cümle}, weil {yan cümle: fiil sonda}.|{sonuç}, çünkü {neden}.
Ich bin {profession} von Beruf.|Mesleğim {meslek}.
Mein Hobby ist {hobi}.|Hobim {hobi}.
Ich bin {yaş} Jahre alt.|{yaş} yaşındayım.
Ich lerne Deutsch für {amaç}.|{amaç} için Almanca öğreniyorum.
Wo finde ich {ürün}?|{ürün} nerede bulabilirim?
Ich brauche {nesne}.|{nesne} gerekiyor.
Haben Sie das in {renk}?|Bunun {renk} rengi var mı?
Kann ich {tamamlayıcı} haben?|{istenen şey} alabilir miyim?
Fährt dieser Bus nach {tamamlayıcı}?|Bu otobüs {yer} yönüne gidiyor mu?
Ich fahre mit {araç}.|{araç} ile gidiyorum.
Hier müssen Sie {eylem}.|Burada {eylem} yapmalısınız.
Wir sind {sayı} Personen.|Biz {sayı} kişiyiz.
Ich habe keine {çoğul isim}.|Benim {çoğul isim} yok.
Das Zimmer hat {nesne}.|Odada {nesne} var.
{yer} ist neben {Dativ yer}.|{yer}, {diğer yer} yanında.
Ich wohne mit {Dativ kişi}.|{kişi} ile yaşıyorum.
Meine Familie lebt in {yer}.|Ailem {yer} içinde yaşıyor.
Ich stehe um {saat} auf.|Saat {saat} kalkıyorum.
Ich gehe um {saat} schlafen.|Saat {saat} yatıyorum.
Heute ist {gün}.|Bugün {gün}.
Ich komme am {gün}.|{gün} günü geliyorum.
Ich habe von {saat} bis {saat} Zeit.|Saat {başlangıç} ile {bitiş} arasında müsaitim.
{tekil özne} muss {Partizip II} werden.|{özne} için {eylem} yapılması gerekiyor.
Bitte {çekimli fiil} Sie {nesne} {ayrılan ön ek}.|Lütfen {nesne} ile ilgili {eylem} yapınız.
Leider kann {özne} {zaman} nicht.|Ne yazık ki {özne}, {zaman} müsait değil / yapamıyor.
Ja, {özne} {çekimli fiil}.|Evet, {özne} {eylem} yapıyor.
Mit {product} gibt es ein Problem.|{ürün} ile ilgili bir sorun var.
Können Sie {Dativ kişi} {Akkusativ nesne} geben?|{kişi} için {nesne} verebilir misiniz?
Ich bin am {day} ab {time} zu Hause.|{gün} günü saat {saat} itibarıyla evdeyim.
Welche {çoğul isim} brauche ich?|Hangi {çoğul isim} gerekli?
Leider kann ich nicht {mastar fiil}.|Ne yazık ki {eylem} yapamıyorum.
Können wir uns stattdessen am {day} treffen?|Bunun yerine {gün} günü buluşabilir miyiz?
{özne} kann nicht {yer bilgisi} {mastar fiil}.|{özne}, {yer} için {eylem} yapamıyor.
Ich kann {zaman} nicht {mastar fiil}.|{zaman} için {eylem} yapamıyorum.
Ich freue mich auf {Akkusativ isim grubu}.|{beklenen şey} için sabırsızlanıyorum.
Ich habe {nesne} auch schon {Partizip II}.|{nesne} ile ilgili {eylem} ben de çoktan yaptım.
Ein Nachteil ist {problem}.|Bir dezavantajı {sorun}.
Hast du schon {Akkusativ isim grubu}?|Senin {nesne} zaten var mı?
Ich mache {task}, und du machst {task}.|Ben {görev} yaparım, sen de {diğer görev} yaparsın.
Was {çekimli fiil} {özne}?|{özne} ne {eylem}?
{tekil özne} ist {isim grubu}.|{özne}, {tanım}.
{Akkusativ nesne} finde ich {değerlendirme}.|{nesne} bence {değerlendirme}.
Also {çekimli fiil} {özne} {tamamlayıcı}.|Öyleyse {özne}, {eylem} yapıyor.
Haben {özne} {nesne} {Partizip II}?|{özne}, {nesne} ile ilgili {eylem} yaptı mı?
Du machst {task}, und ich mache {task}.|Sen {görev} yaparsın, ben de {diğer görev} yaparım.
Ich nehme {Bestellung} zum Mitnehmen, bitte.|{sipariş} paket olsun, lütfen.
Ich möchte {Gegenstand}, bitte.|{nesne} istiyorum, lütfen.
Gehen Sie nach {Richtung}.|{yön} doğru gidin.
Ich habe {Anzahl} Kinder.|{sayı} çocuğum var.
Das ist {Possessivartikel} {Familienmitglied}.|Bu, {iyelik bildiren söz} {aile üyesi}.
Entschuldigung, {soru cümlesi}?|Affedersiniz, {soru}?
Ich kann {Zeitangabe} leider nicht.|Ne yazık ki {zaman} müsait değilim / yapamıyorum.
Wir sehen uns {zaman}.|{zaman} görüşürüz.
Wie heißt {kişi}?|{kişi} adı ne?
Wie geht es {kişi}?|{kişi} nasıl?
Ich nehme {içecek} mit Milch.|{içecek} sütlü alıyorum.
Ich trinke {içecek} ohne Zucker.|{içecek} şekersiz içiyorum.
Entschuldigung, ich möchte {mastar fiil grubu}.|Affedersiniz, {eylem} yapmak istiyorum.
Entschuldigung, ist {yer} noch frei?|Affedersiniz, {yer} hâlâ boş mu?
{nesne} gefällt mir.|{nesne} hoşuma gidiyor.
Danke, {özne} {çekimli fiil} nur.|Teşekkürler, {özne} sadece {eylem} yapıyor.
Kann ich bitte {nesne} haben?|Lütfen {nesne} alabilir miyim?
Fährt {araç} nach {yer}?|{araç}, {yer} yönüne gidiyor mu?
Ist {yer} weit?|{yer} uzak mı?
Gehen Sie {yer} geradeaus.|{yer} boyunca düz gidin.
{service} fährt um {time} ab.|{araç} saat {saat} hareket ediyor.
{service} hat {duration} Verspätung.|{araç}, {süre} gecikmeli.
{service} fährt heute von {place}.|{araç} bugün {yer} noktasından kalkıyor.
Wegen {reason} fährt {service} anders.|{neden} nedeniyle {araç} farklı bir güzergâhtan gidiyor.
{place} bleibt am {day} geschlossen.|{yer}, {gün} günü kapalı kalacak.
Bitte {fiil} Sie {tamamlayıcı}.|Lütfen {tamamlayıcı} ile ilgili {eylem} yapınız.
{place} öffnet um {time}.|{yer} saat {saat} açılıyor.
{event} beginnt um {time}.|{etkinlik} saat {saat} başlıyor.
Heute gibt es {weather}.|Bugün {hava durumu} var.
{object} wurde gefunden.|{nesne} bulundu.
Ihr Termin ist am {date} um {time}.|Randevunuz {tarih} tarihinde saat {saat}.
Ihre Lieferung kommt am {day}.|Teslimatınız {gün} günü geliyor.
{activity} fällt heute aus.|{etkinlik} bugün yapılmayacak.
Soll ich dir bei {task} helfen?|{görev} konusunda sana yardım edeyim mi?
Kannst du mir bei {task} helfen?|{görev} konusunda bana yardım edebilir misin?
Geht es auch am {day}?|{gün} günü de olur mu?
Meinen Sie {option}?|{seçenek} mi demek istiyorsunuz?
{object} funktioniert nicht.|{nesne} çalışmıyor.
Ein Vorteil ist {benefit}.|Bir avantajı {fayda}.
Am {day} bleibt {place} geschlossen.|{gün} günü {yer} kapalı kalacak.
{action} ist nicht erlaubt.|{eylem} yapmak yasak.
{document} muss bis {date} vorliegen.|{belge}, {tarih} tarihine kadar teslim edilmiş olmalı.
Bei Fragen rufen Sie {contact} an.|Sorularınız için {iletişim} arayın.
{object} ist ab {date} verfügbar.|{nesne}, {tarih} itibarıyla mevcut olacak.
{object} kostet {price}.|{nesne} fiyatı {fiyat}.
{object} ist nur für {group}.|{nesne} yalnızca {grup} için.
Wir bieten {service} an.|{hizmet} sunuyoruz.
Der Kurs findet am {day} statt.|Kurs {gün} günü yapılıyor.
Sie brauchen {qualification}.|{nitelik} gerekiyor.
Bewerben Sie sich bis {date}.|{tarih} tarihine kadar başvurun.
Ich lade dich zu {event} ein.|Seni {etkinlik} için davet ediyorum.
{event} fällt aus.|{etkinlik} yapılmayacak.
Kannst du bitte {action}?|Lütfen {eylem} yapabilir misin?
Ich möchte wissen, {question}.|{soru} öğrenmek istiyorum.
{person} kann heute nicht kommen.|{kişi} bugün gelemiyor.
Zuerst müssen Sie {action}.|Önce {eylem} yapmalısınız.
Bringen Sie {documents} mit.|{belgeler} yanınızda getirin.
Bei {symptom} sollten Sie {action}.|{belirti} varsa {eylem} yapmanız iyi olur.
{object} dürfen nur {condition} mitgenommen werden.|{nesne} yalnızca {koşul} koşuluyla beraberinde götürülebilir.
Bitte zahlen Sie {amount} bis {date}.|Lütfen {tutar} tutarını {tarih} tarihine kadar ödeyin.
Wir übernehmen {cost}.|{masraf} biz karşılıyoruz.
Sie haben einen Termin am {date}.|{tarih} tarihinde randevunuz var.
Ich schreibe dir, weil {reason}.|Sana yazıyorum, çünkü {neden}.
Ich schreibe Ihnen, weil {reason}.|Size yazıyorum, çünkü {neden}.
Seit {duration} funktioniert {object} nicht.|{nesne}, {süre} boyunca çalışmıyor.
Das Problem ist {detail}.|Sorun şu: {ayrıntı}.
Deshalb kann ich {consequence} nicht.|Bu yüzden {sonuç} yapamıyorum.
Bitte lassen Sie {object} reparieren.|Lütfen {nesne} tamir ettirin.
Sie erreichen mich unter {contact}.|Bana {iletişim} üzerinden ulaşabilirsiniz.
Wann beginnt {course}?|{kurs} ne zaman başlıyor?
Wie lange dauert {course}?|{kurs} ne kadar sürüyor?
Ich komme gern zu {event}.|{etkinlik} için memnuniyetle gelirim.
Es tut mir leid, dass {problem}.|{sorun} olduğu için üzgünüm.
Was kann ich {person} schenken?|{kişi} için ne hediye alabilirim?
Ich bin mit {product} nicht zufrieden.|{ürün} konusunda memnun değilim.
Bitte erstatten Sie mir {amount}.|Lütfen {tutar} tutarını bana iade edin.
Bitte schicken Sie mir {replacement}.|Lütfen bana {alternatif} gönderin.
Ich interessiere mich für {position}.|{pozisyon} ile ilgileniyorum.
Ich habe Erfahrung mit {skill}.|{beceri} konusunda deneyimim var.
Ich konnte {requirement} nicht erfüllen.|{gereklilik} yerine getiremedim.
Am {date} ist {event} passiert.|{tarih} tarihinde {olay} oldu.
Ich wohne seit {duration} in {place}.|{süre} boyunca {yer} içinde yaşıyorum.
Ich lebe mit {people} zusammen.|{kişiler} ile birlikte yaşıyorum.
Zurzeit {çekimli fiil} {özne} {tamamlayıcı}.|Şu sıralar {özne}, {eylem} yapıyor.
In meiner Freizeit {çekimli fiil} {özne} {tamamlayıcı}.|Boş zamanımda {özne}, {eylem} yapıyor.
Auf dem Bild sehe ich {scene}.|Resimde {sahne} görüyorum.
Die Personen sind in {place}.|Kişiler {yer} içinde.
Vorne sehe ich {object}.|Önde {nesne} görüyorum.
Im Hintergrund ist {object}.|Arka planda {nesne} var.
Die Person trägt {clothing}.|Kişi {giysi} giyiyor.
{kişi} {çekimli fiil} {tamamlayıcı}.|{kişi}, {eylem} yapıyor.
{object} liegt neben {place}.|{nesne}, {yer} yanında duruyor.
Die Person wirkt {mood}.|Kişi {ruh hâli} görünüyor.
Das Wetter ist {weather}.|Hava {hava durumu}.
Vielleicht {çekimli fiil} {özne} {tamamlayıcı}.|Belki {özne}, {eylem} yapıyor.
Letztes Jahr {çekimli fiil} {özne} {tamamlayıcı}.|Geçen yıl {özne}, {eylem} yaptı.
In meinem Heimatland ist das {comparison}.|Benim ülkemde bu {karşılaştırma}.
Ich {çekimli fiil} lieber {tamamlayıcı}.|{eylem} yapmayı daha çok tercih ediyorum.
Das ist gut, weil {reason}.|Bu iyi, çünkü {neden}.
Wir müssen {event} planen.|{etkinlik} planlamalıyız.
Können wir uns am {day} treffen?|{gün} günü buluşabilir miyiz?
Treffen wir uns bei {place}.|{yer} noktasında buluşalım.
Wir können mit {transport} fahren.|{araç} ile gidebiliriz.
Wir können {food} mitbringen.|Yanımızda {yiyecek} getirebiliriz.
Wir können {gift} schenken.|{hediye} hediye edebiliriz.
Jeder zahlt {amount}.|Herkes {tutar} ödüyor.
Die Idee ist gut, aber {problem}.|Fikir iyi, ama {sorun}.
Wir können stattdessen {alternative}.|Bunun yerine {alternatif} yapabiliriz.
Was meinst du mit {detail}?|{ayrıntı} derken ne demek istiyorsun?
`.trim().split('\n').map(line=>line.split('|')));

const templateKey = frame => frame.replace(/\{[^}]+\}/g,'{}');
const meaningsByTemplate = new Map(Object.entries(sentenceMeanings).map(([frame,meaning])=>[templateKey(frame),meaning]));
export const sentenceMeaning = frame => meaningsByTemplate.get(templateKey(frame));
