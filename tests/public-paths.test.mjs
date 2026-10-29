import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { resolvePublicFile } from '../scripts/public-files.mjs';

const root = path.resolve('example-site');
test('the preview resolves public pages and assets', () => {
  assert.equal(resolvePublicFile(root, '/'), path.join(root, 'index.html'));
  assert.equal(resolvePublicFile(root, '/privacy/'), path.join(root, 'privacy/index.html'));
  assert.equal(resolvePublicFile(root, '/assets/cafe.webp'), path.join(root, 'assets/cafe.webp'));
});

test('canonical paths cannot bypass the public allowlist', () => {
  for (const file of ['/README.md', '/.git/config', '/assets/../README.md', '/assets/../.git/config', '/assets/../.env', '/src/../docs/setup.md', '/assets/../../outside.txt', '/assets/..\\.git/config', '/assets/\0']) {
    assert.equal(resolvePublicFile(root, file), null, file);
  }
});
