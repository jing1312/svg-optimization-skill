# Design Patterns

Shared geometry, measurement and composition rules for the brand assets.

## 1. Motif brief (required before drawing)

Every primary motif needs three lines:

```text
message: what the motif explains about the product
visual nouns: the concrete shapes used
relationship: how the nouns connect
```

Valid example:

```text
message: 知识核验把章节和概念连起来 (verification links chapters and concepts)
visual nouns: open book, shield, chapter nodes, check
relationship: nodes orbit the book; shield/check sits at the relationship center
```

If a motif cannot be tied to the copy in one sentence, delete it — never add
more decoration to rescue an unclear motif.

## 2. Canvas defaults

| Asset | viewBox | Notes |
|---|---|---|
| promo banner | `0 0 1100 300` | Title ≥ 34 px, subtitle ≥ 17 px, edge-clipped bubbles allowed |
| popup mockup | `0 0 860 730` | Dark browser backdrop `#0b1020`, popup card with ≥ 24 px radius |
| style chooser | free | Each option = banner thumbnail + popup/UI crop |
| logo preview | free | Always include a 48 px render next to the full tile |

## 3. Text measurement

- Chinese glyphs advance ≈ `font-size × 1.0`; Latin/digits ≈ `font-size × 0.55`.
- Reserved width = advance + `0.12 × font-size` safety per side.
- If font metrics are ambiguous, measure offline with `scripts/measure_text.html`
  and record the measured box as a comment next to the `<text>` node.
- Never let text overlap the clipped-edge decoration band (keep a 72 px margin on
  the decorated side of banners).

## 4. Bubble edge clipping

Ambient bubbles are clipped by the canvas edge so the composition breathes:

```xml
<g clip-path="url(#edge)">
  <circle cx="1100" cy="300" r="120" fill="url(#bubbleGrad)" opacity="0.5"/>
</g>
```

At least two bubbles must cross an edge in the banner; no bubble may float in
the exact center of the headline zone.

## 5. Six-layer effect budget (order matters)

1. Light gradient base (2 stops, ≤ 8 % saturation difference).
2. One large ambient halo layer → airiness.
3. One colored soft shadow → lift.
4. One translucent liner / inner keyline → boundary.
5. One clipped gloss or fading highlight → material.
6. One primary illustration, unified stroke width, ≤ 2 emphasis colors.

Forbidden: unbounded blur (`stdDeviation > 24`), repeated glow passes, random
dot scatter, multiple unrelated primary motifs in one asset.

## 6. Popup anatomy

Header (logo 40 px row) → feature rows (icon + label + one-line proof) →
primary CTA. Feature rows reuse the same motif nouns as the banner so the popup
reads as one product, not three stickers.

## 7. 布局红线（geometry gate 自动强制，G1–G4）

这些是最基本的布局规则，**永远不允许违反**。`npm run check` 会对所有
`assets/**/*.svg` 执行几何门禁（文本宽度按 CJK=1em、Latin≈0.56em 估算）：

- **G1 不越界**：所有文字必须完整落在画布内；唯一例外是显式 `clip-path`
  组内的边缘裁切元素。
- **G2 容器适配**：chip / pill / 按钮里的文字，左右各留 ≥5 px；先估算
  再定容器宽度——`容器宽 ≥ 起点x + 估算文本宽 + 8`。文字永远不允许比
  容器长而"等着被裁"。
- **G3 不遮挡**：文字不得与任何 `data-motif` 图案包围盒、Logo 包围盒相交。
  装饰图案要么让开文字行，要么删除——不用图案去救排版。
- **G4 不互压**：两段文字的包围盒不得重叠。

流程要求：每次改完 SVG，先跑 `npm run check`（几何门禁 0 issue），再上
浏览器做最终目检；估算宽度只是预检，目检才是放行标准。回归测试
`tests/fixtures/geometry-bad.svg` 保证门禁本身不会失效。
