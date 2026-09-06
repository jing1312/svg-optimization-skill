---
name: svg-optimization
description: >-
  Design, generate, restyle and validate SVG assets through a complete visual
  direction system: create banners, UI mockups, flow diagrams, social cards,
  icons, and logo lockups for READMEs, documentation, and product pages. Use
  when SVG text overflows, layout feels unbalanced, exported markup is
  bloated, or a project needs a polished vector asset. The workflow applies
  design tokens and style archetypes, measures text, selects semantically
  appropriate icons from established open-source libraries, records
  attribution, renders in a browser, and iterates from visual evidence
  through tiered quality gates.
---

# SVG Visual Direction Engine

Hand-author the composition and layout. For recognizable interface icons and
logo glyphs, prefer established open-source paths over improvised geometry.
The goal is a small, legible SVG with an intentional visual idea — not merely
a file that passes structural checks.

> SVG 不是代码片段，而是一套视觉语言。门禁保证 SVG 不坏，设计系统保证 SVG 不普通。

A high quality SVG is built in this order: Intent → Visual Concept →
Composition → Style System → Design Tokens → Material → Motion →
Verification. Never start from effects: blur, gradients, shadows, and
particles are implementation details, not design.

## Safety boundary

Public skill repositories must contain reusable guidance, not private working
context.

- Never commit chat transcripts, raw user feedback, internal handoff notes,
  local usernames, home-directory paths, tokens, or private project prompts.
- Generalize a useful observation into a rule without preserving its source or
  original wording.
- Use fictional names and `example.com` in public examples.
- Before publishing, run `npm test`; its privacy checks scan tracked files.

## When to use

Use this skill when a project needs a new SVG asset, a repair to an existing
one, a restyle across a family of assets, or several visual directions to
choose from. Skip the full design pass for a narrow overflow fix or markup
cleanup.

## Workflow

For a new direction or substantial redesign, read
`references/design-system.md` before drawing. If the style needs a stronger
system backbone, also read `references/style-library.md`,
`references/design-tokens.md`, and `references/anti-ai.md`.

1. Define the visual brief: artifact, audience, primary message, reading order,
   mood, semantic motif, and delivery constraints.
2. Choose one design language. If style is unresolved, compare complete
   directions from `references/style-system.md` with the same content.
3. Write a semantic logo brief and select a glyph before styling its container.
4. Assign role-based color tokens, including surfaces, text, brand, semantic
   state, border, highlight, and shadow.
5. Map every text role to a type scale and every group to a spacing rhythm.
6. Build the SVG in layers: root, metadata, defs, background, content, and one
   coherent semantic motif. Stay inside the material and effect budget
   (`references/design-principles.md`).
7. Add motion only when it communicates entrance, progress, state change, or
   material response; preserve a complete static state
   (`references/motion-library.md`).
8. Measure every visible string with `scripts/measure_text.html`, then backfill
   box widths and chained coordinates.
9. Render the file in a browser and inspect the actual pixels at target size,
   50%, and the smallest logo size.
10. Compare the candidate with its sibling directions or incumbent using the
    five-part scorecard in `references/design-system.md`.
11. Run structural and logo checks, then iterate on visual issues.

## Style-choice flow

Do not interrupt a simple repair when the desired style is already explicit.
Offer style selection when the brief is ambiguous, the user asks for a redesign,
or the user says the result is plain, generic, or unattractive. Read
`references/design-system.md`, then `references/style-system.md`, and show two
or three complete directions first.
Each direction must reuse the same title, copy, logo meaning, and canvas so the
comparison isolates design decisions rather than content changes. Show both a
banner thumbnail and a small popup/UI crop; a color swatch alone is not enough.
For dreamy or pastel directions, also vary the motif language deliberately
(networks, waves, progress paths, or memory cards) and apply a measured eyebrow,
display title, body, and baseline rhythm. Read the detail guidance in
`references/style-system.md` before drawing decorative patterns. Keep the
motif budget explicit: one focal illustration per card, one supporting action,
and no large curve, ring, or node field unless it explains the product action.
When a user says a new version is worse than the previous one, compare against
the incumbent first and remove additions before inventing another layer.

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

## Design tokens and visual system

Colors, type, spacing, stroke, and canvas sizes come from a single source of
truth, not isolated taste decisions:

```js
import { T } from "./scripts/tokens.js";
T.font.title     // 48
T.space(2)       // 16
T.stroke.medium  // 2
T.canvas.banner  // { w: 1100, h: 300 }
```

