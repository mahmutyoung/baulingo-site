for (const section of document.querySelectorAll('[data-study-section]')) {
  const filters = section.querySelector('.study-filters');
  const controls = [...filters.querySelectorAll('select')];
  const items = [...section.querySelectorAll('[data-study-item]')];
  function update() {
    const type = section.querySelector('[data-study-type]')?.value || '';
    const part = section.querySelector('[data-study-part]').value;
    const topic = section.querySelector('[data-study-topic]').value;
    for (const item of items) item.hidden = !!((type && item.dataset.type !== type) || (part && !item.dataset.parts.split('|').includes(part)) || (topic && item.dataset.topic !== topic));
    for (const group of section.querySelectorAll('.study-topic')) group.hidden = !group.querySelector('[data-study-item]:not([hidden])');
    section.querySelector('.study-empty').hidden = items.some(item => !item.hidden);
  }
  for (const control of controls) control.addEventListener('change', update);
  filters.hidden = false;
  update();
}
