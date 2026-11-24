// Optional website analytics. Google code is loaded only after a visitor opts in.
const MEASUREMENT_ID = 'G-R1YH6T64JM';
const CONSENT_KEY = 'baulingo.ga4-consent.v2';
const PREVIOUS_CONSENT_KEY = 'baulingo.ga4-consent.v1';
const allowedEvents = new Set([
  'learning_started', 'learning_completed', 'learning_resumed', 'learning_paused',
  'exercise_answered', 'exercise_retried', 'topic_selected', 'level_selected',
  'search_performed', 'search_no_results', 'hint_used', 'answer_revealed',
  'audio_played', 'audio_completed', 'section_completed', 'study_time',
  'feedback_submitted', 'language_changed', 'download_clicked', 'app_store_clicked', 'learning_error',
]);
const enums = {
  activity_type: ['sentence','dtz','mini_pack','grammar','writing','a1_test','topic','resource','audio','site'],
  content_language: ['tr','en','de'],
  target_language: ['tr','en','de'],
  level: ['A1','A2','B1','B2','C1','C2'],
  outcome: ['correct','incorrect'],
  feedback: ['helpful','not_helpful'],
  error_code: ['audio_failed','library_failed','resource_failed'],
  completion_type: ['checked','self_review','exam_result'],
};
const idFields = ['activity_id','exercise_id','section_id'];
const countFields = ['result_count','attempt_number','questions_answered','correct_answers','duration_seconds'];
export function sanitizeLearningEvent(name, values = {}) {
  if (!allowedEvents.has(name)) return null;
  const params = {};
  for (const [key, allowed] of Object.entries(enums)) if (allowed.includes(values[key])) params[key] = values[key];
  for (const key of idFields) if (typeof values[key] === 'string' && /^[A-Za-z0-9-]{1,64}$/.test(values[key])) params[key] = values[key];
  for (const key of countFields) if (Number.isInteger(values[key]) && values[key] >= 0 && values[key] <= 86400) params[key] = values[key];
  return params;
}
let enabled = false;
let banner;

function storedConsent() {
  try { return localStorage.getItem(CONSENT_KEY) || (localStorage.getItem(PREVIOUS_CONSENT_KEY) === 'denied' ? 'denied' : null); }
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
    || new URLSearchParams(location.search).has('__review')
    || document.querySelector('meta[name="robots"][content*="noindex"]')) return;
  enabled = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', MEASUREMENT_ID, {
    send_page_view: false, page_location: cleanPage(), page_referrer: cleanReferrer(),
    allow_google_signals: false, allow_ad_personalization_signals: false,
  });
  trackPageView();
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
  document.head.append(script);
}

// Strip query strings and fragments. Never send input values, draft text, search terms or custom identifiers.
function cleanPage() { return location.origin + location.pathname; }
function cleanReferrer() {
  try { const url = new URL(document.referrer); return url.origin === location.origin ? url.origin + url.pathname : url.origin + '/'; }
  catch { return ''; }
}
let lastPage = '';
export function trackPageView() {
  if (!enabled) return;
  const page = cleanPage();
  if (page === lastPage) return;
  const referrer = lastPage || cleanReferrer();
  lastPage = page;
  window.gtag('set', { page_location: page, page_referrer: referrer });
  window.gtag('event', 'page_view', { page_location: page, page_referrer: referrer, page_title: document.title });
}
export function analyticsEnabled() { return enabled; }
export function trackLearningEvent(name, values = {}) {
  if (!enabled || typeof window.gtag !== 'function') return;
  const params = sanitizeLearningEvent(name, values);
  if (!params) return;
  window.gtag('event', name, { ...params, page_location: cleanPage() });
}

