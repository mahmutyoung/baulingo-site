import { trackLearningEvent, beginStudy } from '../analytics.js';
import { remainingTime } from '../writing/rules.js';

const container = document.querySelector('[data-dtz-fragment]');
const resource = container.dataset.dtzFragment;
const context = { activity_id: 'dtz-' + resource, activity_type: resource === 'modelltest' ? 'dtz' : 'writing', content_language: 'de' };
const storagePrefix = 'baulingo-dtz-schreibkurs:de:';

async function load() {
  try {
    const response = await fetch(`/src/dtz/${resource}-de.gz`);
    if (!response.ok) throw new Error('DTZ resource request failed');
    const stream = response.body.pipeThrough(new DecompressionStream('gzip'));
    const html = await new Response(stream).text();
    container.innerHTML = html;
  } catch {
    trackLearningEvent('learning_error', { ...context, error_code: 'resource_failed' });
    const feedback = document.createElement('p');
    feedback.setAttribute('role', 'status');
    feedback.textContent = 'Die Übungen konnten nicht geladen werden.';
    const retry = document.createElement('button');
    retry.type = 'button';
    retry.className = 'button button-primary';
    retry.textContent = 'Erneut versuchen';
    retry.addEventListener('click', () => { feedback.remove(); retry.remove(); load(); }, { once: true });
    container.append(feedback, retry);
    return;
  }
  if (resource === 'modelltest') await import('./player.js');
  else connectWriting();
}

function connectWriting() {
  const status = document.createElement('p');
  status.setAttribute('role', 'status');
  status.textContent = 'Deine Entwürfe bleiben in diesem Browser.';
  container.prepend(status);
  const fields = [...container.querySelectorAll('[data-writing-response]')];
  for (const field of fields) {
    const key = storagePrefix + field.dataset.writingResponse;
    try { field.value = localStorage.getItem(key) ?? ''; }
    catch { status.textContent = 'Dieser Browser erlaubt keinen Zugriff auf gespeicherte Entwürfe.'; }
    field.addEventListener('input', () => {
      beginStudy(context);
      try {
        if (field.value) localStorage.setItem(key, field.value);
        else localStorage.removeItem(key);
      } catch {
        status.textContent = 'Dein Entwurf konnte nicht gespeichert werden. Lade deine Texte herunter, bevor du die Seite verlässt.';
      }
    });
  }
  const download = document.createElement('button');
  download.type = 'button';
  download.className = 'button button-primary';
  download.textContent = 'Meine Texte herunterladen';
  status.after(download);
  download.addEventListener('click', () => {
    const content = fields.filter(field => field.value.trim()).map(field => {
      const chapter = field.closest('[data-chapter]').querySelector('h2').textContent;
      return `${chapter} · ${field.labels[0].textContent}\n${field.value}`;
    }).join('\n\n');
    if (!content) {
      status.textContent = 'Schreibe zuerst eine Antwort.';
      return;
    }
    trackLearningEvent('download_clicked', { ...context, activity_id: 'dtz-german-writing-export' });
    const url = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'baulingo-dtz-schreibkurs.txt';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  connectClock();
  if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView();
}

function connectClock() {
  const start = container.querySelector('[data-writing-clock]');
  const output = container.querySelector('[data-writing-time]');
  const key = storagePrefix + 'deadline';
  let deadline = 0;
  let interval;
  try { deadline = Number(localStorage.getItem(key)); } catch { /* Timer works in this tab. */ }
  function tick() {
    const left = remainingTime(deadline);
    if (left === null) return;
    output.textContent = left ? `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}` : 'Zeit abgelaufen';
    start.disabled = left > 0;
    if (!left) clearInterval(interval);
  }
  start.addEventListener('click', () => {
    deadline = Date.now() + 30 * 60 * 1000;
    try { localStorage.setItem(key, String(deadline)); } catch { /* Timer works in this tab. */ }
    interval = setInterval(tick, 1000);
    tick();
  });
  if (remainingTime(deadline) > 0) interval = setInterval(tick, 1000);
  tick();
}

load();
