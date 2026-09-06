# Design System Foundation

Use this foundation for every new SVG direction and every substantial visual
redesign. It turns taste into a sequence of decisions that can be explained,
compared, and checked. It is not a fixed theme: the same system can produce a
dreamy summer banner, a warm editorial card, or a precise technical diagram.

## 1. Visual brief

Write these fields before choosing colors or effects:

```text
artifact: README banner
audience: developers evaluating a study extension
primary message: turn source material into a verified review path
reading order: product name -> promise -> proof -> action
mood: warm, capable, lightly dreamy
semantic motif: source cards converge into one checked outline
constraints: 1100 x 300, readable at 50%, static fallback required
```

The primary message must survive after every decorative layer is hidden. When
the copy does not suggest a meaningful visual noun or relationship, prefer a
quiet surface over invented symbolism.

## 2. Visual hierarchy

Design one reading path, not a field of equally loud objects.

- Give the composition one focal point: usually the title or semantic mark.
- Use three content levels: focal, supporting, and metadata. A fourth level is
  acceptable only in a product UI with real state or controls.
- Keep the reading field calm. Place stronger material effects in the visual
  anchor region or at the canvas boundary, not behind small text.
- Use contrast, scale, and spacing together. Do not compensate for weak
  hierarchy by making every heading bold or every section a card.
- At thumbnail size, the first and second reading targets should still be
  obvious without zooming.

### Attention budget

Use at most one item from each row unless the brief proves a second is needed:

| Layer | Default budget |
|---|---|
| focal | one title or one logo lockup |
| illustration | one semantic motif family |
| material | one surface language and one shadow family |
| atmosphere | one ambient glow or one edge-clipped bubble field |
| accent | one primary accent and one supporting accent |

If two elements compete for the first glance, reduce or remove one before
adding another effect.

## 3. Role-based color system

Name color roles before assigning values. A palette is coherent when a color
has the same job everywhere, not when every object uses a nearby hue.

### Shared brand tokens

All public examples in this skill use the following “dreamy premium” token
set. The neutral surfaces keep the reading field calm; indigo carries brand
recognition; mint and coral are reserved for real state or temperature cues.

```text
surface.canvas      #F5F3F0
surface.card        #FBFAF8
text.primary        #24263A
text.secondary      #686979
brand.primary       #5F61C7
brand.deep          #383B73
brand.supporting    #A79AE8
semantic.success    #56B59A
semantic.warm       #E8A38F
border.quiet        #D8D8E5
effect.highlight    #FFFFFF
effect.shadow       #54516F
```

Treat these values as cross-asset invariants, not suggestions. A banner may
use `brand.deep` as its field and a card may use `surface.card`, but a Logo,
primary action, body text, border, and successful state must retain the same
role wherever they appear. Gradients may interpolate between tokens to show
material, light, or depth; they must not introduce a new accent family.

Use the 80/15/5 balance as a practical audit: roughly 80% neutral surface and
structure, 15% indigo brand color, and 5% semantic or temperature emphasis.
Each asset gets at most one main brand color and one semantic emphasis color.

```text
surface.canvas
surface.raised
surface.tint
text.primary
text.secondary
border.quiet
brand.primary
brand.supporting
semantic.success
semantic.warning
semantic.error
effect.highlight
effect.shadow
```

- Start with surfaces and text, then add one brand accent. Add a supporting
  accent only when it separates a second semantic role.
- Prefer `surface.canvas` and `surface.card` for large areas. Use `text.primary`
  and `text.secondary` for all reading copy; do not recolor type to match a
  card's atmosphere.
- Use `brand.primary` and `brand.deep` for Logo containers, primary actions,
  rails, and structural connectors. `brand.supporting` is a light treatment,
  not a second product identity.
- Use `semantic.success` for every equivalent ready, checked, or completed
  state. Use `semantic.warm` only for a warning-like or warm seasonal cue.
- Use `border.quiet`, `effect.highlight`, and `effect.shadow` as shared
  material primitives so cards do not grow their own border and shadow hues.
- Keep success, warning, and error colors stable across the whole asset suite.
  Do not recolor them to match each card.
- Use one dominant gradient family per surface. Its stops should describe
  light, depth, or temperature; random gradients between unrelated accents
  are not a design system.
- Reserve the highest chroma for the focal mark, primary action, or one proof
  state. Most of the canvas should be quieter.
- Dreamy palettes may combine lavender, sky, peach, or mint, but each still
  needs a neutral text color, a quiet border, and a legible surface role.
- Warm palettes need a cool or neutral structural color so the page does not
  collapse into cream, orange, and brown.
- Check important text and controls for WCAG contrast. Decorative translucency
  cannot be the only boundary between content and background.

## 4. Typography scale

Choose type by content role, then keep that mapping stable across the suite.

| Role | README banner | Compact UI | Line height |
|---|---:|---:|---:|
| display | 60-72 px | 26-32 px | 1.05-1.16 |
| section | 24-30 px | 18-22 px | 1.18-1.3 |
| body | 18-24 px | 14-16 px | 1.4-1.55 |
| metadata | 15-18 px | 12-14 px | 1.3-1.45 |

- Use one sans family for product and UI work. Add one serif family only when
  the direction is explicitly editorial and the role split is clear.
- Use weight and size for hierarchy. Letter spacing stays `0` unless measured
  uppercase metadata needs a small positive value.
- Do not shrink body text to rescue a crowded layout. Remove content, enlarge
  the canvas, or change the composition.
- Measure the actual fallback font stack. Chinese and Latin strings with the
  same character count do not occupy the same width.
- Keep paragraphs to short, intentional line lengths and align multi-line text
  to a consistent baseline rhythm.

