import { entryAttribution, measurementId as MEASUREMENT_ID, sanitizeLearningEvent } from './analytics-contract.js';
import { classifyEntry, referrerURL, resumeVisit, visitWindow } from './analytics-attribution.js';
import { mountCookieConsent } from './cookie-consent.js';
export { sanitizeLearningEvent } from './analytics-contract.js';

// Optional website analytics. Google code is loaded only after a visitor opts in.
const CONSENT_KEY = 'baulingo.ga4-consent.v2';
const PREVIOUS_CONSENT_KEY = 'baulingo.ga4-consent.v1';
// Filled by the static build from the publishing catalog.
const publishedPages = {};
const writingLessonSlugs = [];
const VISIT_KEY = 'baulingo.analytics-visit.v1';
const RETURN_KEY = 'baulingo.analytics-seen.v1';

export function miniPackEventContext(grammarTrack, content_language) {
  return { activity_type: 'mini_pack', content_category: grammarTrack ? 'grammar' : 'everyday_communication', content_language };
}
let enabled = false;
let cookieConsent;
let consentChoice;
let localeRedirect = false;
let miniPack;
let waitForReader = false;
let pendingEnable = false;
let visit;
let persistedAt = 0;

const inBrowser = typeof document !== 'undefined';
const entry = inBrowser ? classifyEntry(location.search, document.referrer) : {};
const legalPage = inBrowser && ['/privacy/', '/impressum/'].includes(location.pathname);
const reviewPage = inBrowser && new URLSearchParams(location.search).has('__review');
const promptForConsent = () => !legalPage && !reviewPage && !localeRedirect;

export function redirectToLocale(url) {
  localeRedirect = true;
  location.replace(url);
}
export function deferMiniPackPage() { waitForReader = true; }
export function setMiniPackPage(context, lesson) {
  miniPack = context && { path: location.pathname, context, lesson };
  waitForReader = false;
  if (pendingEnable) enable();
  trackPageView();
}
function readStorage(store, key) {
  try { return globalThis[store].getItem(key); } catch { return null; }
}
function writeStorage(store, key, value) {
  try {
    if (value === null) globalThis[store].removeItem(key);
    else globalThis[store].setItem(key, value);
    return true;
  } catch { return false; }
}

function pageFields(path) {
  const row = Object.hasOwn(publishedPages, path) && publishedPages[path];
  const lessonSlug = path.startsWith('/dtz-mektup-yazma/') && path.endsWith('/') && path.slice('/dtz-mektup-yazma/'.length, -1);
  const fields = {};
  if (row) {
    const [page_id, content_language, content_id, content_format, collection_id, level] = row;
    Object.assign(fields, { page_id, content_language });
    if (content_id) fields.content_id = content_id;
    if (content_format) fields.content_format = content_format;
    if (collection_id) fields.collection_id = collection_id;
    if (level) fields.level = level;
  } else if (lessonSlug && writingLessonSlugs.includes(lessonSlug)) {
    const content_id = 'dtz-writing-' + lessonSlug;
    return { page_id: content_id + ':tr', content_id, content_language: 'tr', content_format: 'writing',
      collection_id: 'dtz-writing-tr' };
  }
  if (miniPack?.path === path) {
    const { activity_id, content_language, content_category, level } = miniPack.context;
    Object.assign(fields, {
      content_id: activity_id, content_format: 'mini_pack', content_language, content_category, level,
      collection_id: content_category === 'grammar' ? 'grammar' : 'everyday-communication',
    });
    if (miniPack.lesson) fields.page_id = activity_id + ':' + content_language;
  }
  return fields;
}

function openVisit(restored = false) {
  const referrer = referrerURL(document.referrer);
  const navigation = performance.getEntriesByType('navigation')[0]?.type;
  const internal = restored || referrer?.origin === location.origin || ['reload', 'back_forward'].includes(navigation);
  visit = resumeVisit(readStorage('sessionStorage', VISIT_KEY), internal, Date.now());
  if (!visit || (!restored && entry.campaign_source && entry.campaign_source !== visit.attribution.campaign_source)) {
    visit = null;
    trackPageView(restored ? {} : entry);
  } else {
    applyCampaign(visit.attribution);
    trackPageView();
  }
}

