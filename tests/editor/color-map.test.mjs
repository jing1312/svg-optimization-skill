import { test } from 'node:test';
import assert from 'node:assert';
import { planThemeChanges, relLum, wcagContrast, elemOpacityAt, isTextEl, paletteFromColors, contrastMinRatio, mixPaintPlan } from '../../src/editor/color-map.mjs';
import { THEMES } from '../../src/editor/theme-tokens.mjs';

const AURORA = THEMES.find(t => t.id === 'aurora-light').tokens;
const GOLD = THEMES.find(t => t.id === 'graphite-gold').tokens;

function fakeEl(tag, attrs = {}) {
  return { tagName: tag, getAttribute: n => (n in attrs ? attrs[n] : null) };
}
function text(val, attrs) { return { el: fakeEl('text', attrs), attr: 'fill', val }; }
function rect(val, attrs) { return { el: fakeEl('rect', attrs), attr: 'fill', val }; }

const MID = hex => relLum(hex) > 0.45 && relLum(hex) < 0.65;

test('R4: 低透明度装饰不参与换肤', () => {
  const entries = [rect('#ffffff', { 'fill-opacity': '0.09' }), text('#ffffff', {})];
  const out = planThemeChanges(entries, AURORA);
  // 白色高光 rect 被跳过：任何针对它的 change 都不应出现
  assert.equal(out.filter(c => c.el === entries[0].el).length, 0);
  // 不透明文字参与映射（目标已是原值时无需 change，两种情况都合法）
  const c = out.find(x => x.el === entries[1].el);
  if (c) assert.ok(relLum(c.after) >= 0.65, `白字被映射到暗色: ${c.after}`);
});

test('R4: stop-opacity 低的渐变 stop 被跳过', () => {
  const el = fakeEl('stop', { 'stop-opacity': '0.02' });
  const out = planThemeChanges([{ el, attr: 'stop-color', val: '#a79ae8' }], AURORA);
  assert.equal(out.length, 0);
});

test('R1: 相同源色映射到相同目标（不散档）', () => {
  const entries = [
    text('#ffffff', {}), text('#ffffff', {}), rect('#ffffff', {}),
    rect('#ffffff', {}), rect('#ffffff', {}),
  ];
  const out = planThemeChanges(entries, AURORA);
  const afters = [...new Set(out.map(c => c.after))];
  // 全部 #ffffff（含文字）同簇 → 至多按文字极性一个目标；非文字另一目标也不得散出
  const textAfters = [...new Set(out.filter(c => isTextEl(c.el)).map(c => c.after))];
  assert.ok(textAfters.length <= 1, `文字同色散档: ${textAfters}`);
  const rectAfters = [...new Set(out.filter(c => !isTextEl(c.el)).map(c => c.after))];
  assert.ok(rectAfters.length <= 1, `图形同色散档: ${rectAfters}`);
});

test('R2: 文字不落中间档（aurora + graphite 全体主题扫描）', () => {
  for (const theme of THEMES) {
    const entries = [
      text('#ffffff', {}), text('#f5f3f0', {}), text('#24263a', {}),
      rect('#383b73', {}), rect('#a79ae8', {}),
    ];
    const out = planThemeChanges(entries, theme.tokens);
    for (const c of out.filter(c => isTextEl(c.el))) {
      assert.ok(!MID(c.after), `${theme.id}: 文字落中间档 ${c.after}`);
    }
  }
});

test('R2: 极性保持——原图浅色文字换肤后仍为浅色', () => {
  const out = planThemeChanges([text('#f5f3f0', {})], AURORA);
  assert.equal(out.length, 1);
  assert.ok(relLum(out[0].after) >= 0.65, `副标题变深色: ${out[0].after}`);
});

test('R2: 极性保持——原图深色文字换肤后仍为深色', () => {
  const out = planThemeChanges([text('#24263a', {})], AURORA);
  assert.equal(out.length, 1);
  assert.ok(relLum(out[0].after) <= 0.45, `深字变浅: ${out[0].after}`);
});

test('诊断案例回归: graphite-gold 下白标题与米白副标题均不隐身', () => {
  const out = planThemeChanges([text('#ffffff', {}), text('#f5f3f0', {})], GOLD);
  for (const c of out) {
    assert.ok(relLum(c.after) >= 0.65, `${c.before} -> ${c.after} 仍偏暗`);
  }
});

test('R6: 中性深底不进彩色通道，彩色不进中性通道', () => {
  const out = planThemeChanges([rect('#383b73', {}), rect('#f5f3f0', {})], AURORA);
  const chroma = new Set(['#4f7cff', '#3b63d9', '#22d3ee']);
  for (const c of out.filter(c => c.before === '#383b73')) assert.ok(chroma.has(c.after), `${c.before} -> ${c.after}`);
});

