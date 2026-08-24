import { test } from 'node:test';
import assert from 'node:assert';
import { createTextMeasurer, bindCanvasMeasure } from '../../src/editor/text-measurer.mjs';

const fake = (text, fs, weight) => text.length * fs * (weight === 700 ? 1.1 : 1);

test('width & fitWidth', () => {
  const m = createTextMeasurer(fake, { pad: 16 });
  assert.equal(m.width('abcd', 10), 40);
  assert.equal(m.width('abcd', 10, 700), 44);
  assert.equal(m.fitWidth('abcd', { fontSize: 10 }), 72); // 40 + 32
});

test('browser binding guarded in node', () => {
  assert.throws(() => bindCanvasMeasure(), /canvas unavailable/);
});
