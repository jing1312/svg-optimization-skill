# Design Patterns for Hand-Written SVG

Copy-ready patterns. Sizes shown are examples — always re-measure your own
strings with `scripts/measure_text.html` before finalizing widths.

## Banner (README header image)

Typical canvas 1100×300. **Use a left-text + right-icon column layout**, not
a centered pile — title/subtitle/badges anchor to the left, the logo icon
cluster sits on the right; the empty middle lets the canvas breathe. **Round
the background rect (`rx` = 24)** — a sharp-cornered banner looks
unfinished. Layer order: gradient background → translucent circle blobs →
title/subtitle left, badges left, icon cluster right.

Vertical rhythm: keep the title baseline → subtitle baseline ≥ 60 px (the
largest gap in the figure — let the 72 px title breathe), and subtitle →
badge row ≥ 28 px. Cramped big-to-small text is the first thing reviewers
notice; uniform gaps everywhere read flat and平庸.

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="1100" height="300" viewBox="0 0 1100 300" font-family="PingFang SC, Microsoft YaHei, sans-serif">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#12294f"/>
      <stop offset="0.55" stop-color="#1e4277"/>
      <stop offset="1" stop-color="#2f5fb8"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#5b8def"/>
      <stop offset="1" stop-color="#2f5fb8"/>
    </linearGradient>
  </defs>

  <rect width="1100" height="300" rx="24" fill="url(#bg)"/>
  <!-- decoration: big translucent circles, opacity 0.04-0.06 -->
  <circle cx="980" cy="40" r="140" fill="#ffffff" opacity="0.05"/>
  <circle cx="60" cy="300" r="130" fill="#ffffff" opacity="0.04"/>

  <!-- LEFT column: title + subtitle (baseline gap ≥ 55) -->
  <text x="70" y="118" font-size="72" font-weight="700" fill="#ffffff" letter-spacing="4">景图题库助手</text>
  <text x="70" y="178" font-size="26" fill="#cfe0ff">一键导出课程练习题与隐藏答案 · 章节题库 & 期末考试</text>

  <!-- badges: y=210, height 46, rx=23 (pill). Width = measured text + 40.
       x chain: 72 → 72+276+54 → 366+204+54 ... -->
  <g font-size="18">
    <rect x="72" y="210" width="276" height="46" rx="23" fill="#ffffff" opacity="0.12" stroke="#ffffff" stroke-opacity="0.3"/>
    <text x="92" y="239" fill="#ffffff">浏览器扩展 · Edge / Chrome</text>
    <rect x="366" y="210" width="204" height="46" rx="23" fill="url(#accent)"/>
    <text x="386" y="239" fill="#ffffff" font-weight="600">v 1.0.0</text>
  </g>

  <!-- RIGHT column: logo (gradient tile + glow halo + white glyph) via translate(x,y) -->
</svg>
```

Badge math: 46 px tall pill → text baseline y = 196 + 23 + 18 × 0.35 ≈ 225
(`rect.y + height/2 + fontSize × 0.35`). Widths were measured (e.g.
"浏览器扩展 · Edge / Chrome" at 18 px ≈ 236 px → rect = 236 + 40 = 276).
Text horizontal placement: `text-anchor="middle"` with `x = rect.x +
rect.width / 2` guarantees a centered label; if left-aligned, left and right
padding must be equal. Minimum padding per side: 10 px, target: 20 px.

Type scale for banners (pick a ladder, don't improvise):
| Rung | Size | Where |
|---|---|---|
| Title | 72 | the product name |
| Subtitle | 26 | one-line description |
| Body | 18 | badges, pills |

## UI mockup (popup / dashboard preview)

Canvas 860×730 example. Slim browser chrome on top, a popup card with drop
shadow in the center. **Keep the canvas background a single solid fill (or
drop it entirely when the card fills the frame)** — the decorative
translucent circles belong in banners, not behind a UI mockup. Type scale
for mockups:
| Rung | Size | Where |
|---|---|---|
| Title | 20–24 | extension name |
| Section | 15–16 | group labels |
| Body / buttons | 15–16 | labels, values, buttons |
| Status / captions | 14 | status cards, progress text |

Nothing below 13.5; if a caption would be smaller, grow the text instead of
the card.

**Card size matters.** A popup that occupies ~55% of both canvas axes reads
as "too small" next to the empty background — and a card surrounded by a wide
margin of empty canvas reads as "lost in space". On an 860×730 canvas, make
the popup ~65% of the canvas width **and** ~75%+ of the height (≈560 px wide,
≈560–600 px tall), tending toward a clean square. Center it; keep the 24 px
content inset. When in doubt, scale the card up — crowded-inside is fixable by
raising the card, a tiny card is a bigger visual sin than a busy one.

**Chrome stays slim.** The toolbar is furniture: ≤ 48 px tall, small traffic
lights (r ≈ 6), a modest address pill. The popup card is the subject.

```svg
<defs>
  <filter id="sh" x="-20%" y="-20%" width="140%" height="140%">
    <feDropShadow dx="0" dy="8" stdDeviation="14" flood-color="#12294f" flood-opacity="0.14"/>
  </filter>
