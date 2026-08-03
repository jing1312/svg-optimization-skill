---
name: svg-optimization
description: >-
  Create and optimize compact SVG illustrations for READMEs, documentation,
  and product pages, including banners, UI mockups, flow diagrams, social
  cards, icons, and logo lockups. Use when SVG text overflows, layout feels
  unbalanced, exported markup is bloated, or a project needs a polished vector
  asset. Use this skill for SVG redesigns, logo polish, and requests for
  multiple visual directions. The workflow measures text, selects semantically
  appropriate icons from established open-source libraries, records attribution,
  renders in a browser, and iterates from visual evidence.
---

# SVG Illustration and Optimization

Hand-author the composition and layout. For recognizable interface icons and
logo glyphs, prefer established open-source paths over improvised geometry.
The goal is a small, legible SVG with an intentional visual idea, not merely a
file that passes structural checks.

## Safety boundary

Public skill repositories must contain reusable guidance, not private working
context.

- Never commit chat transcripts, raw user feedback, internal handoff notes,
  local usernames, home-directory paths, tokens, or private project prompts.
- Generalize a useful observation into a rule without preserving its source or
  original wording.
- Use fictional names and `example.com` in public examples.
- Before publishing, run `npm test`; its privacy checks scan tracked files.

## Workflow

1. Write a one-line content brief: audience, message, format, and intended use.
2. Define the canvas, type ladder, palette, and layout regions before drawing.
3. Write a logo brief before choosing a glyph.
4. Build the SVG in layers: root, metadata, defs, background, content, details.
5. Measure every visible string with `scripts/measure_text.html`, then backfill
   box widths and chained coordinates.
6. Render the file in a browser and inspect the actual pixels at target size.
7. Run structural and logo checks, then iterate on visual issues.

## Style selection and visual comparison

Do not interrupt a simple repair when the desired style is already explicit.
Offer style selection when the brief is ambiguous, the user asks for a redesign,
or the user says the result is plain, generic, or unattractive. Read
`references/style-system.md` and show two or three complete directions first.
Each direction must reuse the same title, copy, logo meaning, and canvas so the
comparison isolates design decisions rather than content changes. Show both a
banner thumbnail and a small popup/UI crop; a color swatch alone is not enough.

Use this delivery order:

1. Present named directions with one-line differences in composition, material,
   motion, and mood. Keep A/C when they are preferred, then add clearly
   different editorial, instrument, paper, refractive, contour, signal,
   dreamy, summer, or warm directions as requested.
2. Let the user choose a direction before producing the final SVG. Then offer
   two or three palette/material variants within that selected direction.
3. Adapt the presentation to the host agent. Use clickable cards when the
   conversation supports them; otherwise write `style-options.svg`; if only
   text can be shown, use a Markdown table with the same thumbnails described
   by stable labels. The workflow must remain usable in Codex, OpenCode,
   Claude Code, and agents with no special UI.

## Privacy-first local preference learning

Preference learning is an optional, local-only recommendation aid. Ask before
persisting anything across sessions. Store only allowlisted numeric weights via
`scripts/preferences.mjs`; never store raw feedback, prompts, project names,
file contents, URLs, local paths, usernames, or free text. Preferences may
change the order of suggested styles, but never silently choose a style or
rewrite this public skill. Without a writable local profile, keep the signal in
the current session only.

Supported controls:

```text
node scripts/preferences.mjs show
node scripts/preferences.mjs forget --key material.glass
node scripts/preferences.mjs reset
```

Record a preference only after explicit consent, for example:

```text
node scripts/preferences.mjs record --key background.edge_clipped_bubbles --delta 1
```

Tell the user what is stored and how to forget it. The profile is outside the
repository by default, so sharing or publishing the skill does not share a
person's taste profile.

## SVG foundation

The root must include identical intrinsic dimensions and viewBox dimensions:

```svg
<svg xmlns="http://www.w3.org/2000/svg"
     width="1100" height="300" viewBox="0 0 1100 300"
     font-family="PingFang SC, Microsoft YaHei, sans-serif"
     role="img" aria-labelledby="title desc">
  <title id="title">Project banner</title>
  <desc id="desc">A short description of the visible composition.</desc>
</svg>
```

Keep `<defs>` near the top, define gradients and filters once, and reuse them
with `url(#id)`. Do not include editor namespaces, metadata dumps, embedded
rasters, scripts, or external resources.

## Logo brief

Do not begin with a favorite shape. Begin with semantic intent:

```text
subject: knowledge verification
action: organize and confirm
tone: precise, calm, capable
```

Use those three fields to select a glyph. Good source libraries include
Lucide (ISC), Tabler Icons (MIT), and Phosphor Icons (MIT). Prefer a single
strong silhouette or coherent stroke icon. Combine icons only when the second
mark adds essential meaning and remains legible at the final size.

Examples of semantic mapping:

| Intent | Suitable icon concepts |
|---|---|
| notes and writing | `notebook-pen`, `file-pen-line` |
| knowledge verification | `book-open-check`, `badge-check` |
| transcription | `audio-lines`, `mic`, `captions` |
| data export | `file-down`, `package-open` |
| automation | `wand-sparkles`, `workflow` |

Do not use `zap`, a generic sparkle, or a random monogram as an automatic
default. Use a generic symbol only when the product meaning genuinely matches
it, and record that decision with `data-logo-allow-generic="true"`.

### Assemble the mark

The container supports the glyph; it is not the concept.

- A tile is optional. Use one for app-icon or extension contexts, not for every
  diagram label.
- Derive colors from the surrounding product. Blue is not a universal default.
- If a halo is used, keep it local and soft. Its radius should be no more than
  `0.72 * tile width`; a large opaque disk competes with the mark.
