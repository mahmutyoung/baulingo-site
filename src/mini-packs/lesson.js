import { escapeLearningText as escape } from '../learning-text.js';
import { icon } from './icons.js';
import { label, language } from './language.js';
import { grammarLesson, lessonPath } from './routes.js';

const standard = [
  ['vocabulary', label('Vocabulary', 'Kelimeler'), 'book'],
  ['expressions', label('Useful expressions', 'Kullanışlı ifadeler'), 'chat'],
  ['grammar', label('Grammar pattern', 'Dil bilgisi'), 'layers'],
  ['dialogue', label('Dialogue', 'Diyalog'), 'chat'],
  ['practice', label('Practice', 'Alıştırmalar'), 'check'],
  ['challenge', label('Real-world challenge', 'Günlük hayat görevi'), 'target'],
];

export function sectionsFor(pack) {
  if (!pack.scenario) return standard;
  const final = 'routes' in pack.scenario
    ? ['route-task', label('Route decision', 'Rota seçimi'), 'train']
    : ['scenario-task', label('Final scenario', 'Senaryo görevi'), 'target'];
  return [...standard.slice(0, -1), final];
}

export const lessonNumber = index => String(index + 1).padStart(2, '0');
const pair = item => `<p lang="de">${escape(item.de)}</p><p>${escape(item[language])}</p>`;
const count = label => `<span class="section-count">${label}</span>`;
const review = `<button type="button" class="review-button" data-review>${icon('check', 15)}<span>${label('Mark reviewed', 'Gözden geçirdim')}</span></button>`;
const stageNames = { recognize: label('Recognize', 'Tanı'), build: label('Build', 'Tamamla'), produce: label('Use it', 'Kullan') };

export function progressMarkup(className, total) {
  const progressLabel = label('Lesson progress', 'Ders ilerlemesi');
  const counter = '<span data-progress-count></span>';
  const bar = `<progress aria-label="${progressLabel}" value="0" max="${total}"></progress>`;
  return className === 'sidebar-progress'
    ? `<div class="${className}"><div><strong>${progressLabel}</strong>${counter}</div>${bar}</div>`
    : `<div class="${className}"><span>${progressLabel}</span>${bar}${counter}</div>`;
}

function exerciseMarkup(exercise, index) {
  const id = escape(exercise.id);
  const prompt = `question-${id}`;
  const field = exercise.options.length
    ? `<fieldset aria-labelledby="${prompt}">${exercise.options.map(option => `<label class="option" lang="de">
        <input type="radio" name="${id}" value="${escape(option)}">${escape(option)}</label>`).join('')}</fieldset>`
    : `<input class="response" aria-labelledby="${prompt}" lang="de" placeholder="${label('Write your answer in German', 'Cevabını Almanca yaz')}">`;
  return `<form class="panel exercise" data-exercise="${index}">
    <div class="exercise-heading"><span class="exercise-index">${index + 1}</span>
      <strong>${stageNames[exercise.stage]}</strong><span data-exercise-done hidden>${icon('check', 16)}</span></div>
    <p id="${prompt}">${escape(exercise.prompt)}</p>${field}
    <div class="exercise-actions"><button class="primary" disabled>${label('Check answer', 'Cevabı kontrol et')}</button>
      <button class="text-button" type="button" data-show-answer>${label('Show answer', 'Cevabı göster')}</button></div>
    <div class="feedback" role="status" hidden></div>
    <button type="button" class="text-button" data-finish-review hidden>${label('Finish reviewing', 'İncelemeyi bitir')}</button>
  </form>`;
}

const checklist = items => items.map(item => `<label class="checklist"><input type="checkbox">${escape(item)}</label>`).join('');

