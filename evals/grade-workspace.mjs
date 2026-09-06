import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, isAbsolute, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkLogoQuality } from './lib/logo-quality.mjs';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function optionValue(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : '';
}

const logoFile = optionValue('--check-logo');
if (logoFile) {
  const absoluteFile = isAbsolute(logoFile) ? logoFile : resolve(process.cwd(), logoFile);
  const results = checkLogoQuality(readFileSync(absoluteFile, 'utf8'));
  for (const result of results) {
    console.log(`${result.passed ? 'PASS' : 'FAIL'} ${result.text}: ${result.evidence}`);
  }
  const passed = results.every(result => result.passed);
  console.log(`logo-quality: ${passed ? 'PASS' : 'FAIL'}`);
  process.exit(passed ? 0 : 1);
}

const WS = resolve(optionValue('--workspace') || process.env.SVG_EVAL_WORKSPACE || join(REPO_ROOT, '.eval-workspace'));
const ITER = optionValue('--iteration') || 'iteration-1';

const EVALS = [
  { id: 1, name: 'eval-1-readme-banner-generation' },
  { id: 2, name: 'eval-2-fix-overflowing-banner' },
  { id: 3, name: 'eval-3-popup-ui-mockup' },
];

function parseAttrs(attrStr) {
  const attrs = {};
  const re = /([\w-]+)="([^"]*)"/g;
  let m;
  while ((m = re.exec(attrStr))) attrs[m[1]] = m[2];
  return attrs;
}