test('R6: 近黑深色不误入彩色通道（#24263a 相对饱和度虚高案例）', () => {
  const out = planThemeChanges([text('#24263a', {})], AURORA);
  assert.equal(out.length, 1);
  const neutral = new Set(Object.values(AURORA).map(v => String(v).toLowerCase()));
  assert.ok(neutral.has(out[0].after), `深色文字被染成主题彩色: ${out[0].after}`);
});

test('paletteFromColors: banner 配色 → 三彩色按明度对号，中性分层，语义色沿用 baseline', () => {
  const out = paletteFromColors(
    ['#383b73', '#5f61c7', '#a79ae8', '#24263a', '#f5f3f0', '#ffffff'], AURORA);
  // 彩色 relLum 升序 → primaryDark / primary / accent
  assert.equal(out.primaryDark, '#383b73');
  assert.equal(out.primary, '#5f61c7');
  assert.equal(out.accent, '#a79ae8');
  // 中性升序分位 → title(最暗) / muted(中位) / surface(最亮)，body/bg 沿用 baseline
  assert.equal(out.title, '#24263a');
  assert.equal(out.muted, '#f5f3f0');
  assert.equal(out.surface, '#ffffff');
  assert.equal(out.body, AURORA.body);
  assert.equal(out.bg, AURORA.bg);
  // R5：语义色不被配色提取覆盖
  assert.equal(out.success, AURORA.success);
  assert.equal(out.danger, AURORA.danger);
});

test('paletteFromColors: 单彩色落 primary，单中性落 muted；非法输入返回 baseline', () => {
  const one = paletteFromColors(['#ff5f57'], AURORA);
  assert.equal(one.primary, '#ff5f57');
  const oneN = paletteFromColors(['#f5f3f0'], AURORA);
  assert.equal(oneN.muted, '#f5f3f0');
  const none = paletteFromColors(['url(#x)', ''], AURORA);
  assert.equal(none.primary, AURORA.primary);
});

test('contrastMinRatio: WCAG 大字/普通文本阈值', () => {
  assert.equal(contrastMinRatio(24, false), 3.0);
  assert.equal(contrastMinRatio(19, true), 3.0);
  assert.equal(contrastMinRatio(18.5, true), 4.5); // 差一点不到 18.66
  assert.equal(contrastMinRatio(18, false), 4.5);
  assert.equal(contrastMinRatio(16, true), 4.5);
});

test('mixPaintPlan: 四种混色手法', () => {
  const tok = AURORA;
  // solid：纯主色；swap 交换主深色
  assert.equal(mixPaintPlan('solid', tok, 0).type, 'solid');
  assert.equal(mixPaintPlan('solid', tok, 0).color, tok.primary);
  assert.equal(mixPaintPlan('solid', tok, 0, true).color, tok.primaryDark);
  // band：垂直双段渐变 primary→primaryDark
  const band = mixPaintPlan('band', tok, 0);
  assert.equal(band.type, 'gradient');
  assert.equal(band.vertical, true);
  assert.deepEqual(band.stops, [tok.primary, tok.primaryDark]);
  // aurora：斜向三段 accent→primary→primaryDark
  const aur = mixPaintPlan('aurora', tok, 0);
  assert.equal(aur.vertical, false);
  assert.deepEqual(aur.stops, [tok.accent, tok.primary, tok.primaryDark]);
  // multichip：按 index 轮换 primary/accent/warning
  assert.equal(mixPaintPlan('multichip', tok, 0).color, tok.primary);
  assert.equal(mixPaintPlan('multichip', tok, 1).color, tok.accent);
  assert.equal(mixPaintPlan('multichip', tok, 2).color, tok.warning);
  assert.equal(mixPaintPlan('multichip', tok, 3).color, tok.primary); // 循环
  // 未知手法回落 solid
  assert.equal(mixPaintPlan('nope', tok, 0).color, tok.primary);
});

test('wcagContrast / elemOpacityAt 基础行为', () => {
  assert.ok(wcagContrast('#ffffff', '#000000') > 20);
  assert.ok(Math.abs(wcagContrast('#ffffff', '#ffffff') - 1) < 1e-9);
  assert.equal(elemOpacityAt(fakeEl('rect', { 'fill-opacity': '0.2', opacity: '0.5' }), 'fill'), 0.1);
  assert.equal(elemOpacityAt(fakeEl('rect', {}), 'fill'), 1);
});
