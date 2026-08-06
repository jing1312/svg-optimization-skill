# Style System

Direction registry. Directions A/C/D–I are historical; J/K/L/M/N/O/P are the
current seasonal set; Q/R are style-axis explorations. All directions share
identical copy (SKILL.md §2) and logo semantics — only palette, material and
motif accents differ.

## 1. Historical directions (frozen)

- `A` Deep-sea bubbles — the original cyan-navy promo; frozen in
  `assets/examples/banner-deepsea-baseline.svg` as the regression baseline.
- `C` Glass cards, `D` Citrus flat, `E` Mint grid, `F` Dusk neon, `G` Paper tape,
  `H` Chalk doodle, `I` Fog gradient — retired after season testing.

## 2. Seasonal directions

### J · 梦幻极光 (Dreamy Aurora)

- Base: `#eef4ff → #f6efff` vertical.
- Aurora ribbons: `#7ee8e0 → #9b8cff → #ffb3d9`, opacity ≤ 0.55, large radius blur.
- Ink `#2b2f55`; accents `#38bdf8` (cyan), `#8b7cf6` (violet).
- Material: airy glass; halo dominates, shadow is violet-tinted at 18 %.
- Motif accents: orbiting chapter nodes drawn as aurora beads.

### K · 夏日汽水 (Summer Soda)

- Base: `#eafaf3 → #fff7e6`.
- Fizz accents: lime `#a3e635`, citrus `#fbbf24`, soda cyan `#22d3ee`, coral `#fb7185`.
- Ink `#1f3d3a`; cards float on teal-tinted shadow at 16 %.
- Material: cold glass with bubble trails; bubbles must stay ≤ 10 px radius
  inside cards (fizz, not foam).
- Motif accents: review paths drawn as soda-straw dotted lines.

### L · 暖阳纸片 (Warm Sun Paper)

- Base: `#fff8ec → #ffedd5`.
- Paper `#fffdf5` cards, amber `#f59e0b` + warm orange `#fb923c`.
- Ink `#4a3826`; shadow warm-brown at 14 %; highlight is a sunbeam fade.
- Material: cut paper with one folded corner per card.
- Motif accents: chapter nodes as paper tabs.

### M · 海盐薄荷 (Sea Salt Mint)

- Base: `#f0fbf8 → #e6f7f1`.
- Accents: mint `#5eead4`, seafoam `#99f6e4`, ice blue `#7dd3fc`, salt white `#f8fffe`.
- Ink `#23443d`; shadow teal-tinted at 16 %; halo is cold mist, opacity ≤ 0.4.
- Material: frosted glass — highlight is a cold white sheen, never warm.
- Motif accents: chapter nodes as ice beads; review path as a shoreline dotted line.

### N · 落日蜜桃 (Sunset Peach)

- Base: `#fff5ef → #ffe9dd`.
- Accents: peach `#fb923c`, coral `#fb7185`, apricot `#fdba74`, blush `#fecdd3`.
- Ink `#4a2f2a`; shadow coral-tinted at 18 %; halo is low-sun warmth fading to 0.
- Material: dusk glow — one large sun halo at top, page gloss kept warm.
- Motif accents: chapter nodes as sunlit beads; waveform bars in peach→coral.

### O · 深海月光 (Deep Sea Moonlight)

- Base: `#0d1b2e → #16324f` (dark direction).
- Accents: moon silver `#cbd5e1`, moon blue `#93c5fd`, deep cyan `#22d3ee`.
- Text ink `#e6edf7`; cards/tiles `#16233b` with silver keyline at 30 %.
- Material: quiet water — halos are moon-blue at ≤ 0.3, bubbles silver-rimmed
  and sparse; no warm color anywhere.
- Motif accents: chapter nodes as moon phases; verification check in moon blue.
- Contrast rule: all body text ≥ 70 % lightness on this base.

### P · 樱花糖果 (Sakura Candy)

- Base: `#fff5f9 → #ffe9f3`.
- Accents: sakura `#f9a8d4`, candy pink `#f472b6`, cream `#fef3f7`, leaf mint `#86efac`.
- Ink `#4d2b3a`; shadow pink-tinted at 20 %; halo candy-pink at ≤ 0.35.
- Material: cotton-candy highlight; candy sprinkles allowed **only inside cards**,
  radius ≤ 5 px, ≤ 8 per card, colors from the accent set (sprinkles, not scatter).
