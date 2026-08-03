---
name: svg-optimization
description: >-
  Create and optimize hand-written SVG illustrations for READMEs, docs, and
  product pages — banners, UI mockups, flow diagrams, social cards. Use this
  skill whenever the user asks to 制作/生成/优化 SVG 配图、banner、示意图、演示图、
  项目头图, or to fix an existing SVG where text overflows its box, cards look
  mis-sized, or the layout looks off, or when a tool-exported SVG is bloated and
  should be rewritten by hand. Use it even when the user does not say "SVG" but
  wants a header image, preview mockup, or illustration for their project. The
  skill encodes the browser-measured text width → backfill coordinates →
  re-layout → iterate-in-browser workflow, and comes with an offline text
  measurement tool (scripts/measure_text.html) so every run measures text with
  the same ruler.
---

# Hand-Written SVG Illustration Skill

SVG is the right format for README banners, UI mockups, and technical
illustrations: it scales without blur, renders text as real text (selectable,
copyable), and a good hand-written file is 2–6 KB instead of a bloated
editor export. But SVG has one fundamental trap that decides everything:

> **`<text>` does not auto-size its container.** A `<rect>` behind a `<text>`
> never grows to fit the text. Text width and box width are two independent
> numbers you must reconcile yourself.

Every failure mode in this domain — overflowing text, cards that are too wide,
text clipped at edges, overlapping badges — comes from ignoring that fact.
The entire workflow below is built around measuring text and backfilling
coordinates from the measurement.

## The workflow: generate → measure → backfill → verify → iterate

### 1. Structure first, then fill in

Write the SVG top-down in layers, in this order:

1. `<svg>` root: set `xmlns`, `width`, `height`, and `viewBox` identical to
   width/height (e.g. `viewBox="0 0 1100 300"`). Never omit viewBox — it is
   what makes the image scale responsively in a README.
2. `<defs>`: gradients, drop shadows, anything reused. Define once, reference
   with `fill="url(#id)"`.
3. Background: one full-size `<rect>`, optionally with `rx` for rounded card
   feel. **For banners, always round the background rect (`rx` ≈ 24)** — a
   banner with sharp corners looks unfinished; reviewers explicitly prefer
   the rounded version.
4. Decoration: large translucent circles (`opacity="0.04"–"0.06"`) give a
   professional gradient backdrop for ~3 lines of code.
5. Content groups: title text, subtitle, badges, mockup elements. Use `<g>`
   to group and `transform="translate(x y)"` to move whole clusters.

Set `font-family` once on the root `<svg>` so all text inherits it. Use a
cross-platform stack: `PingFang SC, Microsoft YaHei, sans-serif` — this makes
Mac and Windows render the same shapes, and it is the stack you must use when
measuring text (measure and render must use the same ruler).

### 2. Measure text before placing boxes (the core step)

Never guess text width. Never eyeball it. Measure it:

- Open `scripts/measure_text.html` in a browser, or use a canvas `measureText`
  in the console with the exact font stack:
  ```js
  const c = document.createElement('canvas');
  const t = c.getContext('2d');
  t.font = '18px "PingFang SC", "Microsoft YaHei", sans-serif';
  console.log(t.measureText('浏览器扩展 · Edge / Chrome').width);
  ```
- Then set the containing rect: `rect.width = textWidth + 2 × padding`
  (12–20 px per side is typical).
- Then place the text inside with one of two centering methods:
  - Horizontal: `text-anchor="middle"` on the text, `x = rect center x` —
    no manual centering math, and it survives text edits.
  - Vertical: text `y` is the **baseline**, not the center. Use
    `baseline y = rect.y + rect.height/2 + fontSize × 0.35` (see
    "Centering is a requirement" below for the worked example).

### Centering is a requirement, not a nicety

Text inside a box reads as "off" the moment left padding ≠ right padding, or
when the baseline is high or low in the pill. Check both axes for every
boxed text before declaring done:

