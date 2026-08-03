# Style System for Visual Choices

Style directions should feel like different design systems, not recolored
copies. Describe each direction across four independent dimensions:

- **Composition**: grid, focal point, density, and cropping.
- **Material**: glass, paper, ink, metal, or flat surface treatment.
- **Motion**: calm, orbital, directional, layered, or none.
- **Mood**: calm, energetic, precise, tactile, or quiet.

Keep the semantic logo, copy, dimensions, and content order constant while
comparing directions. A useful first set is:

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
| J · Dreamy aurora | soft asymmetry with luminous ribbons | lavender-peach glass | drifting light bands | dreamy, gentle |
| K · Summer soda | sun disc, wave rail, and open sky | mint, aqua, lemon, coral | buoyant bubbles and a rising sweep | bright, playful |
| L · Warm paper sun | layered sheets with an offset mark | apricot, terracotta, cream | slow folded depth | warm, human |

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
- For Logo lockups, keep the semantic glyph unchanged while varying only the
  container treatment. Use an outer halo, a quiet ring, a rounded tile, a
  single inner keyline, and at most one clipped gloss or bloom; the halo must
  remain subordinate to the glyph while the effects fade into the card.

The reference implementations are `assets/examples/dreamy-detail-board.svg`
for the semantic baseline and `assets/examples/ornate-style-gallery.svg` for
the richer six-motif treatment.
