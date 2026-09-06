// 换肤配色映射 · 最终规则（文档：.superpowers/2026-09-07-color-repaint-rules.md）
// R1 同色同档：明度差 <0.02 且色距 <24 的源色聚为一簇，同簇拿同一目标 token
// R2 文字禁中间档：文字簇按原色极性只落亮端(relLum≥0.65)或暗端(relLum≤0.45)候选
// R3 对比度兜底：以「极性锁定」近似实现——原文浅色换肤后仍浅、深色仍深，
//    由 relLum 窗口保证与画布两端的安全距离；元素级背景检测留待后续升级
// R4 低透明度(<0.3)的填充/描边/渐变 stop 属高光氛围层，不参与换肤、不入源色池
// R5 语义色(success/warning/danger)不进入映射通道，全主题固定
// R6 彩色/中性分通道：sat≥0.18 且绝对色差 max-min≥24 才算彩色
// （仅看相对饱和度会让 #24263a 这类近黑深色虚高误入彩色通道，已被
//   graphite-gold 验证抓出；低明度深色的饱和度必须用绝对色差复核）

const OPACITY_ATTR = { fill: 'fill-opacity', stroke: 'stroke-opacity', 'stop-color': 'stop-opacity' };
const TEXT_TAGS = ['text', 'tspan'];
const CLUSTER_DL = 0.02;   // R1 聚类明度窗口
const CLUSTER_DIST = 24;   // R1 聚类色距窗口
const LIGHT_FLOOR = 0.65;  // R2 亮端候选下限（relLum）
const DARK_CEIL = 0.45;    // R2 暗端候选上限（relLum）
const MIN_OPACITY = 0.3;   // R4 参与换肤的最低不透明度

