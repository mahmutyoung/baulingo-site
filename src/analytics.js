// Optional website analytics. Google code is loaded only after a visitor opts in.
const MEASUREMENT_ID = 'G-3XSNDN7FE4';
const CONSENT_KEY = 'baulingo.ga4-consent.v1';
const allowedEvents = new Set(['learning_started', 'learning_completed', 'exercise_answered']);
let enabled = false;
let banner;

function storedConsent() {
  try { return localStorage.getItem(CONSENT_KEY); }
  catch { return null; }
}

function saveConsent(choice) {
  try { localStorage.setItem(CONSENT_KEY, choice); }
  catch { /* Do not enable tracking on later page loads without renewed consent. */ }
}

function clearAnalyticsCookies() {
  for (const part of document.cookie.split(';')) {
    const name = part.trim().split('=')[0];
    if (!/^_ga(?:_|$)|^_gid$|^_gat(?:_|$)/.test(name)) continue;
    for (const domain of ['', '; domain=baulingo.app', '; domain=.baulingo.app']) {
      document.cookie = `${name}=; Max-Age=0; path=/${domain}; Secure; SameSite=Lax`;
    }
  }
}

function enable() {
  if (enabled || location.hostname !== 'baulingo.app' || location.protocol !== 'https:'
    || document.querySelector('meta[name="robots"][content*="noindex"]')) return;
  enabled = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', MEASUREMENT_ID, { send_page_view: true });
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
  document.head.append(script);
}

// No query strings, answer text, drafts, user identifiers or custom URLs are sent.
export function trackLearningEvent(name, { activity_id, activity_type, content_language, outcome } = {}) {
  if (!enabled || !allowedEvents.has(name) || typeof window.gtag !== 'function') return;
  const params = {};
  if (typeof activity_id === 'string' && /^[a-z0-9-]{1,48}$/.test(activity_id)) params.activity_id = activity_id;
  if (['sentence', 'dtz'].includes(activity_type)) params.activity_type = activity_type;
  if (['tr', 'en'].includes(content_language)) params.content_language = content_language;
  if (['correct', 'incorrect'].includes(outcome)) params.outcome = outcome;
  window.gtag('event', name, params);
}

function setConsent(choice) {
  saveConsent(choice);
  if (choice === 'granted') {
    enable();
    banner.hidden = true;
    return;
  }
  clearAnalyticsCookies();
  if (enabled) {
    // The loaded Google script cannot be unloaded reliably. Restart with consent denied.
    location.reload();
    return;
  }
  banner.hidden = true;
}

function initialize() {
  const footer = document.querySelector('footer');
  if (!footer) return;
  const english = document.documentElement.lang === 'en';
  const settings = document.createElement('button');
  settings.type = 'button';
  settings.className = 'analytics-settings';
  settings.textContent = english ? 'Analytics settings' : 'Analiz ayarları';
  footer.append(settings);

  banner = document.createElement('section');
  banner.id = 'ga4-consent';
  banner.className = 'ga4-consent';
  banner.setAttribute('role', 'region');
  banner.setAttribute('aria-label', english ? 'Analytics choice' : 'Analiz tercihi');
  const message = document.createElement('p');
  message.textContent = english
    ? 'May we use Google Analytics to understand which pages and learning activities are useful? Optional; Google tracking stays off unless you agree.'
    : 'Hangi sayfaların ve alıştırmaların faydalı olduğunu anlamak için Google Analytics kullanabilir miyiz? İzin vermezsen Google takibi kapalı kalır.';
  const actions = document.createElement('div');
  actions.className = 'ga4-consent-actions';
  const reject = document.createElement('button');
  reject.type = 'button';
  reject.textContent = english ? 'Decline' : 'Reddet';
  const accept = document.createElement('button');
  accept.type = 'button';
  accept.textContent = english ? 'Allow analytics' : 'Analize izin ver';
  actions.append(reject, accept);
  banner.append(message, actions);
  document.body.append(banner);

  reject.addEventListener('click', () => setConsent('denied'));
  accept.addEventListener('click', () => setConsent('granted'));
  settings.addEventListener('click', () => { banner.hidden = false; reject.focus(); });

  const choice = storedConsent();
  banner.hidden = choice === 'granted' || choice === 'denied';
  if (choice === 'granted') enable();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, { once: true });
else initialize();