- Keep glyph bounds around 58-68% of the tile. Adjust optical alignment after
  rendering rather than centering only by coordinates.
- Use one shadow and one subtle border at most. Avoid glossy ellipses, stacked
  effects, and decoration that reads louder than the glyph.
- Record intent, source, icon name, and license in data attributes.

```svg
<g data-role="logo"
   data-logo-intent="knowledge verification"
   data-icon-source="lucide"
   data-icon-name="book-open-check"
   data-icon-license="ISC">
  <circle data-role="logo-halo" cx="80" cy="80" r="43" fill="url(#halo)"/>
  <rect data-role="logo-tile" x="46" y="46" width="68" height="68" rx="17" fill="url(#tile)"/>
  <g data-role="logo-glyph" transform="translate(59.6 59.6) scale(1.7)"
     fill="none" stroke="#fff" stroke-width="1.7"
     stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 5v16"/>
    <path d="m16 12 2 2 4-4"/>
    <path d="M22 6V5a2 2 0 0 0-1.999-2L16 3.002A5 5 0 0 0 12 5a5 5 0 0 0-4-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 1.999 2H8a5 5 0 0 1 4 2 5 5 0 0 1 4-2h4.001A2 2 0 0 0 22 17v-1.344"/>
  </g>
</g>
```

The embedded glyph above is Lucide's `book-open-check`, used under the ISC
license. Preserve attribution in `THIRD_PARTY_NOTICES.md` when copying it.

## Measure text, then size containers

SVG `<text>` does not resize a backing `<rect>`. Measure with the same family,
size, and weight used in the SVG:

```js
const canvas = document.createElement('canvas');
const context = canvas.getContext('2d');
context.font = '600 18px "PingFang SC", "Microsoft YaHei", sans-serif';
context.measureText('Markdown export').width;
```

Then calculate:

```text
box width = measured width + 2 * horizontal padding
centered baseline = box y + box height / 2 + font size * 0.35
next x = current x + current width + gap
```

For pills, use at least 12 px horizontal padding per side; 18-20 px usually
looks better. Prefer `text-anchor="middle"` for labels. Recompute the whole row
when any label changes.

## Type and spacing

Use three or four font sizes. Adjacent levels should be visibly different.

- README banner: title 60-72, subtitle 22-28, metadata 16-18.
- UI mockup: title 22-28, section 15-17, body/action 14-16.
- Do not use tiny captions to make a layout fit. Resize the composition.
- Use a spacing ladder such as 8 / 16 / 24 / 32.
- Large headings need more space below than small labels.

Letter spacing should be `0` unless the typography has a specific measured
reason. Never rely on arbitrary tracking to make a heading feel designed.

## Composition patterns

### README banner

- Use a stable two-region composition: content plus a semantic visual anchor.
- Keep the main title in the first two thirds and the icon in the remaining
  region; do not force a centered stack.
- Keep the title-to-subtitle baseline gap around 0.85-1.05 times the title
  size, then a smaller gap before metadata.
- Limit decoration to one background motif. For translucent bubble depth,
  place the main circle centers outside the canvas or directly on an edge and
  clip the whole decoration layer with the banner's rounded rectangle. Show
  fragments, not a row of fully visible circles. Vary scale and opacity, keep
  the reading area quiet, and use at most one faint highlight arc per bubble.
- Rounded corners are appropriate for a standalone banner but not mandatory
  when the image is intended to bleed into a page background.

### UI mockup

- Show a believable product state, not a catalog of decorative cards.
- Browser chrome should remain secondary and compact.
- Use cards only for repeated records, statuses, and actual framed tools.
- Peer actions belong in one row when space allows.
- Align icons and labels as a single lockup; do not place a huge halo above a
  disconnected title.
- Use color by meaning. Equivalent success states share one success color.

See `references/design-patterns.md` for copy-ready layout patterns and
`references/logo-system.md` for icon selection and optical checks. Read
`references/style-system.md` when preparing visual choices.

## Browser verification

Inspect rendered pixels, not only source code:

1. Open the SVG in a browser at its intrinsic size.
2. Check the full composition and the logo at 100%, 50%, and favicon-like size.
3. Confirm text padding, baselines, icon clearspace, contrast, and clipping.
4. Compare against the brief: can a viewer infer the subject without reading
   the title?
5. Iterate until visual defects stop changing between passes.

## Automated checks

From the skill repository:

```bash
npm test
node evals/grade.mjs --check-logo assets/examples/banner-example.svg
node evals/grade.mjs --workspace ./my-eval-workspace --iteration iteration-1
```

Automated checks are guardrails. They catch leakage, missing provenance,
unbounded effects, inaccessible markup, overflow, and structural regressions.
They cannot prove that a logo is distinctive or beautiful; browser inspection
against the semantic brief remains required.

## Delivery checklist

- [ ] Public content contains no private prompt, transcript, local path, or user identifier.
- [ ] SVG includes matching width, height, and viewBox.
- [ ] SVG has non-empty `<title>` and `<desc>`.
- [ ] Logo has a written semantic intent and a matching glyph.
- [ ] Third-party icon source, name, and license are recorded.
- [ ] Generic bolt/sparkle marks are not used without an explicit reason.
- [ ] Halo is subordinate to the tile; glyph has optical clearspace.
- [ ] Text was measured with the rendered font stack.
- [ ] Boxed text is centered and padded; sibling elements do not overlap.
- [ ] Font sizes and spacing come from small, consistent ladders.
- [ ] The SVG was rendered and inspected at target size.
- [ ] `npm test` and the relevant eval command pass.