export function hexToRgb(h) {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
export function colorDist(a, b) {
  const A = hexToRgb(a), B = hexToRgb(b);
  return Math.abs(A[0]-B[0]) + Math.abs(A[1]-B[1]) * 1.2 + Math.abs(A[2]-B[2]);
}
export function sat(hex) { const [r, g, b] = hexToRgb(hex); const mx = Math.max(r, g, b), mn = Math.min(r, g, b); return mx === 0 ? 0 : (mx - mn) / mx; }
// 彩色判定：相对饱和度 + 绝对色差双门槛（防深色近黑误判，见 R6 注释）
export function isChromatic(hex) {
  const [r, g, b] = hexToRgb(hex);
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
  return mx > 0 && (mx - mn) / mx >= 0.18 && (mx - mn) >= 24;
}

// 从任意颜色集合提炼一套组件默认配色（跨主题锁定用）：
// 彩色按 relLum 升序填 primaryDark/primary/accent，中性按 relLum 升序填
// title/body/muted/bg/surface（分位对号），语义色与缺省键沿用 baseline
const CHROMA_TARGETS = ['primaryDark', 'primary', 'accent'];
const NEUTRAL_TARGETS = ['title', 'body', 'muted', 'bg', 'surface'];
export function paletteFromColors(colors, baseline) {
  const out = { ...baseline };
  const uniq = [...new Set((colors || [])
    .filter(c => /^#[0-9a-fA-F]{6}$/i.test(String(c)))
    .map(c => String(c).toLowerCase()))];
  const assign = (keys, list) => {
    if (!list.length) return;
    list.forEach((c, i) => {
      const k = keys[list.length === 1
        ? Math.floor(keys.length / 2)
        : Math.round(i * (keys.length - 1) / (list.length - 1))];
      out[k] = c;
    });
  };
  assign(CHROMA_TARGETS, uniq.filter(isChromatic).sort((a, b) => relLum(a) - relLum(b)));
  assign(NEUTRAL_TARGETS, uniq.filter(c => !isChromatic(c)).sort((a, b) => relLum(a) - relLum(b)));
  return out;
}

// 组件配色手法（混色下拉）：solid 纯色 / band 垂直渐变 / aurora 三段斜向渐变 /
// multichip 多彩轮换（primary/accent/warning 按 index 循环）。swap 交换主深色（按钮类）
export function mixPaintPlan(mix, tok, index, swap) {
  const p1 = swap ? tok.primaryDark : tok.primary;
  const p2 = swap ? tok.primary : tok.primaryDark;
  if (mix === 'band') return { type: 'gradient', vertical: true, stops: [p1, p2] };
  if (mix === 'aurora') return { type: 'gradient', vertical: false, stops: [tok.accent, p1, p2] };
  if (mix === 'multichip') {
    const colors = [p1, tok.accent, tok.warning];
    return { type: 'solid', color: colors[index % colors.length] };
  }
  return { type: 'solid', color: p1 };
}

export function relLum(hex) {
  const ch = hexToRgb(hex).map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
}
export function wcagContrast(a, b) {
  const l1 = relLum(a), l2 = relLum(b);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}
// WCAG 对比度达标线：大字（≥24px，或 ≥18.66px 且加粗）3.0，普通文本 4.5
export function contrastMinRatio(fontSize, bold) {
  return (fontSize >= 24 || (bold && fontSize >= 18.66)) ? 3.0 : 4.5;
}
export function elemOpacityAt(el, attr) {
  let o = 1;
  const own = OPACITY_ATTR[attr];
  if (own) { const v = parseFloat(el.getAttribute(own)); if (!isNaN(v)) o *= v; }
  const g = parseFloat(el.getAttribute('opacity'));
  if (!isNaN(g)) o *= g;
  return o;
}
export function isTextEl(el) {
  return TEXT_TAGS.includes((el.tagName || '').toLowerCase());
}
// entries: [{el, attr, val(hex)}]；返回 [{el, attr, before, after}]
export function planThemeChanges(entries, targetTokens) {
  const out = [];
  const usable = entries.filter(e => elemOpacityAt(e.el, e.attr) >= MIN_OPACITY);
  const byLum = keys => keys.map(k => ({ k, v: String(targetTokens[k]).toLowerCase() }))
    .sort((a, b) => relLum(a.v) - relLum(b.v));
  runChannel(usable.filter(e => isChromatic(e.val)), byLum(['primary', 'primaryDark', 'accent']));
  runChannel(usable.filter(e => !isChromatic(e.val)), byLum(['bg', 'surface', 'muted', 'body', 'title']));
  return out;

  function clusterList(list) {
    const sorted = [...list].sort((a, b) => relLum(a.val) - relLum(b.val));
    const clusters = [];
    for (const e of sorted) {
      const c = clusters[clusters.length - 1];
      if (c && Math.abs(relLum(e.val) - relLum(c.rep)) < CLUSTER_DL && colorDist(e.val, c.rep) < CLUSTER_DIST) {
        c.items.push(e);
      } else clusters.push({ rep: e.val, isText: isTextEl(e.el), items: [e] });
    }
    return clusters;
  }
  function runChannel(list, targets) {
    if (!list.length || !targets.length) return;
    const clusters = clusterList(list);
    // 非文字簇：全 ramp 明度分位（保留原图层次）
    const deco = clusters.filter(c => !c.isText);
    deco.forEach((c, i) => {
      const idx = deco.length === 1 ? Math.floor(targets.length / 2)
        : Math.round(i * (targets.length - 1) / (deco.length - 1));
      c.target = targets[idx];
    });
    // 文字簇：按原色极性锁定两端，永不落中间档
    for (const pole of ['light', 'dark']) {
      const gs = clusters.filter(c => c.isText && (relLum(c.rep) > 0.5 ? 'light' : 'dark') === pole);
      if (!gs.length) continue;
      const cands = targets.filter(t => pole === 'light' ? relLum(t.v) >= LIGHT_FLOOR : relLum(t.v) <= DARK_CEIL);
      gs.forEach((c, k) => {
        if (!cands.length) { // 该极性无安全档：退到全 ramp 对应端点
          c.target = pole === 'light' ? targets[targets.length - 1] : targets[0];
          return;
        }
        c.target = gs.length === 1
          ? cands[pole === 'light' ? cands.length - 1 : 0]
          : cands[Math.min(cands.length - 1, Math.round(k * (cands.length - 1) / (gs.length - 1)))];
      });
    }
    for (const c of clusters) for (const e of c.items)
      if (e.val !== c.target.v) out.push({ el: e.el, attr: e.attr, before: e.val, after: c.target.v });
  }
}
