# Design Principles

The portable core of this skill: how to keep SVG assets meaningful, layered and
geometrically sound, independent of any brand or style preset.

## 1. Motif brief (required before drawing)

Every primary motif needs three lines:

```text
message: what the motif explains about the content/product
visual nouns: the concrete shapes used
relationship: how the nouns connect
```

Valid example:

```text
message: verification links chapters and concepts
visual nouns: open book, shield, chapter nodes, check
relationship: nodes orbit the book; shield sits at the relationship center
```

Rules:

- If a motif cannot be tied to the content in one sentence, delete it.
- Never add more decoration to rescue an unclear motif.
- Mark motifs in markup so gates and reviewers can see them:
  `<g data-motif="chapter-relations" data-motif-message="one sentence">`.
  Groups without `data-motif` are treated as neutral decoration by the gates —
  that is an escape hatch, not a license; reviewers should still ask why.

## 2. Composition baselines

- One primary focal element per asset. Secondary elements support it, never
  compete with it.
- Align to an implicit grid: shared left edge, shared centers, or equal card
  gutters. Three alignment systems in one canvas is noise.
- Negative space is a design element: premium compositions keep ≥ 30 % of the
  canvas visually quiet; busy directions still keep ≥ 15 %.
- Typography hierarchy has at most three levels (title / subtitle / caption).
  Title ≥ 34 px on banner-scale canvases, subtitle ≥ 17 px, captions ≥ 13 px.
  Never introduce a fourth level; change weight instead.
- Decorations that cross the canvas edge should do it in a clipped group
  (`clip-path`), deliberately, on ≤ 2 edges.

## 3. Text measurement (estimates, before any render)

- CJK glyphs advance ≈ `font-size × 1.0`; Latin/digits ≈ `font-size × 0.56`;
  space ≈ `0.32 × font-size`.
- Reserved width = advance + `0.12 × font-size` safety per side.
- Keep text ≥ 72 px away from decorated edge bands on banners.
- These are font-independent estimates for pre-flight only. The render tier
  (T2) is the authority; see `verification.md` and `typography.md`.

## 4. Six-layer effect budget (order matters)

Airiness is budgeted, not stacked:

1. Light gradient or solid base (2 stops, subtle).
2. One large ambient halo layer → airiness.
3. One colored soft shadow → lift.
4. One translucent liner / inner keyline → boundary.
5. One clipped gloss or fading highlight → material.
6. One primary illustration, unified stroke width, ≤ 2 emphasis colors.

Hard bans: unbounded blur (`stdDeviation > 24`), repeated glow passes on the
same element, random dot scatter, multiple unrelated primary motifs in one
asset. Every radial halo/gloss gradient must terminate at `stop-opacity="0"`.

Style archetypes may relax the *look* of these layers (ink sketch has no halo;
neon replaces shadows with glow) but not the discipline: each layer appears at
most once, in role order, with bounded parameters.

## 5. Geometry red lines (machine-enforced, G1–G4)

`evals/grade.mjs` enforces these on every asset; they are never negotiable:

- **G1 no canvas escape:** all text stays fully inside the viewBox. Explicit
  `clip-path` groups are the only exemption (edge-clipped decor).
- **G2 container fit:** text inside a chip/pill/button keeps ≥ 5 px left/right.
  Size the container from the *estimated* width first — never ship text that is
  longer than its container "waiting to be clipped".
- **G3 no occlusion:** text must not intersect any `data-motif` bounding box
  or logo bounding box. Decor moves out of the text's way or gets deleted.
- **G4 no text-on-text:** two text bounding boxes never overlap.

Estimates are just that — estimates (CJK = 1 em, Latin ≈ 0.56 em, transforms
composed as full affine matrices, paths included). A clean gate is necessary,
not sufficient: the render check is the release standard.

## 6. Logo rules — a single fused mark, not an assembly

A logo is a brand mark, so it obeys one law: **one gesture carries all the
meaning.** Start from the semantic brief (§1), then design a single fused form
where the brand's action lives inside the shape itself — e.g. the page of an
open book continuing directly into a verification check, with one accent node
at the stroke tip. If the reader needs a legend to decode the logo, the logo
has failed.

Construction rules:

1. **One mark, one silhouette.** Tile/ground + liner + the fused glyph + one
   accent node is the ceiling. No node rings, no shields, no second check, no
   halo louder than the mark. Every added element must *merge* into the
   silhouette, not sit beside it.
2. **The gesture survives 48 px.** Ship a 48 px preview beside every logo. In
   it, the primary gesture stays legible, thin strokes stay ≥ ~1.5 px, and the
   accent node stays visible. If two meanings fight at 48 px, one of them is
   decoration — cut it.
3. **Meaning by shape, not by count.** Two checks do not mean "more
   verification" — they mean "the designer wasn't sure." One confident gesture
   beats three anxious ones.
4. Provenance is metadata, not folklore: `data-role="logo"` and
   `data-logo-intent` always; `data-icon-source` / `data-icon-name` /
   `data-icon-license` only when genuinely derived from an icon set. An
   original mark declares `data-logo-secondary-motif` in one sentence instead.
5. Auto-fail: a second competing glyph; icon + ring + shield assembly; filler
   flowers/waveforms/molecules; strokes thinner than ~1.2 px at 24 px scale;
   any element that reads as "added to fill the corner."

## 7. Accessibility minimums

- Every root `<svg>` carries `role="img"` and a descriptive `<title>` (and
  optionally `<desc>`).
- Text-vs-background contrast: ≥ 4.5:1 for normal text, ≥ 3:1 for large text
  (≥ 24 px, or ≥ 18.5 px bold). Gate C1 checks the confident cases; do the
  eyeball pass on gradients.
- Don't encode meaning in color alone; pair color with shape or position.
