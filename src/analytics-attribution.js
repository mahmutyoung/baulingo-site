const source = 'chatgpt.com';
const campaign = 'german-courses';
const parameters = ['utm_source', 'utm_medium', 'utm_campaign'];
export const visitWindow = 30 * 60_000;

export function referrerURL(referrer) {
  try {
    const url = new URL(referrer);
    if (['https:', 'http:'].includes(url.protocol) && !url.username && !url.password) return url;
  } catch { /* The browser may withhold the referrer. */ }
  return null;
}

export function classifyEntry(search, referrer) {
  const query = new URLSearchParams(search);
  const [sources, media, names] = parameters.map(name => query.getAll(name));
  const byHost = referrerURL(referrer)?.origin === 'https://' + source;
  const byTag = sources.length === 1 && sources[0] === source;
  const named = sources.length === 1 && sources[0] === 'baulingo' &&
    media.length === 1 && media[0] === 'referral' && names.length === 1 && names[0] === campaign;
  if (byHost && named) return {};
  if (byHost || byTag) return { campaign_source: source, campaign_medium: 'referral', ai_source: 'chatgpt' };
  if (named) return { campaign_source: 'baulingo', campaign_medium: 'referral', campaign_name: campaign };
  return {};
}

export function localeEntryQuery(search, referrer) {
  const entry = classifyEntry(search, referrer);
  if (!entry.campaign_source) return '';
  const query = new URLSearchParams({ utm_source: entry.campaign_source, utm_medium: entry.campaign_medium });
  if (entry.campaign_name) query.set('utm_campaign', entry.campaign_name);
  return '?' + query;
}

export function isAcquisitionQuery(search) {
  return Array.from(new URLSearchParams(search).keys()).every(name => parameters.includes(name));
}

export function resumeVisit(raw, internal, now) {
  if (!internal || !raw) return null;
  try {
    const { landing, landingId, attribution, time } = JSON.parse(raw);
    if (typeof landing !== 'string' || !/^\/(?:[a-z0-9-]+\/)*$/.test(landing) || !Number.isFinite(time) ||
      now < time || now - time >= visitWindow || !attribution) return null;
    const query = new URLSearchParams({
      utm_source: attribution.campaign_source, utm_medium: attribution.campaign_medium, utm_campaign: attribution.campaign_name,
    });
    return { landing, attribution: classifyEntry(query, ''), time,
      ...(typeof landingId === 'string' && /^[A-Za-z0-9:-]{1,64}$/.test(landingId) && { landingId }) };
  } catch { return null; }
}
