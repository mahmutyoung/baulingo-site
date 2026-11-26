import { pathToFileURL } from 'node:url';
import { createRequest, dateRange } from './seo-performance.ts';
type Json = Record<string, any>;
export async function checkConnection(property: string, list: () => Promise<Json>, query: (body: Json) => Promise<Json>, endDate: string) {
  const result = await list();
  if (result.siteEntry !== undefined && !Array.isArray(result.siteEntry)) throw new Error('Invalid Search Console property list.');
  const properties = result.siteEntry ?? [];
  const target = properties.find((entry: Json) => entry.siteUrl === property);
  if (!target) throw new Error(`Property ${property} is not in the accessible Search Console properties.`);
  if (!['siteOwner', 'siteFullUser', 'siteRestrictedUser'].includes(target.permissionLevel)) throw new Error(`Property ${property} has no verified read permission.`);
  const range = dateRange('28', endDate);
  const response = await query({ ...range, type:'web', dataState:'final' });
  if (response.rows !== undefined && !Array.isArray(response.rows)) throw new Error('Invalid Search Console performance response.');
  return { properties: properties.map((item: Json) => ({ property:item.siteUrl, permissionLevel:item.permissionLevel })), property, permissionLevel:target.permissionLevel, range, rows:(response.rows ?? []).length, responseAggregationType:response.responseAggregationType ?? null };
}
async function main() {
  const args = process.argv.slice(2);
  if (args.length && (args.length !== 2 || args[0] !== '--property' || !args[1])) throw new Error('Usage: npm run seo:check -- [--property <property>]');
  const property = args[1] ?? 'sc-domain:baulingo.app';
  const token = process.env.BAULINGO_GA4_ACCESS_TOKEN?.trim();
  if (!token) throw new Error('Set BAULINGO_GA4_ACCESS_TOKEN using docs/analytics.md.');
  const quota = process.env.BAULINGO_GA4_QUOTA_PROJECT?.trim() ?? '';
  const list = async () => {
    const response = await fetch('https://www.googleapis.com/webmasters/v3/sites', { headers:{ Authorization:'Bearer ' + token, ...(quota && { 'x-goog-user-project':quota }) }, redirect:'error', signal:AbortSignal.timeout(30000) });
    if (!response.ok) throw new Error(`Search Console property list HTTP ${response.status}. ${response.status === 401 ? 'Token expired or invalid.' : response.status === 403 ? 'Check scope, API and quota project permissions.' : 'Check service availability and quota.'}`);
    return await response.json() as Json;
  };
  const endDate = new Date(Date.now() - 3 * 86400000).toISOString().slice(0, 10);
  const result = await checkConnection(property, list, createRequest(property, token, quota), endDate);
  for (const site of result.properties) console.log(`Property: ${site.property} · ${site.permissionLevel}`);
  console.log(`Selected: ${result.property} · ${result.permissionLevel}`);
  console.log(`Quota project: ${quota || 'not specified'} (header ${quota ? 'sent' : 'not sent'}).`);
  console.log(`Finalized performance request succeeded for ${result.range.startDate} to ${result.range.endDate}; ${result.rows} total row(s). Empty is a valid response.`);
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main().catch(error => { console.error(error instanceof Error ? error.message : 'Search Console check failed.'); process.exitCode = 1; });