Five archetypes anchor the style library (`references/style-library.md`):
Dreamlight, Editorial, Material Craft, Glass Intelligence, and Mono System.
Pick one `Archetype × Palette × Layout` combination and never mix styles
randomly. For JSON-driven generation use `scripts/generate-svg.mjs`
(`node scripts/generate-svg.mjs --layout banner --palette dreamlight --title "标题"`),
which computes coordinates from the token system.

Materials must behave physically — glass has transparency, reflection, and
depth; paper has grain, edge, and warm shadow; light has direction, source,
and falloff. Never use material effects as decoration. Premium design comes
from editing, not accumulation: reject random gradient blobs, meaningless glow
spheres, excessive glass layers, decorative particle fields, and
icon-title-subtitle templates (`references/anti-ai.md`).

## Typography

Use three or four font sizes. Adjacent levels should be visibly different.

- Default scale: display 72, title 48, section 32, heading 24, body 18,
  caption 13 (`references/typography.md`).
- README banner: title 60-72, subtitle 22-28, metadata 16-18.
- UI mockup: title 22-28, section 15-17, body/action 14-16.
- Do not use tiny captions to make a layout fit. Resize the composition.
- Use a spacing ladder such as 8 / 16 / 24 / 32.
- Large headings need more space below than small labels.

Letter spacing should be `0` unless the typography has a specific measured
reason. Never rely on arbitrary tracking to make a heading feel designed.
Typography has priority over decoration.

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

## Logo rules

The container supports the glyph; it is not the concept.

- A tile is optional. Use one for app-icon or extension contexts, not for every
  diagram label.
- Derive colors from the surrounding product. Blue is not a universal default.
- If a halo is used, keep it local and soft. Its radius should be no more than
  `0.72 * tile width`; a large opaque disk competes with the mark.
- Keep glyph bounds around 58-68% of the tile. Adjust optical alignment after
  rendering rather than centering only by coordinates.
- Use a bounded effect stack when the visual brief calls for a soft editorial
  or dreamy finish: one colored shadow, one ambient bloom, one quiet ring, and
  one inset highlight are acceptable when each layer has a distinct job. Avoid
  unbounded blur, duplicate glows, or decoration that reads louder than the
  glyph. The goal is controlled depth, not a flat tile and not a pile of
  effects.
- Record intent, source, icon name, and license in data attributes.
- Prefer one original fused mark over an icon assembly when the brand allows
  it: a single silhouette that carries the semantics in one gesture, declared
  with `data-logo-intent` and no `data-icon-source`.

