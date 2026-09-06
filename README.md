# svg-optimization-skill

A practical skill for creating and repairing compact SVG assets used in
READMEs, documentation, and product pages.

The project combines hand-authored composition with measured typography and
semantically selected open-source icon paths. It includes polished examples,
an offline text measurement tool, visual style comparisons, privacy checks,
local preference controls, and structural/logo quality evaluation.

<p align="center">
  <img src="assets/examples/banner-example.svg" alt="Banner produced with this skill" width="640">
</p>

## Examples

Every figure below is a hand-authored SVG from `assets/examples/` — no image
generators, no design tools, just the workflow documented in this repository.
Open any of them in `scripts/editor.html` to see the visual editor round-trip.

<table>
  <tr>
    <td align="center">
      <img src="assets/examples/style-options-example.svg" alt="Style options comparison" width="340"><br>
      <sub>Complete style directions compared side by side</sub>
    </td>
    <td align="center">
      <img src="assets/examples/brand-theme-pair.svg" alt="Seasonal brand and theme pair" width="340"><br>
      <sub>Seasonal brand suite with matching theme tokens</sub>
    </td>
  </tr>
  <tr>
    <td align="center">
      <img src="assets/examples/dreamy-detail-board.svg" alt="Dreamy detail board" width="340"><br>
      <sub>Detail board with layered material and soft palette</sub>
    </td>
    <td align="center">
      <img src="assets/examples/popup-mockup-example.svg" alt="Popup mockup" width="340"><br>
      <sub>Popup mockup with measured typography</sub>
    </td>
  </tr>
  <tr>
    <td align="center" colspan="2">
      <img src="assets/examples/logo-concepts.svg" alt="Logo concept sheet" width="480"><br>
      <sub>Logo concepts with semantic motifs and bounded effects</sub>
    </td>
  </tr>
</table>

## What changed

- Logo generation now begins with a semantic brief instead of a fixed bolt or
  generic AI symbol.
- Copy-ready glyphs come from established icon libraries with source and
  license metadata.
- Halos and shadows have bounded proportions so effects cannot overwhelm the
  mark.
- SVG examples include accessible titles and descriptions.
- Style selection compares complete banner and popup treatments, not isolated
  color swatches, and works in agents with or without clickable UI cards.
- A shared design-system foundation now defines hierarchy, role-based color,
  typography, spacing, material, semantic motifs, motion, and rejection gates.
- Optional preference learning is local, allowlisted, and user-controlled. It
  reorders suggestions without rewriting the public skill or uploading taste.
- Eval scripts are repository-relative and work on any machine.
- Automated checks reject private handoff files, local home paths, and known
  project-specific identifiers in public templates.

## Installation

Copy this repository directory into the skills folder used by your agent:

```bash
# Codex
cp -r svg-optimization-skill ~/.codex/skills/svg-optimization

# Claude Code
cp -r svg-optimization-skill ~/.claude/skills/svg-optimization

# Agents / OpenCode
cp -r svg-optimization-skill ~/.agents/skills/svg-optimization
```

No runtime dependency is required for normal skill use. Node.js 20 or newer is
needed only for automated checks and eval tooling.

## Workflow

1. Define the visual brief, reading order, and semantic motif using
   `references/design-system.md`.
2. If style is unclear or a redesign is requested, compare two or three
   complete directions from `references/style-system.md` and let the user pick.
3. Choose the canvas and layout, then assign color, typography, spacing, and
   material roles from the shared design system.
4. Measure visible strings with `scripts/measure_text.html`.
5. Source a relevant glyph from Lucide, Tabler, or Phosphor and record its
   license.
6. Build and render the SVG in a browser.
7. Add motion only when it explains state or progress, with a static fallback.
8. Inspect at intrinsic and small sizes, compare against the incumbent, and
   apply the anti-pattern gate.
9. Run the automated checks.

## Visual editor

`scripts/editor.html` is a single-file, offline, dependency-free visual editor
(double-click to open; Chrome/Edge recommended). Drag an SVG in, edit it by
hand, and Ctrl+S writes back to the same file.

