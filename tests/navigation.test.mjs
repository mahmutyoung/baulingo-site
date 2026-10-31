import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

test('phone navigation collapses, closes with Escape/outside/link and resets on desktop', async () => {
  const listeners = new Map();
  const control = () => ({ hidden: false, attributes: new Map(), addEventListener(type, callback) { listeners.set(this.name + type, callback); }, setAttribute(key, value) { this.attributes.set(key, value); }, getAttribute(key) { return this.attributes.get(key); } });
  const toggle = { ...control(), name: 'toggle', focus() { this.focused = true; } };
  const nav = { ...control(), name: 'nav' }, language = control();
  const header = { querySelector: selector => ({ '.menu-toggle': toggle, '.navigation': nav, '.language': language })[selector], contains: target => target === toggle };
  const phone = { matches: true, addEventListener: (_, callback) => listeners.set('resize', callback) };
  const document = { querySelector: () => header, addEventListener: (type, callback) => listeners.set(type, callback) };
  vm.runInNewContext(await readFile('src/navigation.js', 'utf8'), { document, matchMedia: () => phone });
  assert.equal(nav.hidden, true); assert.equal(language.hidden, true); assert.equal(toggle.hidden, false);
  listeners.get('toggleclick')(); assert.equal(nav.hidden, false); assert.equal(toggle.getAttribute('aria-expanded'), 'true');
  listeners.get('keydown')({ key: 'Escape' }); assert.equal(nav.hidden, true); assert.equal(toggle.focused, true);
  listeners.get('toggleclick')(); listeners.get('navclick')({ target: { closest: () => ({}) } }); assert.equal(nav.hidden, true);
  listeners.get('toggleclick')(); listeners.get('click')({ target: {} }); assert.equal(nav.hidden, true);
  phone.matches = false; listeners.get('resize')(); assert.equal(nav.hidden, false); assert.equal(language.hidden, false); assert.equal(toggle.hidden, true);
  phone.matches = true; listeners.get('resize')(); assert.equal(nav.hidden, true);
});
