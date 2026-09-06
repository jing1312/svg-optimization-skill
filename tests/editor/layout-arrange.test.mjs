import { test } from 'node:test';
import assert from 'node:assert';
import { arrangeLayout } from '../../src/editor/layout-arrange.mjs';

const C = { x: 0, y: 0, w: 1100, h: 300 };
const close = (a, b, eps = 0.6) => Math.abs(a - b) <= eps;
const center = (b, p) => ({ cx: p.x + b.w / 2, cy: p.y + b.h / 2 });

test('单元素：任何布局都画布居中', () => {
  const b = [{ x: 800, y: 250, w: 100, h: 40 }];
  for (const id of ['left-right', 'centered', 'feature-grid', 'diagonal']) {
    const [p] = arrangeLayout(id, b, C);
    const c = center(b[0], p);
    assert.ok(close(c.cx, C.w / 2) && close(c.cy, C.h / 2), id + ': ' + JSON.stringify(p));
  }
});

test('left-right：3 个元素按 x 分两列，列中心在 1/4 与 3/4 画布宽', () => {
  const boxes = [
    { x: 500, y: 0, w: 200, h: 50 },   // 中间
    { x: 0, y: 200, w: 150, h: 40 },   // 最左
    { x: 900, y: 100, w: 180, h: 60 }, // 最右
  ];
  const out = arrangeLayout('left-right', boxes, C);
  // 按 x 排序：1(最左) 0 2(最右) → 左列 [1,0]，右列 [2]
  const c1 = center(boxes[1], out[1]), c0 = center(boxes[0], out[0]), c2 = center(boxes[2], out[2]);
  assert.ok(close(c1.cx, C.w * 0.25) && close(c0.cx, C.w * 0.25), '左列 x: ' + c1.cx + ',' + c0.cx);
  assert.ok(close(c2.cx, C.w * 0.75), '右列 x: ' + c2.cx);
  // 左列两元素垂直堆叠不重叠
  const [top, bot] = out[1].y < out[0].y ? [out[1], out[0]] : [out[0], out[1]];
  assert.ok(bot.y >= top.y + boxes[1].h - 0.6 || bot.y >= top.y + boxes[0].h - 0.6, '堆叠重叠');
});

test('centered：全部水平居中，按阅读序（y 优先）纵向排列', () => {
  const boxes = [
    { x: 900, y: 250, w: 100, h: 40 }, // y 最大
    { x: 0, y: 0, w: 300, h: 60 },     // y 最小
  ];
  const out = arrangeLayout('centered', boxes, C);
  const c0 = center(boxes[0], out[0]), c1 = center(boxes[1], out[1]);
  assert.ok(close(c0.cx, C.w / 2) && close(c1.cx, C.w / 2));
  assert.ok(out[1].y < out[0].y, 'y 小的在上');
  assert.ok(out[0].y >= out[1].y + boxes[1].h, '堆叠不重叠');
});

test('feature-grid：第一个元素置顶居中，其余一行均布其下', () => {
  const boxes = [
    { x: 0, y: 0, w: 400, h: 60 },   // 标题（y 最小）
    { x: 0, y: 100, w: 150, h: 80 },
    { x: 500, y: 120, w: 150, h: 80 },
  ];
  const out = arrangeLayout('feature-grid', boxes, C);
  const head = center(boxes[0], out[0]);
  assert.ok(close(head.cx, C.w / 2), '标题水平居中');
  assert.ok(close(out[0].y, 16), '标题贴顶（MARGIN=16）');
  // 其余两个同一行、水平均布
  assert.ok(close(out[1].y, out[2].y), '同一行');
  const c1 = center(boxes[1], out[1]), c2 = center(boxes[2], out[2]);
  assert.ok(c1.cx < C.w / 2 && c2.cx > C.w / 2, '分列中线两侧');
  assert.ok(close((c1.cx + c2.cx) / 2, C.w / 2), '关于中线对称');
  assert.ok(out[1].y >= 16 + boxes[0].h + 16, '在标题下方');
});

test('diagonal：沿对角线单调分布且不出画布', () => {
  const boxes = [
    { x: 0, y: 0, w: 100, h: 40 },
    { x: 900, y: 0, w: 100, h: 40 },
    { x: 0, y: 250, w: 100, h: 40 },
  ];
  const out = arrangeLayout('diagonal', boxes, C);
  for (let i = 0; i < 3; i++) {
    assert.ok(out[i].x >= 16 && out[i].x + boxes[i].w <= C.w - 16, 'x 在界内');
    assert.ok(out[i].y >= 16 && out[i].y + boxes[i].h <= C.h - 16, 'y 在界内');
  }
  // 按 x+y 排序后目标位置 x、y 均单调不减
  const order = [0, 1, 2].sort((a, b) =>
    (boxes[a].x + boxes[a].y) - (boxes[b].x + boxes[b].y));
  for (let k = 1; k < order.length; k++) {
    assert.ok(out[order[k]].x >= out[order[k - 1]].x - 0.6, 'x 单调');
    assert.ok(out[order[k]].y >= out[order[k - 1]].y - 0.6, 'y 单调');
  }
});

test('未知布局 id：全部画布居中', () => {
  const boxes = [{ x: 0, y: 0, w: 100, h: 40 }, { x: 500, y: 100, w: 100, h: 40 }];
  const out = arrangeLayout('nope', boxes, C);
  for (let i = 0; i < 2; i++) {
    const c = center(boxes[i], out[i]);
    assert.ok(close(c.cx, C.w / 2) && close(c.cy, C.h / 2));
  }
});
