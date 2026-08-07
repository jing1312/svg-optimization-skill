# Style Library

Two halves: **archetypes** (structural looks, style-agnostic) and **derivation
rules** (how to build a custom style from a user's brand color). Pick an
archetype first, then instantiate it with a palette — preset or derived.
Directions in one project share identical copy and canvas; only palette and
material differ, so comparison is honest.

## 1. Archetypes

### F · Flat & geometric
- Solid panels, crisp shapes, zero gradients or only 2-stop subtle ones; no
  halos, no gloss.
- One ink color for text; ≤ 3 accent colors, each with a job (action, data,
  decoration in that order).
- Shadows: none, or a single hard offset shape at ≤ 0.12 opacity.
- Use for: tech/editorial brands, dense feature grids, print-adjacent assets.

### A · Aurora gradient (soft dreamy)
- Base: 2-stop vertical gradient between two low-saturation tints
  (e.g. `#eef4ff → #f6efff`).
- Aurora ribbons: 2–3 color gradient strokes/blobs, opacity ≤ 0.55, blur
  `stdDeviation` 12–24, always fading to 0.
- Ink: deep desaturated blue/violet instead of black; shadow tinted with the
  dominant accent at 14–20 % opacity.
- Airy glass material: one gloss pass max; edge-clipped bubbles ≤ 2 edges.
- Use for: consumer/friendliness, learning & lifestyle products, "light air"
  moods.

### G · Glassmorphism
- Dark or image-like backdrop; cards = translucent white `0.06–0.14` fill +
  1 px inside keyline at `0.25` white + soft shadow.
- Blur behind cards only (`feGaussianBlur` ≤ 24); never blur text.
- Text white ≥ 90 % lightness on dark backdrops; body at ≥ 70 %.
- Use for: dashboards, AI/crypto product surfaces, dark-mode heroes.

### N · Dark neon
- Base: near-black with hue bias (`#0a0a1a → #141432`).
- Neon via gradient *strokes* (2–3 hues); glow = one `feDropShadow` or blur
  pass per element at `stdDeviation ≤ 10` — never overlapping halos.
- Star/speck dots ≤ 2 px radius, ≤ 12 per canvas, behind content.
- Text ink ≥ `#e6e9ff`; no warm colors unless they are THE accent.
- Use for: gaming, events, nightlife, launch posters.

### I · Ink sketch (line art)
- Paper base (`#fdfcf8`), single ink color, unified stroke width (~2.4 px);
  no gradients, no halos — the paper carries the airiness.
- Exactly one accent color (vermilion-family), reserved for the check/verify/
  focus mark; never decorative.
- Use for: editorial, humanist brands, "quiet confidence" direction.

### E · Editorial poster
- Portrait canvas; 24 px outer frame, content grid starting ≥ 72 px in.
- One oversized display headline (96–120 px), ≤ 3 lines, one phrase per line;
  third line may take the single accent color.
- Numbered info sections (01/02/03) on thin rules: heading ~20 px + note ~13 px.
- One semantic motif total, placed opposite the headline; ghost numerals ≤ 0.12
  opacity and never over body text. Whitespace is the luxury signal.

### P · Premium serif ad
- Dark ground (≤ `#1a212c`) + one metallic accent (gold family `#d3b57a`).
- Serif display type on strict center axis: eyebrow → hairline → logo → title
  → subtitle → capability line → CTA. Whitespace ≥ 40 %.
- Restraint rules: no halo layer, no bubbles, at most one spot glow ≤ 0.16;
  hairlines 1 px fading to 0 at both ends; eyebrow `letter-spacing ≥ 8 px`;
  body gray no darker than ~`#8d94a3` at ≥ 12 px.
- Use for: luxury, hospitality, flagship announcements.

### S · Paper / craft
- Warm paper base with cut-paper cards, one folded corner per card; shadows
  warm-brown ≤ 16 %; highlight is a sunbeam fade.
- Tangible but quiet: no gloss, minimal radius, stitched/dashed keylines.
- Use for: education, kids, cozy community products.

Register each chosen direction in markup:
`<g data-style-id="aurora" data-style-family="A">` — one line of provenance per
asset, so future iterations change style deliberately.

## 2. Orthogonal axes

Archetype (material) × palette (season) × layout (composition) are
independent: any palette can ride any archetype; any layout can host either.
When a user says "换个风格":

- same structure, new colors → new palette (season axis);
- same colors, new texture → new archetype (material axis);
- same content, new arrangement → new layout (poster/ad/grid axis).

Ask or infer which axis they mean; produce directions that differ on exactly
that axis.

## 3. Deriving a custom style from a brand color

Given a brand primary `B` (and optionally secondary):

1. **Decide temperature** from the brand: warm primaries keep warm lights and
   shadows; cool primaries keep cool ones. Never mix a warm halo with a cool
   base.
2. **Base:** mix `B` toward white at 92–96 % lightness for light archetypes,
   toward near-black at 8–14 % lightness for dark ones. Keep the base hue
   within ±10° of `B`.
3. **Ink:** same hue family as `B`, lightness ≤ 30 % (light themes) or ≥ 88 %
   (dark themes). Never pure black/white next to a tinted base.
4. **Accents:** `B` itself + one analogous hue (±30°) + one sparing highlight.
   Total ≤ 4 chromatic colors; more reads as collage.
5. **Contrast gate:** every text/accent pairing must clear C1 (4.5:1 normal,
   3:1 large). If the brand color fails on the base, shift lightness until it
   passes — record the adjusted token, not the raw brand hex, in the asset.
6. **Shadow tint:** dominant accent at 14–20 % opacity, never gray-on-white
   mud (`#000` shadows at > 0.1 over tinted bases).

Write the derived tokens into the motif brief header comment so the next
iteration doesn't re-derive them from scratch.

## 4. Anti-collage rule

If an asset reads as "stickers on a background" — elements without a shared
grid, stroke width, light direction or color family — stop adding. Pick the
one motif that matters (brief §1), rebuild around it, and re-add layers within
the budget. Collage is a removal problem, never an addition problem.
