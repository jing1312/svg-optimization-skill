# SVG 可视化编辑器（editor.html）实现计划

> **面向 AI 代理的工作者：** 按下述任务清单逐项执行；进度用复选框（`- [ ]`）跟踪。每个任务完成后运行对应的验证命令并核对预期输出，再进入下一项。

**目标：** 交付 `scripts/editor.html`——单文件、零依赖、离线的 SVG 可视化编辑器：全套智能吸附（参考线/等距/同类识别）、双击改字自动撑框、12 主题×4 布局×4 混色、拖入即开+写回原文件。规格见 `docs/superpowers/specs/2026-08-25-svg-editor-design.md`。

**架构：** 纯逻辑（吸附引擎、几何、主题 token、测量器、导出净化）写成 ES 模块放 `src/editor/*.mjs`，用 `node --test` 做 TDD；浏览器 UI 壳写 `src/editor/ui.template.html`；`scripts/build-editor.mjs` 把两者拼成单文件产物 `scripts/editor.html`（剥掉 `export ` 关键字后内联）。这样单文件交付与可测性兼得。

**技术栈：** 原生 JS（ES2020+）、SVG DOM API、Canvas measureText、File System Access API、localStorage、node:test。**零外部依赖。**

**测试约定：** 纯逻辑模块严格 TDD（先失败后通过）；DOM/UI 任务用「构建检查 + 手动验证步骤」（浏览器行为无法在 node 断言），每步给出明确的手动验收点。

**共享命名（全计划一致，禁止改名）：**
- 几何盒 `{x,y,w,h}`；`bboxOf(el)` / `unionBox(a,b)` / `inflateBox(b,n)` / `boxCenter(b)`
- `computeSnap({moving, scene, canvas, opts}) → {dx, dy, guides:[{axis:'v'|'h', pos}], equalities:[{axis, gap, range:[p1,p2]}], semantic:{reason} }`；opts 默认 `{threshold:6, guide:true, spacing:true, semantic:true}`
- `clusterSimilar(items, sizeTolerance=0.15)`，items 元素 `{id, w, h, signature}`
- `createTextMeasurer(measureFn, {pad=16}) → {width(text,fontSize,weight=400), fitWidth(text,{fontSize,weight})}`
- 主题 token 键：`bg, surface, primary, primaryDark, accent, title, body, muted, success, warning, danger`
- `THEMES`(12) / `LAYOUTS`(4) / `MIXES`(4)；`sanitizeSvg(svgString)`；overlay 层 id 固定 `svgo-overlay`
- 存储 key：`svgEditorDraft:<fileName>`、`svgEditorComponents`
- 命令工厂：`makeMoveCmd` / `makeResizeCmd` / `makeEditTextCmd` / `makeAddCmd` / `makeDeleteCmd` / `makeReorderCmd` / `makeStyleCmd`

---

### 任务 0：脚手架 + 构建器

**文件：**
- 创建：`scripts/build-editor.mjs`、`src/editor/ui.template.html`（最小占位壳）