- **Horizontal**: use `text-anchor="middle"` with `x = rect.x + rect.width / 2`
  for centered labels (badges, buttons, progress captions), or keep left and
  right padding exactly equal for left-aligned text. Never mix a 20 px left
  padding with a 35 px right padding — it looks like an error.
- **Vertical**: `baseline y = rect.y + rect.height / 2 + fontSize × 0.35`.
  Sanity check: for a 46 px pill at 18 px font, baseline ≈ y + 23 + 6.3 ≈
  y + 29. A baseline at y + 26 looks high; at y + 34 it sinks.
- **Minimum padding**: if text fits with less than 10 px per side, the box
  looks wrong even though it "fits". When in doubt, 20 px per side.

### Type scale: unify the size ladder first

A figure with font sizes 19, 13, 17, 26, 72 looks random; a figure with
72 / 26 / 18 reads as a designed system. Decide the ladder before placing any
text and use only those rungs:

- Banner: title 72, subtitle 26, badge/body 18. Vertical rhythm between
  rungs matters as much as size: keep ≥ 60 px between the 72 px title
  baseline and the 26 px subtitle baseline, and ≥ 28 px between the
  subtitle and the badge row — the title gap should be the largest in the
  figure (cramped big-to-small text is the first thing reviewers notice;
  uniform gaps everywhere read flat).
- UI mockup (popup on a large canvas): title 20–24, section/body 15–16,
  buttons 15–16, badges/status 14, captions/progress text 14. **Never drop
  below 13.5** — tiny captions next to a big card look broken; if a caption
  would be smaller than 14, enlarge the caption, not the card. Block gaps
  between content sections: 24–32 px (loose 60+ px gaps read as empty).
- Rule of thumb: 3–4 rungs max. Rungs should differ by a clear visual step
  (≥ 1.5× between title and next level); if two adjacent elements differ by
  1–2 px, unify them instead.

### Spacing rhythm: uniform gaps beat even content

"Too crowded" and "too empty" are both symptoms of uneven gaps. In any card,
mockup, or group:

- Give the content area a fixed inset (≥ 20 px on each side in a mockup card,
  20 px left inset for badge rows).
- Space vertical elements on a small ladder (8 / 16 / 24 px steps) and keep
  the same gap between all siblings of the same type.
- **Rhythm, not monotony: give the hierarchy room.** After a large title,
  leave a noticeably larger gap before the next line — the space below a
  72 px title should be bigger than the space below a 26 px subtitle. A
  figure where every gap is identical reads flat and平庸; let big text
  breathe and keep small-to-small gaps tighter. Banner: title→subtitle
  baseline gap ≥ 60 px, subtitle→badges ≥ 28 px — the title gap is the
  largest in the figure.
- Minimum vertical gaps: a "crowded" feel comes from gaps smaller than
  ~12 px between buttons or ~16 px between sections. When two things sit
  close vertically, their gap should be at least ~0.6× the font size of the
  taller element. If you cannot fit a 16 px gap comfortably, the layout is
  probably wrong — try a two-column row instead of a tall stack.
- **Loose also fails.** Mockup section gaps (between content blocks) should
  stay ≤ ~40 px — a 60+ px gap between every block makes the card feel
  empty and "松散". 24–32 px between sections is the sweet spot; reserve
  40+ px only for the space between a heading and the card top.
- When the card is bigger than its content, expand the card's whitespace
  evenly — do not stretch element widths to fill it, and do not shrink the
  card to hug the content if a generous feel is wanted. Fix the inset, then
  let the card height follow the content + inset.

### Icon proportion: content ≤ 75% of the tile

Icons "look like they're about to overflow" when the drawn strokes run close
to the tile edge. Give every icon a breathing margin:

- Icon drawing bounds ≤ 75% of the tile (for a 32 px tile, strokes live
  inside a ~24 px area, ≥ 4 px from each edge).
