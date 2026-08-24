import { test } from 'node:test';
import assert from 'node:assert';
import { unionBox, inflateBox, boxCenter } from '../../src/editor/geometry.mjs';

test('union/inflate/center', () => {
  assert.deepEqual(unionBox({x:0,y:0,w:10,h:10},{x:20,y:5,w:10,h:5}), {x:0,y:0,w:30,h:10});
  assert.deepEqual(inflateBox({x:10,y:10,w:20,h:20}, 5), {x:5,y:5,w:30,h:30});
  assert.deepEqual(boxCenter({x:0,y:0,w:10,h:6}), {x:5,y:3});
});