- Full smart snapping: red guide lines (edge/center), live equal-gap badges,
  and same-kind recognition that snaps a third badge into the column with the
  matching width and gap. Hold Ctrl to place freely.
- Double-click text to retype — containers re-measure and re-fit automatically.
- 8-way resize handles (rect / circle / ellipse / text / image), multi-select
  align + equal-distribute toolbar, layer lock/hide/rename/reorder, context menu,
  custom component library (`存为我的组件`).
- `g` and `path` resize via anchor-preserving scale transforms — consecutive
  resizes compose, and snapping/marquee stay correct because the mover's bbox
  already reflects the composed transform.
- Layout templates (布局 dropdown) arrange the current selection on the canvas:
  left-right columns, centered stack, title + feature row, and diagonal flow.
  Every arrangement is one undo step.
- Component colors follow the theme dropdown by default; `🎨 收藏配色` locks a
  palette captured from the selection so new components keep it across themes,
  and `↺ 跟随主题` restores theme-following. The chosen theme itself is
  remembered between sessions.
- `◐ 体检` runs a WCAG contrast check: it tests every text fill against the
  topmost solid background beneath it (3:1 for large text, 4.5:1 otherwise),
  marks failures with dashed red boxes and ratio badges (Esc clears), and the
  theme button pre-checks contrast before you apply a recolor.
- The mix dropdown (混色) styles newly inserted components: solid, vertical
  band gradient, diagonal aurora gradient, or cycling multi-color.
- 12 built-in themes with preview-then-confirm recoloring that preserves
  hand-picked colors; PNG 2x/4x export (Shift-click trims empty canvas margins
  to the content bounds); one-click clean-SVG copy; autosaved drafts with
  restore.
- Shortcuts: arrows nudge 1px (Shift 10px), Alt-drag duplicates, Ctrl+Z/Y undo,
  Ctrl+C/V, F focus selection, Ctrl+0 reset view, wheel zoom, Space+drag pan.

Rebuild the artifact after editing `src/editor/*`:

```bash
node scripts/build-editor.mjs
```

## Validation

```bash
npm test
npm run check

# Check one logo-bearing SVG
node evals/grade.mjs --check-logo assets/examples/banner-example.svg

# Grade a generated eval workspace
node evals/grade.mjs --workspace ./my-eval-workspace --iteration iteration-1
node evals/aggregate.mjs --workspace ./my-eval-workspace --iteration iteration-1
node evals/viewer.mjs --workspace ./my-eval-workspace --iteration iteration-1
```

The eval workspace defaults to `.eval-workspace/` and can also be set with
`SVG_EVAL_WORKSPACE`.

## Local preference controls

Persistence is opt-in. When enabled, the profile stays outside this repository
and stores only small numeric weights for known style dimensions. It never
stores prompts, raw feedback, project content, URLs, or local paths.

```bash
node scripts/preferences.mjs show
node scripts/preferences.mjs forget --key material.glass
node scripts/preferences.mjs reset
```

On hosts without a writable profile, keep preferences in the current session.

## Repository layout

```text
assets/examples/             Browser-verified banner, mockup, logo, and style choices
                            `brand-theme-pair.svg` shows the J/K seasonal suite
evals/                       Structural and logo quality checks
references/design-patterns.md
references/design-system.md
references/logo-system.md
references/style-system.md
scripts/measure_text.html    Offline text measurement tool
scripts/preferences.mjs      Local allowlisted preference profile CLI
SKILL.md                     Agent workflow and delivery checklist
PRIVACY.md                   Rules for safe public artifacts
THIRD_PARTY_NOTICES.md       Icon licenses and attribution
```

## Privacy

Do not store raw conversations, original user feedback, internal handoff
notes, private prompts, local paths, or secrets in this repository. Convert
useful feedback into anonymous, reusable guidance. See `PRIVACY.md`.

## License

Project code and documentation are MIT licensed. Embedded Lucide icon paths
are available under the ISC license; see `THIRD_PARTY_NOTICES.md`.
