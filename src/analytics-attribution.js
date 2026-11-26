import { entryAttribution } from './analytics-contract.js';

const { ai, campaign, visitWindow } = entryAttribution;
const parameters = ['utm_source', 'utm_medium', 'utm_campaign'];
export { visitWindow };

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
  const byHost = referrerURL(referrer)?.origin === 'https://' + ai.campaign_source;
  const byTag = sources.length === 1 && sources[0] === ai.campaign_source;
  const named = sources.length === 1 && sources[0] === campaign.campaign_source &&
    media.length === 1 && media[0] === campaign.campaign_medium && names.length === 1 && names[0] === campaign.campaign_name;
  if (byHost && named) return {};
  if (byHost || byTag) return { ...ai };
  if (named) return { ...campaign };
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
