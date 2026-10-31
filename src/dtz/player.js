import { examData } from './content.js';
import { createAttempt, selectAnswer, finishListening, nextSection, syncClock, remainingSeconds, scoreAttempt, validateAttempt } from './rules.js';

const root = document.querySelector('#dtz-app');
const $ = selector => root.querySelector(selector);
const $$ = selector => [...root.querySelectorAll(selector)];
const storageKey = 'baulingo.dtz.mock-01.v1';
const labels = { listening: '01 · Dinleme', reading: '02 · Okuma', writing: '03 · Yazma', speaking: '04 · Konuşma', result: 'Sonuç' };
const audio = $('#dtz-audio');
let attempt = null, active = false, audioStarted = false, audioLoading = false, invalidSaved = false;
let scrollScheduled = false;
function updateToolbar() {
  const toolbar = $('#dtz-toolbar');
  const pinned = !toolbar.hidden && $('#dtz-toolbar-sentinel').getBoundingClientRect().bottom + 20 <= 0;
  toolbar.classList.toggle('is-compact', pinned && ['reading', 'speaking'].includes(attempt?.phase));
}
window.addEventListener('scroll', () => {
  if (!scrollScheduled) { scrollScheduled = true; requestAnimationFrame(() => { scrollScheduled = false; updateToolbar(); }); }
}, { passive: true });
window.addEventListener('resize', updateToolbar);

function status(message) { $('#dtz-status').textContent = message; }
function save() {
  try { localStorage.setItem(storageKey, JSON.stringify(attempt)); }
  catch { status('Tarayıcı kayda izin vermedi. Bu sekmede devam edebilirsin; kapatırsan yanıtların kaybolabilir. Yazını TXT olarak indirebilirsin.'); }
}
try {
  const saved = localStorage.getItem(storageKey);
  if (saved) {
    try { attempt = validateAttempt(JSON.parse(saved)); } catch { /* Report corrupt data without crashing. */ }
    invalidSaved = !attempt;
    if (invalidSaved) status('Bu tarayıcıdaki deneme kaydı okunamadı. Yeniden başlamak için aşağıdaki “deneme verilerini sil” düğmesini kullan.');
  }
} catch { status('Tarayıcı kayıtlara erişime izin vermedi. Denemeyi bu sekmede yapabilirsin; ilerlemen saklanamayabilir.'); }

function stopAudio() {
  audio.pause();
  audio.removeAttribute('src');
  audio.load();
  audioStarted = false;
  audioLoading = false;
}

function focusSection() {
  const heading = attempt?.phase === 'result' ? $('#dtz-result-title') : $(`[data-phase="${attempt?.phase}"] h2`);
  heading?.focus({ preventScroll: true });
  heading?.scrollIntoView({ block: 'start', behavior: 'instant' });
}

function render() {
  const phase = attempt?.phase;
  root.dataset.running = String(active && phase !== 'result');
  $('#dtz-start-panel').hidden = active;
  $('#dtz-start').hidden = !!attempt || invalidSaved || active;
  $('#dtz-resume').hidden = !attempt || active;
  $('#dtz-resume').textContent = phase === 'result' ? 'Sonucumu göster' : 'Kaldığım yerden devam et';
  $('#dtz-clear').hidden = !attempt && !invalidSaved;
  $('#dtz-toolbar').hidden = !active || phase === 'result';
  updateToolbar();
  $('#dtz-current-section').textContent = labels[phase] || '';
  for (const section of $$('[data-phase]')) section.hidden = !active || section.dataset.phase !== phase;
  for (const actions of $$('[data-action-for]')) actions.hidden = !active || actions.dataset.actionFor !== phase;
  $('#dtz-audio-panel').hidden = !active || phase !== 'listening';
  $('#dtz-play').disabled = audioLoading || audioStarted || !!attempt?.listeningFinished;
  $('#dtz-play').textContent = audioLoading ? 'Ses yükleniyor…' : audioStarted ? 'Dinleme devam ediyor' : attempt?.listeningFinished ? 'Dinleme tamamlandı' : 'Dinlemeyi başlat';
  $('[data-action-for="listening"] [data-next]').disabled = !attempt?.listeningFinished;
  for (const task of examData.listeningTasks) if (!task.isExample) {
    for (const q of task.questions) $(`[data-question="${q.id}"]`).disabled = !audioStarted || !!attempt?.listeningFinished;
  }
  if (attempt) {
    for (const [id, answer] of Object.entries(attempt.answers)) {
      const selected = $(`input[name="${id}"][value="${answer}"]`);
      if (selected) selected.checked = true;
    }
    $(`input[name="writing-prompt"][value="${attempt.prompt}"]`).checked = true;
    $(`input[name="speaking-candidate"][value="${attempt.candidate}"]`).checked = true;
    if (document.activeElement !== $('#dtz-writing')) $('#dtz-writing').value = attempt.writing;
    $('#dtz-writing-count').textContent = attempt.writing.length;
  }
  for (const prompt of $$('[data-writing-prompt]')) prompt.hidden = prompt.dataset.writingPrompt !== (attempt?.prompt || 'a');
  for (const picture of $$('[data-speaking-candidate]')) picture.hidden = picture.dataset.speakingCandidate !== (attempt?.candidate || 'a');
  $('#dtz-download-writing').hidden = !active || phase !== 'writing';
  $('#dtz-result').hidden = !active || phase !== 'result';
  $('#dtz-review').hidden = !active || phase !== 'result';
  if (active && phase === 'result') renderResult();
  renderTimer();
}

