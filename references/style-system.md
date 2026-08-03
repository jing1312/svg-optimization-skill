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
