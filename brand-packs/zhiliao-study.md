# Brand Pack · 知了学习 (demo)

A complete worked example of one brand riding this skill's core. Copy, themes
and logo instance are frozen here as reference; **nothing in the core skill or
gates depends on this brand**. New assets for other brands must not inherit
its copy or palettes — derive them (`references/style-library.md` §3).

## 1. Canonical copy

Keep wording identical across all directions unless explicitly rewritten:

- Product: 知了学习
- Title: 知了学习 · 知识组织与核验助手
- Subtitle: 把章节连成关系网，让每次复习都有据可查
- Popup CTA: 开始核验

Product story: knowledge organization + verification — chapters become
relationship graphs, review paths become checkable, notes become exported
packs. The six gallery motifs are: 章节关系 / 提纲生成 / 复习路径 / 卡片核验 /
课堂波形 / 资料导出包.

## 2. Seasonal palette axis (same copy & logo, palette swap)

| Dir | Name | Base | Accents | Ink / shadow |
|---|---|---|---|---|
| J (default) | 梦幻极光 | `#eef4ff → #f6efff` | ribbons `#7ee8e0 → #9b8cff → #ffb3d9` (≤ 0.55), cyan `#38bdf8`, violet `#8b7cf6` | `#2b2f55`, violet shadow 18 % |
| K | 夏日汽水 | `#eafaf3 → #fff7e6` | lime `#a3e635`, citrus `#fbbf24`, soda cyan `#22d3ee`, coral `#fb7185` | `#1f3d3a`, teal shadow 16 % |
| L | 暖阳纸片 | `#fff8ec → #ffedd5` | amber `#f59e0b`, orange `#fb923c`, paper `#fffdf5` | `#4a3826`, warm-brown shadow 14 % |
| M | 海盐薄荷 | `#f0fbf8 → #e6f7f1` | mint `#5eead4`, seafoam `#99f6e4`, ice `#7dd3fc` | `#23443d`, teal shadow 16 %, cold mist halo ≤ 0.4 |
| N | 落日蜜桃 | `#fff5ef → #ffe9dd` | peach `#fb923c`, coral `#fb7185`, apricot `#fdba74`, blush `#fecdd3` | `#4a2f2a`, coral shadow 18 % |
| O | 深海月光 (dark) | `#0d1b2e → #16324f` | moon silver `#cbd5e1`, moon blue `#93c5fd`, deep cyan `#22d3ee` | text `#e6edf7`, tiles `#16233b` + silver keyline 30 %; body text ≥ 70 % lightness; no warm colors |
| P | 樱花糖果 | `#fff5f9 → #ffe9f3` | sakura `#f9a8d4`, candy `#f472b6`, cream `#fef3f7`, leaf `#86efac` | `#4d2b3a`, pink shadow 20 %; sprinkles only inside cards, r ≤ 5 px, ≤ 8/card |

Material notes: K bubbles ≤ 10 px radius inside cards; L = cut paper, one
folded corner per card; seasonal switching keeps J and K both shippable.

## 3. Style & layout axes (orthogonal to palettes)

- **Q · 墨线手稿** — paper `#fdfcf8`, ink `#2f2a24` line art at 2.4 px, no
  gradients/halos; single vermilion `#d94f30` reserved for verification marks.
- **R · 星夜霓虹** — base `#0a0a1a → #141432`, neon gradient strokes
  `#22d3ee → #a855f7 → #f472b6`, one glow pass per element (≤ 10 stdDeviation),
  star dots ≤ 2 px and ≤ 12, behind content.
- **S1 · 编辑海报** — 900×1200 portrait; display headline 96–120 px ≤ 3 lines;
  numbered sections 20 px + 13 px on hairlines; one motif opposite headline;
  ghost elements ≤ 0.12 opacity, never over body text.
- **S2 · 高级广告** — 1200×800; ground ≤ `#1a212c`, gold `#d3b57a`, CJK serif
  stack `"Songti SC", "STSong", "SimSun", "Noto Serif SC", serif`; strict
  center axis; whitespace ≥ 40 %; no halo/bubbles; hairlines 1 px fading to 0;
  eyebrow letter-spacing ≥ 8 px; body ≥ `#8d94a3` at ≥ 12 px.

Axes relax palette traditions but never the motif brief, measurement or
geometry gates.

## 4. Logo instance

Core glyph: Lucide `book-open-check` (ISC — see THIRD_PARTY_NOTICES.md),
rendered `fill="none"`, round caps/joins, stroke ≥ 1.8 at 24 px scale.
Semantic brief: opened learning material + verification action; nodes orbit as
a chapter ring; shield liners the tile so verification reads as protection,
not decoration. Allowed layers (six, in order): theme halo (≤ 0.5, fading to
0) → rounded tile with tinted shadow → translucent liner (6–10 % inset) →
glyph → node ring (≥ 3 nodes, r ≥ 6 % tile) → one top-half gloss. Shield badge
≤ 30 % tile width, may overlap tile corner, must never cover the check.

Required metadata on every formal logo group:

```xml
data-role="logo"
data-logo-intent="knowledge verification"
data-icon-source="lucide"
data-icon-name="book-open-check"
data-icon-license="ISC"
data-logo-secondary-motif="chapter relationship + verification shield"
```

## 5. Historical directions (frozen, do not extend)

A 深海气泡 (regression baseline), C 玻璃卡片, D 柑橘平面, E 薄荷网格, F 暮色霓虹,
G 纸胶带, H 粉笔涂鸦, I 雾面渐变 — retired after season testing. New seasonal
directions continue from P (next letters), new layouts from S2.
