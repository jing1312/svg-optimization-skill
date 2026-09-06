/**
 * scripts/tokens.js — Design Token System
 * Single source of truth for all SVG assets in this project.
 */
export const T = {
  font: { display: 72, title: 48, section: 32, heading: 24, body: 18, caption: 13 },
  lineHeight: { display: 1.12, title: 1.25, section: 1.30, heading: 1.35, body: 1.55, caption: 1.50 },
  titleGapRatio: 1.45,
  spaceRaw: [4, 8, 16, 24, 32, 48, 64, 96, 128],
  space(n) { return this.spaceRaw[Math.min(n, this.spaceRaw.length - 1)]; },
  stroke: { hairline: 1, thin: 1.5, medium: 2, bold: 3, heavy: 4 },
  canvas: {
    banner: { w: 1100, h: 300 }, bannerWide: { w: 1200, h: 560 },
    card: { w: 380, h: 300 }, cardTall: { w: 380, h: 340 },
    gallery2x2: { w: 820, h: 700 }, gallery3x2: { w: 1240, h: 760 },
    poster: { w: 900, h: 1200 }, posterWide: { w: 1200, h: 800 },
    showcase: { w: 1200, h: 800 }, selector3: { w: 1060, h: 1090 },
    selector4: { w: 1060, h: 1410 }, popup: { w: 860, h: 730 },
  },
  grid(opts) {
    const { canvasW, canvasH, cols, rows, margin = 48, gutter = 32, headerH = 96 } = opts;
    const innerW = canvasW - margin * 2;
    const innerH = canvasH - margin - headerH - margin;
    const cardW = Math.floor((innerW - gutter * (cols - 1)) / cols);
    const cardH = Math.floor((innerH - gutter * (rows - 1)) / rows);
    const positions = [];
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++)
      positions.push({ x: margin + c * (cardW + gutter), y: margin + headerH + r * (cardH + gutter), w: cardW, h: cardH });
    return { cardW, cardH, gutter, positions };
  },
  colorRoles: ["surface","ink","muted","accent","material","shadow","glow"],
  fontStack: {
    cjkSans: 'PingFang SC, Hiragino Sans GB, Microsoft YaHei, Noto Sans SC, system-ui, sans-serif',
    cjkSerif: 'Songti SC, STSong, SimSun, Noto Serif SC, serif',
    latinSans: 'system-ui, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif',
    latinSerif: 'Georgia, Times New Roman, serif',
    mono: 'ui-monospace, SFMono-Regular, Consolas, Liberation Mono, monospace',
  },
  radius: { sm: 8, md: 16, lg: 24, xl: 32 },
  material: { blur: { max: 24, passes: 2 }, halo: { maxOpacity: 0.45 }, shadow: { maxOpacity: 0.35 }, glass: { opacityRange: [0.06, 0.14] } },
  contrast: { normalText: 4.5, largeText: 3.0 },
};

export function textStack(startY, items, _T = T) {
  let y = startY;
  return items.map(item => {
    const fontSize = _T.font[item.level];
    const baseline = y + fontSize;
    const lh = fontSize * _T.lineHeight[item.level];
    y += lh;
    return { ...item, fontSize, y: baseline };
  });
}

export function estimateTextWidth(text, fontSize, letterSpacing = 0) {
  let width = 0;
  for (const ch of text) {
    if (/[\u4e00-\u9fff\u3000-\u303f\uff00-\uffef]/.test(ch)) width += fontSize;
    else if (ch === " ") width += fontSize * 0.32;
    else if (/[·・]/.test(ch)) width += fontSize * 0.5;
    else width += fontSize * 0.56;
  }
  width += letterSpacing * Math.max(0, text.length - 1);
  return width;
}

export function sizeContainer(text, fontSize, opts = {}) {
  const { paddingH = 12, paddingV = 8, letterSpacing = 0, minHeight = 32 } = opts;
  const textW = estimateTextWidth(text, fontSize, letterSpacing);
  return { width: Math.ceil(textW + paddingH * 2), height: Math.max(minHeight, Math.ceil(fontSize + paddingV * 2)) };
}
