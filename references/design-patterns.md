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