## 5. Spacing rhythm

Use an 8 px base rhythm with 4 px half-steps for optical correction:

```text
4 / 8 / 12 / 16 / 24 / 32 / 48 / 64
```

- Repeated peers use identical insets, gaps, and baseline positions.
- Space between unrelated groups must be larger than space within a group.
- A title needs more space below it than a metadata label. Avoid identical
  16 px gaps between every element.
- Optical corrections may move a glyph or baseline by 1-4 px; they do not
  create a second spacing system.
- Containers must not change size when labels, hover states, or loading text
  appear. Measure the longest intended state.

## 6. Material and effect budget

Choose one material language for a surface: glass, paper, ink, metal, or flat.
Effects should explain that material instead of becoming independent stickers.

- Use one shadow family with shared hue, softness, and light direction.
- Use at most one ambient bloom near a focal mark. Multiple competing glows or
  rings flatten hierarchy even when each one is individually subtle.
- For glass, combine a tinted translucent fill, quiet border, restrained inner
  keyline, and one directional highlight. Blur is atmosphere, not structure.
- For paper, use edge contrast, slight offset, and restrained shadow instead
  of glass blur.
- Edge-clipped bubbles may enter from outside the canvas and fade before the
  reading field. Use two to four unequal forms, not a repeated circle pattern.
- Obvious decorative curves are rejected unless the curve represents a real
  path, flow, orbit, waveform, or boundary. Even then, it supports the subject
  and does not become the subject.
- The logo glyph remains the highest-contrast layer in its lockup. A large
  container, halo, gloss, or shadow cannot rescue a generic symbol.

## 7. Semantic motif rules

Write a motif brief before drawing:

```text
message: chapters become a verified review path
visual nouns: chapter nodes, selected outline, check
relationship: nodes feed the outline; the check confirms the result
```

Every visible motif must map to one of those nouns or relationships. Use one
grammar across related cards: nodes and straight connectors, layered documents,
measured signal bars, or a directional rail. Do not mix unrelated motifs merely
to fill empty space. Empty space is a valid part of the composition.

Decorative accents such as sparkles, dots, and rings may clarify material or
focus, but they do not count as semantic detail. Remove them when they cannot
be explained without referring to their appearance.

## 8. Motion principles

Motion must communicate entrance, progress, state change, or material response.
If the same animation could be pasted onto an unrelated product, it is probably
decoration rather than communication.

- Use opacity and transform for most motion; keep the final static state fully
  readable when animation is unsupported.
- UI feedback typically lasts 160-240 ms. A staged illustration reveal may
  take 600-1000 ms. Ambient drift, when justified, should be subtle and slow.
- Keep one primary motion and at most one subordinate response. Avoid perpetual
  bounce, spin, pulse, or path morphing with no semantic purpose.
- Do not animate reading text, essential borders, or several independent motif
  groups at once.
- Respect `prefers-reduced-motion` in HTML hosts. For standalone SVG, provide a
  motionless default or an explicit static variant.
- Inspect the midpoint of every animation, not only its start and end. No frame
  may overlap text, expose unclipped effects, or shift the layout.

## 9. Anti-pattern gate

Reject or revise a direction before polishing when it contains any of these:

| Anti-pattern | Why it fails | Correction |
|---|---|---|
| random gradients | colors have no stable roles | define surfaces, text, brand, and semantic roles first |
| too many accent colors | everything asks for attention | keep one primary and at most one supporting accent |
| obvious decorative curves | the background becomes the concept | replace with a quiet field or a semantic path |
| unrelated motifs | details feel assembled from a sticker pack | write one motif sentence and delete unmatched forms |
| competing glows or rings | depth collapses into haze | keep one ambient layer near the focal mark |
| tiny typography | information hierarchy is being solved by shrinking | simplify content or enlarge the layout |
| inconsistent line-height | repeated text blocks lose rhythm | map every text role to one shared type scale |
| logo container overpowering glyph | decoration becomes more memorable than identity | reduce the container and strengthen the semantic glyph |
| motion without semantic purpose | animation adds noise and distracts from reading | tie it to state or remove it |
| card around every section | hierarchy becomes a grid of equal boxes | use spacing, dividers, and surface bands first |

## 10. Compare and verify

When style is unresolved, compare two or three complete directions with the
same copy, canvas, information order, and logo meaning. Do not compare palette
swatches alone. Include a full banner and a representative UI crop so material,
typography, and hierarchy are visible in context.

Score each candidate from 0-2 on these five questions:

1. Is the reading order obvious at thumbnail size?
2. Does every major motif relate to the content?
3. Are color, type, spacing, and effects internally consistent?
4. Is the mark legible and distinctive at its smallest delivery size?
5. Does the design feel restrained after the main idea is understood?

Reject a candidate with any zero. When revising an existing asset, include the
incumbent in the comparison; a new direction is not progress merely because it
contains more detail.

Then render, measure, and inspect at target size, 50%, and the smallest logo
size. Run structural checks only after the visual comparison; passing XML and
overflow checks does not make a composition good.

## 11. Privacy-first self-evolution

Self-evolution means local preference ranking, not autonomous rewriting of the
public skill.

1. Observe feedback in the current session.
2. Generalize it into a non-sensitive style dimension.
3. Ask before persisting the preference.
4. Store only an allowlisted numeric weight in the local profile.
5. Let the user inspect, forget, or reset that profile.

Never persist raw feedback, private prompts, project text, filenames, URLs,
usernames, local paths, generated assets, or conversation excerpts. Never send
the profile to a remote service, merge one person's preferences into defaults,
or let preference weights silently choose the final direction. A reusable rule
may enter the public skill only through an explicit, human-reviewed code change.
