import { test } from 'node:test';
import assert from 'node:assert';
import { computeSnap, detectEquality, clusterSimilar } from '../../src/editor/snap-engine.mjs';

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

test('equal spacing detection', () => {
  // a |24| moving |24| b
  const r = detectEquality({ moving:{id:'m',x:150,y:0,w:60,h:32},
    neighbors:[{id:'a',x:66,y:0,w:60,h:32},{id:'b',x:234,y:0,w:60,h:32}] });
  assert.equal(r.axis, 'h'); assert.equal(r.gap, 24);
});

test('no equality when gaps differ', () => {
  const r = detectEquality({ moving:{id:'m',x:150,y:0,w:60,h:32},
    neighbors:[{id:'a',x:60,y:0,w:60,h:32},{id:'b',x:260,y:100,w:60,h:32}] });
  assert.equal(r, null);
});

test('cluster by signature and size within 15%', () => {
  const items = [
    {id:'1',w:96,h:32,signature:'g>rect+text'}, {id:'2',w:98,h:33,signature:'g>rect+text'},
    {id:'3',w:140,h:40,signature:'g>rect+text'}, {id:'4',w:96,h:32,signature:'path'}];
  const groups = clusterSimilar(items);
  assert.deepEqual(groups.find(g => g.includes('1')), ['1','2']);
});

test('semantic column target overrides guide snap', () => {
  const scene = [{id:'a',x:30,y:20,w:96,h:32},{id:'b',x:30,y:70,w:96,h:32}];
  const r = computeSnap({ moving:{id:'m',x:60,y:120,w:97,h:32}, scene, canvas,
    opts:{threshold:6, semantic:true}, signatures:{a:'g>rect+text',b:'g>rect+text',m:'g>rect+text'} });
  assert.equal(r.dx, -30); // 吸到同列 x=30（30px 距离，在 48px 捕获半径内）
  assert.match(r.semantic.reason, /同类/);
});

test('semantic ignores different signature', () => {
  const scene = [{id:'a',x:130,y:20,w:96,h:32}];
  const r = computeSnap({ moving:{id:'m',x:60,y:120,w:97,h:32}, scene, canvas,
    opts:{threshold:6, semantic:true}, signatures:{a:'path',m:'g>rect+text'} });
  assert.equal(r.dx, 0); assert.equal(r.semantic, null);
});