function applyCampaign({ campaign_source = '', campaign_medium = '', campaign_name = '' }) {
  window.gtag('set', { campaign_source, campaign_medium, campaign_name });
}

function recordVisit(path, identity, attribution = {}) {
  const time = Date.now();
  const started = !visit || time - visit.time >= visitWindow;
  if (started) {
    visit = { landing: path, landingId: identity.page_id, attribution, time };
    applyCampaign(attribution);
  }
  visit.time = time;
  const fields = { ...visit.attribution, ...(visit.landingId && { landing_page_id: visit.landingId }) };
  if (started || time - persistedAt >= 60000 || persistedAt === 0) {
    persistedAt = time;
    const remembered = writeStorage('sessionStorage', VISIT_KEY, JSON.stringify(visit));
    if (started) {
      const previous = Number(readStorage('localStorage', RETURN_KEY));
      const seen = remembered && writeStorage('localStorage', RETURN_KEY, String(time));
      const returning = previous > 0 && time >= previous && time - previous <= entryAttribution.returningWindow;
      window.gtag('event', 'visit_started', {
        ...fields, ...identity, page_location: location.origin + path,
        ...(seen && { browser_visit: returning ? 'returning' : 'first' }),
      });
    }
  }
  return fields;
}

function storedConsent() {
  const choice = readStorage('localStorage', CONSENT_KEY);
  if (choice === 'granted' || choice === 'denied') return choice;
  return readStorage('localStorage', PREVIOUS_CONSENT_KEY) === 'denied' ? 'denied' : null;
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
  if (enabled || !promptForConsent() || location.hostname !== 'baulingo.app' || location.protocol !== 'https:'
    || document.querySelector('meta[name="robots"][content*="noindex"]')) return;
  pendingEnable = waitForReader;
  if (pendingEnable) return;
  enabled = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', MEASUREMENT_ID, {
    send_page_view: false, page_location: cleanPage(), page_referrer: cleanReferrer(),
    allow_google_signals: false, allow_ad_personalization_signals: false,
  });
  openVisit();
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
  document.head.append(script);
}

// Strip query strings and fragments. Never send input values, draft text, search terms or custom identifiers.
function cleanPage() { return location.origin + location.pathname; }
function cleanReferrer() {
  const url = referrerURL(document.referrer);
  if (!url) return '';
  return url.origin + (url.origin === location.origin ? url.pathname : '/');
}

let lastPage = '';
let lastContent = '';
export function trackPageView(attribution) {
  if (!enabled) return;
  const path = location.pathname;
  const page = cleanPage();
  const identity = pageFields(path);
  if (page !== lastPage) {
    const referrer = lastPage || cleanReferrer();
    lastPage = page;
    lastContent = '';
    const context = recordVisit(path, identity, attribution);
    window.gtag('set', { page_location: page, page_referrer: referrer });
    window.gtag('event', 'page_view', { ...context, ...identity, page_location: page, page_referrer: referrer, page_title: document.title });
  }
  const currentContent = identity.content_id || identity.collection_id;
  if (currentContent && currentContent !== lastContent) {
    lastContent = currentContent;
    sendEvent('content_viewed', {}, { path, identity });
  }
}
export function analyticsEnabled() { return enabled; }

/** @template {import('./analytics/schema.ts').LearningEvent} N
 * @param {N} name @param {import('./analytics/schema.ts').EventInput<N>} values */
export function trackLearningEvent(name, values) {
  if (!enabled) return;
  const path = location.pathname;
  const params = sanitizeLearningEvent(name, values);
  if (params) sendEvent(name, params, { path, identity: eventIdentity(path, params) });
}

