// 布局模板：把选中元素按画布（canvas）排版，返回与输入同序的目标坐标数组。
// 纯函数——box = elBox(mover) 形状 {x,y,w,h}，canvas = stage.__canvas 形状 {x,y,w,h}。
// 排版语义：
//   left-right   左文右标：按当前 x 排序，前一半左列、其余右列，两列垂直居中
//   centered     居中对称：按阅读序（y 优先）纵向堆叠，水平居中
//   feature-grid 标题+特性格：第一个（最靠上）作标题置顶居中，其余一行均布其下
//   diagonal     斜切动势：按当前对角位置排序，沿画布对角线分布
// 元素尺寸不变，只返回移动目标点（元素左上角目标位置）。

export function arrangeLayout(id, boxes, canvas) {
  const c = canvas;
  const idx = boxes.map((_, i) => i);
  const out = idx.map(() => ({ x: 0, y: 0 }));
  if (!boxes.length) return out;
  if (boxes.length === 1) {
    out[0] = { x: c.x + c.w / 2 - boxes[0].w / 2, y: c.y + c.h / 2 - boxes[0].h / 2 };
    return out;
  }
  const byXY = [...idx].sort((a, b) => (boxes[a].y - boxes[b].y) || (boxes[a].x - boxes[b].x));
  const byX = [...idx].sort((a, b) => (boxes[a].x - boxes[b].x) || (boxes[a].y - boxes[b].y));
  const centerIn = (i, cx, cy) => { out[i] = { x: cx - boxes[i].w / 2, y: cy - boxes[i].h / 2 }; };
  const GAP = 16, MARGIN = 16, GAP_MIN = 4;
  // 在 [top,bottom] 区间内垂直堆叠（保持 list 顺序），每列元素水平中心对齐 cx
  const stack = (list, cx, top, bottom) => {
    const totalH = list.reduce((s, i) => s + boxes[i].h, 0);
    const gap = list.length > 1
      ? Math.max(GAP_MIN, Math.min(GAP, (bottom - top - totalH) / (list.length - 1)))
      : 0;
    let y = top + Math.max(0, (bottom - top - totalH - gap * (list.length - 1)) / 2);
    for (const i of list) {
      centerIn(i, cx, y + boxes[i].h / 2);
      y += boxes[i].h + gap;
    }
  };

  if (id === 'left-right') {
    const k = Math.ceil(byX.length / 2);
    stack(byX.slice(0, k), c.x + c.w * 0.25, c.y + MARGIN, c.y + c.h - MARGIN);
    stack(byX.slice(k), c.x + c.w * 0.75, c.y + MARGIN, c.y + c.h - MARGIN);
  } else if (id === 'centered') {
    stack(byXY, c.x + c.w / 2, c.y + MARGIN, c.y + c.h - MARGIN);
  } else if (id === 'feature-grid') {
    const head = byXY[0], rest = byXY.slice(1);
    centerIn(head, c.x + c.w / 2, c.y + MARGIN + boxes[head].h / 2);
    if (rest.length) {
      const rowTop = c.y + MARGIN + boxes[head].h + GAP;
      const rowBottom = c.y + c.h - MARGIN;
      const totalW = rest.reduce((s, i) => s + boxes[i].w, 0);
      const gap = rest.length > 1
        ? Math.max(GAP_MIN, Math.min(GAP, (c.w - 2 * MARGIN - totalW) / (rest.length - 1)))
        : 0;
      const total = totalW + gap * (rest.length - 1);
      let x = c.x + (c.w - total) / 2;
      const cy = (rowTop + rowBottom) / 2;
      for (const i of rest) {
        out[i] = { x, y: cy - boxes[i].h / 2 };
        x += boxes[i].w + gap;
      }
    }
  } else if (id === 'diagonal') {
    const order = [...idx].sort((a, b) =>
      (boxes[a].x + boxes[a].y) - (boxes[b].x + boxes[b].y));
    order.forEach((i, k) => {
      const t = k / (order.length - 1);
      out[i] = {
        x: c.x + MARGIN + t * (c.w - 2 * MARGIN - boxes[i].w),
        y: c.y + MARGIN + t * (c.h - 2 * MARGIN - boxes[i].h),
      };
    });
  } else {
    for (const i of idx) centerIn(i, c.x + c.w / 2, c.y + c.h / 2);
  }
  return out;
}