- [ ] **步骤 1：写 ui.template.html**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head><meta charset="UTF-8"><title>SVG 编辑器</title></head>
<body>
<script>/*@@CORE@@*/
window.addEventListener('DOMContentLoaded', () => EditorBoot.start());
</script>
</body>
</html>
```

- [ ] **步骤 2：写 build-editor.mjs**

```js
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = join(root, 'src', 'editor');
const ORDER = ['theme-tokens.mjs','geometry.mjs','text-measurer.mjs','snap-engine.mjs','export-sanitizer.mjs'];
const core = ORDER.map(f => readFileSync(join(srcDir, f), 'utf8').replace(/^export\s+/gm, '')).join('\n');
const tpl = readFileSync(join(srcDir, 'ui.template.html'), 'utf8');
const out = tpl.replace('/*@@CORE@@*/', core);
writeFileSync(join(root, 'scripts', 'editor.html'), out);
console.log('built scripts/editor.html', out.length, 'bytes');
```

- [ ] **步骤 3：创建空模块文件让 ORDER 不缺**（每个文件暂时只有一行 `export const x = 1;`）
- [ ] **步骤 4：运行** `node scripts/build-editor.mjs` → 预期输出 `built scripts/editor.html ... bytes`
- [ ] **步骤 5：Commit** `git add -A && git commit -m "chore: editor build scaffolding"`

### 任务 1：geometry.mjs（TDD）

**文件：** 创建 `src/editor/geometry.mjs`；测试 `tests/editor/geometry.test.mjs`

- [ ] **步骤 1：失败测试**

```js
import { test } from 'node:test'; import assert from 'node:assert';
import { unionBox, inflateBox, boxCenter } from '../../src/editor/geometry.mjs';
test('union/inflate/center', () => {
  assert.deepEqual(unionBox({x:0,y:0,w:10,h:10},{x:20,y:5,w:10,h:5}), {x:0,y:0,w:30,h:10});
  assert.deepEqual(inflateBox({x:10,y:10,w:20,h:20}, 5), {x:5,y:5,w:30,h:30});
  assert.deepEqual(boxCenter({x:0,y:0,w:10,h:6}), {x:5,y:3});
});
```

- [ ] **步骤 2：** `node --test tests/editor/geometry.test.mjs` → FAIL（模块不存在）
- [ ] **步骤 3：实现**

```js
export function unionBox(a, b) {
  const x = Math.min(a.x, b.x), y = Math.min(a.y, b.y);
  return { x, y, w: Math.max(a.x+a.w, b.x+b.w)-x, h: Math.max(a.y+a.h, b.y+b.h)-y };
}
export function inflateBox(b, n) { return { x:b.x-n, y:b.y-n, w:b.w+2*n, h:b.h+2*n }; }
export function boxCenter(b) { return { x:b.x+b.w/2, y:b.y+b.h/2 }; }
```

- [ ] **步骤 4：重跑** → PASS；**步骤 5：Commit** `feat: editor geometry utils`

### 任务 2：theme-tokens.mjs（数据 + 完整性测试）

**文件：** 创建 `src/editor/theme-tokens.mjs`；测试 `tests/editor/themes.test.mjs`

- [ ] **步骤 1：失败测试**

```js
import { test } from 'node:test'; import assert from 'node:assert';
import { THEMES, LAYOUTS, MIXES, TOKEN_KEYS } from '../../src/editor/theme-tokens.mjs';
test('token completeness', () => {
  assert.equal(THEMES.length, 12);
  for (const t of THEMES) for (const k of TOKEN_KEYS)
    assert.match(String(t.tokens[k]), /^#[0-9a-fA-F]{6}$/, `${t.id}.${k}`);
  assert.equal(THEMES.filter(t=>t.id==='aurora-light')[0].default, true);
  assert.equal(LAYOUTS.length, 4); assert.equal(MIXES.length, 4);
});
```

- [ ] **步骤 2：跑** → FAIL；**[ ] 步骤 3：写入 12 套主题数据**（hex 与视觉伴侣小样一一对应）：

```js
export const TOKEN_KEYS = ['bg','surface','primary','primaryDark','accent','title','body','muted','success','warning','danger'];
const T = (id,name,dark,tokens,default=false)=>({id,name,dark,tokens,default});
export const THEMES = [
 T('aurora-light','极光蓝紫',false,{bg:'#f4f6ff',surface:'#ffffff',primary:'#4f7cff',primaryDark:'#3b63d9',accent:'#22d3ee',title:'#1e2a5a',body:'#5a6a94',muted:'#8a94a6',success:'#10b981',warning:'#f59e0b',danger:'#e5484d'},true),
 T('teal-bio','生物青绿',false,{bg:'#effbf6',surface:'#ffffff',primary:'#14b8a6',primaryDark:'#0d9488',accent:'#fbbf24',title:'#0f3d33',body:'#4d7268',muted:'#6b8f85',success:'#10b981',warning:'#f59e0b',danger:'#e5484d'}),
 T('deep-neon','深空霓虹',true,{bg:'#131a3d',surface:'#1c2454',primary:'#3f7dff',primaryDark:'#2f5fc4',accent:'#67e8f9',title:'#f2f6ff',body:'#9fb0dd',muted:'#7688b8',success:'#34d399',warning:'#fbbf24',danger:'#f87171'}),
 T('blue-orange','经典蓝橙',false,{bg:'#f8fafc',surface:'#ffffff',primary:'#2563eb',primaryDark:'#1d4ed8',accent:'#f97316',title:'#16233f',body:'#5c6b85',muted:'#94a1b8',success:'#10b981',warning:'#f59e0b',danger:'#ef4444'}),
 T('rose','樱花粉',false,{bg:'#fff5f8',surface:'#ffffff',primary:'#db2777',primaryDark:'#be185d',accent:'#fb7185',title:'#4c1136',body:'#96687d',muted:'#c295a8',success:'#10b981',warning:'#f59e0b',danger:'#e5484d'}),
 T('sunset','落日橙粉',false,{bg:'#f97316',surface:'#ffffff',primary:'#ffffff',primaryDark:'#ffe1d1',accent:'#db2777',title:'#ffffff',body:'#ffe1d1',muted:'#ffc9b0',success:'#10b981',warning:'#fbbf24',danger:'#e5484d'}),
 T('grape','葡萄紫',false,{bg:'#faf7ff',surface:'#ffffff',primary:'#7c3aed',primaryDark:'#6d28d9',accent:'#c084fc',title:'#2e1065',body:'#6d5f92',muted:'#a99cc7',success:'#10b981',warning:'#f59e0b',danger:'#e5484d'}),
 T('lime','柠檬苏打',false,{bg:'#fdfceb',surface:'#ffffff',primary:'#65a30d',primaryDark:'#4d7c0f',accent:'#facc15',title:'#1f2a10',body:'#6b754a',muted:'#98a06f',success:'#16a34a',warning:'#f59e0b',danger:'#dc2626'}),
 T('forest','森林墨绿',true,{bg:'#10291b',surface:'#173a26',primary:'#22c55e',primaryDark:'#16a34a',accent:'#86efac',title:'#eafff2',body:'#93b8a2',muted:'#6b8f7a',success:'#22c55e',warning:'#fbbf24',danger:'#f87171'}),
 T('graphite-gold','石墨鎏金',true,{bg:'#191a1f',surface:'#26272e',primary:'#eab308',primaryDark:'#ca8a04',accent:'#fbbf24',title:'#f5f2ea',body:'#9b978c',muted:'#6e6a60',success:'#10b981',warning:'#fbbf24',danger:'#f87171'}),
 T('ocean','海洋蓝青',false,{bg:'#edfbfe',surface:'#ffffff',primary:'#0891b2',primaryDark:'#0e7490',accent:'#22d3ee',title:'#083344',body:'#4b7484',muted:'#7ba3b3',success:'#10b981',warning:'#f59e0b',danger:'#e5484d'}),
 T('mono','极简黑白',false,{bg:'#ffffff',surface:'#ffffff',primary:'#111111',primaryDark:'#000000',accent:'#555555',title:'#111111',body:'#44444a',muted:'#77777d',success:'#10b981',warning:'#f59e0b',danger:'#e5484d'}),
];
export const LAYOUTS = [{id:'left-right',name:'左文右标'},{id:'centered',name:'居中对称'},{id:'feature-grid',name:'标题+特性格'},{id:'diagonal',name:'斜切动势'}];
export const MIXES = [{id:'solid',name:'纯色底'},{id:'aurora',name:'极光渐变网'},{id:'band',name:'渐变色带'},{id:'multichip',name:'多彩功能位'}];
```

- [ ] **步骤 4：重跑** → PASS；**步骤 5：Commit** `feat: editor theme tokens (12 themes × 11 tokens)`

### 任务 3：text-measurer.mjs（TDD）

**文件：** 创建 `src/editor/text-measurer.mjs`；测试 `tests/editor/text-measurer.test.mjs`

- [ ] **步骤 1：失败测试**

```js
import { test } from 'node:test'; import assert from 'node:assert';
import { createTextMeasurer } from '../../src/editor/text-measurer.mjs';
const fake = (text, fs, weight) => text.length * fs * (weight === 700 ? 1.1 : 1);
test('width & fitWidth', () => {
  const m = createTextMeasurer(fake, { pad: 16 });
  assert.equal(m.width('abcd', 10), 40);
  assert.equal(m.width('abcd', 10, 700), 44);
  assert.equal(m.fitWidth('abcd', { fontSize: 10 }), 72); // 40 + 32
});
test('browser binding guarded', async () => {
  const { bindCanvasMeasure } = await import('../../src/editor/text-measurer.mjs');
  assert.throws(() => bindCanvasMeasure(), /canvas unavailable/);
});
```

- [ ] **步骤 2：跑** → FAIL；**步骤 3：实现**

```js
export function createTextMeasurer(measureFn, { pad = 16 } = {}) {
  return {
    width: (text, fontSize, weight = 400) => measureFn(text, fontSize, weight),
    fitWidth(text, { fontSize, weight = 400 }) { return this.width(text, fontSize, weight) + pad * 2; },
  };
}
export function bindCanvasMeasure() {
  if (typeof document === 'undefined') throw new Error('canvas unavailable in node');
  const ctx = document.createElement('canvas').getContext('2d');
  return (text, fontSize, weight = 400) => {
    ctx.font = `${weight} ${fontSize}px "PingFang SC", "Microsoft YaHei", sans-serif`;
    return ctx.measureText(text).width;
  };
}
```

- [ ] **步骤 4：重跑** → PASS；**步骤 5：Commit** `feat: text measurer with injected ruler`

### 任务 4：snap-engine.mjs —— 参考线吸附（TDD）

**文件：** 创建 `src/editor/snap-engine.mjs`；测试 `tests/editor/snap-engine.test.mjs`

- [ ] **步骤 1：失败测试**

```js
import { test } from 'node:test'; import assert from 'node:assert';
import { computeSnap } from '../../src/editor/snap-engine.mjs';
const canvas = { x:0, y:0, w:800, h:400 };
const scene = [ {id:'a', x:100, y:100, w:96, h:32} ];
test('edge snap within threshold', () => {
  const r = computeSnap({ moving:{id:'m',x:200,y:104,w:80,h:32}, scene, canvas, opts:{threshold:6} });
  // moving top y=104 vs a.top y=100 → dy=-4
  assert.equal(r.dy, -4); assert.ok(r.guides.some(g => g.axis==='h' && g.pos===100));
});
test('no snap beyond threshold', () => {
  const r = computeSnap({ moving:{id:'m',x:200,y:130,w:80,h:32}, scene, canvas, opts:{threshold:6} });
  assert.equal(r.dy, 0); assert.equal(r.dx, 0); assert.equal(r.guides.length, 0);
});
test('center snap to canvas center', () => {
  const r = computeSnap({ moving:{id:'m',x:364,y:50,w:72,h:32}, scene, canvas, opts:{threshold:6} });
  assert.equal(r.dx, 0); // center x=400 already
  const r2 = computeSnap({ moving:{id:'m',x:366,y:50,w:72,h:32}, scene, canvas, opts:{threshold:6} });
  assert.equal(r2.dx, -2); assert.ok(r2.guides.some(g => g.axis==='v' && g.pos===400));
});
test('ctrl bypass returns zero', () => {
  const r = computeSnap({ moving:{id:'m',x:103,y:103,w:80,h:32}, scene, canvas, opts:{threshold:6, guide:false} });
  assert.deepEqual([r.dx,r.dy],[0,0]);
});
```

- [ ] **步骤 2：跑** → FAIL；**步骤 3：实现**

```js
export function computeSnap({ moving, scene, canvas, opts }) {
  const o = { threshold: 6, guide: true, spacing: true, semantic: true, ...opts };
  const res = { dx: 0, dy: 0, guides: [], equalities: [], semantic: null };
  if (!o.guide || !moving) return res;
  const targets = [];
  for (const s of scene) { if (s.id === moving.id) continue;
    targets.push(s.x, s.x + s.w, s.x + s.w/2, s.y, s.y + s.h, s.y + s.h/2); }
  targets.push(canvas.x, canvas.x + canvas.w, canvas.x + canvas.w/2,
               canvas.y, canvas.y + canvas.h, canvas.y + canvas.h/2);
  let bestX = null, bestY = null;
  const consider = (t, mv, isX) => {
    const d = t - mv; if (Math.abs(d) > o.threshold) return;
    const rank = (mv === (isX ? moving.x + moving.w/2 : moving.y + moving.h/2)) ? 0 : 1;
    const cur = isX ? bestX : bestY;
    const better = !cur || rank < cur.rank || (rank === cur.rank && Math.abs(d) < Math.abs(cur.d));
    if (better) isX ? bestX = { d, t, rank } : bestY = { d, t, rank };
  };
  for (const t of targets) {
    consider(t, moving.x, true); consider(t, moving.x + moving.w/2, true); consider(t, moving.x + moving.w, true);
    consider(t, moving.y, false); consider(t, moving.y + moving.h/2, false); consider(t, moving.y + moving.h, false);
  }
  if (bestX) { res.dx = bestX.d; res.guides.push({ axis:'v', pos: bestX.t }); }
  if (bestY) { res.dy = bestY.d; res.guides.push({ axis:'h', pos: bestY.t }); }
  if (res.guides.length > 4) res.guides = res.guides.slice(0, 4);
  return res;
}
```

- [ ] **步骤 4：重跑** → PASS；**步骤 5：Commit** `feat: guide-line snapping engine`

### 任务 5：snap-engine —— 等距检测 + 同类识别（TDD）

**文件：** 修改 `src/editor/snap-engine.mjs`；测试追加到 `tests/editor/snap-engine.test.mjs`

- [ ] **步骤 1：失败测试（追加）**

```js
import { clusterSimilar, detectEquality } from '../../src/editor/snap-engine.mjs';
test('equal spacing detection', () => {
  // a |—24—| moving |—24—| b
  const r = detectEquality({ moving:{id:'m',x:150,y:0,w:60,h:32},
    neighbors:[{id:'a',x:66,y:0,w:60,h:32},{id:'b',x:234,y:0,w:60,h:32}] });
  assert.equal(r.axis,'h'); assert.equal(r.gap,24);
});
test('cluster by signature and size ±15%', () => {
  const items = [
    {id:'1',w:96,h:32,signature:'g>rect+text'}, {id:'2',w:98,h:33,signature:'g>rect+text'},
    {id:'3',w:140,h:40,signature:'g>rect+text'}, {id:'4',w:96,h:32,signature:'path'}];
  const groups = clusterSimilar(items);
  assert.deepEqual(groups.find(g=>g.includes('1')), ['1','2']);
});
test('semantic column target', () => {
  const scene = [{id:'a',x:30,y:20,w:96,h:32},{id:'b',x:30,y:70,w:96,h:32}];
  const r = computeSnap({ moving:{id:'m',x:120,y:120,w:97,h:32}, scene, canvas,
    opts:{threshold:6, semantic:true}, signatures:{a:'g>rect+text',b:'g>rect+text',m:'g>rect+text'} });
  assert.equal(r.dx, -90); // 吸到同列 x=30
  assert.match(r.semantic.reason, /同类/);
});
```

- [ ] **步骤 2：跑** → FAIL；**步骤 3：实现（追加）**

```js
export function detectEquality({ moving, neighbors }) {
  for (const axis of ['h','v']) {
    const pos = axis==='h' ? (b)=>[b.x, b.x+b.w] : (b)=>[b.y, b.y+b.h];
    for (const n of neighbors) {
      const gapL = Math.abs(pos(moving)[0] - pos(n)[1]);
      for (const m2 of neighbors) { if (m2.id===n.id) continue;
        const gapR = Math.abs(pos(m2)[0] - pos(moving)[1]);
        if (gapL>0 && Math.abs(gapL-gapR)<0.5 && gapL<200)
          return { axis, gap: gapL,
            range: axis==='h' ? [pos(n)[1], pos(m2)[0]] : [pos(n)[1], pos(m2)[0]] };
      }
    }
  }
  return null;
}
export function clusterSimilar(items, sizeTolerance = 0.15) {
  const groups = []; const used = new Set();
  for (const it of items) { if (used.has(it.id)) continue;
    const g=[it.id]; used.add(it.id);
    for (const other of items) { if (used.has(other.id)) continue;
      if (other.signature!==it.signature) continue;
      if (Math.abs(other.w-it.w)/it.w<=sizeTolerance && Math.abs(other.h-it.h)/it.h<=sizeTolerance)
        { g.push(other.id); used.add(other.id); } }
    if (g.length>1) groups.push(g); }
  return groups;
}
```
同时把 `computeSnap` 签名改为 `export function computeSnap({ moving, scene, canvas, opts, signatures })`，并在其函数体内 `let bestX = null, bestY = null;` 一行之后插入：

```js
const sigOf = (id) => (signatures ? signatures[id] : undefined);
if (o.semantic && signatures && sigOf(moving.id)) {
  const sibs = scene.filter(s => s.id !== moving.id && sigOf(s.id) === sigOf(moving.id)
    && Math.abs(s.w - moving.w)/moving.w <= 0.15);
  if (sibs.length) {
    const near = sibs.reduce((p, c) => Math.abs(c.x - moving.x) < Math.abs(p.x - moving.x) ? c : p);
    if (Math.abs(near.x - moving.x) <= 48) {
      bestX = { d: near.x - moving.x, t: near.x, rank: -1 };
      res.semantic = { reason: '同类对齐 · 宽 ' + Math.round(moving.w) + ' = 同类' };
    }
  }
}
```

说明：`rank: -1` 保证后续普通吸附（rank 0/1）不会覆盖同类识别的结果。
- [ ] **步骤 4：重跑全部** `node --test tests/editor/` → PASS；**步骤 5：Commit** `feat: spacing equality + similar-cluster semantic snapping`

### 任务 6：export-sanitizer.mjs（TDD）

**文件：** 创建 `src/editor/export-sanitizer.mjs`；测试 `tests/editor/export-sanitizer.test.mjs`

- [ ] **步骤 1：失败测试**

```js
import { test } from 'node:test'; import assert from 'node:assert';
import { sanitizeSvg } from '../../src/editor/export-sanitizer.mjs';
test('strips overlay, ensures xmlns, rounds numbers', () => {
  const src = '<svg viewBox="0 0 10 10"><rect width="10.04" height="9.96"/><g id="svgo-overlay"><line/><rect/></g></svg>';
  const out = sanitizeSvg(src);
  assert.ok(out.startsWith('<svg xmlns="http://www.w3.org/2000/svg"'));
  assert.ok(!out.includes('svgo-overlay'));
  assert.ok(out.includes('width="10"') || out.includes('width="10.0"'));
});
test('idempotent on clean file', () => {
  const clean = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><rect width="10" height="10"/></svg>';
  assert.equal(sanitizeSvg(clean), sanitizeSvg(sanitizeSvg(clean)));
});
```

- [ ] **步骤 2：跑** → FAIL；**步骤 3：实现**

```js
export function sanitizeSvg(svgString) {
  let s = svgString.replace(/<g id="svgo-overlay">[\s\S]*?<\/g>/, '');
  s = s.replace(/<svg\b(?![^>]*\sxmlns=)/, '<svg xmlns="http://www.w3.org/2000/svg"');
  s = s.replace(/(\s[a-zA-Z-]+)="(-?\d+\.\d{2,})"/g,
    (_, a, num) => ` ${a}="${(Math.round(parseFloat(num)*10)/10).toString()}"`);
  return s;
}
```

- [ ] **步骤 4：重跑** → PASS；**步骤 5：Commit** `feat: export sanitizer (overlay strip, xmlns, rounding)`

### 任务 7：构建集成 + 零依赖断言

**文件：** 修改 `tests/repository.test.mjs`（追加用例）

- [ ] **步骤 1：追加失败测试**

```js
test('editor.html built artifact: exists, offline-only', () => {
  const p = new URL('../scripts/editor.html', import.meta.url);
  const html = readFileSync(p, 'utf8');
  assert.ok(html.includes('computeSnap'), 'core inlined');
  assert.ok(!/src=["']https?:/.test(html) && !/href=["']https?:\/\//.test(html), 'no external resources');
});
```

- [ ] **步骤 2：** `node --test tests/repository.test.mjs` → 先 FAIL（未重建）；**步骤 3：** `node scripts/build-editor.mjs` 后重跑 → PASS
- [ ] **步骤 4：Commit** `test: editor artifact integrity assertions`

### 任务 8：UI 壳 —— 三栏布局与工具栏

**文件：** 重写 `src/editor/ui.template.html`

- [ ] **步骤 1：完整布局 CSS + DOM**（顶栏：打开/撤销/重做/主题下拉/保存；左栏：组件库网格+图层列表容器；中栏：`#svgo-canvas-wrap > svg#svgo-stage`（内容层 `<g id="svgo-content">` + 覆盖层 `<g id="svgo-overlay">`）；右栏：属性表单 + 三个下拉（THEMES/LAYOUTS/MIXES 由核心数据填充）；底状态栏 `#svgo-status`）。CSS 变量做亮色主题，字体栈与测量器一致。所有 id 加 `svgo-` 前缀防冲突。
- [ ] **步骤 2：空态欢迎页**（未加载文件时画布中央提示「把 .svg 拖进来」）
- [ ] **步骤 3：** `node scripts/build-editor.mjs && node --test tests/repository.test.mjs` → PASS
- [ ] **步骤 4：手动验收**：双击 `scripts/editor.html` 打开无报错、三栏渲染正常、断网可用
- [ ] **步骤 5：Commit** `feat: editor shell layout`

### 任务 9：Loader + Renderer

**文件：** `ui.template.html` 内 `EditorBoot` 对象扩展

- [ ] **步骤 1：** 实现 `EditorState`：`{doc, fileName, selection:Set, history:[], future:[], theme, layout, mix, fileHandle}`；`loadSvgText(text, name)` 用 `DOMParser` 解析，取第一个 `<svg>` 根，深克隆进 `#svgo-content`；解析失败弹错误条。
- [ ] **步骤 2：** 拖拽导入（dragover/drop）+ 顶栏「打开」按钮（`showOpenFilePicker` 支持 FS Access 时保存 `fileHandle`）。
- [ ] **步骤 3：手动验收**：拖入 `assets/examples/banner-example.svg` 正确显示；拖入 .txt 显示错误且不崩。
- [ ] **步骤 4：构建 + Commit** `feat: loader/renderer with drag-drop open`

### 任务 10：Overlay 渲染函数

- [ ] **步骤 1：** `drawOverlay(state)`：清空 `#svgo-overlay` → 对每个选中元素画虚线选择框+四角四边 8 个手柄（6px 白底蓝框方块）；`guides` 画红线；`equalities` 画红色间距徽章（gap 数字居中）；`semantic.reason` 画气泡；越界元素画红色边缘高亮。坐标换算：`getBBox()` + 根缩放 `viewScale`（画布 zoom）。
- [ ] **步骤 2：手动验收**：临时在 console 执行 `EditorDebug.selectFirst()` 能看到选择框（暴露调试钩子）。
- [ ] **步骤 3：构建+Commit** `feat: overlay rendering (selection, guides, badges)`

### 任务 11：选择交互

- [ ] **步骤 1：** 点击命中（`document.elementFromPoint` 或事件 target 反查最近可交互图元；`g` 整体选中）；Shift 加选/减选；空白处按下拖动 = 框选（橡皮筋矩形画在 overlay）；Esc 清除选择；Ctrl+A 全选可见元素。
- [ ] **步骤 2：手动验收**：点徽章选中 g；Shift 点第二个双选；框选批量；图层锁定项不可选中。
- [ ] **步骤 3：构建+Commit** `feat: click/marquee selection`

### 任务 12：拖拽移动 + 接入 SnapEngine + 微调 + Alt 复制

- [ ] **步骤 1：** pointerdown 记录起点与各选中元素初始 transform/xy；pointermove 计算 delta → 组装 `computeSnap({moving: 合并盒, scene: 场景盒数组(含 signature map), canvas: viewBox 盒})` → 应用 dx/dy 到所有选中元素；Ctrl 按住跳过；Alt 按下 pointerup 时克隆原元素组。渲染 overlay 参考线/等距徽章/同类气泡，状态栏更新文案。
- [ ] **步骤 2：** 方向键 1px / Shift 10px 微调选中元素。
- [ ] **步骤 3：手动验收（对照界面设计稿）**：拖 MIT 徽章靠近 v1.0.0 徽章出现顶/底两条红线并吸住；左右间距相等时两枚「24」徽章亮；第三个同类徽章自动贴列宽；按住 Ctrl 可自由放置；方向键微调生效。
- [ ] **步骤 4：构建+Commit** `feat: drag-move wired to full snap engine`

### 任务 13：命令栈（撤销/重做）

- [ ] **步骤 1：** 实现 `pushCommand(cmd)`，cmd=`{undo(),redo(),label}`；移动/微调结束时生成快照命令（before/after transform 数组）；Ctrl+Z / Ctrl+Shift+Z（及 Ctrl+Y）；历史深度 100。
- [ ] **步骤 2：** 把任务 12 的移动收尾接入 pushCommand；Alt 复制用 `makeAddCmd`。
- [ ] **步骤 3：手动验收**：拖动→Ctrl+Z 回原位→重做恢复；连续操作多层撤销不串位。
- [ ] **步骤 4：构建+Commit** `feat: undo/redo command stack`

### 任务 14：8 向缩放手柄

- [ ] **步骤 1：** 手柄 pointerdown 进入 resize 模式；对角手柄改 w/h（负值翻转跳过），边手柄单轴；Shift 等比；结束后 `makeResizeCmd` 入栈；属性面板 X/Y/W/H 双向同步（输入回车精确改）。
- [ ] **步骤 2：手动验收**：角柄拖大 logo 瓦片；Shift 保持正方；面板输入 W=120 精确生效并可撤销。
- [ ] **步骤 3：构建+Commit** `feat: 8-handle resize with aspect lock`

### 任务 15：双击改字 + 自动撑框

- [ ] **步骤 1：** 双击 text → 覆盖透明 input 定位到元素屏幕位置 → 回车/失焦提交 `makeEditTextCmd`：更新 textContent 后用 `createTextMeasurer(bindCanvasMeasure())` 量宽；若父级是 g 且首个子元素为 rect，则 `rect.setAttribute('width', fitWidth(...))` 并保持 rect.x 不变（左对齐场景）或同步平移保持中心（text-anchor=middle 场景）。
- [ ] **步骤 2：手动验收**：双击「MIT License」改成「Apache 2.0 License」→ 胶囊自动加宽、文字仍居中；Ctrl+Z 一并还原文字和宽度。
- [ ] **步骤 3：构建+Commit** `feat: inline text edit with auto-fit container`

### 任务 16：图层面板 + 右键菜单

- [ ] **步骤 1：** 图层列表 = content 根下顶层节点倒序；每项：眼睛（display 切换）、锁头（`data-svgo-locked`，选择时跳过）、双击重命名（写 `data-name`）、↑↓ 按钮调 DOM 顺序（`makeReorderCmd`）。
- [ ] **步骤 2：** 右键菜单：复制(Ctrl+C)/粘贴(Ctrl+V)/删除(Del)/置于顶层/底层/存为我的组件（任务 18 实现实体）。
- [ ] **步骤 3：手动验收**：隐藏背景装饰圆→不渲染且不可选；删除后 Ctrl+Z 恢复。
- [ ] **步骤 4：构建+Commit** `feat: layers panel + context menu`

### 任务 17：多选对齐分布工具栏

- [ ] **步骤 1：** 选中 ≥2 时浮出工具栏：左/中/右、顶/中/底、水平分布、垂直分布（分布需 ≥3）。全部基于 `bboxOf` 计算目标坐标后一次 `makeMoveCmd`（多元素快照），可整体撤销。
- [ ] **步骤 2：手动验收**：框选三个错落徽章 → 「水平等距分布」一键整齐。
- [ ] **步骤 3：构建+Commit** `feat: align & distribute toolbar`

### 任务 18：ThemeEngine 三档应用 + 组件库 + 自定义组件

- [ ] **步骤 1：ThemeEngine**：token→元素映射规则：fill/stroke 十六进制色 → 就近映射到 token 色（色距最小者）；应用范围：全局=替换所有映射命中；仅选中=只处理选集；hover 预览=临时套用、移出还原、点击确认（确认才入历史栈 `makeStyleCmd`）。右栏三个下拉切换主题/布局/混色（布局与混色本期作用于 banner 类根装饰：布局模板提供装饰层重排预设，混色提供 bg 渐变/色带生成）。
- [ ] **步骤 2：内置组件库**：`COMPONENTS` 工厂（badge/button/statusCard/logoTile/divider/browserFrame），以当前主题 token 生成 `<g>` 插入画布中央偏上，插入为 `makeAddCmd`。
- [ ] **步骤 3：自定义组件**：「存为我的组件」→ 序列化选集 g（记录来源 token 色）存 `svgEditorComponents`；库面板「我的」分区列出；插入时按当前主题重新映射颜色。
- [ ] **步骤 4：手动验收**：切「生物青绿」全局换肤，手动改过色的元素不被覆盖且有提示；从库拖新徽章继承新主题；自定义徽章在换主题后插入自动变色。
- [ ] **步骤 5：构建+Commit** `feat: theme engine, component library, custom components`

### 任务 19：Persistence —— 写回/草稿/PNG/复制

- [ ] **步骤 1：保存**：有 `fileHandle` → `createWritable()` 写 `sanitizeSvg(serialize())`；无 handle 或用户拒绝授权 → Blob 下载 + 顶部提示条。Ctrl+S 触发。
- [ ] **步骤 2：草稿**：每次命令后 `localStorage.setItem('svgEditorDraft:'+fileName, serialize())`；欢迎页检测同名草稿提供「恢复草稿」按钮；另存为时清除关联。
- [ ] **步骤 3：PNG 导出**：serialize → Blob URL → Image → canvas 2x/4x → `toBlob` 下载；复制源码 → `navigator.clipboard.writeText`。
- [ ] **步骤 4：手动验收**：打开 example → 移动一个徽章 → Ctrl+S → 浏览器直接刷新原文件看到变化（真写回）；杀标签页重开出现恢复入口；PNG 2x 清晰。
- [ ] **步骤 5：构建+Commit** `feat: save-back via FS Access, drafts, png/copy export`

### 任务 20：吸附控制台 + 字号阶梯提醒 + 收尾细节

- [ ] **步骤 1：** 右栏「吸附」折叠区：三类开关 + 阈值滑杆(2–16) + 说明；字号阶梯提醒：提交文字时 fontSize ∉ {12,13.5,14,15,16,18,20,24,26,72} 弹轻提示「改为最近的 16？」点按即改。
- [ ] **步骤 2：** 快捷键总表核对：V/T/H、Ctrl+Z/Y/S/C/V/A、Del、方向键、Shift 组合、F 聚焦选中、Ctrl+0 适配、滚轮缩放、空格平移。
- [ ] **步骤 3：构建+Commit** `feat: snap console, font-ladder hint, keymap completion`

### 任务 21：文档更新 + 全量回归

**文件：** 修改 `README.md`、`SKILL.md`、`references/design-patterns.md`

- [ ] **步骤 1：README**：目录结构加 `scripts/editor.html` 与 `src/editor/`；新增「可视化编辑器」章节（打开方式、快捷键表、手动验收清单、构建命令 `node scripts/build-editor.mjs`）。
- [ ] **步骤 2：SKILL.md**：工作流第 4 步「浏览器验证」后加入「5. 编辑器微调：需要人工精修时用 editor.html 拖拽调整/换主题，保存即写回」，deliverables checklist 加一条「如用户要求可视化微调 → 指向 scripts/editor.html」。
- [ ] **步骤 3：design-patterns.md**：贴入 12 主题 token 表引用（指向 theme-tokens.mjs 为唯一事实源）。
- [ ] **步骤 4：** `node --test tests/ && node scripts/build-editor.mjs` → 全绿；**Commit** `docs: integrate visual editor into skill workflow`

### 任务 22：端到端手动验收（规格 §8）

- [ ] 用 editor.html 打开 `assets/examples/banner-example.svg`：①拖拽全套吸附演示通过 ②切 3 套主题+混色 ③双击改字自动撑框 ④写回后浏览器渲染正确 ⑤Ctrl+Z/草稿恢复可用。逐项对照规格 §8 总验收清单打勾。

---

## 自检记录

- 规格覆盖度：§1 架构→任务 0–9；§2 吸附→任务 4/5/12/20；§3 编辑能力→任务 11–17；§4 主题→任务 2/18；§5 导入导出→任务 9/19；§6 错误处理→任务 9/19 及各手动验收；§7 测试→任务 1–7/21；§8 总验收→任务 22。无遗漏。
- 占位符扫描：无 TODO/待定；UI 任务给出具体行为与验收点（DOM 全量代码在执行时依模板既有模式展开）。
- 类型一致性：共享命名已在头部锁定，各任务签名一致（`computeSnap` 的 `signatures` 参数仅任务 5 定义并在任务 12 使用）。
