import test from 'node:test';
import assert from 'node:assert/strict';
import { runGa4 } from '../scripts/sync-ga4.ts';
import { ga4Definitions } from '../src/analytics/schema.ts';

const property = 'properties/565704627';
const stream = property + '/dataStreams/345';

function fixture({ measurementId = 'G-R1YH6T64JM', overrides = {}, enhanced = {} } = {}) {
  const definitions = {
    customDimensions: [...ga4Definitions.customDimensions],
    customMetrics: [...ga4Definitions.customMetrics],
    keyEvents: [...ga4Definitions.keyEvents],
    ...overrides,
  };
  const writes = [];
  const messages = [];
  const request = async (service, resource, body) => {
    if (service === 'data') {
      if (resource === property + ':runReport') {
        assert.deepEqual(body.metrics, [{ name: 'eventCount' }]);
        return { rowCount: 0 };
      }
      assert.equal(resource, property + '/metadata');
      return {
        dimensions: definitions.customDimensions.map(({ parameterName }) => ({ apiName: 'customEvent:' + parameterName })),
        metrics: definitions.customMetrics.map(({ parameterName }) => ({ apiName: 'customEvent:' + parameterName })),
      };
    }
    const path = new URL(resource, 'https://example.test');
    if (path.pathname === '/' + property) return { name: property, displayName: 'baulingo-web' };
    if (path.pathname === '/' + property + '/dataStreams') {
      return { dataStreams: [{ name: stream, type: 'WEB_DATA_STREAM', webStreamData: { measurementId, defaultUri: 'https://baulingo.app' } }] };
    }
    if (resource === stream + '/enhancedMeasurementSettings') return enhanced;
    const kind = path.pathname.split('/').at(-1);
    assert.ok(Object.hasOwn(definitions, kind), resource);
    if (body) {
      writes.push([kind, body]);
      definitions[kind].push(body);
      return body;
    }
    // Split the list to catch missing matches and quota undercounts from later pages.
    const end = path.searchParams.has('pageToken');
    return { [kind]: end ? definitions[kind].slice(1) : definitions[kind].slice(0, 1),
      ...(!end && definitions[kind].length > 1 && { nextPageToken: 'next/+ token' }) };
  };
  return { writes, messages, options: { request, log: message => messages.push(message) } };
}

test('sync previews by default and creates only missing definitions after approval', async () => {
  const kinds = ['customDimensions', 'customMetrics', 'keyEvents'];
  const missing = kinds.map(kind => [kind, ga4Definitions[kind].at(-1)]);
  const overrides = Object.fromEntries(kinds.map(kind => [kind, ga4Definitions[kind].slice(0, -1)]));
  const service = fixture({ overrides });
  assert.equal(await runGa4('sync', service.options), false);
  assert.deepEqual(service.writes, []);
  assert.equal(await runGa4('sync', { ...service.options, apply: true }), true);
  assert.deepEqual(service.writes, missing);
  assert.equal(await runGa4('sync', { ...service.options, apply: true }), true);
  assert.equal(service.writes.length, 3);
});

test('wrong measurement IDs, same-parameter conflicts and exhausted limits never create definitions', async () => {
  const wrongStream = fixture({ measurementId: 'G-WRONG' });
  await assert.rejects(runGa4('sync', { ...wrongStream.options, apply: true }), /G-R1YH6T64JM/);
  assert.deepEqual(wrongStream.writes, []);
  const metric = ga4Definitions.customMetrics[0];
  const conflict = fixture({ overrides: { customMetrics: [{ ...metric, measurementUnit: 'MILLISECONDS' }, ...ga4Definitions.customMetrics.slice(1)] } });
  assert.equal(await runGa4('sync', { ...conflict.options, apply: true }), false);
  assert.deepEqual(conflict.writes, []);
  assert.ok(conflict.messages.some(message => message.includes('measurementUnit')));
  const atLimit = fixture({ overrides: { customDimensions: Array.from({ length: 50 }, (_, i) => ({
    parameterName: 'other_' + i, displayName: 'Other ' + i, scope: 'EVENT',
  })) } });
  assert.equal(await runGa4('sync', { ...atLimit.options, apply: true }), false);
  assert.deepEqual(atLimit.writes, []);
  assert.ok(atLimit.messages.some(message => /limit/i.test(message)));
});

test('verify checks reporting availability and flags overlapping stream settings', async () => {
  const clean = fixture();
  assert.equal(await runGa4('verify', clean.options), true);
  const overlap = fixture({ enhanced: { streamEnabled: true, siteSearchEnabled: true } });
  assert.equal(await runGa4('verify', overlap.options), false);
  assert.ok(overlap.messages.some(message => message.includes('siteSearchEnabled')));
  assert.deepEqual(overlap.writes, []);
});
