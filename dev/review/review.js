const $ = selector => document.querySelector(selector);
let model = null, changeId = '', stepIndex = 0, saving = false;
let previewScroll = null;
let component = null;
const drafts = new Map();
const currentChange = () => model?.changes.find(change => change.id === changeId);
const currentStep = () => currentChange()?.steps[stepIndex];
const draftKey = () => JSON.stringify([changeId, currentStep()?.id, component?.path, component?.selector]);
const element = (tag, text, className) => {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
};
function status(message) { $('#status').textContent = message; }
function retainDraft() { if (currentStep()) drafts.set(draftKey(), $('#note').value); }
function selectComponent(target) {
  retainDraft(); component = target;
  $('#component-target').hidden = !target;
  $('#component-label').textContent = target ? `${target.label} · ${target.path}` : '';
  $('#note').value = drafts.get(draftKey()) || '';
}
function annotations() {
  $('#preview').contentWindow.postMessage({ type: 'baulingo-review-annotations', visible: $('#annotations').checked }, location.origin);
}
function previewURL() {
  const step = currentStep(), url = new URL(step.path, location.origin);
  url.searchParams.set('__review', step.stage || 'intro');
  return url.href;
}
function savePosition() {
  try { sessionStorage.setItem('baulingo.website-review-position', JSON.stringify({ changeId, stepId: currentStep().id })); } catch { /* Optional convenience. */ }
}
function loadPreview() {
  previewScroll = { left: window.scrollX, top: window.scrollY, behavior: 'instant' };
  $('#preview').src = previewURL();
  $('#open-preview').href = previewURL();
}
function renderChanges() {
  const container = $('#changes'); container.replaceChildren();
  for (const [index, change] of model.changes.entries()) {
    const button = element('button', undefined, 'change-button'); button.type = 'button';
    button.setAttribute('aria-pressed', String(change.id === changeId));
    button.append(element('strong', change.title), element('small', `${index === 0 ? 'Latest · ' : ''}${change.date}`));
    button.addEventListener('click', () => { selectComponent(null); changeId = change.id; stepIndex = 0; render(); });
    container.append(button);
  }
}
function renderSteps() {
  const list = $('#steps'); list.replaceChildren();
  currentChange().steps.forEach((step, index) => {
    const item = element('li'), button = element('button', `${index + 1}. ${step.title}`); button.type = 'button';
    if (index === stepIndex) button.setAttribute('aria-current', 'step');
    const latest = [...model.notes].reverse().find(note => !note.component && note.changeId === changeId && note.stepId === step.id && note.sourceVersion === currentChange().sourceVersion);
    if (latest) button.append(element('span', latest.status === 'approved' ? '✓' : latest.status === 'changes' ? '↺' : '•', 'step-marker'));
    button.addEventListener('click', () => { selectComponent(null); stepIndex = index; render(); });
    item.append(button); list.append(item);
  });
}
function renderNotes() {
  const list = $('#notes'); list.replaceChildren();
  const notes = model.notes.filter(note => note.changeId === changeId).slice().reverse();
  if (!notes.length) { list.append(element('p', 'No saved review for this change yet.', 'subtle')); return; }
  for (const note of notes) {
    const old = note.component ? note.componentVersion !== model.componentVersion : note.sourceVersion !== currentChange().sourceVersion;
    const card = element('article', undefined, `note-card${old ? ' note-old' : ''}`);
    const label = note.status === 'approved' ? 'Approved' : note.status === 'changes' ? 'Needs changes' : 'Note';
    const step = currentChange().steps.find(s => s.id === note.stepId);
    card.append(element('strong', `${label} · ${step?.title || note.stepId}`));
    card.append(element('small', `${new Date(note.createdAt).toLocaleString()}${old ? ' · Earlier source version' : ''}`));
    if (note.component) card.append(element('p', `${note.component.label} · ${note.component.path}`, 'subtle'));
    if (model.changes.some(change => change.addresses?.includes(note.id))) card.append(element('p', 'Applied locally · awaiting your review', 'subtle'));
    if (note.text) card.append(element('p', note.text));
    list.append(card);
  }
}
function render() {
  const change = currentChange(), step = currentStep(); if (!change || !step) return;
  $('#change-date').textContent = `${model.changes[0].id === change.id ? 'LATEST CHANGE · ' : ''}${change.date}`;
  $('#change-title').textContent = change.title;
  $('#change-summary').textContent = change.summary;
  $('#before').textContent = change.before; $('#after').textContent = change.after;
  $('#changed-files').replaceChildren(...change.files.map(file => element('li', file)));
  $('#step-position').textContent = `STOP ${stepIndex + 1} OF ${change.steps.length}`;
  $('#step-title').textContent = step.title; $('#step-check').textContent = step.check;
  $('#step-count').textContent = `${stepIndex + 1} / ${change.steps.length}`;
  $('#previous').disabled = stepIndex === 0; $('#next').disabled = stepIndex === change.steps.length - 1;
  $('#note').value = drafts.get(draftKey()) || '';
  loadPreview();
  status(model.storageError || (change.previewStale ? 'The preview is older than the source. Refresh changes to rebuild it before reviewing.' : ''));
  renderChanges(); renderSteps(); renderNotes(); savePosition();
}
async function refresh(rebuild = false) {
  selectComponent(null); $('#refresh').disabled = true;
  try {
    const response = await fetch('/dev/review/api', rebuild ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'refresh' }) } : { cache: 'no-store' });
    const next = await response.json();
    if (!response.ok) throw Error(next.error || 'Review data could not be loaded. Check the local server and try Refresh changes.');
    if (!Array.isArray(next.changes) || !next.changes.length) throw Error('No review changes are registered.');
    const previousStep = currentStep()?.id;
    model = next;
    if (!changeId) {
      try { const position = JSON.parse(sessionStorage.getItem('baulingo.website-review-position')); changeId = position?.changeId || ''; stepIndex = Math.max(0, model.changes.find(c => c.id === changeId)?.steps.findIndex(s => s.id === position.stepId) ?? 0); } catch { /* Use latest change. */ }
    }
    if (!currentChange()) { changeId = model.changes[0].id; stepIndex = 0; }
    else if (previousStep) stepIndex = Math.max(0, currentChange().steps.findIndex(step => step.id === previousStep));
    render();
  } catch (error) { status(error.message); }
  finally { $('#refresh').disabled = false; }
}
async function save(decision) {
  if (saving || !currentStep()) return;
  const text = $('#note').value;
  if (decision === 'changes' && !text.trim()) { status('Describe the change you want before saving Needs changes.'); $('#note').focus(); return; }
  saving = true; retainDraft();
  for (const button of document.querySelectorAll('.decision-actions button')) button.disabled = true;
  const change = currentChange(), step = currentStep(), key = draftKey(), target = component;
  try {
    const response = await fetch('/dev/review/api', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ changeId: change.id, stepId: step.id, sourceVersion: change.sourceVersion, status: decision, text, ...(target ? { component: target, componentVersion: model.componentVersion } : {}) }),
    });
    const data = await response.json();
    if (!response.ok) throw Error(data.error || 'Feedback could not be saved. Your draft is still here.');
    model.notes.push(data.note);
    if (drafts.get(key) === text) drafts.delete(key);
    if (draftKey() === key && $('#note').value === text) $('#note').value = '';
    renderSteps(); renderNotes(); status('Saved locally. No agent work or publication was started.');
  } catch (error) { status(error.message); }
  finally { saving = false; for (const button of document.querySelectorAll('.decision-actions button')) button.disabled = false; }
}

