(() => {
  const key = 'baulingo.dtz.mock-01.v1';
  const seed = JSON.parse(document.currentScript.dataset.reviewState || 'null');
  const memory = new Map(seed ? [[key, JSON.stringify(seed)]] : []);
  // This override exists only in an explicitly marked local preview document.
  Object.defineProperty(window, 'localStorage', { value: {
    getItem: name => memory.has(String(name)) ? memory.get(String(name)) : null,
    setItem: (name, value) => memory.set(String(name), String(value)),
    removeItem: name => memory.delete(String(name)), clear: () => memory.clear(),
    key: index => [...memory.keys()][index] ?? null, get length() { return memory.size; },
  } });
  document.documentElement.classList.add('review-sandbox');
  function annotate() {
    if (parent === window) return;
    const layer = document.createElement('div');
    layer.className = 'review-component-layer';
    layer.setAttribute('popover', 'manual');
    layer.setAttribute('aria-label', 'Bileşen yorumları');
    document.body.append(layer);
    const targets = new Map();
    const candidates = 'header,nav,section,article,form,fieldset,dialog,footer,h1,h2,h3,p,button,a,input:not([type="hidden"]),textarea,summary,img[alt]:not([alt=""]),audio,[role="group"],.hero-copy,.hero-visual,.phrase-panel,.phrase-meaning,.quick-topics,.answer-area,.exercise-actions,.dtz-reference,.dtz-actions';
    function selectorFor(node) {
      const parts = [];
      while (node && node !== document.body) {
        if (node.id) { parts.unshift(`#${CSS.escape(node.id)}`); break; }
        const tag = node.localName;
        const siblings = [...node.parentElement.children].filter(sibling => sibling.localName === tag);
        parts.unshift(`${tag}:nth-of-type(${siblings.indexOf(node) + 1})`);
        node = node.parentElement;
      }
      return parts.join(' > ');
    }
    function labelFor(node) {
      const label = node.getAttribute('aria-label') || node.labels?.[0]?.textContent || node.getAttribute('alt') || node.querySelector('h1,h2,h3,legend')?.textContent || node.textContent || node.localName;
      return `${node.localName} · ${label.replace(/\s+/g, ' ').trim()}`.slice(0, 200);
    }
    let scheduled = false;
    function update() {
      scheduled = false;
      for (const [node, button] of targets) if (!node.isConnected) { button.remove(); targets.delete(node); }
      for (const node of document.querySelectorAll(candidates)) {
        if (node.closest('.review-component-layer,.review-preview-banner') || node.closest('[aria-hidden="true"]') || targets.has(node)) continue;
        const button = document.createElement('button');
        button.type = 'button'; button.className = 'review-component-button'; button.textContent = '+';
        button.addEventListener('click', event => {
          event.preventDefault(); event.stopPropagation();
          const component = { path: location.pathname, selector: selectorFor(node), label: labelFor(node) };
          parent.postMessage({ type: 'baulingo-review-comment', component }, location.origin);
        });
        targets.set(node, button); layer.append(button);
      }
      const occupied = [];
      const modal = document.querySelector('dialog[open]');
      // A modal makes its siblings inert. Keep annotation controls inside it.
      const host = modal || document.body;
      if (layer.parentElement !== host) { layer.hidePopover(); host.append(layer); }
      for (const [node, button] of targets) {
        const rect = node.getBoundingClientRect();
        const visible = node.checkVisibility() && rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < innerHeight && (!modal || modal.contains(node));
        button.hidden = !visible;
        if (!visible) continue;
        const label = labelFor(node);
        button.title = `Yorum ekle: ${label}`;
        button.setAttribute('aria-label', button.title);
        let left = Math.min(innerWidth - 32, Math.max(0, rect.right - 28));
        const top = Math.min(innerHeight - 32, Math.max(0, rect.top));
        // Nested controls retain separate, reachable buttons without covering each other.
        while (occupied.some(p => Math.abs(p.left - left) < 29 && Math.abs(p.top - top) < 29) && left >= 30) left -= 30;
        occupied.push({ left, top });
        button.style.left = `${left}px`; button.style.top = `${top}px`;
      }
      if (!layer.matches(':popover-open')) layer.showPopover();
    }
    function schedule() { if (!scheduled) { scheduled = true; requestAnimationFrame(update); } }
    const observer = new MutationObserver(records => {
      if (records.some(record => !layer.contains(record.target))) schedule();
    });
    observer.observe(document.body, { subtree: true, childList: true, attributes: true, characterData: true });
    window.addEventListener('scroll', schedule, true);
    window.addEventListener('resize', schedule);
    document.addEventListener('toggle', event => { if (event.target.matches('dialog')) { layer.hidePopover(); schedule(); } }, true);
    window.addEventListener('message', event => {
      if (event.source !== parent || event.origin !== location.origin || event.data?.type !== 'baulingo-review-annotations') return;
      layer.classList.toggle('review-annotations-off', !event.data.visible);
    });
    document.fonts.ready.then(schedule);
    update();
  }
  function focus(selector) {
    try {
      for (const old of document.querySelectorAll('[data-review-highlight]')) old.removeAttribute('data-review-highlight');
      const element = document.querySelector(selector);
      if (!element) return;
      element.setAttribute('data-review-highlight', '');
      const top = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: Math.max(0, top - 32), behavior: 'instant' });
    } catch { /* Unknown/obsolete focus targets do not break the real page. */ }
  }
  window.addEventListener('message', event => {
    if (event.source !== parent || event.origin !== location.origin || event.data?.type !== 'baulingo-review-focus') return;
    if (typeof event.data.selector === 'string' && event.data.selector.length < 160) focus(event.data.selector);
  });
  document.addEventListener('click', event => {
    const anchor = event.target.closest?.('a[href]');
    if (!anchor || anchor.hasAttribute('download')) return;
    const url = new URL(anchor.href, location.href);
    if (url.origin !== location.origin) { anchor.target = '_blank'; anchor.rel = 'noopener noreferrer'; return; }
    if (url.pathname.startsWith('/dev/')) return;
    if (url.pathname === location.pathname && url.hash) return;
    url.searchParams.set('__review', 'intro');
    anchor.href = url.href;
  }, true);
  window.addEventListener('DOMContentLoaded', () => {
    const banner = document.createElement('div');
    banner.className = 'review-preview-banner';
    banner.textContent = seed ? 'Review sandbox · sample attempt · normal saved progress is untouched' : 'Review sandbox · changes here do not alter your normal saved attempt';
    document.body.prepend(banner);
    if (seed) document.querySelector('#dtz-resume')?.click();
    annotate();
    parent.postMessage({ type: 'baulingo-review-ready', path: location.pathname }, location.origin);
  });
})();
