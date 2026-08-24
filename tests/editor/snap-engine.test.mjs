import { test } from 'node:test';
import assert from 'node:assert';
import { computeSnap } from '../../src/editor/snap-engine.mjs';

const canvas = { x: 0, y: 0, w: 800, h: 400 };

test('edge snap within threshold', () => {
  const scene = [{ id: 'a', x: 100, y: 100, w: 96, h: 96 }]; // 竖直中心 148，远离被拖元素
  const r = computeSnap({ moving:{id:'m',x:300,y:103,w:80,h:32}, scene, canvas, opts:{threshold:6} });
  assert.equal(r.dy, -3); // moving.top=103 吸到 a.top=100
  assert.equal(r.dx, 0);
  assert.deepEqual(r.guides, [{ axis: 'h', pos: 100 }]);
});

test('center snap beats edge at equal distance', () => {
  const scene = [{ id: 'a', x: 100, y: 100, w: 96, h: 64 }]; // midY=132
  const r = computeSnap({ moving:{id:'m',x:300,y:101,w:80,h:62}, scene, canvas, opts:{threshold:6} });
  // moving 中心 132 与 a 中心重合(d=0)，优先于顶边 d=-1
  assert.equal(r.dy, 0);
  assert.deepEqual(r.guides.filter(g => g.axis === 'h'), [{ axis: 'h', pos: 132 }]);
});

test('no snap beyond threshold', () => {
  const scene = [{ id: 'a', x: 100, y: 100, w: 96, h: 96 }];
  const r = computeSnap({ moving:{id:'m',x:500,y:330,w:80,h:32}, scene, canvas, opts:{threshold:6} });
  assert.equal(r.dx, 0); assert.equal(r.dy, 0); assert.equal(r.guides.length, 0);
});

test('center snap to canvas center', () => {
  const scene = [];
  const r = computeSnap({ moving:{id:'m',x:364,y:50,w:72,h:32}, scene, canvas, opts:{threshold:6} });
  assert.equal(r.dx, 0); // 中心 x=400 已对齐
  const r2 = computeSnap({ moving:{id:'m',x:366,y:50,w:72,h:32}, scene, canvas, opts:{threshold:6} });
  assert.equal(r2.dx, -2);
  assert.ok(r2.guides.some(g => g.axis === 'v' && g.pos === 400));
});

test('guide:false bypass returns zero', () => {
  const scene = [{ id: 'a', x: 100, y: 100, w: 96, h: 32 }];
  const r = computeSnap({ moving:{id:'m',x:103,y:103,w:80,h:32}, scene, canvas, opts:{threshold:6, guide:false} });
  assert.deepEqual([r.dx, r.dy], [0, 0]);
});