function renderTimer() {
  if (!attempt) return;
  const seconds = remainingSeconds(attempt, Date.now());
  $('#dtz-timer-label').textContent = attempt.phase === 'listening' ? 'Kayıt' : attempt.phase === 'speaking' ? 'Önerilen süre' : 'Kalan süre';
  const elapsed = Math.floor(audio.currentTime || 0);
  $('#dtz-timer').textContent = seconds === null ? attempt.phase === 'speaking' ? '~16 dk.' : audioStarted ? `${Math.floor(elapsed / 60)}:${String(elapsed % 60).padStart(2, '0')}` : '—' : `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

function tick() {
  if (!attempt) return;
  const updated = syncClock(attempt, Date.now());
  if (updated !== attempt) {
    attempt = updated; save(); render();
    status(`Süre doldu. ${labels[attempt.phase]} bölümüne geçildi.`);
    if (active) focusSection();
  } else renderTimer();
}

function startNew() {
  stopAudio();
  for (const input of $$('.dtz-question:not(:disabled) input, .dtz-question[data-question] input')) {
    if (!input.closest('fieldset').querySelector('.dtz-example')) input.checked = false;
  }
  attempt = createAttempt(Date.now()); active = true; invalidSaved = false;
  status(''); $('#dtz-audio-status').textContent = ''; $('#dtz-audio-progress').value = 0;
  save(); render(); focusSection();
}

$('#dtz-start').addEventListener('click', startNew);
$('#dtz-restart').addEventListener('click', () => {
  if (confirm('Yeni deneme mevcut yanıtların ve yazının yerini alacak. Önce yazını indirebilirsin. Devam edilsin mi?')) startNew();
});
$('#dtz-resume').addEventListener('click', () => {
  if (!attempt) return;
  active = true;
  const previous = attempt.phase;
  attempt = syncClock(attempt, Date.now());
  status(attempt.phase !== previous ? 'Bölüm süresi dolduğu için sonraki bölüme geçildi.' : attempt.phase === 'listening' && !attempt.listeningFinished ? 'Dinlemeyi yeniden başlattığında kayıt baştan oynar. Önceki yanıtların korunur.' : 'Kayıtlı denemen açıldı.');
  save(); render(); focusSection();
});
$('#dtz-exit').addEventListener('click', () => {
  if (attempt.phase === 'listening' && audioStarted && !confirm('Ayrılırsan dinleme kaydını baştan dinlemen gerekir. Yanıtların saklanır. Ara verilsin mi?')) return;
  tick(); save(); stopAudio(); active = false; render();
  status('Deneme kapatıldı. Okuma ve yazmada süre işlemeye devam eder.');
  $('#dtz-resume').focus();
});
$('#dtz-clear').addEventListener('click', () => {
  if (!confirm('Bu tarayıcıdaki DTZ yanıtların ve yazın silinsin mi? Bu işlem geri alınamaz.')) return;
  try { localStorage.removeItem(storageKey); }
  catch { status('Tarayıcı kaydın silinmesine izin vermedi. Tarayıcının site verileri ayarlarından silebilirsin.'); return; }
  stopAudio(); attempt = null; invalidSaved = false; active = false;
  $('#dtz-writing').value = ''; $('#dtz-writing-count').textContent = '0';
  for (const task of [...examData.listeningTasks, ...examData.readingTasks].filter(t => !t.isExample)) for (const q of task.questions) {
    for (const input of $$(`input[name="${q.id}"]`)) input.checked = false;
  }
  status('Bu tarayıcıdaki deneme verileri silindi.'); render(); $('#dtz-start').focus();
});

$('#dtz-play').addEventListener('click', async () => {
  if (!active || attempt?.phase !== 'listening' || audioStarted || audioLoading || attempt.listeningFinished) return;
  audioLoading = true; render();
  $('#dtz-audio-status').textContent = 'Dinleme kaydı yükleniyor…';
  audio.src = audio.dataset.src;
  try {
    await audio.play();
    if (!active || attempt.phase !== 'listening') return;
    audioStarted = true;
    $('#dtz-audio-status').textContent = 'Kayıt devam ediyor. Soruları aşağıda yanıtla.';
  } catch {
    audioStarted = false;
    $('#dtz-audio-status').textContent = 'Ses oynatılamadı. Bağlantını kontrol edip “Dinlemeyi başlat” ile tekrar dene. Kayıt baştan başlar.';
  } finally { audioLoading = false; render(); }
});
audio.addEventListener('error', () => {
  if (!audio.getAttribute('src') || !active || attempt?.phase !== 'listening') return;
  audioStarted = false; audioLoading = false;
  $('#dtz-audio-status').textContent = 'Ses yüklenemedi. Bağlantını kontrol et ve dinlemeyi yeniden başlat. Kayıt baştan oynar.';
  render();
});
audio.addEventListener('timeupdate', () => {
  if (!Number.isFinite(audio.duration) || !audio.duration) return;
  $('#dtz-audio-progress').value = audio.currentTime / audio.duration;
  const elapsed = Math.floor(audio.currentTime);
  if (attempt?.phase === 'listening') $('#dtz-timer').textContent = `${Math.floor(elapsed / 60)}:${String(elapsed % 60).padStart(2, '0')}`;
});
audio.addEventListener('ended', () => {
  if (!active || attempt?.phase !== 'listening' || !audioStarted) return;
  attempt = finishListening(attempt); save();
  $('#dtz-audio-status').textContent = 'Dinleme tamamlandı. Okuma bölümüne geçebilirsin.';
  render();
});

root.addEventListener('change', event => {
  const input = event.target;
  if (!(input instanceof HTMLInputElement) || !active || !attempt) return;
  tick();
  if (input.name === 'writing-prompt' && attempt.phase === 'writing') attempt = { ...attempt, prompt: input.value };
  else if (input.name === 'speaking-candidate' && attempt.phase === 'speaking') attempt = { ...attempt, candidate: input.value };
  else {
    if (attempt.phase === 'listening' && !audioStarted) return;
    attempt = selectAnswer(attempt, input.name, Number(input.value));
  }
  save(); render();
});
$('#dtz-writing').addEventListener('input', () => {
  if (!active || attempt?.phase !== 'writing') return;
  tick();
  if (attempt.phase !== 'writing') return;
  attempt = { ...attempt, writing: $('#dtz-writing').value.slice(0, 20_000) };
  $('#dtz-writing-count').textContent = attempt.writing.length;
  save();
});
for (const button of $$('[data-next]')) button.addEventListener('click', () => {
  if (!active || !attempt) return;
  const previous = attempt.phase;
  tick();
  if (attempt.phase !== previous) return;
  if (attempt.phase === 'reading') {
    const unanswered = examData.readingTasks.filter(t => !t.isExample).flatMap(t => t.questions).filter(q => !Object.hasOwn(attempt.answers, q.id)).length;
    if (!confirm(`${unanswered ? `${unanswered} soru boş. ` : ''}Okuma bölümünü bitirip yazmaya geçilsin mi? Okuma yanıtlarına geri dönemezsin.`)) return;
  }
  if (attempt.phase === 'writing' && !confirm('Yazma bölümünü bitirip konuşmaya geçilsin mi? Yazını değiştiremeyeceksin.')) return;
  // Native confirmation can remain open past the deadline; reconcile again.
  tick();
  if (attempt.phase !== previous) return;
  attempt = nextSection(attempt, Date.now());
  if (attempt.phase !== previous) stopAudio();
  save(); status(''); render(); focusSection();
});

function downloadWriting() {
  if (!attempt) return;
  const prompt = examData.writingPrompts.find(p => p.id === attempt.prompt);
  const content = `Baulingo DTZ denemesi — yazma taslağı\n${prompt.title}\n\n${attempt.writing}\n\nBu metin otomatik değerlendirilmemiştir.\n`;
  const url = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' }));
  const link = document.createElement('a'); link.href = url; link.download = 'baulingo-dtz-yazim.txt'; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
$('#dtz-download-writing').addEventListener('click', downloadWriting);
$('#dtz-result-download').addEventListener('click', downloadWriting);

function renderResult() {
  const score = scoreAttempt(attempt);
  $('#dtz-score').textContent = `${score.total} / 45`;
  $('#dtz-level').textContent = score.level === 'unter A2' ? 'A2 altı · dinleme ve okuma' : `${score.level} · dinleme ve okuma`;
  $('#dtz-score-parts').textContent = `Dinleme: ${score.listening} / 20 · Okuma: ${score.reading} / 25`;
  const questions = [...examData.listeningTasks, ...examData.readingTasks].filter(t => !t.isExample).flatMap(t => t.questions);
  for (const q of questions) {
    const answer = attempt.answers[q.id];
    const text = answer === undefined ? 'Boş bırakıldı.' : answer === q.correctAnswer ? 'Yanıtın doğru.' : `Yanıtın: ${q.choices[answer]}`;
    $(`[data-review="${q.id}"] .dtz-review-outcome`).textContent = text;
  }
}

window.addEventListener('pagehide', () => { if (attempt) save(); });
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') tick(); });
setInterval(tick, 1000);
render();