function scenarioContext(scenario) {
  if ('routes' in scenario) return `<article class="panel train-scenario">
    <p>${escape(scenario.brief)}</p><div class="train-canceled">${icon('train', 20)}
      <span lang="de">${escape(scenario.origin)} → ${escape(scenario.destination)} <strong>${escape(scenario.canceledDeparture)}</strong></span>
      <span class="train-canceled-tag" lang="de">Fällt aus</span></div>
    <table class="train-timetable"><caption>${label('Practice timetable · Replacement trains', 'Örnek sefer tablosu · Alternatif trenler')}</caption>
      <thead lang="de"><tr><th scope="col">Verbindung</th><th scope="col">Abfahrt</th><th scope="col">Ankunft</th><th scope="col">Umstiege</th></tr></thead>
      <tbody lang="de">${scenario.routes.map(route => `<tr><th scope="row">${escape(route.label)}</th><td>${escape(route.departure)}</td><td>${escape(route.arrival)}</td><td>${escape(route.transfers)}</td></tr>`).join('')}</tbody>
    </table></article>`;
  return `<article class="panel scenario-context"><p>${escape(scenario.brief)}</p>
    <div class="scenario-inputs">${scenario.inputs.map(input => `<div class="scenario-input">
      <h3>${escape(input.title)}</h3><p class="scenario-source-text" lang="de">${escape(input.text)}</p></div>`).join('')}</div></article>`;
}

function scenarioMarkup(scenario, task) {
  return `${scenarioContext(scenario)}
    <div class="panel scenario-response">
      <p id="scenario-instructions">${escape(task.instructions)}</p>
      ${task.steps ? `<ol class="scenario-steps" aria-label="${label('What to include', 'Yanıtında olması gerekenler')}">${task.steps.map(step => `<li>${escape(step)}</li>`).join('')}</ol>` : ''}
      <form><label for="scenario-response">${label('Your response in German', 'Almanca yanıtın')}</label>
        <textarea id="scenario-response" aria-describedby="scenario-instructions" class="response" rows="5" lang="de" maxlength="1200"></textarea>
        <button class="primary" disabled>${label('Review my response', 'Yanıtımı gözden geçir')}</button></form>
      <fieldset class="scenario-self-check" hidden><legend>${label('Check what your response does', 'Yanıtını kontrol et')}</legend>
        <p>${label('Tick each statement your response meets. Revise your draft if something is missing.', 'Her maddeyi yanıtınla karşılaştır. Eksik kalan bir nokta varsa yanıtını düzelt.')}</p>${checklist(task.checklist)}</fieldset>
      <details class="scenario-model" hidden><summary>${label('See a model response', 'Örnek yanıtı gör')}</summary>${pair(task.example)}</details>
      <button type="button" class="primary" data-finish-scenario hidden disabled>${label('Finish task', 'Görevi bitir')}</button>
      <p role="status" class="validation-success" hidden>${icon('check', 16)} ${label('Final task complete.', 'Görev tamamlandı.')}</p>
    </div>`;
}

function lessonLinks(links) {
  const review = new URLSearchParams(location.search).get('__review');
  const suffix = review ? '?__review=' + encodeURIComponent(review) : '';
  return `<ul class="lesson-links">${links.map(({ id, title }) =>
    `<li><a href="${lessonPath(id, language)}${suffix}">${escape(title)}</a></li>`).join('')}</ul>`;
}

