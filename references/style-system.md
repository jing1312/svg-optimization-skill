# Style System for Visual Choices

Style directions should feel like different design systems, not recolored
copies. Describe each direction across four independent dimensions:

- **Composition**: grid, focal point, density, and cropping.
- **Material**: glass, paper, ink, metal, or flat surface treatment.
- **Motion**: calm, orbital, directional, layered, or none.
- **Mood**: calm, energetic, precise, tactile, or quiet.

Keep the semantic logo, copy, dimensions, and content order constant while
comparing directions. A useful first set is:

## Brand invariants across directions

J, K, and L are presentation choices inside one product system. They may change
the material, light direction, crop, and perceived temperature, but they do not
create separate brands:

- Keep `#5F61C7` / `#383B73` as the Logo, primary action, and structural indigo
  across every direction. A lighter surface can expose more `#A79AE8`, but it
  cannot recolor the mark to orange, teal, or pink.
- Keep `#24263A` and `#686979` for text, `#D8D8E5` for quiet borders, and
  `#54516F` for the shared shadow family.
- Keep `#56B59A` for every equivalent success, checked, ready, or completed
  state. Use `#E8A38F` only for a warm temperature cue or a genuinely different
  warning-like state.
- Keep approximately 80% neutral surfaces/structure, 15% indigo brand color,
  and 5% semantic or temperature emphasis. Each direction gets no more than
  one primary brand color and one semantic emphasis color.
- A gradient may describe pearl, paper, glass, or a passing highlight by
  blending the shared tokens. It must not become an extra palette.

This makes a style chooser useful: the user compares material and composition,
not three unrelated products wearing the same copy.

| Label | Composition | Material | Motion | Mood |
|---|---|---|---|---|
| A · Deep-sea glass | asymmetrical anchor with open reading field | translucent glass | slow orbital bubbles clipped by edges | calm, premium |
| C · Vital study | diagonal blocks and active lower rail | soft solid panels | forward sweep | energetic, approachable |
| D · Swiss editorial | strict columns and generous margins | paper and hairline rules | none | clear, cultured |
| E · Precision instrument | measured grid, readouts, and ticks | matte graphite with signal accents | calibrated pulses | technical, trustworthy |
| F · Layered paper | offset sheets and visible registration | tactile paper | stacked depth | warm, crafted |
| G · Refractive glass | overlapping panes and sliced highlights | refractive glass | light passing across planes | expressive, modern |
| H · Contour field | contour lines framing a quiet center | ink on tinted stock | flowing paths | exploratory, intelligent |
| I · Minimal signal | one strong mark and ample negative space | flat neutral surface | one directional cue | focused, efficient |
| J · Dreamy aurora | soft asymmetry with luminous ribbons | pearl glass with indigo light | drifting light bands | dreamy, gentle |
| K · Summer soda | open pearl field with a mint success cue | translucent pearl with a warm sun cue | buoyant bubbles and a rising sweep | bright, playful |
| L · Warm paper sun | layered pearl sheets with an offset mark | warm paper surface, indigo structure | slow folded depth | warm, human |

When the user asks for more options, expand to four to six directions, keeping
at least two dimensions different between neighboring options. Do not present
only palettes: every option needs a complete banner thumbnail plus a local
popup/UI crop, or a clear fallback description if the host cannot render SVG.

## Trigger and fallback

Offer choices only when the style is unknown, a redesign is requested, or the
user reports that the result feels plain, generic, or unattractive. If the
style is explicit or the task is a narrow overflow/measurement repair, apply it
directly and skip the chooser.

Use the richest output the host supports:

1. clickable cards in the conversation;
2. `assets/examples/style-options-example.svg` or a generated
   `style-options.svg` when files can be previewed;
3. a Markdown table with stable labels and concise descriptions.

The chooser is a comparison surface, not the final deliverable. After a choice,
generate the selected direction and run the same measurement, XML, logo, and
pixel checks as any other SVG.

## Dreamy detail language

Soft gradients become intentional when the rest of the card has a quiet,
repeatable system:

- Use a pale base, a 1 px tinted border, a faint inner keyline, and one soft
  motif field. Keep the motif on the visual side so the reading side stays calm.
- Give each card one dominant illustration. Use one stroke family, one node
  size, and one accent hierarchy; do not mix a graph, flower, waveform, and
  card in the same motif. Labels belong in the text column unless they carry
  essential state.
- Prefer motifs with meaning: node constellations for relationships, waveforms
  for audio or flow, plotted paths for progress, and tilted cards for memory.
  Build them from a few lines, nodes, arcs, and one accent mark instead of
  decorative stickers or generic sparkles.
- Write a motif brief before drawing: `message`, `visual nouns`, and
  `relationship`. For example, “chapters connect to concepts, and the check
  confirms the selected concept” becomes a node graph with a check node, not a
  flower or an unrelated waveform. If a motif cannot be explained in one
  sentence tied to the copy, remove it.
- Use a three-level text ladder: uppercase eyebrow at 11–12 px with measured
  tracking, display title at 28–34 px, and body at 13–15 px with a 1.35–1.5
  line-height. Leave 20–28 px between title and body, then anchor the card with
  a thin baseline or divider.
- Set a motif budget before drawing: one primary visual, one supporting action,
  and at most one soft glow. A large curve is not a detail system by itself;
  use a short straight rail or two-segment path when direction matters. If the
  viewer notices the decoration before the title, remove half of it.
- For Logo lockups, keep the semantic glyph unchanged while varying only the
  container treatment. Use an outer halo, a quiet ring, a rounded tile, a
  single inner keyline, and at most one clipped gloss or bloom; the halo must
  remain subordinate to the glyph while the effects fade into the card.

### Book-page mapping direction

When the user chooses a document or knowledge-mapping direction, use one
repeatable grammar across the board: page tabs or source rows on one side,
an outline or answer card on the other, and straight connectors that show the
actual transformation. Label stages or states when the copy names them (for
example `01 / 02 / 03` or `读 / 练 / 忆`). A shield, star, or colored node is
not a substitute for a chapter, concept, question, or answer. Add detail by
showing those real objects, their hierarchy, and their state changes rather
than by adding unrelated dots or decorative curves.

The reference implementation is `assets/examples/dreamy-detail-board.svg`.
It is intentionally a quiet four-card board: use it as a baseline, then add
detail only when the brief names the product meaning that detail carries.
