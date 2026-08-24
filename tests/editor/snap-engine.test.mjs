import { test } from 'node:test';
import assert from 'node:assert';
import { computeSnap } from '../../src/editor/snap-engine.mjs';

const canvas = { x: 0, y: 0, w: 800, h: 400 };
const scene = [{ id: 'a', x: 100, y: 100, w: 96, h: 32 }];

test('edge snap within threshold', () => {
  const r = computeSnap({ moving:{id:'m',x:200,y:104,w:80,h:32}, scene, canvas, opts:{threshold:6} });
  assert.equal(r.dy, -4); // moving.top=104 吸到 a.top=100
  assert.ok(r.guides.some(g => g.axis === 'h' && g.pos === 100));
});

test('no snap beyond threshold', () => {
  const r = computeSnap({ moving:{id:'m',x:300,y:130,w:80,h:32}, scene, canvas, opts:{threshold:6} });
  assert.equal(r.dx, 0); assert.equal(r.dy, 0); assert.equal(r.guides.length, 0);
});

test('center snap to canvas center', () => {
  const r = computeSnap({ moving:{id:'m',x:364,y:50,w:72,h:32}, scene, canvas, opts:{threshold:6} });
  assert.equal(r.dx, 0); // 中心 x=400 已对齐
  const r2 = computeSnap({ moving:{id:'m',x:366,y:50,w:72,h:32}, scene, canvas, opts:{threshold:6} });
  assert.equal(r2.dx, -2);
  assert.ok(r2.guides.some(g => g.axis === 'v' && g.pos === 400));
});

test('guide:false bypass returns zero', () => {
  const r = computeSnap({ moving:{id:'m',x:103,y:103,w:80,h:32}, scene, canvas, opts:{threshold:6, guide:false} });
  assert.deepEqual([r.dx, r.dy], [0, 0]);
});
