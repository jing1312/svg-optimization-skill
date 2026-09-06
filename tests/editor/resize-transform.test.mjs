import { test } from 'node:test';
import assert from 'node:assert';
import { composeScaleTransform, applyTransformPoint } from '../../src/editor/resize-transform.mjs';

// 形状约定（与编辑器一致）：
// box = elBox(mover) → {x,y,w,h}；rbox = mover.getBBox() → {x,y,width,height}；nb → {x,y,w,h}

// 把 rbox 四角过一遍生成的 transform，断言渲染框等于 nb（缩放的核心不变量）
function renderedBox(transform, rbox) {
  const pts = [
    applyTransformPoint(transform, rbox.x, rbox.y),
    applyTransformPoint(transform, rbox.x + rbox.width, rbox.y),
    applyTransformPoint(transform, rbox.x, rbox.y + rbox.height),
    applyTransformPoint(transform, rbox.x + rbox.width, rbox.y + rbox.height),
  ];
  const xs = pts.map(p => p.x), ys = pts.map(p => p.y);
  return {
    x: Math.min(...xs), y: Math.min(...ys),
    w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys),
  };
}
const close = (a, b, eps = 0.15) => Math.abs(a - b) <= eps;

test('se 拖大：右下角跟随，锚点不动，框精确等于 nb', () => {
  const rbox = { x: 100, y: 100, width: 100, height: 100 };
  const box = { x: 100, y: 100, w: 100, h: 100 };
  const nb = { x: 100, y: 100, w: 200, h: 150 };
  const t = composeScaleTransform('se', box, rbox, nb, '');
  const out = renderedBox(t, rbox);
  assert.ok(close(out.x, nb.x) && close(out.y, nb.y) && close(out.w, nb.w) && close(out.h, nb.h), JSON.stringify(out));
});

test('nw 拖动：左上角跟随，右下角锚定', () => {
  const rbox = { x: 100, y: 100, width: 100, height: 100 };
  const box = { x: 100, y: 100, w: 100, h: 100 };
  const nb = { x: 50, y: 80, w: 150, h: 120 };
  const t = composeScaleTransform('nw', box, rbox, nb, '');
  const out = renderedBox(t, rbox);
  assert.ok(close(out.x, nb.x) && close(out.y, nb.y) && close(out.w, nb.w) && close(out.h, nb.h), JSON.stringify(out));
});

test('n 单边：水平不缩放，底边锚定', () => {
  const rbox = { x: 0, y: 0, width: 200, height: 100 };
  const box = { x: 0, y: 0, w: 200, h: 100 };
  const nb = { x: 0, y: 30, w: 200, h: 70 };
  const t = composeScaleTransform('n', box, rbox, nb, '');
  const out = renderedBox(t, rbox);
  assert.ok(close(out.x, nb.x) && close(out.y, nb.y) && close(out.w, nb.w) && close(out.h, nb.h), JSON.stringify(out));
});

test('连续两次缩放：复合 transform 后渲染框仍精确（第二次的 rbox 已含第一次）', () => {
  const rbox1 = { x: 10, y: 10, width: 80, height: 60 };
  const box1 = { x: 10, y: 10, w: 80, h: 60 };
  const t1 = composeScaleTransform('e', box1, rbox1, { x: 10, y: 10, w: 160, h: 60 }, '');
  const r2 = renderedBox(t1, rbox1);
  const rbox2 = { x: r2.x, y: r2.y, width: r2.w, height: r2.h };
  const box2 = { x: r2.x, y: r2.y, w: r2.w, h: r2.h };
  const t2 = composeScaleTransform('s', box2, rbox2, { x: r2.x, y: r2.y, w: r2.w, h: r2.h * 2 }, t1);
  const out = renderedBox(t2, rbox1);
  assert.ok(close(out.w, 160) && close(out.h, 120), JSON.stringify(out));
});

test('带拖动偏移（box ≠ rbox）：缩放比正确、平移补齐偏移', () => {
  const rbox = { x: 100, y: 100, width: 100, height: 100 };
  const box = { x: 120, y: 90, w: 100, h: 100 }; // tx=20, ty=-10
  const nb = { x: 170, y: 90, w: 50, h: 50 }; // sw 缩小：x = box 右边(220) - 新宽(50)
  const t = composeScaleTransform('sw', box, rbox, nb, '');
  const out = renderedBox(t, rbox);
  // 渲染框（mover 本地）+ 偏移 = 画布框
  assert.ok(close(out.w, 50) && close(out.h, 50), JSON.stringify(out));
  assert.ok(close(out.x + 20, nb.x) && close(out.y - 10, nb.y), JSON.stringify(out));
});

test('applyTransformPoint：translate/scale 逆序作用', () => {
  const p = applyTransformPoint('translate(10 20) scale(2 3)', 5, 5);
  // 先 scale 再 translate：=(10+10, 15+20)
  assert.ok(close(p.x, 20) && close(p.y, 35));
});