```svg
<g data-role="logo"
   data-logo-intent="knowledge verification"
   data-icon-source="lucide"
   data-icon-name="book-open-check"
   data-icon-license="ISC">
  <circle data-role="logo-halo" cx="80" cy="80" r="43" fill="url(#halo)"/>
  <rect data-role="logo-tile" x="46" y="46" width="68" height="68" rx="17" fill="url(#tile)"/>
  <g data-role="logo-glyph" transform="translate(59.6 59.6) scale(1.7)"
     fill="none" stroke="#FFFFFF" stroke-width="1.7"
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
- For semantic detail cards, use one illustration grammar across the board:
  either straight relationship lines, a quiet directional rail, or layered
  documents. Do not combine a prominent wave, constellation, halo, and extra
  card inside one motif. Curves are an accent, never the subject.
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
`references/design-system.md` for the shared color, type, spacing, material,
motion, and anti-pattern gates. Read `references/style-system.md` when preparing
visual choices, and `references/premium-craft.md` for dark editorial and
dreamlight flagship treatments.

## Memory and local preferences

Two kinds of memory help future runs without leaking private context:

- Design memory (`memory/successful-compositions.md`,
  `memory/rejected-patterns.md`) records which compositions worked and which
  rules to reject, generalized into reusable guidance.
- Preference learning is an optional, local-only recommendation aid. Ask before
  persisting anything across sessions. Store only allowlisted numeric weights
  via `scripts/preferences.mjs`; never store raw feedback, prompts, project
  names, file contents, URLs, local paths, usernames, or free text. The
  workflow must never silently choose a style: preferences may reorder
  suggestions, but the user always picks.

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

## Visual editor for human fine-tuning

When the user wants hands-on adjustments — nudging positions with snap guides,
equal-spacing a badge row, swapping themes, inserting ready-made components —
point them at `scripts/editor.html` (double-click to open, Chrome/Edge):

- Drag the SVG file in (or use 打开), edit visually, and Ctrl+S writes back to
  the same file via the File System Access API.
- Smart snapping is on by default: guide lines (edge/center), live equal-gap
  detection, and same-kind recognition that snaps badges into columns with
  matching widths. Hold Ctrl to place freely.
- Double-click any text to retype it; its container re-measures and re-fits
  automatically — the same measure-and-backfill rule this skill encodes.
- 12 built-in themes apply with preview-then-confirm; the chosen theme is
  remembered between sessions, and components can be locked to a custom
  palette (`🎨 收藏配色`) that survives theme switches.
- `g`/`path` elements support the same 8-way resize handles (anchor-preserving
  scale transforms); layout templates arrange the current selection with one
  undo step; the mix dropdown styles newly inserted components (solid, band
  gradient, aurora gradient, or color cycling).
- `◐ 体检` flags text that fails WCAG contrast against its background (3:1
  large text, 4.5:1 body) with on-canvas markers, and theme previews warn
  before applying a low-contrast recolor. PNG export supports Shift-click
  content trimming.
- Exports strip every editor artifact, so files remain hand-written-clean
  after round-trips.

A separate config-driven previewer for the JSON generator lives in
`tools/editor/` (serve the repo over HTTP and open `/tools/editor/`).

## Verification tiers

Technical correctness is necessary but not sufficient. Verify in tiers:

### T0 Visual reasoning

Check concept clarity, hierarchy, composition, and style consistency against
the brief and `references/design-review-checklist.md`.

### T1 Machine validation

```bash
npm test
node evals/grade.mjs                                  # gates over examples/ and docs/
node evals/grade.mjs --check-logo assets/examples/banner-example.svg
node evals/grade.mjs --workspace ./my-eval-workspace --iteration iteration-1
node evals/aggregate.mjs --workspace ./my-eval-workspace --iteration iteration-1
```

Gates: XML validity, reference integrity, duplicate IDs, logo provenance,
bounded blur, motif messages, geometry (G1 text inside canvas, G2 text fits
containers, G3 text/motif separation, G4 no text overlap) and contrast
(WCAG 4.5:1 / 3:1). Automated checks catch leakage, missing provenance,
unbounded effects, inaccessible markup, overflow, and structural regressions.
They cannot prove that a logo is distinctive or beautiful.

### T2 Render review

```bash
node scripts/render.mjs asset.svg
```

Inspect the actual pixels at intrinsic size, 50%, and favicon-like size:
visual balance, typography, spacing, material realism, aesthetic quality
(`evals/aesthetic-score.md`). Confirm text padding, baselines, icon
clearspace, contrast, and clipping. Compare against the brief: can a viewer
infer the subject without reading the title? Iterate until visual defects stop
changing between passes.

A green technical check does not mean the design is good.

## Brand packs

A brand pack freezes a fully worked brand: `brand-packs/zhiliao-study.md`
declares its single fused mark, seasonal directions, and example renders under
`examples/zhiliao-study/`. Brand packs are references, not templates — the
skill files themselves stay brand-neutral, and new work must not reuse a
frozen brand's identity for a different product.

## Delivery checklist

- [ ] Public content contains no private prompt, transcript, local path, or user identifier.
- [ ] Visual brief, reading order, and semantic motif are written before styling.
- [ ] One archetype, one palette system, one layout grammar — chosen, not mixed.
- [ ] Colors, typography, spacing, material, and motion use explicit token roles.
- [ ] The anti-pattern gate in `references/design-system.md` has no unresolved rejection.
- [ ] SVG includes matching width, height, and viewBox.
- [ ] SVG has non-empty `<title>` and `<desc>`.
- [ ] Logo has a written semantic intent and a matching glyph or fused mark.
- [ ] Third-party icon source, name, and license are recorded.
- [ ] Generic bolt/sparkle marks are not used without an explicit reason.
- [ ] Halo is subordinate to the tile; glyph has optical clearspace.
- [ ] Text was measured with the rendered font stack.
- [ ] Boxed text is centered and padded; sibling elements do not overlap.
- [ ] Font sizes and spacing come from small, consistent ladders.
- [ ] Materials behave physically; every effect layer has a distinct job.
- [ ] Motion has a semantic purpose and a complete static fallback, or is omitted.
- [ ] The candidate was compared with sibling directions or the incumbent.
- [ ] The SVG was rendered and inspected at target size.
- [ ] `npm test`, the quality gates, and the relevant eval command pass.
