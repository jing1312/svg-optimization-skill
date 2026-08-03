import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

const repoRoot = join(import.meta.dirname, '..');
const script = join(repoRoot, 'scripts', 'preferences.mjs');

function run(args, path) {
  return execFileSync(process.execPath, [script, ...args, '--path', path], {
    cwd: repoRoot,
    encoding: 'utf8',
  }).trim();
}

function tempPath() {
  return join(mkdtempSync(join(tmpdir(), 'svg-preferences-')), 'preferences.json');
}

test('records allowlisted structured preferences and caps their weight', () => {
  const path = tempPath();

  run(['record', '--key', 'background.edge_clipped_bubbles', '--delta', '9'], path);
  run(['record', '--key', 'background.edge_clipped_bubbles', '--delta', '2'], path);

  const stored = JSON.parse(readFileSync(path, 'utf8'));
  assert.deepEqual(stored, {
    version: 1,
    preferences: { background: { edge_clipped_bubbles: 5 } },
  });
});

test('rejects unknown keys without creating a preference record', () => {
  const path = tempPath();

  assert.throws(
    () => run(['record', '--key', 'private.prompt', '--delta', '1'], path),
    /Unknown preference key/,
  );
  assert.equal(readFileSync(path, 'utf8', { encoding: 'utf8', flag: 'a' }), '');
});

test('forgets one preference and can reset the whole profile', () => {
  const path = tempPath();

  run(['record', '--key', 'composition.unified_brand_suite', '--delta', '2'], path);
  run(['record', '--key', 'logo.avoid_generic_bolt', '--delta', '1'], path);
  run(['forget', '--key', 'composition.unified_brand_suite'], path);

  assert.deepEqual(JSON.parse(run(['show'], path)), {
    version: 1,
    preferences: { logo: { avoid_generic_bolt: 1 } },
  });

  run(['reset'], path);
  assert.deepEqual(JSON.parse(run(['show'], path)), { version: 1, preferences: {} });
});

test('recovers from malformed local configuration without exposing its contents', () => {
  const path = tempPath();
  writeFileSync(path, 'not-json');

  assert.deepEqual(JSON.parse(run(['show'], path)), { version: 1, preferences: {} });
  run(['record', '--key', 'palette.dark_cyan', '--delta', '1'], path);
  assert.deepEqual(JSON.parse(run(['show'], path)), {
    version: 1,
    preferences: { palette: { dark_cyan: 1 } },
  });
});