- Use `transform="translate(x y)"` to position the tile, then draw the icon
  in local coordinates around a virtual center — that keeps margins uniform
  on all four sides.

### Logo style: polished, not stick-figure

A hero icon (banner logo, popup app icon) is the first thing a viewer looks
at — a few geometric strokes read as a cheap stick figure. **Never use a
plain line icon as a logo.** Instead, layer it like a real app icon:

1. **Gradient tile**: a rounded square (`rx` ≈ 20% of size) filled with a
   `linearGradient`. **Keep the palette bright** — reviewers reject dark,
   muddy logos. Use a luminous deep blue such as `#5b8def` → `#2f5fb8`
   (or `#4a7bd6` → `#1e5bb8`), optionally with a small light ellipse at the
   top as a sheen. If the banner background is already dark navy, the logo
   tile should be the **brightest** blue on the canvas.
2. **Glow halo**: a `radialGradient` circle inside/behind the tile fading
   from a light brand tint to transparent (`stop-opacity` 0.9 → 0). This is
   the "渐变蓝色光环" look reviewers notice. Keep the halo soft (large
   radius, gentle opacity) — a hard bright ring reads as cheap.
3. **Drop shadow**: a soft `feDropShadow` under the tile, or a darker
   `rx`-matching rect offset behind it.
4. **White glyph on top**: the symbol drawn **filled** in white
   (`fill="#ffffff"`), centered with the 75% margin rule.

**Glyph choice decides everything — and the default matter.** Reviewers have
repeatedly rejected the "book of two plain rects + a spine" idea: it is the
single most common way a logo looks 丑. **Never draw the glyph as two or
three flat rectangles.** Draw the symbol the way you would sketch it with a
pen — with diagonals, angles, and a recognizable silhouette. Default to a
**lightning bolt** (`path` with two sharp angled cuts) or a **folded note
sheet**; both read as "hand-designed" fax. A stack of rects reads as
"debugging artifact".

