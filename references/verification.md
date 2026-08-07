# Verification

Three tiers. Use the highest tier the environment allows; lower tiers never
excuse skipping what a higher tier could have caught. Report which tier you
reached whenever you declare an asset done.

## 1. Tier overview

| Tier | Requires | Proves |
|---|---|---|
| T0 static self-check | nothing | you reasoned about the layout; catches ~70 % of mistakes before any tooling |
| T1 machine gates | Node ≥ 18 | structure, references, geometry, contrast — "not broken" |
| T2 render check | any rasterizer (Playwright → Chromium → rsvg-convert) | real fonts, real pixels — "actually fits, actually looks right" |

```bash
node evals/grade.mjs path/to/asset.svg      # T1, exit 1 on error
node scripts/render.mjs path/to/asset.svg   # T2, writes asset.png next to it
```

T1 output is necessary, never sufficient. If T2 was available and you skipped
it, the asset is not done.

## 2. T0 — static self-check (run in your head, always)

Walk the source and answer each item honestly:

Geometry
- [ ] Every `<text>`: estimate width (CJK=1em, Latin≈0.56em, +12 % safety per
      side). Does it fit the canvas with ≥ 16 px margin? Inside a chip/pill,
      is the container ≥ estimate + 10 px wide?
- [ ] No two texts share vertical range at the same x; multi-line blocks use
      consistent line height ≥ 1.35× font-size.
- [ ] Decorative groups stay clear of text rows or sit in explicit
      `clip-path` edge bands.
- [ ] `transform`s accounted for: rotated/scaled boxes occupy more/different
      space than their raw coordinates.

References
- [ ] Every `url(#id)` target exists exactly once; every `<use href="#id">`
      resolves; no copy-pasted duplicate `id`s across merged groups.

Semantics
- [ ] One primary motif; can you state its message in one sentence? Is it
      marked with `data-motif` + `data-motif-message`?
- [ ] Layer budget: ≤ 1 halo, ≤ 1 shadow, ≤ 1 gloss, blur ≤ 24, ≤ 2 emphasis
      colors, halos fade to `stop-opacity="0"`.

Fonts & access
- [ ] Font stack ends in a generic family; CJK text has a stack that exists on
      at least one platform the user cares about.
- [ ] `<title>` present and descriptive; contrast plausible (dark-enough ink
      on light base, light-enough on dark).

## 3. T2 — render checklist (after looking at the PNG)

State what you checked; "looks fine" is not acceptable:

1. **Text:** nothing clipped at canvas or container edges; no tofu □ glyphs
   (font missing); fallback didn't cause overflow the estimate missed.
2. **Overlap:** no text sits on motifs, gradients stops or other text; chips
   keep ≥ 5 px padding.
3. **Alignment:** shared edges/centers register; card gutters equal; nothing
   is 3 px off.
4. **Hierarchy:** the eye lands on the primary element first; subtitle second;
   decoration never louder than content.
5. **Material:** halos fade out (no fog rectangles); shadows read as lift, not
   dirt; at most one gloss; no banding in gradients.
6. **Color:** ≥ 4.5:1 body text contrast at a glance; accents harmonize (same
   temperature as base); no accidental neon where the style is calm.
7. **Edges:** nothing unintentionally touches/crosses the canvas border;
   deliberate edge clips look deliberate.

If any check fails, fix and re-run from the tier that catches it (geometry →
T1; pixels → T2), never patch blindly.

## 4. What the gates do NOT judge

Beauty, originality, mood fit, brand voice. Those are the designer's (and
user's) judgment — the skill's job is to make sure the judgment is applied to
an asset that doesn't fall apart.