export function lessonMarkup({ pack, category, icon: topicIcon, coverPhrase, related = [], prerequisites = [] }, index, sections) {
  const section = (number, title, content, extra = '') => {
    const [id, , symbol] = sections[number];
    return `<section class="lesson-section" id="${id}" aria-labelledby="${id}-title">
      <div class="section-heading"><div class="section-title"><span class="section-symbol">${icon(symbol)}</span>
      <div><div class="step">${label('Step', 'Adım')} ${lessonNumber(number)}</div><h2 id="${id}-title">${title}</h2></div></div>${extra}</div>
      ${content}</section>`;
  };
  const level = { A1: label('Beginner', 'Başlangıç'), A2: label('Elementary', 'Temel'), B1: label('Intermediate', 'Orta') }[pack.cefr];
  const { scenario, challenge } = pack;
  const finalTask = scenario?.task ?? challenge;
  const grammar = grammarLesson(pack.id);
  const track = grammar ? label('Grammar Course', 'Gramer Kursu') : label('Everyday German', 'Almanca Kursu');
  return `<div class="breadcrumb"><span>${track}${category ? ' · ' + escape(category) : ''}</span>${icon('angle', 13)}<strong>${label('Lesson', 'Ders')} ${lessonNumber(index)}</strong></div>
    <section class="cover cover-${index % 3}" aria-labelledby="lesson-title">
      <div class="cover-copy"><div class="cover-meta"><span>${pack.cefr} ${level}</span><span>${icon('clock', 15)} ${pack.minutes} ${label('min', 'dk')}</span></div>
        <h1 id="lesson-title" tabindex="-1">${escape(pack.title)}</h1><p lang="de">${escape(pack.germanTitle)}</p>
        <a class="cover-action" href="#vocabulary">${label('Start lesson', 'Derse başla')} ${icon('arrow', 16)}</a></div>
      <div class="cover-art" aria-hidden="true"><div class="orbit orbit-one"></div><div class="orbit orbit-two"></div>
        <span class="art-spark">${icon('spark', 27)}</span><div class="art-back">${icon(topicIcon, 46)}</div>
        <div class="art-front"><span lang="de">${escape(coverPhrase)}</span><div></div></div><span class="art-dash">✦</span></div>
    </section>
    ${progressMarkup('mobile-progress', sections.length)}
    <div class="objective"><span class="objective-icon">${icon('target', 22)}</span>
      <div><strong>${label('Your goal', 'Hedefin')}</strong><p>${escape(pack.objective)}</p></div><span class="source-tag">${label('Sample pack', 'Örnek paket')}</span></div>
    ${pack.prerequisites.length || prerequisites.length ? `<div class="prerequisites"><strong>${label('Before you begin', 'Başlamadan önce')}</strong> ${escape(pack.prerequisites.join(' · '))}${prerequisites.length ? lessonLinks(prerequisites) : ''}</div>` : ''}
    ${related.length ? `<div class="prerequisites"><strong>${grammar ? label('Practise in context', 'Günlük bir durumda kullan') : label('Related grammar lessons', 'İlgili gramer dersleri')}</strong>${lessonLinks(related)}</div>` : ''}
    ${section(0, label('Words to know', 'Bilmen gereken kelimeler'), `<div class="vocab-grid">${pack.vocabulary.map(item => `<article class="word-card">
      <h3 lang="de">${escape(item.de)}</h3><p>${escape(item[language])}</p><div class="word-example">${pair(item.example)}</div></article>`).join('')}</div>${review}`, count(pack.vocabulary.length + label(' words', ' kelime')))}
    ${section(1, sections[1][1], `<div class="phrase-list panel">${pack.expressions.map(item => `<article>
      <div><h3 lang="de">${escape(item.de)}</h3><p>${escape(item[language])}</p></div><p>${escape(item.note)}</p></article>`).join('')}</div>${review}`)}
    ${section(2, escape(pack.grammar.title), `<article class="panel grammar"><div class="pattern" lang="de">${escape(pack.grammar.pattern)}</div>
      <p>${escape(pack.grammar.explanation)}</p><blockquote>${pair(pack.grammar.example)}</blockquote></article>${review}`)}
    ${section(3, label('A conversation in context', 'Kısa bir konuşma'), `<article class="panel dialogue"><p class="dialogue-setting">${escape(pack.dialogue.setting)}</p>
      ${pack.dialogue.lines.map(line => `<div class="dialogue-line"><span class="speaker-initial" aria-hidden="true">${escape(Array.from(line.speaker)[0])}</span>
      <div class="bubble"><strong>${escape(line.speaker)}</strong>${pair(line)}</div></div>`).join('')}</article>${review}`)}
    ${section(4, label('Try it yourself', 'Kendin dene'), `<div class="exercise-list">${pack.exercises.map(exerciseMarkup).join('')}</div>`, count(`<span data-exercise-count>0</span> / ${pack.exercises.length} ${label('done', 'tamamlandı')}`))}
    ${scenario && finalTask
      ? section(5, 'routes' in scenario ? label('Choose a route and explain why', 'Bir rota seç ve nedenini açıkla') : label('Respond to the situation', 'Duruma yanıt ver'), scenarioMarkup(scenario, finalTask))
      : section(5, label('Take it into the real world', 'Günlük hayatta kullan'), `<article class="panel challenge"><p>${escape(challenge.instructions)}</p>
        ${checklist(challenge.checklist)}<details><summary>${label('See an example', 'Örneği gör')}</summary>${pair(challenge.example)}</details>
        <button type="button" class="primary" disabled>${icon('check', 17)}<span>${label('Finish challenge', 'Görevi bitir')}</span></button></article>`)}`;
}
