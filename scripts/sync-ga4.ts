import { pathToFileURL } from 'node:url';
import { ga4Definitions, ga4Limits, ga4Property, measurementId } from '../src/analytics/schema.ts';

type Mode = 'check' | 'sync' | 'verify';
type Kind = keyof typeof ga4Definitions;
type RecordData = Record<string, unknown>;
type Request = (service: 'admin' | 'data', resource: string, body?: RecordData) => Promise<RecordData>;
type PlanEntry = { kind: Kind; definition: RecordData };

const property = 'properties/' + ga4Property.id;
const kinds = Object.keys(ga4Definitions) as Kind[];
const identityField = (kind: Kind) => kind === 'keyEvents' ? 'eventName' : 'parameterName';
const namePattern = /^[a-zA-Z][a-zA-Z0-9_]{0,39}$/;

function validateDefinitions() {
  for (const kind of kinds) {
    const definitions: readonly RecordData[] = ga4Definitions[kind];
    if (definitions.length > ga4Limits[kind]) throw new Error(`${kind} exceed the standard GA4 limit.`);
    const ids = new Set();
    const labels = new Set();
    for (const definition of definitions) {
      const id = String(definition[identityField(kind)]);
      if (!namePattern.test(id) || /^(ga_|google_|firebase_)/i.test(id) || ids.has(id)) {
        throw new Error(`Invalid or duplicate GA4 definition: ${id}`);
      }
      ids.add(id);
      if (kind === 'keyEvents') continue;
      const label = String(definition.displayName);
      if (!/^[a-zA-Z][a-zA-Z0-9_ ]{0,81}$/.test(label) || labels.has(label.toLowerCase()) ||
          String(definition.description).length > 150) {
        throw new Error(`Invalid or duplicate GA4 display fields: ${id}`);
      }
      labels.add(label.toLowerCase());
    }
  }
}

async function list(request: Request, kind: Kind | 'dataStreams') {
  const rows: RecordData[] = [];
  const seenTokens = new Set();
  let token = '';
  do {
    const query = token ? '?' + new URLSearchParams({ pageToken: token }) : '';
    const page = await request('admin', `${property}/${kind}${query}`);
    if (page[kind] !== undefined && !Array.isArray(page[kind])) throw new Error(`Invalid ${kind} list from Google.`);
    rows.push(...(page[kind] as RecordData[] | undefined ?? []));
    token = typeof page.nextPageToken === 'string' ? page.nextPageToken : '';
    if (token && seenTokens.has(token)) throw new Error(`Repeated page token for ${kind}.`);
    seenTokens.add(token);
  } while (token);
  return rows;
}

function differences(kind: Kind, expected: RecordData, actual: RecordData) {
  const fields = Object.keys(expected).filter(key => expected[key] !== actual[key]);
  if (kind === 'keyEvents' && actual.defaultValue != null) fields.push('defaultValue');
  return fields;
}

