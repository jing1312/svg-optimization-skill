# Style System

Direction registry. Directions A/C/D–I are historical; J/K/L are the current
seasonal set. All directions share identical copy (SKILL.md §2) and logo
semantics — only palette, material and motif accents differ.

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

## 3. Shared rules

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