</defs>

<!-- plain canvas background: one solid fill, no decoration -->
<rect width="860" height="730" fill="#e9edf4"/>

<!-- slim browser chrome: white bar ≤ 48 tall, 3 traffic-light circles, address pill -->
<rect x="80" y="24" width="700" height="44" rx="12" fill="#ffffff" stroke="#dfe5ef"/>
<circle cx="104" cy="46" r="6" fill="#ff5f57"/>  <!-- red -->
<circle cx="124" cy="46" r="6" fill="#febc2e"/>  <!-- yellow -->
<circle cx="144" cy="46" r="6" fill="#28c840"/>  <!-- green -->
<rect x="176" y="34" width="440" height="24" rx="12" fill="#f2f4f9" stroke="#e3e8f0"/>
<text x="194" y="50" font-size="13" fill="#8a94a6">jingtu-ai.com/smart-teaching</text>

<!-- popup with shadow: centered horizontally, ≈65% canvas width -->
<g filter="url(#sh)">
  <rect x="150" y="96" width="560" height="570" rx="16" fill="#ffffff"/>
  <!-- ...content cards, each x = 174 (24px inside popup)... -->
</g>
```

**Two parallel actions go in a two-column row, not a vertical stack.** When
the popup holds two peer buttons (e.g. 抓取章节 / 抓取期末), lay them side by
side — each ~45% of the card width with a 16 px gap — so the card stays
rectangular instead of stretched tall.

```svg
<!-- card content width ~472 (520 - 2x24 inset); two buttons 228 + 16 + 228 -->
<rect x="194" y="380" width="228" height="40" rx="10" fill="url(#ic)"/>
<text x="308" y="405" font-size="15" font-weight="600" fill="#ffffff" text-anchor="middle">抓取章节题库</text>
<rect x="438" y="380" width="228" height="40" rx="10" fill="#ffffff" stroke="#2f5fb8" stroke-width="1.5"/>
<text x="552" y="405" font-size="15" fill="#2f5fb8" text-anchor="middle">抓取期末考试</text>
```

The address-bar URL is placeholder content — pick one string and use it
consistently; it carries no meaning.

## Status cards: word the state, don't draw it

Reviewers react well to small labeled cards — 「平台就绪」「会话就绪」「权限就绪」:
a light tint fill, a small **check badge** (filled circle + white check,
≤ 14 px), and the **word**. A lone dot reads plain; the check badge reads
designed. Hand-drawn check marks read coarse at badge sizes; plain label
cards always look cleaner.

**Color matches meaning, not variety.** When several states mean the same
thing (e.g. 平台就绪 / 会话就绪 / 权限就绪 are all positive), give every
card the **same positive color** — all green — so one glance reads
"everything OK". Only introduce a second color when a status is genuinely
different (a warning, an error, a pending item). Never paint a ready item
neutral gray — that reads as "not set up".

- **Labeled status card** (three of these in a row, same green):
  ```svg
  <g font-size="14">
    <rect x="0" y="0" width="140" height="42" rx="21" fill="#ecfdf3" stroke="#a7f3d0"/>
    <circle cx="22" cy="21" r="9" fill="#16a34a"/>
    <path d="M 18.5 21 l 2.5 2.5 l 4.5 -5" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="38" y="24.5" font-weight="600" fill="#15803d">平台就绪</text>
  </g>
  ```
- Keep the three cards equal width so the row reads as a system.

Status card recipe: `fill="#ecfdf3"` (green = ready), check badge circle
`#16a34a` + white check path, label text vertically centered
(`baseline = y + 21 + fontSize × 0.35`).

## Hand-drawn icons

Icon strokes must stay inside a ~24 px area centered in the tile (≤ 75% of
tile size, ≥ 4 px from each edge) — a tile whose strokes run to the edge
reads as "about to overflow".

**App logo style (hero icon / banner logo)** — reviewers react badly to a
plain line icon next to a big title, and reject dark/muddy logos. Layer it
like a real app icon: **bright** gradient tile + soft glow halo + drop
shadow + white **filled** glyph. **Critical: the glyph must be hand-drawn
with diagonals/folds, never a stack of two plain rounded rects.** The
"two-rect book" is the single most-cited reason a logo looks 丑. A lightning
bolt (`M…L…` zigzag) is the safest glyph; a folded note sheet reads equally
hand-designed:

```svg
<defs>
  <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#5b8def"/><stop offset="1" stop-color="#2f5fb8"/>
  </linearGradient>
  <radialGradient id="halo" cx="0.5" cy="0.35" r="0.8">
    <stop offset="0" stop-color="#8fb4f5" stop-opacity="0.9"/>
    <stop offset="1" stop-color="#8fb4f5" stop-opacity="0"/>
  </radialGradient>
</defs>
<circle cx="40" cy="40" r="36" fill="url(#halo)"/>                   <!-- glow halo -->
<rect x="8" y="8" width="64" height="64" rx="14" fill="url(#lg)"/>   <!-- gradient tile -->
<path d="M 40 20 L 24 42 h 10 L 30 58 L 48 40 H 36 Z" fill="#ffffff"/>  <!-- white bolt glyph -->
```

**Lightning bolt glyph (white filled)** — the default logo glyph; it only
ever needs diagonals:

```svg
<path d="M 40 20 L 24 42 h 10 L 30 58 L 48 40 H 36 Z" fill="#ffffff"/>
```

Glyph ideas (all drawn filled in white, within the 75% margin — **each has a
diagonal or fold, none is a stack of bars**):
- 闪电 bolt (canonical): the zigzag path above
- 折角便签 folded note: a sheet path + one folded-corner triangle
- 对勾圆: circle + filled check
- 音符: circle + stem + flag

**Download arrow in a 32×32 tile** — bounds 711.5–732.5 (21 px wide),
centered around 722:

```svg
<g fill="none" stroke="#ffffff" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
  <path d="M 722 58.5 L 722 63.5"/>                                   <!-- stem -->
  <path d="M 718.2 62.3 L 722 66.1 L 725.8 62.3"/>                    <!-- arrowhead -->
  <path d="M 711.5 70.5 C 714.8 66.8 719 67.5 722 71.3 L 722 78.4 C 719.4 77.1 715.9 76.9 711.5 78.2 Z"/> <!-- tray left -->
  <path d="M 722 71.3 C 725 67.5 729.2 66.8 732.5 70.5 L 732.5 78.2 C 728.1 76.9 724.6 77.1 722 78.4 Z"/> <!-- tray right -->
</g>
```

A good icon is 3–5 strokes of simple geometry. If an icon needs more than
6 paths, simplify the idea instead of adding detail.

**Microphone icon (note-taking / dictation app, 18×26 strokes in a 40×40 tile)** —
a stem arc, a stand, and a base line, all centered in the tile:

```svg
<g fill="none" stroke="#ffffff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
  <path d="M 9 14 a 6 6 0 0 1 12 0 v 4 a 6 6 0 0 1 -12 0 z"/>   <!-- capsule body -->
  <path d="M 7 17 a 8 8 0 0 0 16 0"/>                            <!-- outer arc -->
  <path d="M 15 25 v 3"/>                                         <!-- stand -->
  <path d="M 11 31 h 12"/>                                        <!-- base -->
</g>
```

## Spacing rhythm

Vertical rhythm inside a card runs on a small ladder — 8 / 16 / 24 px — and
every sibling of the same kind gets the same gap. Card content inset: ≥ 24 px
on all sides (mockup content x = popup x + 24 in the example above). If the
card feels crowded, grow the card (keep inset) instead of shrinking gaps
unevenly; if it feels empty, grow the inset, not the element widths.

**Hierarchy gets rhythm, not monotony.** The gap below a big title should be
the largest in the figure (banner: title→subtitle ≥ 60 px, subtitle→badges
≥ 28 px). Mockup content-block gaps: 24–32 px — 60+ px gaps between every
block read as empty and 松散.

**Logo clearance:** ≥ 40 px between a logo tile and neighboring text; ≥ 32 px
between the logo and the title below it in a mockup header. A logo crammed
against text looks like an overlap bug.

## Color language

- Brand gradient: dark navy `#12294f` → `#1e4277` → `#2f5fb8`; lighter accent
  `#4a7bd6` → `#6da3f0`.
- On-dark text: white, `#cfe0ff` for secondary.
- On-light mockups: text `#1c2733` (primary), `#5b6b82` (secondary),
  `#8a94a6` (dim labels), borders `#dfe5ef`, canvas `#e9edf4`.
- Status: green `#1a9e4b`/`#e8f7ee`, blue `#2f5fb8`/`#eef4ff`.
