// Authored phrases only: never guess a language from capitalisation or spelling.
export const escapeLearningText = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export const writingGermanMentions = ['formell','höflich mit Namen','persönlich','außerdem','Liebe Frau Adler,','Sehr geehrte Frau …','Sehr geehrter Herr …','Sehr geehrte Damen und Herren,','Liebe Sara,','Lieber Daniel,','Mit freundlichen Grüßen','Viele Grüße','ich schreibe …','bleibt kalt','schließt nicht richtig','lässt sich nicht einschalten','deine Einladung','Ihre Einladung','Deutsch für den Beruf','Sehr geehrte','Warmmiete','Beschwerde','Reklamation','Sie','Ihnen','Ihr','Ihre','du','Liebe','Herr','Frau','geehrter','geehrte','könnten','weil','deshalb','Deshalb','aber','und','oder','ob','dass','wenn','ist','kann','kaputt','seit','vor','bis'];

export function germanParts(text, terms = []) {
  const source = String(text), parts = [];
  const phrases = [...new Set(terms.filter(Boolean))].sort((a,b) => b.length-a.length);
  const word = character => !!character && /[\p{L}\p{N}_]/u.test(character);
  let plain = '', index = 0;
  while (index < source.length) {
    const phrase = phrases.find(term => source.startsWith(term,index)
      && !word(source[index-1]) && !word(source[index+term.length]));
    if (phrase) {
      if (plain) parts.push({text:plain,german:false});
      parts.push({text:phrase,german:true}); plain=''; index+=phrase.length;
    } else plain+=source[index++];
  }
  if (plain) parts.push({text:plain,german:false});
  return parts;
}

export function germanHTML(text, terms = []) {
  return germanParts(text,terms).map(part => part.german
    ? `<i lang="de">${escapeLearningText(part.text)}</i>`
    : escapeLearningText(part.text)).join('');
}

export function appendGermanText(parent, text, terms = []) {
  for (const part of germanParts(text,terms)) {
    const node=parent.ownerDocument.createTextNode(part.text);
    if (!part.german) parent.append(node);
    else {
      const phrase=parent.ownerDocument.createElement('i');
      phrase.lang='de';phrase.append(node);parent.append(phrase);
    }
  }
}

export function exampleHTML(german, translation, {word=false} = {}) {
  const tag=word?'strong':'span';
  return `<${tag} lang="de" class="german-example${word?' german-target':''}">${escapeLearningText(german)}</${tag}>${translation?`<span class="example-translation">${escapeLearningText(translation)}</span>`:''}`;
}
