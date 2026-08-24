import { test } from 'node:test';
import assert from 'node:assert';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

test('editor.html built artifact exists and embeds core modules', () => {
  const p = join(repoRoot, 'scripts', 'editor.html');
  assert.ok(existsSync(p), 'scripts/editor.html missing — run: node scripts/build-editor.mjs');
  const html = readFileSync(p, 'utf8');
  for (const marker of ['computeSnap', 'THEMES', 'sanitizeSvg', 'createTextMeasurer'])
    assert.ok(html.includes(marker), `core symbol ${marker} not inlined`);
});

test('editor.html is fully offline (no external resources)', () => {
  const html = readFileSync(join(repoRoot, 'scripts', 'editor.html'), 'utf8');
  assert.doesNotMatch(html, /src=["']https?:/);
  assert.doesNotMatch(html, /href=["']https?:\/\//);
  assert.doesNotMatch(html, /@import\s+url\(/);
});
