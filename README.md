# svg-optimization-skill

A practical skill for creating and repairing compact SVG assets used in
READMEs, documentation, and product pages.

The project combines hand-authored composition with measured typography and
semantically selected open-source icon paths. It includes polished examples,
an offline text measurement tool, visual style comparisons, privacy checks,
local preference controls, and structural/logo quality evaluation.

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

1. Define the content and logo semantics.
2. If style is unclear or a redesign is requested, compare two or three
   complete directions from `references/style-system.md` and let the user pick.
3. Choose the canvas, layout regions, type ladder, and palette.
4. Measure visible strings with `scripts/measure_text.html`.
5. Source a relevant glyph from Lucide, Tabler, or Phosphor and record its
   license.
6. Build and render the SVG in a browser.
7. Inspect at intrinsic and small sizes.
8. Run the automated checks.

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
evals/                       Structural and logo quality checks
references/design-patterns.md
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
