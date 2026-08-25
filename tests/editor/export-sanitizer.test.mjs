import { test } from 'node:test';
import assert from 'node:assert';
import { sanitizeSvg } from '../../src/editor/export-sanitizer.mjs';

test('strips overlay, ensures xmlns, rounds numbers', () => {
  const src = '<svg viewBox="0 0 10 10"><rect width="10.04" height="9.96"/><g id="svgo-overlay"><line x1="0"/><rect/></g></svg>';
  const out = sanitizeSvg(src);
  assert.ok(out.startsWith('<svg xmlns="http://www.w3.org/2000/svg"'), 'xmlns injected');
  assert.ok(!out.includes('svgo-overlay'), 'overlay removed');
  assert.ok(out.includes('width="10"') || out.includes('width="10.0"'), 'rounded');
});

test('idempotent on clean file', () => {
  const clean = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><rect width="10" height="10"/></svg>';
  assert.equal(sanitizeSvg(clean), sanitizeSvg(sanitizeSvg(clean)));
});

test('keeps existing xmlns and other attrs intact', () => {
  const src = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4 4"><rect x="1.25" y="0" width="2.24" height="3" fill="#ff0000"/></svg>';
  const out = sanitizeSvg(src);
  assert.ok(out.includes('x="1.3"'));
  assert.ok(out.includes('width="2.2"'));
  assert.ok(out.includes('fill="#ff0000"'));
});

test('strips editor artifacts (data-svgo-*, data-name, mover class)', () => {
  const src = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4 4">' +
    '<g class="svgo-mover" data-svgo-locked="1"><rect width="2" height="2"/></g>' +
    '<g data-name="标题组"><circle r="1"/></g></svg>';
  const out = sanitizeSvg(src);
  assert.ok(!out.includes('svgo-mover'), 'mover class stripped');
  assert.ok(!out.includes('data-svgo'), 'data-svgo stripped');
  assert.ok(!out.includes('data-name'), 'data-name stripped');
  assert.ok(out.includes('<rect') && out.includes('<circle'), 'content kept');
});
