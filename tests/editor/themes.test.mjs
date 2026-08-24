import { test } from 'node:test';
import assert from 'node:assert';
import { THEMES, LAYOUTS, MIXES, TOKEN_KEYS } from '../../src/editor/theme-tokens.mjs';

test('token completeness', () => {
  assert.equal(THEMES.length, 12);
  for (const t of THEMES) for (const k of TOKEN_KEYS)
    assert.match(String(t.tokens[k]), /^#[0-9a-fA-F]{6}$/, `${t.id}.${k}`);
  assert.equal(THEMES.filter(t => t.id === 'aurora-light')[0].default, true);
  assert.equal(THEMES.filter(t => t.default).length, 1);
  assert.equal(LAYOUTS.length, 4);
  assert.equal(MIXES.length, 4);
});
