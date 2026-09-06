// path/g 缩放：绕手柄对侧锚点的 scale 变换合成
// 坐标约定：rbox = mover.getBBox()（mover 本地坐标，已含内层既有 transform），
// box = elBox(mover)（= rbox + 拖动偏移 tx/ty），nb = 新框（画布坐标）。
// 生成 'translate(...) scale(...)' 前缀复合到内层元素既有 transform 之前；
// mover.getBBox() 恒反映复合后的渲染框，elBox/吸附/框选因此自动正确。

export function composeScaleTransform(mode, box, rbox, nb, prev) {
  const sx = (mode.includes('e') || mode.includes('w')) ? nb.w / box.w : 1;
  const sy = (mode.includes('n') || mode.includes('s')) ? nb.h / box.h : 1;
  const ax = mode.includes('w') ? rbox.x + rbox.width : mode.includes('e') ? rbox.x : rbox.x + rbox.width / 2;
  const ay = mode.includes('n') ? rbox.y + rbox.height : mode.includes('s') ? rbox.y : rbox.y + rbox.height / 2;
  const fmt = n => Math.round(n * 10000) / 10000;
  const m = 'translate(' + Math.round(ax * (1 - sx) * 10) / 10 + ' ' + Math.round(ay * (1 - sy) * 10) / 10 + ') scale(' + fmt(sx) + ' ' + fmt(sy) + ')';
  return prev ? m + ' ' + prev : m;
}
// 把 transform 串应用到一点（支持 translate/scale 子集，足够覆盖本模块输出）
// transform 列表从右往左作用（最右最内层），故按匹配的逆序应用
export function applyTransformPoint(str, x, y) {
  let px = x, py = y;
  const re = /(translate|scale)\(\s*(-?[\d.]+)[,\s]+(-?[\d.]+)\s*\)/g;
  const ops = [];
  let m;
  while ((m = re.exec(String(str)))) ops.push([m[1], parseFloat(m[2]), parseFloat(m[3])]);
  for (const [op, a, b] of ops.reverse()) {
    if (op === 'translate') { px += a; py += b; }
    else { px *= a; py *= b; }
  }
  return { x: px, y: py };
}