- Motif accents: chapter nodes as candy beads; shield badge in candy pink.

## 3. Style-axis explorations (not seasonal recolors)

These explore a different look-and-feel axis while keeping semantic briefs,
accessibility and structure gates. They may relax the six-layer palette
tradition but never the motif-brief and measurement rules.

### Q · 墨线手稿 (Ink Sketch)

- Base: paper `#fdfcf8`; ink `#2f2a24`, single accent vermilion `#d94f30`.
- Illustrations are stroke-only line art (fill none) at unified 2.4 px; no
  gradient fills, no halo — the paper texture carries the airiness.
- The single accent is reserved for verification marks (check/shield); never
  decorative.
- Logo: tile becomes paper with ink keyline; node ring drawn as ink dots.

### R · 星夜霓虹 (Starry Neon)

- Base: `#0a0a1a → #141432`; text ink `#e6e9ff`.
- Neon strokes: `#22d3ee → #a855f7 → #f472b6` linear gradients on dark; glow via
  feDropShadow at ≤ 10 stdDeviation (bounded, single pass).
- Material: signage — one glow per element, no overlapping halos; star dots
  ≤ 2 px radius, ≤ 12 per banner, always behind content.
- Logo: tile becomes glass-black; glyph strokes neon gradient; shield neon cyan.

## 4. Shared rules

1. Effect stack exactly as `design-patterns.md` §5 — six layers, in order.
2. Semantic motifs: each card’s `<g>` carries
   `data-motif` (noun) and `data-motif-message` (one sentence). The gallery
   motifs are: 章节关系 / 提纲生成 / 复习路径 / 卡片核验 / 课堂波形 / 资料导出包.
3. Typography hierarchy: title ≥ 34 px semibold, subtitle ≥ 17 px regular,
   card labels 16–18 px, captions 13 px at 60 % ink. Never introduce a fourth level.
4. Gradients fade out: every halo/gloss must terminate at `stop-opacity="0"`
   so airiness never becomes fog.
5. Seasonal switching: J and K remain swappable themes after a default is
   chosen; do not delete either asset set. Chosen default: **J 梦幻极光**,
   applied to `banner-example.svg` and `popup-mockup-example.svg`.

## 5. Layout axis (排版轴)

排版轴改变构图层级与信息编排，与季节色板、风格轴正交——任何色板都可以套用
任一排版轴，但几何门禁 G1–G4 永远适用（`design-patterns.md` §7）。

### S1 · 编辑海报 (Editorial Poster)

- Canvas `900×1200` 竖版；24 px 边界框，正文网格从 72 px 起。
- 超大展示字（96–120 px）承载主信息，至多三行，一行一个短语；第三行可用
  单一主题强调色。
- 编号信息区（01/02/03）沿细分线排列：标题 20 px + 说明 13 px。
- 全幅只保留一个语义 motif（如节点星座），放在展示字对侧留白处；不重复装饰。
- Ghost 数字 / ISSUE eyebrow 允许，但 opacity ≤ 0.12，且不得压住正文。

### S2 · 高级广告 (Premium Ad)

- Canvas `1200×800`；深底（≤ `#1a212c`）+ 金点缀（`#d3b57a`）；标题必须用
  衬线字族（Songti SC / STSong / Noto Serif SC）。
- 严格中轴对称：eyebrow → 金色发丝线 → logo → 主标题 → 副标题 → 能力线 → CTA。
- 克制效果：无环境光晕层、无气泡；唯一 spot 光晕 ≤ 0.16；留白 ≥ 40%。
- 分割线只用 1 px 两端淡出至 0 的渐变发丝线；四角角标 1.4 px。
- eyebrow letter-spacing ≥ 8 px；正文灰阶不低于 `#8d94a3`、≥ 12 px。

### 组合规则

- 排版轴资产同样要过 `npm run check`（含几何门禁），并在浏览器实测后才算完成。
- 新排版方向命名 S3、S4…；先出完整单页样板，再考虑换季套色。