$('#note').addEventListener('input', retainDraft);
$('#clear-component').addEventListener('click', () => selectComponent(null));
$('#annotations').addEventListener('change', annotations);
$('#refresh').addEventListener('click', () => refresh(true));
$('#previous').addEventListener('click', () => { if (stepIndex > 0) { selectComponent(null); stepIndex--; render(); } });
$('#next').addEventListener('click', () => { if (stepIndex < currentChange().steps.length - 1) { selectComponent(null); stepIndex++; render(); } });
$('#reload-preview').addEventListener('click', () => { if (currentStep()) { selectComponent(null); loadPreview(); } });
$('#approve').addEventListener('click', () => save('approved'));
$('#needs-changes').addEventListener('click', () => save('changes'));
$('#save-note').addEventListener('click', () => save('note'));
for (const button of document.querySelectorAll('[data-width]')) button.addEventListener('click', () => {
  $('#preview-canvas').dataset.width = button.dataset.width;
  for (const control of document.querySelectorAll('[data-width]')) control.setAttribute('aria-pressed', String(control === button));
});
$('#preview').addEventListener('load', () => {
  selectComponent(null);
  annotations();
  if (previewScroll) window.scrollTo(previewScroll);
  const step = currentStep();
  if (step?.focus) $('#preview').contentWindow.postMessage({ type: 'baulingo-review-focus', selector: step.focus }, location.origin);
  try {
    const actual = new URL($('#preview').contentWindow.location.href);
    if (actual.origin === location.origin) $('#open-preview').href = actual.href;
  } catch { /* External destinations open separately. */ }
});
window.addEventListener('message', event => {
  if (event.origin !== location.origin || event.source !== $('#preview').contentWindow) return;
  if (event.data?.type === 'baulingo-review-comment') {
    const target = event.data.component;
    if (!target || typeof target.path !== 'string' || typeof target.selector !== 'string' || typeof target.label !== 'string') return;
    selectComponent(target); $('#note').focus(); return;
  }
  if (event.data?.type !== 'baulingo-review-ready') return;
  annotations();
  if (previewScroll) window.scrollTo(previewScroll);
  if (currentStep()?.focus) $('#preview').contentWindow.postMessage({ type: 'baulingo-review-focus', selector: currentStep().focus }, location.origin);
});
$('#preview-canvas').dataset.width = 'desktop';
refresh();