export async function runGa4(mode: Mode, { request, apply = false, log = console.log }: {
  request: Request; apply?: boolean; log?: (message: string) => void;
}) {
  validateDefinitions();
  if (apply && mode !== 'sync') throw new Error('--apply is only valid with analytics:sync.');
  const target = await request('admin', property);
  if (target.name !== property || target.displayName !== ga4Property.displayName) {
    throw new Error(`Expected ${ga4Property.displayName} (${property}).`);
  }
  const streams = await list(request, 'dataStreams');
  const matched = streams.filter(row => row.type === 'WEB_DATA_STREAM' &&
    (row.webStreamData as RecordData | undefined)?.measurementId === measurementId);
  const stream = matched[0];
  if (matched.length !== 1 || typeof stream?.name !== 'string' ||
      !(new RegExp(`^${property}/dataStreams/[0-9]+$`)).test(stream.name)) {
    throw new Error(`Expected one website stream with measurement ID ${measurementId} on ${property}.`);
  }
  log(`${ga4Property.displayName} (${ga4Property.id}) · ${measurementId}`);

  const plan: PlanEntry[] = [];
  let drift = false;
  let overLimit = false;
  for (const kind of kinds) {
    const current = await list(request, kind);
    const managed: readonly RecordData[] = ga4Definitions[kind];
    const key = identityField(kind);
    const managedIds = new Set(managed.map(row => row[key]));
    for (const definition of managed) {
      const id = definition[key];
      const matches = current.filter(row => row[key] === id);
      const labelCollision = kind !== 'keyEvents' && current.some(row => row[key] !== id &&
        row.scope === definition.scope && String(row.displayName).toLowerCase() === String(definition.displayName).toLowerCase());
      if (!matches.length && !labelCollision) {
        plan.push({ kind, definition });
        log(`Missing · ${kind} · ${id}`);
      } else if (matches.length !== 1 || labelCollision) {
        drift = true;
        log(`Conflict · ${kind} · ${id} · duplicate identity or display name`);
      } else {
        const fields = differences(kind, definition, matches[0]);
        const status = fields.some(field => !['displayName', 'description'].includes(field)) ? 'Conflict' : 'Outdated';
        drift ||= fields.length > 0;
        log(`${fields.length ? status : 'Exists'} · ${kind} · ${id}${fields.length ? ' · ' + fields.join(', ') : ''}`);
      }
    }
    for (const row of current.filter(row => !managedIds.has(row[key]))) {
      if (kind === 'keyEvents' && row.custom === false) continue;
      log(`Review required · ${kind} · ${row[key]} · outside the repository specification`);
    }
    const used = current.filter(row => kind === 'keyEvents' ? row.custom === true ||
      (row.custom === undefined && managedIds.has(row[key])) : row.scope === 'EVENT').length;
    const needed = plan.filter(item => item.kind === kind).length;
    if (needed && used + needed > ga4Limits[kind]) {
      overLimit = true;
      log(`Limit · ${kind} · ${used} existing + ${needed} missing exceeds ${ga4Limits[kind]}`);
    }
  }

  if (mode === 'verify') {
    const web = stream.webStreamData as RecordData;
    if (String(web.defaultUri ?? '').replace(/\/$/, '') !== ga4Property.origin) {
      drift = true;
      log(`Review required · website stream URL should be ${ga4Property.origin}`);
    }
    const settings = await request('admin', stream.name + '/enhancedMeasurementSettings');
    for (const field of ['pageChangesEnabled', 'siteSearchEnabled', 'outboundClicksEnabled', 'formInteractionsEnabled', 'fileDownloadsEnabled']) {
      if (settings.streamEnabled && settings[field]) {
        drift = true;
        log(`Review required · enhanced measurement · ${field}`);
      }
    }
    const metadata = await request('data', property + '/metadata');
    for (const [field, definitions] of [['dimensions', ga4Definitions.customDimensions], ['metrics', ga4Definitions.customMetrics]] as const) {
      const names = new Set((metadata[field] as RecordData[] | undefined ?? []).map(row => row.apiName));
      for (const { parameterName } of definitions) {
        const name = 'customEvent:' + parameterName;
        if (names.has(name)) continue;
        drift = true;
        log(`Reporting pending · ${name}`);
      }
    }
    const report = await request('data', property + ':runReport', {
      dateRanges: [{ startDate: '7daysAgo', endDate: 'yesterday' }],
      dimensions: [{ name: 'eventName' }], metrics: [{ name: 'eventCount' }], limit: '1',
    });
    log(`Data API report available${report.rowCount ? '.' : ' (no rows returned for the last seven complete days).'}`);
  }

  if (mode === 'sync' && apply && !overLimit && plan.length) {
    for (const { kind, definition } of plan) {
      const id = definition[identityField(kind)];
      try {
        await request('admin', `${property}/${kind}`, definition);
        log(`Created · ${kind} · ${id}`);
      } catch (error) {
        // A concurrent or partly successful run may have created the resource already.
        const existing = (await list(request, kind)).filter(row => row[identityField(kind)] === id);
        if (existing.length !== 1 || differences(kind, definition, existing[0]).length) throw error;
        log(`Exists after recheck · ${kind} · ${id}`);
      }
    }
    return runGa4('check', { request, log });
  }
  if (mode === 'sync' && !apply && plan.length) log('Preview only. Use analytics:sync -- --apply after reviewing the plan.');
  return !drift && !plan.length;
}

async function main() {
  const [mode, flag, ...extra] = process.argv.slice(2);
  if (!['check', 'sync', 'verify'].includes(mode) || extra.length || (flag && (mode !== 'sync' || flag !== '--apply'))) {
    throw new Error('Usage: sync-ga4.ts check | sync [--apply] | verify');
  }
  const token = process.env.BAULINGO_GA4_ACCESS_TOKEN?.trim();
  if (!token) throw new Error('Set BAULINGO_GA4_ACCESS_TOKEN using the local authentication steps in docs/analytics.md.');
  const quotaProject = process.env.BAULINGO_GA4_QUOTA_PROJECT?.trim();
  const request: Request = async (service, resource, body) => {
    const base = service === 'admin' ? 'https://analyticsadmin.googleapis.com/v1alpha/' : 'https://analyticsdata.googleapis.com/v1beta/';
    const response = await fetch(base + resource, {
      method: body ? 'POST' : 'GET',
      headers: { Authorization: 'Bearer ' + token, ...(quotaProject && { 'x-goog-user-project': quotaProject }),
        ...(body && { 'Content-Type': 'application/json' }) },
      body: body && JSON.stringify(body),
      redirect: 'error',
      signal: AbortSignal.timeout(30_000),
    });
    if (!response.ok) {
      const message = response.status === 403 ? ' Check the API, OAuth scope and property role.' : '';
      throw new Error(`Google Analytics ${service} ${body ? 'POST' : 'GET'} ${resource.split('?')[0]} returned HTTP ${response.status}.${message}`);
    }
    return await response.json() as RecordData;
  };
  process.exitCode = await runGa4(mode as Mode, { request, apply: flag === '--apply' }) ? 0 : 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(error => { console.error(error instanceof Error ? error.message : 'GA4 command failed.'); process.exitCode = 1; });
}