function parseSvg(content) {
  const doc = { root: {}, texts: [], rects: [], circles: [], hasFilter: false, defsRefs: new Set(), fonts: [], groupFontSizes: [] };
  const svgM = content.match(/<svg\b([^>]*)>/);
  if (svgM) doc.root = parseAttrs(svgM[1]);
  doc.hasFilter = /feDropShadow/.test(content);
  const tagRe = /<(\/?)(g|rect|circle|text)\b([^>]*)>/g;
  let tx = 0, ty = 0;
  const stack = [];
  for (const m of content.matchAll(tagRe)) {
    const close = m[1] === '/', tag = m[2], attrs = parseAttrs(m[3]);
    if (tag === 'g') {
      if (close) {
        const p = stack.pop();
        if (p) { tx = p.tx; ty = p.ty; }
      } else {
        stack.push({ tx, ty });
        const t = (attrs.transform || '').match(/translate\(\s*([-\d.]+)[,\s]+([-\d.]+)/);
        if (t) { tx += +t[1]; ty += +t[2]; }
        if (attrs['font-size']) doc.groupFontSizes.push(+attrs['font-size']);
      }
      continue;
    }
    if (tag === 'rect' && attrs.width !== undefined) {
      doc.rects.push({
        x: (+attrs.x || 0) + tx, y: (+attrs.y || 0) + ty,
        width: +attrs.width, height: +attrs.height,
        rx: attrs.rx ? +attrs.rx : 0, fill: (attrs.fill || '').toLowerCase(),
      });
    } else if (tag === 'circle' && attrs.cx !== undefined) {
      doc.circles.push({ cx: +attrs.cx + tx, cy: +attrs.cy + ty, r: +attrs.r, opacity: attrs.opacity !== undefined ? +attrs.opacity : 1, fill: (attrs.fill || '').toLowerCase() });
    } else if (tag === 'text' && !close) {
      const inner = content.slice(m.index + m[0].length).match(/^(.*?)<\/text>/s);
      doc.texts.push({ ...attrs, x: +attrs.x + tx, y: +attrs.y + ty, content: inner ? inner[1].trim() : '' });
    }
  }
  for (const m of content.matchAll(/url\(#([^)]+)\)/g)) doc.defsRefs.add(m[1]);
  for (const m of content.matchAll(/font-family="([^"]*)"/g)) doc.fonts.push(m[1]);
  return doc;
}

function estWidth(text, fontSize, bold) {
  let w = 0;
  for (const ch of text) {
    const cp = ch.codePointAt(0);
    if (cp >= 0x4e00 && cp <= 0x9fff) w += 1.0;
    else if (cp >= 0x3000 && cp <= 0x303f || cp >= 0xff00 && cp <= 0xffef) w += 1.0;
    else if (/[A-Z]/.test(ch)) w += 0.66;
    else if (/[a-z]/.test(ch)) w += 0.52;
    else if (/[0-9]/.test(ch)) w += 0.56;
    else if (ch === ' ') w += 0.3;
    else w += 0.6;
  }
  return w * fontSize * (bold ? 1.03 : 1);
}

function vw(doc) {
  if (doc.root['viewBox']) return +doc.root['viewBox'].split(/\s+/)[2];
  return +doc.root['width'] || 1100;
}
function vh(doc) {
  if (doc.root['viewBox']) return +doc.root['viewBox'].split(/\s+/)[3];
  return +doc.root['height'] || 300;
}

function assert(results, text, passed, evidence) {
  results.push({ text, passed: !!passed, evidence: String(evidence) });
}

function checkTextFit(doc, results) {
  const W = vw(doc);
  let overflow = 0, clipped = 0, fit = 0;
  for (const t of doc.texts) {
    const fs = +t['font-size'] || 14;
    const bold = t['font-weight'] === '700' || t['font-weight'] === 'bold';
    const est = estWidth(t.content, fs, bold);
    const x = +t.x || 0;
    const y = +t.y || 0;
    const anchor = t['text-anchor'];
    const centerX = anchor === 'middle' ? x : x + est / 2;
    const leftX = anchor === 'middle' ? x - est / 2 : x;
    const box = doc.rects.find(r =>
      y >= r.y - 2 && y <= r.y + r.height + 2 &&
      centerX >= r.x - 2 && centerX <= r.x + r.width + 2
    );
    if (!box) continue;
    fit++;
    if (est > box.width - 14) overflow++;
    if (leftX < box.x - 1 || leftX + est > box.x + box.width + 1) clipped++;
    const rightX = anchor === 'middle' ? x + est / 2 : x + est;
    if (rightX > W + 1) clipped++;
  }
  assert(results, 'no-text-overflow', overflow === 0, `关联卡片文字 ${fit} 个，估算溢出 ${overflow} 个`);
  assert(results, 'no-text-clipped', clipped === 0, `文字越界/出画布 ${clipped} 处`);
}

function checkBounds(doc, results) {
  const W = vw(doc), H = vh(doc);
  let bad = 0;
  for (const r of doc.rects) if (r.x + r.width > W + 1 || r.y + r.height > H + 1 || r.x < -1 || r.y < -1) bad++;
  for (const c of doc.circles) {
    if (c.opacity <= 0.15) continue;
    if (c.fill.startsWith('url(#') && c.r > 100) continue;
    if (c.cx + c.r > W + 1 || c.cy + c.r > H + 1 || c.cx - c.r < -1) bad++;
  }
  assert(results, 'no-element-out-of-bounds', bad === 0, `越界元素 ${bad} 个（画布 ${W}×${H}）`);
}

function checkBadges(doc, results) {
  const badgeRects = doc.rects.filter(r => r.height >= 30 && r.height <= 60 && Math.abs(r.rx - r.height / 2) < 1);
  const rows = new Map();
  for (const r of badgeRects) {
    const key = Math.round(r.y / 20);
    if (!rows.has(key)) rows.set(key, []);
    rows.get(key).push(r);
  }
  let overlap = 0;
  for (const [, list] of rows) {
    if (list.length < 2) continue;
    const sorted = [...list].sort((a, b) => a.x - b.x);
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i].x < sorted[i - 1].x + sorted[i - 1].width - 1) overlap++;
    }
  }
  assert(results, 'badges-no-overlap', overlap === 0, `胶囊行元素重叠 ${overlap} 对`);
}

function checkDefsAndFonts(doc, results) {
  const hasGradient = /linearGradient|radialGradient/.test(argContent);
  assert(results, 'defs-gradient-reused', hasGradient && doc.defsRefs.size > 0, `渐变定义 ${hasGradient ? '有' : '无'}，url(#) 引用 ${doc.defsRefs.size} 处`);
  assert(results, 'font-stack-on-root', doc.fonts.some(f => f.includes('sans-serif') && (f.includes('PingFang') || f.includes('YaHei'))), doc.fonts[0] ? `字体栈：${doc.fonts[0]}` : '未设置 font-family');
}

let argFile = '';
let argContent = '';

for (const evalInfo of EVALS) {
  const evalDir = join(WS, ITER, evalInfo.name);
  for (const variant of ['with_skill', 'without_skill']) {
    const svgFile = join(evalDir, variant, 'outputs', 'result.svg');
    if (!existsSync(svgFile)) {
      mkdirSync(join(evalDir, variant), { recursive: true });
      writeFileSync(join(evalDir, variant, 'grading.json'), JSON.stringify([{ text: 'result.svg-missing', passed: false, evidence: '未找到产物' }], null, 2));
      console.log(`graded ${evalInfo.name} / ${variant}: 0/1 (产物缺失)`);
      continue;
    }
    argFile = svgFile;
    argContent = readFileSync(svgFile, 'utf8');
    const doc = parseSvg(argContent);
    const results = [];
    const W = vw(doc), H = vh(doc);

    assert(results, 'valid-svg-size', W >= 800 && H >= 200 && /<\/svg>/.test(argContent), `${W}×${H}`);
    assert(results, 'has-viewbox', doc.root['viewBox'] !== undefined && +doc.root['width'] === W, doc.root['viewBox'] ? `viewBox="${doc.root['viewBox']}"` : '无 viewBox');
    const missingFs = doc.texts.filter(t => !t['font-size']).length;
    const inheritable = missingFs > 0 && doc.groupFontSizes.length > 0;
    assert(results, 'all-text-has-font-size', missingFs === 0 || inheritable, `缺字号文字 ${missingFs} 个（组继承 ${doc.groupFontSizes.length} 处）`);
    checkTextFit(doc, results);
    checkBounds(doc, results);
    checkBadges(doc, results);
    checkDefsAndFonts(doc, results);
    const sizeKb = +(Buffer.byteLength(argContent, 'utf8') / 1024).toFixed(1);
    assert(results, 'file-size-under-10kb', sizeKb <= 10, `${sizeKb} KB`);

    if (evalInfo.id === 1 || evalInfo.id === 2) {
      const goodV = /v\s\d+\.\d+\.\d+/.test(argContent);
      const bareV = /v\d+\.\d+\.\d+/.test(argContent.replace(/v\s\d/g, ''));
      assert(results, 'version-string-has-space', goodV && !bareV, goodV ? '版本号 v 与数字之间有空格' : '版本号缺空格（应为 v X.Y.Z）');
      const bg = doc.rects.find(r => Math.abs(r.width - W) < 2 && Math.abs(r.height - H) < 2);
      assert(results, 'banner-rounded-corners', !!bg && bg.rx >= 20, bg ? `背景圆角 rx=${bg.rx}` : '未找到背景 rect');
      const fsSorted = doc.texts.filter(t => t['font-size']).sort((a, b) => +b['font-size'] - +a['font-size']);
      if (fsSorted.length >= 2) {
        const big = fsSorted[0], small = fsSorted[1];
        const gap = Math.abs((+small.y || 0) - (+big.y || 0));
        assert(results, 'title-subtitle-gap', gap >= 60, `标题-副标题基线差 ${gap.toFixed(0)} px（应 ≥60）`);
      } else {
        assert(results, 'title-subtitle-gap', false, '不足两个字号层级');
      }
      const logoRects = doc.rects.filter(r => r.width >= 40 && r.width <= 200 && r.height >= 40 && r.height <= 200 && Math.abs(r.width - r.height) <= 8 && r.fill.startsWith('url(#'));
      if (logoRects.length > 0) {
        const lr = logoRects[0];
        const near = doc.texts.some(t => Math.abs((+t.x || 0) - (lr.x + lr.width / 2)) < 80 && Math.abs((+t.y || 0) - (lr.y + lr.height / 2)) < 60);
        assert(results, 'logo-clearance', !near, near ? 'logo 与附近文字距离过近' : 'logo 与文字间距正常');
      } else {
        assert(results, 'logo-clearance', true, '未检测到渐变 logo（跳过）');
      }
    }

    if (evalInfo.id === 2) {
      const needed = ['开卷助手', 'Chrome / Edge', 'Markdown + JSON', 'v 1.0.0'];
      const missing = needed.filter(s => !argContent.includes(s));
      assert(results, 'content-preserved', missing.length === 0, missing.length ? `缺失：${missing.join('、')}` : '4 处关键内容全部保留');
      const sub = doc.texts.find(t => t['fill'] === '#cfe0ff');
      if (sub) {
        const est = estWidth(sub.content, +sub['font-size'] || 26, false);
        assert(results, 'subtitle-in-bounds', (+sub.x || 0) + est <= W, `副标题估算右缘 ${((+sub.x || 0) + est).toFixed(0)} ≤ ${W}`);
      } else {
        assert(results, 'subtitle-in-bounds', false, '未找到副标题（fill=#cfe0ff）');
      }
    }

    if (evalInfo.id === 1) {
      const badgeRects = doc.rects.filter(r => r.height >= 30 && r.height <= 60);
      let pills = 0;
      for (const r of badgeRects) if (Math.abs(r.rx - r.height / 2) < 1) pills++;
      assert(results, 'capsule-pills', pills >= 3, `圆角胶囊（rx=高/2）${pills} 个`);
      const hasGradTile = /linearGradient/.test(argContent) && /<rect[^>]*fill="url\(#/.test(argContent);
      const hasHalo = /radialGradient/.test(argContent);
      const whitePaths = argContent.match(/<(?:path|polygon)\b[^>]*(?:fill|stroke)=["']#?(?:ffffff|fff)[^>]*>/gi) || [];
      const whiteRects = [...argContent.matchAll(/<rect\b[^>]*fill=["']#(?:ffffff|fff)["'][^>]*>/gi)].map(m => m[0]);
      const tinyWhiteRects = whiteRects.filter(r => {
        const w = +(/width="([\d.]+)"/.exec(r) || [])[1] || 0;
        const h = +(/height="([\d.]+)"/.exec(r) || [])[1] || 0;
        return w > 0 && w < 50 && h > 5 && h < 80;
      });
      const twoRectStack = tinyWhiteRects.length >= 2;
      const hasHandGlyph = whitePaths.length > 0;
      assert(results, 'logo-gradient-tile', hasGradTile, hasGradTile ? '渐变圆角方块 logo 底' : '缺渐变 logo 底');
      assert(results, 'logo-glow-halo', hasHalo, hasHalo ? '径向渐变光环' : '缺发光光环');
      assert(results, 'logo-hand-drawn-glyph', hasHandGlyph, hasHandGlyph ? `手绘字形 path ${whitePaths.length} 个` : '字形不是手绘 path（应画闪电/折角便签）');
      assert(results, 'logo-not-two-rect-stack', !twoRectStack, twoRectStack ? `字形是 ${tinyWhiteRects.length} 个白色小矩形堆叠（禁止）` : '未用两个白矩形拼字形');
      for (const check of checkLogoQuality(argContent)) assert(results, check.text, check.passed, check.evidence);
    }

    if (evalInfo.id === 3) {
      const lights = ['#ff5f57', '#febc2e', '#28c840'].filter(c => argContent.toLowerCase().includes(c)).length;
      const greenLight = /#27c93f|#28c840|#28c840/i.test(argContent.toLowerCase());
      assert(results, 'browser-chrome-present', (lights >= 2 && greenLight) || lights === 3, `红黄绿圆点 ${lights}/3`);
      const badgeTexts = doc.texts.filter(t => /页面就绪|解析就绪|导出就绪/.test(t.content));
      assert(results, 'status-cards-labeled', badgeTexts.length >= 3, `就绪文字卡片 ${badgeTexts.length} 个（应为「页面就绪/解析就绪/导出就绪」）`);
      const statusRects = doc.rects.filter(r => ['#e9f7ee', '#ecfdf3', '#e8f7ee', '#e8f8ee'].includes(r.fill) && r.height >= 30 && r.height <= 72);
      const sameColor = statusRects.length >= 3;
      assert(results, 'status-cards-same-color', sameColor, sameColor ? `状态卡片同色系（${statusRects.length} 张浅绿底）` : `状态卡片颜色不统一（浅绿底 ${statusRects.length} 张）`);
      const btnTexts = doc.texts.filter(t => /整理章节资料|导出复习提纲/.test(t.content));
      assert(results, 'action-buttons', btnTexts.length === 2, `按钮文字 ${btnTexts.length} 个`);
      const btnRects = doc.rects.filter(r => r.height >= 32 && r.height <= 64 && r.width >= 120);
      let sameRow = false;
      for (let i = 0; i < btnRects.length && !sameRow; i++) {
        for (let j = i + 1; j < btnRects.length; j++) {
          const a = btnRects[i], b = btnRects[j];
          if (Math.abs(a.y - b.y) < 4 && Math.abs(a.height - b.height) < 4 && Math.max(a.x, b.x) >= Math.min(a.x + a.width, b.x + b.width)) { sameRow = true; break; }
        }
      }
      assert(results, 'two-buttons-row', sameRow, sameRow ? '两按钮横向并列' : `未找到并排按钮对（高32-64 宽≥120 的矩形 ${btnRects.length} 个）`);
      const popup = doc.rects.filter(r => r.width >= 420 && r.height >= 400 && r.fill === '#ffffff').sort((a, b) => b.width * b.height - a.width * a.height)[0];
      if (popup) {
        const wRatio = popup.width / W, hRatio = popup.height / H;
        assert(results, 'popup-fills-canvas', wRatio >= 0.6 && hRatio >= 0.7, `弹窗占画布 ${Math.round(wRatio * 100)}%×${Math.round(hRatio * 100)}%`);
      } else {
        assert(results, 'popup-fills-canvas', false, '未找到大尺寸白色弹窗');
      }
      const chrome = doc.rects.filter(r => r.width >= 400 && r.height >= 30 && r.height <= 80).sort((a, b) => a.y - b.y)[0];
      if (chrome) {
        assert(results, 'chrome-slim', chrome.height <= 52, `工具栏高 ${chrome.height}px（应 ≤52）`);
      } else {
        assert(results, 'chrome-slim', false, '未找到浏览器工具栏');
      }
      const decoCircles = doc.circles.filter(c => c.opacity > 0.15 && !c.fill.startsWith('url(#') && !['#ff5f57', '#febc2e', '#28c840', '#27c93f', '#16a34a', '#2fbf71', '#1a9e4b', '#22c55e', '#21a35e', '#20a267'].includes(c.fill));
      assert(results, 'no-decorative-circles', decoCircles.length === 0, `画布装饰圆 ${decoCircles.length} 个（应保持纯色背景）`);
      const minFs = Math.min(...doc.texts.filter(t => !['#8a94a6', '#5b6b82', '#98a0b0'].includes(t['fill'])).map(t => +t['font-size'] || 99));
      assert(results, 'min-font-size-14', minFs >= 14, `最小字号 ${minFs}（应 ≥14，地址栏除外）`);
      assert(results, 'progress-bar', /24\s*\/\s*24/.test(argContent) && doc.rects.some(r => r.height >= 6 && r.height <= 20), '进度文字 24/24 + 细条矩形');
      assert(results, 'drop-shadow-filter', doc.hasFilter, 'feDropShadow 投影');
      const hasGradTile = /linearGradient/.test(argContent) && /<rect[^>]*fill="url\(#/.test(argContent);
      assert(results, 'logo-gradient-tile', hasGradTile, hasGradTile ? '渐变 logo 底' : '缺渐变 logo 底');
      const whitePathsE3 = argContent.match(/<(?:path|polygon)\b[^>]*(?:fill|stroke)=["']#?(?:ffffff|fff)[^>]*>/gi) || [];
      assert(results, 'logo-hand-drawn-glyph', whitePathsE3.length > 0, whitePathsE3.length ? `手绘字形 ${whitePathsE3.length} 个` : '字形不是手绘 path（禁止两个白矩形拼书本）');
      for (const check of checkLogoQuality(argContent)) assert(results, check.text, check.passed, check.evidence);
      const logoRects = doc.rects.filter(r => r.width >= 60 && r.width <= 160 && r.height >= 60 && r.height <= 160 && r.fill.startsWith('url(#'));
      if (logoRects.length > 0) {
        const lr = logoRects[0];
        const below = doc.texts
          .filter(t => (t.x || 0) >= lr.x && (t.x || 0) <= lr.x + lr.width && (+t.y || 0) > lr.y + lr.height)
          .sort((a, b) => (+a.y || 0) - (+b.y || 0))[0];
        if (below) {
          const gap = (+below.y || 0) - (lr.y + lr.height);
          assert(results, 'logo-title-gap', gap >= 32, `logo 底 → 标题基线 ${gap.toFixed(0)}px（应 ≥32，不能重叠）`);
        } else {
          assert(results, 'logo-title-gap', true, 'logo 下方无标题文字');
        }
      } else {
        assert(results, 'logo-title-gap', true, '未检测到渐变 logo（跳过）');
      }
    }

    writeFileSync(join(evalDir, variant, 'grading.json'), JSON.stringify(results, null, 2));
    console.log(`graded ${evalInfo.name} / ${variant}: ${results.filter(r => r.passed).length}/${results.length} passed`);
  }
}