// One in-memory activity at a time. Visible, recently interacted time only.
// Report deltas (not cumulative totals), with a 60-second inactivity cap.
let study = null;
let studyTimer = null;
const now = () => performance.now();
function accountTime(time = now()) {
  if (!study) return;
  if (study.visible) study.pending += Math.max(0, Math.min(time, study.lastInput + 60000) - study.lastTick);
  study.lastTick = time;
}
function flushStudy() {
  if (!study) return;
  accountTime();
  const seconds = Math.floor(study.pending / 1000);
  if (seconds > 0) {
    study.pending -= seconds * 1000;
    trackLearningEvent('study_time', { ...study.context, duration_seconds: seconds });
  }
}
export function stopStudy() {
  flushStudy();
  study = null;
  if (studyTimer !== null) clearInterval(studyTimer);
  studyTimer = null;
}
export function beginStudy(context, eventName = 'learning_started') {
  if (!enabled) return false;
  if (study && study.context.activity_id === context.activity_id && study.context.activity_type === context.activity_type) return true;
  stopStudy();
  const time = now();
  study = { context: sanitizeLearningEvent('study_time', context), pending: 0, lastInput: time, lastTick: time, visible: document.visibilityState === 'visible' };
  trackLearningEvent(eventName, context);
  studyTimer = setInterval(flushStudy, 30000);
  return true;
}
function touchStudy(event) {
  if (!study || !event.isTrusted) return;
  const time = now();
  accountTime(time);
  study.lastInput = time;
}
function installInteractionTracking() {
  for (const event of ['pointerdown','keydown','input','scroll']) document.addEventListener(event, touchStudy, { capture: true, passive: true });
  document.addEventListener('visibilitychange', () => {
    if (!study) return;
    flushStudy();
    study.visible = document.visibilityState === 'visible';
    study.lastTick = now();
  });
  window.addEventListener('pagehide', flushStudy);
  const linkClick = event => {
    const link = event.target.closest?.('a[href]');
    if (!link || !event.isTrusted || (event.type === 'auxclick' && event.button !== 1)) return;
    let url;
    try { url = new URL(link.href); } catch { return; }
    const context = { activity_type: 'resource', content_language: document.documentElement.lang };
    if (url.origin === location.origin && url.pathname.startsWith('/downloads/')) {
      trackLearningEvent('download_clicked', { ...context, activity_id: 'public-download' });
    } else if (url.hostname === 'play.google.com' && url.pathname === '/store/apps/details' && url.searchParams.get('id') === 'com.baulingo.app') {
      trackLearningEvent('app_store_clicked', { ...context, activity_id: 'android-app' });
    }
  };
  document.addEventListener('click', linkClick);
  document.addEventListener('auxclick', linkClick);
}
function setConsent(choice) {
  saveConsent(choice);
  if (choice === 'granted') {
    enable();
    banner.hidden = true;
    return;
  }
  const wasEnabled = enabled;
  enabled = false;
  stopStudy();
  clearAnalyticsCookies();
  if (wasEnabled) {
    window['ga-disable-' + MEASUREMENT_ID] = true;
    // The loaded Google script cannot be unloaded reliably. Restart with consent denied.
    location.reload();
    return;
  }
  banner.hidden = true;
}

function initialize() {
  if (document.getElementById('ga4-consent')) return;
  const footer = document.querySelector('footer');
  installInteractionTracking();
  const english = document.documentElement.lang === 'en';
  const german = document.documentElement.lang === 'de';
  const settings = document.createElement('button');
  settings.type = 'button';
  settings.className = 'analytics-settings';
  settings.textContent = german ? 'Analyse-Einstellungen' : english ? 'Analytics settings' : 'Analiz ayarları';
  (footer || document.body).append(settings);
  if (!footer && typeof MutationObserver !== 'undefined') {
    // Direct lesson URLs insert their shared footer asynchronously.
    const observer = new MutationObserver(() => {
      const destination = document.querySelector('footer');
      if (destination) { destination.append(settings); observer.disconnect(); }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  banner = document.createElement('section');
  banner.id = 'ga4-consent';
  banner.className = 'ga4-consent';
  banner.setAttribute('role', 'region');
  banner.setAttribute('aria-label', german ? 'Einwilligung zur Analyse' : english ? 'Analytics choice' : 'Analiz tercihi');
  const message = document.createElement('p');
  message.textContent = german
    ? 'Dürfen wir Google Analytics für Seitenaufrufe, Lernfortschritt, Übungsresultate und ungefähre Lernzeit verwenden? Die Analyse ist freiwillig und bleibt ohne deine Zustimmung aus.'
    : english
    ? 'May we use Google Analytics to measure page visits, learning progress, exercise outcomes and approximate study time? Optional; Google tracking stays off unless you agree.'
    : 'Sayfa ziyaretleri, öğrenme ilerlemesi, alıştırma sonuçları ve yaklaşık çalışma süresi için Google Analytics kullanabilir miyiz? İzin vermezsen Google takibi kapalı kalır.';
  const actions = document.createElement('div');
  actions.className = 'ga4-consent-actions';
  const reject = document.createElement('button');
  reject.type = 'button';
  reject.textContent = german ? 'Ablehnen' : english ? 'Decline' : 'Reddet';
  const accept = document.createElement('button');
  accept.type = 'button';
  accept.textContent = german ? 'Analyse erlauben' : english ? 'Allow analytics' : 'Analize izin ver';
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

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, { once: true });
  else initialize();
}
