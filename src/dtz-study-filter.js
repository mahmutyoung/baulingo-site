const listRanks = {temel:1,genisletilmis:2,full:3};
export function matchesStudyItem(item, filters) {
  return (!filters.list || (listRanks[item.listTier || 'full'] <= listRanks[filters.list]))
    && (!filters.level || item.level === filters.level)
    && (!filters.topic || item.topic === filters.topic)
    && (!filters.kind || item.kind === filters.kind)
    && (!filters.type || (item.kind === 'word' && item.type === filters.type))
    && (!filters.part || item.parts.split('|').includes(filters.part));
}

// Earlier controls define the choices available in later controls.
export function studyFilterState(items, selected) {
  const filters = {}, options = {};
  for (const key of ['level','list','topic','kind','type','part']) {
    const candidates = key==='list' ? Object.keys(listRanks)
      : [...new Set(items.flatMap(item=>key==='part' ? item.parts.split('|') : [item[key]]).filter(Boolean))];
    options[key] = candidates.filter(value=>items.some(item=>matchesStudyItem(item,{...filters,[key]:value})));
    filters[key] = options[key].includes(selected[key]) ? selected[key] : key==='list' ? options[key][0] || '' : '';
  }
  return {filters,options};
}

for (const root of globalThis.document?.querySelectorAll('[data-study-root]') || []) {
  const filters = root.querySelector('.study-filters');
  const views = document.createElement('div');
  views.className = 'study-views';
  views.setAttribute('role', 'group');
  views.setAttribute('aria-label', 'Görünüm');
  views.innerHTML = '<button type="button" data-study-view="list" aria-pressed="false">Liste</button><button type="button" data-study-view="table" aria-pressed="true">Tablo</button>';
  root.querySelector('[data-study-count]').before(views);
  views.addEventListener('click', event => {
    const button = event.target.closest('[data-study-view]');
    if (!button) return;
    root.classList.toggle('study-list', button.dataset.studyView === 'list');
    for (const choice of views.children) choice.setAttribute('aria-pressed', String(choice === button));
  });
  for (const table of root.querySelectorAll('table')) {
    const scroll = document.createElement('div');
    scroll.className = 'study-scroll';
    scroll.tabIndex = 0;
    scroll.setAttribute('role', 'region');
    scroll.setAttribute('aria-label', 'Çalışma tablosu');
    table.before(scroll);
    scroll.append(table);
  }
  root.classList.remove('study-list');
  const controls = Object.fromEntries(['level','list','topic','kind','type','part'].map(key=>[key,filters.querySelector(`[data-study-${key}]`)]));
  const originalOptions = Object.fromEntries(Object.entries(controls).map(([key,control])=>[key,[...control.options]]));
  const items = [...root.querySelectorAll('[data-i]')];
  for (const item of items) {
    item.dataset.studyItem = '';
    const metadata = parseInt(item.closest('[data-m]').dataset.m,36);
    item.dataset.parts = Object.entries({Hören:1,Lesen:2,Schreiben:4,Sprechen:8}).filter(([,bit])=>Math.floor(metadata/3)&bit).map(([part])=>part).join('|');
    item.dataset.level = item.closest('[data-study-level-section]').dataset.level;
    item.dataset.topic = item.closest('.study-topic').dataset.topic;
    item.dataset.kind = item.closest('div[data-kind]').dataset.kind;
    item.dataset.countKey = item.closest('[data-f]')?.dataset.f || item.closest('[data-e]')?.dataset.e || item.id;
    item.dataset.listTier = ['temel','genisletilmis','full'][metadata%3];
  }
  function update() {
    const selected = Object.fromEntries(Object.entries(controls).map(([key,control])=>[key,control.value]));
    const {filters:chosen,options} = studyFilterState(items.map(item=>item.dataset),selected);
    for (const [key,control] of Object.entries(controls)) {
      control.replaceChildren(...originalOptions[key].filter(option=>!option.value || options[key].includes(option.value)).map(option=>option.cloneNode(true)));
      control.value = chosen[key];
      control.disabled = options[key].length===0;
      if(key==='type')control.closest('label').hidden = !!chosen.kind && chosen.kind!=='word';
    }
    for (const item of items) item.hidden = !matchesStudyItem(item.dataset,chosen);
    for (const group of root.querySelectorAll('[data-frame-family],[data-expression-group]')) {
      const seen = new Set();
      for (const item of group.querySelectorAll('[data-study-item]:not([hidden])')) {
        const text = item.textContent.trim();
        if(seen.has(text)) item.hidden = true;
        else seen.add(text);
      }
    }
    for (const group of root.querySelectorAll('[data-frame-family],[data-expression-group],div[data-kind],.study-topic,[data-study-level-section]')) group.hidden = !group.querySelector('[data-study-item]:not([hidden])');
    const count = items.filter(item=>!item.hidden).length;
    root.querySelector('.study-empty').hidden = count > 0;
    const name = controls.list.selectedOptions[0].textContent;
    const visible=items.filter(item=>!item.hidden);
    const unique=kind=>new Set(visible.filter(x=>x.dataset.kind===kind).map(x=>x.dataset.countKey)).size;
    const examples=visible.filter(x=>x.dataset.kind==='sentence').length;
    root.querySelector('[data-study-count]').textContent = `${name} · ${unique('word')} kelime · ${unique('phrase')} ifade · ${unique('sentence')} cümle kalıbı (${examples} cümle örneği)`;
  }
  for (const [key,control] of Object.entries(controls)) control.addEventListener('change', () => {
    if(key === 'type' && control.value) controls.kind.value = 'word';
    if(key === 'kind' && control.value !== 'word') controls.type.value = '';
    update();
  });
  root.querySelector('[data-study-reset]').addEventListener('click',()=>{for(const control of Object.values(controls))control.value='';controls.list.value='temel';update();});
  for (const link of root.querySelectorAll('[data-level-link]')) link.addEventListener('click',()=>{controls.level.value=link.dataset.levelLink;update();});
  function applyHash() {
    const kind = {kelimeler:'word',kaliplar:'phrase',ifadeler:'phrase',cumleler:'sentence','cumle-kaliplari':'sentence'}[location.hash.slice(1)];
    if(kind) {controls.kind.value=kind;controls.type.value='';}
    const level = /^#level-(A1|A2|B1)$/.exec(location.hash)?.[1];
    if(level)controls.level.value=level;
    update();
  }
  window.addEventListener('hashchange',applyHash);
  filters.hidden = false;
  applyHash();
}