**Give the logo room.** A logo crammed against its neighbor text reads as a
mistake: keep ≥ 40 px between the logo tile edge and any title/badge beside
it, and ≥ 32 px vertically below the logo inside a mockup header. In a
banner the logo cluster owns the right column; nothing overlaps or touches
it.

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
<circle cx="40" cy="40" r="36" fill="url(#halo)"/>          <!-- glow halo -->
<rect x="8" y="8" width="64" height="64" rx="14" fill="url(#lg)"/>  <!-- gradient tile -->
<path d="M 40 20 L 24 42 h 10 L 30 58 L 48 40 H 36 Z" fill="#ffffff"/>  <!-- white bolt glyph -->
```

Two-column layouts: when the banner is left-text + right-icon, this styled
logo is what sits on the right — a plain stroke icon next to a 72 px title
looks unfinished.

### 3. Chain the layout: x-coordinates are sequential

Badges in a row: each rect's x = previous rect's x + previous width + gap.
Compute the chain from left to right, and re-run the whole chain whenever one
width changes. A width change in the first badge invalidates every x after it.

### 4. Verify in a browser, then iterate

SVG files open directly in any browser (drag the file in, or double-click).
Look at the rendering, not the code:

- Does any text overflow its card? → re-measure that string, widen the rect.
- Do two cards overlap? → re-run the x chain.
- Is text clipped at the viewBox edge? → shrink font or widen canvas.
- Are element sizes inconsistent (font 19 px in one badge, 13 px in another)?

Then fix, reopen, re-check. Real projects take 2–4 such rounds; that is
normal and expected. Do not declare the SVG done from code inspection alone.

## Element cheat-sheet (all you need)

| Element | Use for | Notes |
|---|---|---|
| `<rect>` | backgrounds, cards, pills | `rx` = height/2 gives a capsule pill |
| `<circle>` | decorative blobs | low opacity, large radius, off-canvas center |
| `<text>` | all copy | always set `font-size`; inherit family from root |
| `<path>` | hand-drawn icons | keep paths short; 5–6 `M/L/C` segments per icon |
| `<line>` | separators, progress tracks | 1–1.5 px `stroke` |
| `<defs>` | gradients, shadows | `linearGradient` for brand color ramps |
| `<g>` | grouping + positioning | `transform="translate(x y)"` to move clusters |

Keep it minimal: every element is hand-written, no editor namespace bloat,
no `<metadata>`, no embedded rasters.

## Design patterns

See `references/design-patterns.md` for copy-ready patterns:
- **Banner**: gradient background, translucent circle decoration, title +
  subtitle, capsule badges (`rx` = half height), logo icon on the right
  (styled: gradient tile + glow halo, see "Logo style" above).
- **UI mockup**: browser chrome frame, `feDropShadow` popup, status cards,
  progress bar, two-button rows. The popup card should occupy ~60% of the
  canvas width and ~70%+ of the height — a small card reads as a mistake next
  to empty background, and excess whitespace around the card also reads as
  a mistake. Keep the mockup background **plain** (one solid fill) — the
  decorative circles belong in banners, not in UI mockups.
- **Status cards: word the state, don't draw it.** Reviewers react well to
  small labeled cards like 「平台就绪」「会话就绪」「权限就绪」 — a light tint
  fill, a small check badge, and the **word** "就绪". A lone dot reads as
  plain; a tiny filled circle with a white check mark reads as designed —
  keep the badge ≤ 14 px. Hand-drawn check marks look coarse at badge sizes;
  a plain label card always reads cleaner.
  When several states mean the same thing (e.g. all "ready"), give them the
  **same positive color** (all green) so a glance reads "everything OK".
  Only introduce a different color when a status is actually different (a
  warning, an error, a pending state). Never use a neutral gray for a ready
  item — gray reads as "not set up". Prefer plain tinted labels with the
  status word over a Unicode `✓`, which renders inconsistently across
  platforms.

## Layout principles (banners and mockups)

- **Banner: left text + right icon, not centered stack.** The most common
  bad banner piles every element in the center, leaving wide empty sides.
  Anchor the title block to the left, place the logo icon on the right,
  and let the canvas breathe. The icon cluster on the right balances the
  text mass on the left.
- **Mockup: two parallel actions go side by side, not stacked.** When a
  popup holds two peer actions (e.g. "抓取章节题库" / "抓取期末考试") give
  them a **two-column row**, each button ~45% of the card width, ~16 px gap.
  Stacking two buttons vertically forces the card tall and skinny for no
  reason. Use vertical stacking only for genuinely different sections (a
  header band, a content band, a footer band).
- **Mockup card should visibly occupy the canvas.** Target width ~65% of
  the canvas *and* height ~75%+, tending toward a clean square. A card that
  fills 55%×55% of the canvas still reads as small — and one surrounded by
  a wide margin of empty canvas reads as "lost in space". Raise both axes
  together, keep the inset, and let the bigger card consume the picture.
- **Mockup chrome stays slim.** The browser toolbar is furniture, not
  content: keep it ≤ 48 px tall (traffic-light dots + address pill), so the
  popup card — the actual subject — dominates the frame.
- **Mockup backgrounds stay plain.** The mockup sits on a real product
  surface (a browser page); decorative translucent circles belong on banners,
  not behind a UI mockup. One solid fill, and the mockup itself is the
  decoration. If the card fills most of the canvas, the background can even
  be dropped entirely — a full-bleed card with just the chrome band on top
  is fine.

## Copy details (do not get these wrong)

- **Version strings**: separate the letter from the number with a space —
  `v 1.0.0`, `v 0.2.0`. The unspaced `v1.0.0` looks like a typo; this
  convention applies to **every** banner, every release badge, every mockup,
  not just one example. Verify before handing over.

## Anti-patterns (why these are wrong)

- **Guessing text widths** — the #1 source of overflow bugs. Measure.
- **Editor exports** — vector editors produce 10–100× bloat; rewrite by hand.
- **Raster PNG inside SVG** — defeats scalability; pure vectors only.
- **Inconsistent font sizes** — unify the size ladder before layout (see "Type scale").
- **Missing viewBox** — image won't scale in READMEs.
- **font-size larger than the box height** — text clips vertically; box height
  should be ≈ 2.2–2.6 × font-size for pills.
- **Off-center text in boxes** — left/right padding asymmetry or a baseline
  sitting high/low in the pill is the most common "something looks off" bug
  after overflow. Check both axes.
- **Icons touching the tile edge** — strokes that run to the tile boundary
  read as overflowing; keep drawing bounds ≤ 75% of the tile.
- **Unicode ✓ / ● symbols in badges** — render inconsistently across
  platforms and look coarse at 11–13 px. Use plain tinted labels with the
  status word (e.g. 「平台就绪」) instead; hand-drawn checks read coarse at
  badge sizes too — a labeled card wins.
- **Too-small cards in mockups** — a popup that covers ~35% of the canvas
  reads as undersized; target ~60% of canvas width and ~70%+ of height.
- **Plain line icon as a logo** — a few strokes next to a big title look
  unfinished. Style the logo: gradient tile + glow halo + white filled glyph
  (see "Logo style").
- **A logo glyph made of stacked rectangles** — "book" drawn as two/three
  plain rounded rects is the #1 reason a logo looks 丑. Draw a hand-sketched
  silhouette instead: lightning bolt (diagonal zigzag) or folded note.
- **Decorative circles behind a UI mockup** — banners earn decoration;
  mockups sit on a plain surface. Keep the mockup background to one solid
  fill.
- **Tiny caption text in mockups** — captions under 12.5 px look broken next
  to a large card; keep the smallest mockup text ≥ 13 px.

## Deliverables checklist

Before handing over an SVG, confirm in the browser:

- [ ] Text fits inside every box with padding (12–20 px per side)
- [ ] Boxed text is centered on both axes: left/right padding equal (or
      text-anchor="middle"), baseline ≈ rect center + fontSize × 0.35
- [ ] Font sizes come from one small ladder (≤ 4 rungs, clear visual steps)
- [ ] Spacing rhythm is uniform (same gap between siblings; fixed card inset;
      vertical gaps ≥ 0.6× font size, no < 12 px button gaps)
- [ ] Banner uses left-text + right-icon columns, not a centered pile
- [ ] Banner background is rounded (`rx` ≈ 24), title→subtitle baseline gap
      ≥ 60 px (largest gap in the figure), subtitle→badges gap ≥ 28 px
- [ ] Hero logo is styled: bright gradient tile + soft glow halo + white
      filled glyph, **drawn as a bolt or folded-note path (diagonals/folds),
      never a stack of plain rounded rects** — ≥ 40 px clearance from
      neighboring text
- [ ] Mockup parallel actions sit in a two-column row, not a vertical stack
- [ ] Mockup card fills ≥ 65% of canvas width and ≥ 75% of height, near-square,
      with no excess whitespace around it
- [ ] Mockup chrome is slim (toolbar ≤ 48 px); background plain or dropped
- [ ] Mockup text stays ≥ 14 px; captions and progress text are readable
- [ ] Mockup block gaps are 24–32 px (not 60+ px loose); logo has ≥ 32 px
      clearance from the title below it
- [ ] Status cards word the state (「平台就绪」) with a small check badge;
      same positive state → same color (all green)
- [ ] Version strings use a space: `v 1.0.0`, not `v1.0.0`
- [ ] No overlaps between adjacent elements; x-chain is consistent
- [ ] No element or text extends past the viewBox edge
- [ ] viewBox present and matches width/height
- [ ] font-family stack on root; every text has a font-size
- [ ] defs reused for gradients; no duplicate definitions
- [ ] A whole-file size under ~10 KB (else: rewrite, don't shave)