function eventIdentity(path, { activity_type, activity_id }) {
  const identity = pageFields(path);
  if (activity_type === 'sentence') return { ...identity, content_id: 'sentence-' + activity_id, content_format: 'sentence' };
  if (activity_type === 'topic') {
    const topic = pageFields('/konular/' + activity_id + '/');
    return { ...identity, content_id: topic.content_id, content_format: topic.content_format };
  }
  if (activity_type === 'audio' && activity_id === 'coffee-phrase') {
    const phrase = pageFields('/konular/kafede-siparis/');
    return { ...identity, content_id: phrase.content_id, content_format: phrase.content_format };
  }
  return identity;
}

function sendEvent(name, params, { path, identity }, context = recordVisit(path, identity)) {
  if (enabled) window.gtag('event', name, { ...context, ...identity, ...params, page_location: location.origin + path });
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
    const params = sanitizeLearningEvent('study_time', { ...study.context, duration_seconds: seconds });
    if (enabled && params) {
      if (study.visit === visit) recordVisit(study.page.path, study.page.identity);
      sendEvent('study_time', params, study.page, study.acquisition);
    }
  }
}
export function stopStudy() {
  flushStudy();
  study = null;
  if (studyTimer !== null) clearInterval(studyTimer);
  studyTimer = null;
}
/** @param {import('./analytics/schema.ts').ActivityContext} context
 * @param {'learning_started' | 'learning_resumed'} [eventName] */
export function beginStudy(context, eventName = 'learning_started') {
  const cleanContext = enabled && sanitizeLearningEvent(eventName, context);
  if (!cleanContext) return false;
  const path = location.pathname;
  if (study && study.page.path === path && study.context.activity_id === context.activity_id && study.context.activity_type === context.activity_type) return true;
  stopStudy();
  const time = now();
  const identity = eventIdentity(path, context);
  const acquisition = recordVisit(path, identity);
  study = { context: cleanContext, page: { path, identity }, acquisition, visit, pending: 0,
    lastInput: time, lastTick: time, visible: document.visibilityState === 'visible' };
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
  window.addEventListener('pageshow', event => {
    if (!event.persisted) return;
    const choice = storedConsent();
    if (choice !== consentChoice) setConsent(choice, false);
    else if (enabled) {
      lastPage = '';
      openVisit(true);
    }
  });
  window.addEventListener('storage', event => {
    if (event.key !== CONSENT_KEY && event.key !== null) return;
    const choice = storedConsent();
    if (choice !== consentChoice) setConsent(choice, false);
  });
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
function setConsent(choice, persist = true) {
  if (persist) writeStorage('localStorage', CONSENT_KEY, choice);
  consentChoice = choice;
  if (choice === 'granted') {
    enable();
    cookieConsent.close();
    return;
  }
  const wasEnabled = enabled;
  enabled = false;
  pendingEnable = false;
  stopStudy();
  visit = null;
  writeStorage('sessionStorage', VISIT_KEY, null);
  writeStorage('localStorage', RETURN_KEY, null);
  clearAnalyticsCookies();
  if (wasEnabled) {
    window['ga-disable-' + MEASUREMENT_ID] = true;
    // The loaded Google script cannot be unloaded reliably. Restart with consent denied.
    location.reload();
    return;
  }
  if (!choice && promptForConsent()) cookieConsent.open();
  else cookieConsent.close();
}

function initialize() {
  if (cookieConsent) return;
  consentChoice = storedConsent();
  cookieConsent = mountCookieConsent(() => consentChoice, setConsent);
  installInteractionTracking();
  if (consentChoice === 'granted') enable();
  if (!consentChoice && promptForConsent()) cookieConsent.open();
}

if (inBrowser) {
  if (document.readyState === 'complete') initialize();
  else {
    document.addEventListener('DOMContentLoaded', initialize, { once: true });
    window.addEventListener('load', initialize, { once: true });
  }
}
