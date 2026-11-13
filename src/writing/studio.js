// Presentation only: existing player input handlers own answers and persistence.
export function activateWritingStudio(root, lastTask) {
  const body = root.querySelector('.writing-body');
  const phone = matchMedia('(max-width: 800px)');
  const contents = root.querySelector('.writing-contents');
  const sidebarNote = root.querySelector('.writing-sidebar > p:not([data-progress])');
  const progressBar = root.querySelector('[data-progress-bar]');
  contents.querySelector('.writing-course-nav').before(sidebarNote, progressBar);
  const tasks = [...root.querySelectorAll('[data-task]')];
  const ordinary = tasks.filter(task => !task.hasAttribute('data-choice'));
  const stageNav = root.querySelector('.writing-step-links');
  const groups = {
    ogren: [body.querySelector('#ogren')],
    dene: [body.querySelector('#dene')],
    yaz: ['.writing-timer', '.writing-choice-overview', '.writing-task-choice', '#yaz'].map(selector => body.querySelector(selector)),
  };
  let selectedTask = ordinary.find(task => task.id === location.hash.slice(1) || task.dataset.task === lastTask) || ordinary[0];
  let stage = 'ogren';
  let lastEditor;
  const visible = element => element && !element.closest('[hidden]') && !!element.getClientRects().length;
  const draftPreview = root.querySelector('[data-draft-preview]');
  const updatePreview = () => {
    const task = tasks.find(task => visible(task));
    const draft = task?.querySelector('[data-draft]');
    const text = draft?.value || [...task?.querySelectorAll('textarea[data-response]') || []].map(input => input.value).filter(Boolean).join('\n\n');
    if (draftPreview) draftPreview.textContent = text || 'Henüz bir şey yazmadın.';
    if (draftPreview) draftPreview.closest('details').hidden = !task;
  };

  const outcome = root.querySelector('[data-outcome]');
  if (outcome) {
    const details = document.createElement('details');
    details.className = 'writing-outcome-details';
    const summary = document.createElement('summary'); summary.textContent = 'Ders hedefi';
    outcome.before(details); details.append(summary, outcome);
  }

  // Keep all checks, models and revision fields, with one compact disclosure.
  for (const task of tasks) {
    task.querySelector('.writing-planner')?.removeAttribute('open');
    if (task.dataset.taskKind === 'letter') {
      const brief = task.querySelector('[data-stimulus]');
      const details = document.createElement('details');
      details.className = 'writing-brief-details';
      const summary = document.createElement('summary'); summary.textContent = 'Görev metni';
      brief.before(details); details.append(summary, brief);
      const context = document.createElement('details');
      context.className = 'writing-task-context';
      const contextSummary = document.createElement('summary'); contextSummary.textContent = 'Görev ve plan';
      details.before(context);
      context.append(contextSummary, details, task.querySelector('.writing-task-points'), task.querySelector('.writing-planner'));
      context.open = !phone.matches;
      phone.addEventListener('change', event => { context.open = !event.matches; });
    }
    const start = task.querySelector('.writing-selfcheck') || task.querySelector('.writing-model');
    if (!start) continue;
    const review = document.createElement('details');
    review.className = 'writing-review-tools';
    const summary = document.createElement('summary');
    summary.textContent = 'Kontrol et ve geliştir';
    review.append(summary);
    start.before(review);
    let node = start;
    while (node && !node.matches('[data-task-reviewed], .writing-source')) {
      const next = node.nextElementSibling;
      review.append(node);
      node = next;
    }
  }

  const taskButtons = [];
  let previous, next, counter;
  const showTask = (task, focus = false) => {
    selectedTask = task;
    ordinary.forEach(section => { section.hidden = section !== task; section.open = section === task; });
    taskButtons.forEach((button, index) => {
      if (ordinary[index] === task) button.setAttribute('aria-current', 'step');
      else button.removeAttribute('aria-current');
    });
    const index = ordinary.indexOf(task);
    if (previous) previous.disabled = index <= 0;
    if (next) next.disabled = index >= ordinary.length - 1;
    if (counter) counter.textContent = `${index + 1} / ${ordinary.length} çalışma`;
    updatePreview();
    if (focus) {
      const summary = task.querySelector(':scope > summary');
      summary.focus();
      summary.scrollIntoView({ block: 'nearest', behavior: 'instant' });
      history.replaceState(null, '', `#${task.id}`);
    }
  };
  if (ordinary.length) {
    const nav = document.createElement('nav');
    nav.className = 'writing-task-nav';
    nav.setAttribute('aria-label', 'Bu dersteki çalışmalar');
    ordinary.forEach((task, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = index + 1;
      button.setAttribute('aria-label', `${index + 1}. ${task.dataset.taskTitle}`);
      button.title = task.dataset.taskTitle;
      button.addEventListener('click', () => showTask(task, true));
      taskButtons.push(button); nav.append(button);
    });
    ordinary[0].before(nav);
    const footer = document.createElement('div');
    footer.className = 'writing-task-pagination';
    previous = document.createElement('button');
    previous.type = 'button'; previous.textContent = '← Geri'; previous.className = 'button';
    next = document.createElement('button');
    next.type = 'button'; next.textContent = 'Sonraki çalışma →'; next.className = 'button button-primary';
    counter = document.createElement('span'); counter.className = 'writing-caption';
    previous.addEventListener('click', () => showTask(ordinary[ordinary.indexOf(selectedTask) - 1], true));
    next.addEventListener('click', () => showTask(ordinary[ordinary.indexOf(selectedTask) + 1], true));
    footer.append(previous, counter, next);
    ordinary.at(-1).after(footer);
    showTask(selectedTask);
  }

  const selectStage = name => {
    stage = groups[name]?.some(Boolean) ? name : 'ogren';
    root.dataset.studioStage = stage;
    for (const [key, sections] of Object.entries(groups)) for (const section of sections) if (section) section.hidden = stage !== key;
    stageNav?.querySelectorAll('a').forEach(link => {
      const key = link.hash === '#secim' ? 'yaz' : link.hash.slice(1);
      if (key === stage) link.setAttribute('aria-current', 'step');
      else link.removeAttribute('aria-current');
    });
    updatePreview();
  };
  if (stageNav) {
    stageNav.querySelectorAll('a').forEach(link => {
      if (link.hash === '#yaz') link.textContent = 'Yaz';
      if (link.hash === '#secim') link.textContent = 'Seç ve yaz';
      link.addEventListener('click', event => {
        event.preventDefault();
        history.pushState(null, '', link.hash);
        selectStage(link.hash === '#secim' ? 'yaz' : link.hash.slice(1));
      });
    });
    const advance = document.createElement('div');
    advance.className = 'writing-stage-next';
    for (const [name, target, label] of [['ogren', groups.dene.some(Boolean) ? 'dene' : 'yaz', groups.dene.some(Boolean) ? 'Dene →' : 'Çalışmalara geç →'], ['dene', 'yaz', 'Yazmaya geç →']]) {
      if (!groups[name].some(Boolean) || !groups[target].some(Boolean)) continue;
      const link = document.createElement('a');
      link.className = 'button button-primary'; link.href = `#${target}`; link.textContent = label;
      link.addEventListener('click', event => {
        event.preventDefault(); history.pushState(null, '', link.hash); selectStage(target);
        [...stageNav.querySelectorAll('a')].find(link => (link.hash === '#secim' ? 'yaz' : link.hash.slice(1)) === target)?.focus();
      });
      // Append to the stage so it is hidden together with that stage.
      const row = advance.cloneNode(); row.append(link); groups[name].at(-1).append(row);
    }
  }
  const revealHash = () => {
    const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (!target || !body.contains(target)) return false;
    const task = target.closest('[data-task]');
    if (task && ordinary.includes(task)) showTask(task);
    const name = Object.keys(groups).find(key => groups[key].some(section => section?.contains(target)));
    if (stageNav && name) selectStage(name);
    for (let ancestor = target; ancestor && ancestor !== body; ancestor = ancestor.parentElement) if (ancestor.tagName === 'DETAILS') ancestor.open = true;
    return true;
  };
  if (stageNav) selectStage('ogren');
  if (!revealHash() && lastTask && ordinary.some(task => task.dataset.task === lastTask) && stageNav) selectStage('yaz');
  addEventListener('hashchange', revealHash);
  addEventListener('popstate', () => { if (!revealHash() && stageNav) selectStage('ogren'); });
  root.addEventListener('focusin', event => {
    if (event.target.matches('textarea[data-draft], textarea[data-response], textarea[data-revised], input[data-plan]')) lastEditor = event.target;
  });
  root.addEventListener('input', updatePreview);
  root.addEventListener('change', updatePreview);
  root.dataset.studioEnhanced = '';

  const toolbox = root.querySelector('[data-phrase-toolbox]');
  if (!toolbox) return;
  toolbox.open = !phone.matches;
  phone.addEventListener('change', event => { toolbox.open = !event.matches; });
  const status = toolbox.querySelector('[data-phrase-status]');
  const container = toolbox.querySelector('[data-phrase-content]');
  let loading = false, loaded = false;
  const loadPhrases = async () => {
    if (loading || loaded || !toolbox.open) return;
    loading = true;
    try {
      // Reuse the complete authored reference; never maintain a second phrase list.
      const response = await fetch('/dtz-mektup-yazma/cumle-kaliplari/');
      if (!response.ok) throw Error('Phrase reference unavailable');
      const page = new DOMParser().parseFromString(await response.text(), 'text/html');
      const source = page.querySelector('.writing-phrases');
      if (!source) throw Error('Phrase reference missing');
      const searchLabel = document.createElement('label');
      searchLabel.textContent = 'Kalıp ara'; searchLabel.className = 'writing-phrase-search';
      const search = document.createElement('input'); search.type = 'search'; search.placeholder = 'Almanca veya Türkçe';
      searchLabel.append(search); container.append(searchLabel);
      const entries = [];
      for (const sourceGroup of source.querySelectorAll(':scope > details')) {
        const group = sourceGroup.cloneNode(true);
        group.className = 'writing-toolbox-group';
        for (const entry of group.querySelectorAll('dl > div')) {
          const phrase = entry.querySelector('dt').textContent;
          const button = document.createElement('button');
          button.type = 'button'; button.className = 'writing-phrase-insert'; button.textContent = 'Ekle';
          button.setAttribute('aria-label', `${phrase} kalıbını ekle`);
          button.addEventListener('click', () => {
            const editor = visible(lastEditor) ? lastEditor : tasks.find(visible)?.querySelector('textarea[data-draft], textarea[data-response]');
            if (!visible(editor)) { status.textContent = 'Önce bir yazma alanı seç.'; return; }
            const start = editor.selectionStart, end = editor.selectionEnd;
            const prefix = start > 0 && !/\s$/.test(editor.value.slice(0, start)) ? ' ' : '';
            const suffix = end < editor.value.length && !/^\s/.test(editor.value.slice(end)) ? ' ' : '';
            const insertion = prefix + phrase + suffix;
            if (editor.maxLength > 0 && editor.value.length - (end - start) + insertion.length > editor.maxLength) {
              status.textContent = 'Yazma alanının karakter sınırına ulaştın.'; return;
            }
            editor.setRangeText(insertion, start, end, 'end');
            editor.dispatchEvent(new Event('input', { bubbles: true }));
            if (phone.matches) toolbox.open = false;
            editor.focus(); status.textContent = 'Kalıp eklendi.';
          });
          // Examples and translations remain available without filling the rail.
          const examples = document.createElement('details');
          examples.className = 'writing-toolbox-example';
          const summary = document.createElement('summary'); summary.textContent = 'Örnek'; examples.append(summary);
          const dd = entry.querySelector('dd');
          for (const paragraph of [...dd.querySelectorAll('.writing-phrase-example, .writing-caption')]) examples.append(paragraph);
          dd.append(examples); entry.append(button);
          entries.push({ entry, group, text: entry.textContent.toLocaleLowerCase('tr') });
        }
        container.append(group);
      }
      container.querySelector('details').open = true;
      search.addEventListener('input', () => {
        const query = search.value.trim().toLocaleLowerCase('tr');
        let count = 0;
        for (const { entry, text } of entries) { entry.hidden = !text.includes(query); if (!entry.hidden) count++; }
        for (const group of container.querySelectorAll('.writing-toolbox-group')) {
          group.hidden = !group.querySelector('dl > div:not([hidden])');
          if (query && !group.hidden) group.open = true;
        }
        status.textContent = query ? `${count} kalıp` : '';
      });
      loaded = true; status.textContent = '';
    } catch {
      status.textContent = 'Kalıplar yüklenemedi. Tüm kalıplar ve örnekler bağlantısını kullanabilirsin.';
    } finally { loading = false; }
  };
  toolbox.addEventListener('toggle', loadPhrases);
  loadPhrases();
}
