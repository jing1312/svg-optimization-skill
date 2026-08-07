---
name: svg-optimization-skill
description: >
  Design, generate, restyle and fix SVG assets — banners, posters, logos,
  illustration boards, cards, simple infographics — that are visually clean and
  bug-free, in many styles (flat, aurora gradient, glass, dark neon, ink sketch,
  editorial print, and brand-derived custom styles), with zero runtime
  dependencies. Use when asked to create or beautify SVG graphics, fix SVG text
  overflow / element overlap / broken rendering, choose between visual
  directions, or verify SVG layout quality. Ships machine-enforced layout gates
  (overflow, occlusion, overlap, dangling references, duplicate ids, contrast),
  a style library, and a tiered verification loop that degrades gracefully from
  "Node + browser" to "no tools at all".
---

# SVG Design & Optimization Skill

Produce SVG assets that are (1) genuinely good-looking, (2) free of layout and
rendering bugs, (3) stylistically controllable, (4) usable in any agent
environment. All guidance lives in `references/`; this file is the contract.

## 1. When to use

Trigger this skill when the user wants to:

- create or restyle an SVG asset (banner, poster, logo, illustration board,
  feature grid, style-exploration sheet),
- fix SVG defects: text overflow, element occlusion/overlap, broken gradients,
  invisible elements, font-fallback breakage,
- choose between several visual directions before committing,
- audit an existing SVG for layout or rendering bugs.

Do not trigger for raster image editing, chart-library code (ECharts/D3), or
animated/interactive SVG beyond static design.

## 2. Workflow (five steps, none skippable)

1. **Write a motif brief before drawing** (`references/design-principles.md` §1).
   Every primary motif must state message / visual nouns / relationship in three
   lines. If a motif cannot be tied to the content in one sentence, delete it —
   never add decoration to rescue an unclear motif.
2. **Pick a style** from `references/style-library.md`. If the direction is
   unclear, the user asks for a redesign, or says "太简单 / 不好看 / too plain",
   run the style-choice flow (§4) before finalizing. If the user supplies brand
   colors, derive the palette with the derivation rules (style-library §3)
   instead of picking a preset blindly. For hero images, banners, specimen
   sheets, or any ask for 高级感/premium feel, apply
   `references/premium-craft.md` — its anti-pattern blacklist overrides
   default habits (no pills, no gradient blobs, no dot rows, no centered
   triads).
3. **Build with the six-layer effect budget** (`design-principles.md` §4):
   layers in fixed order, capped count, bounded blur. No unbounded blurs, no
   repeated glow passes, no scattered decorative dots.
4. **Verify with the highest tier you can run** (§5). Never declare "done" on
   gate output alone when a render tier was available and skipped.
5. **State what you verified.** List the gates that ran and the tier reached;
   if you inspected a render, state what you checked (overflow, overlap,
   alignment, contrast, hierarchy) using `references/verification.md` §3.

## 3. Canvas defaults

| Asset | viewBox | Notes |
|---|---|---|
| promo/banner | `0 0 1100 300` | Title ≥ 34 px, subtitle ≥ 17 px, edge-clipped decor allowed |
| poster (portrait) | `0 0 900 1200` | One primary motif, generous margins |
| wide ad / hero | `0 0 1200 800` | Centered or strict-grid compositions |
| popup/UI mockup | `0 0 860 730` | Dark backdrop card, ≥ 24 px radii |
| feature grid | free | Unified card size, ≤ 2 emphasis colors per card |
| style chooser | free | One panel per direction, same copy across panels |

Other sizes are fine; the geometry gates (G1–G4) apply at every size.

## 4. Style-choice flow

When direction is ambiguous:

1. Produce 2–4 complete directions using the **same copy and canvas** so the
   comparison isolates style.
2. Show each direction as a real miniature of the final asset (not swatches).
3. One SVG sheet with panels is the most portable output; a Markdown table is
   the fallback for text-only channels. Never depend on editor-specific features.
4. Only after the user picks, produce the final asset. Skip this flow for
   simple overflow/bug fixes.

## 5. Verification tiers (use the highest available)

- **T0 — static self-check (always available, zero tools):** walk
  `references/verification.md` §2 checklist by reasoning over the SVG source.
- **T1 — machine gates (needs Node ≥ 18):**
  ```bash
  node evals/grade.mjs path/to/asset.svg   # or npm run check for whole repo
  ```
  Enforces: XML well-formedness, viewBox, accessible `<title>`, dangling
  `url(#ref)` references (R1), duplicate ids (R2), external raster embeds (W1),
  geometry G1–G4 (canvas overflow, container overflow, motif/logo occlusion,
  text-on-text overlap), and contrast C1. Must report zero errors.
- **T2 — render verification (needs a rasterizer):**
  ```bash
  node scripts/render.mjs path/to/asset.svg   # playwright → chromium → rsvg
  ```
  Then inspect the PNG against `verification.md` §3 and say what was checked.
  T0's width estimates are font-independent guesses; a render is the only proof
  text actually fits under real fonts. If the render shows a font-fallback
  problem, apply `references/typography.md` §4 (safe stacks or text-to-path).

Rules: T1-pass does not replace T2 when T2 was available. T0 is mandatory even
when T1/T2 ran — gates cannot judge beauty. Passing structure gates proves the
asset is *not broken*; the visual checklist is what proves it is *good*.

## 6. Typography and font portability (hard rules)

- Reserve width with CJK ≈ `font-size × 1.0`, Latin ≈ `font-size × 0.56`,
  plus `0.12 × font-size` safety per side (measured estimates, see
  `references/typography.md` §2).
- Always end font stacks on a generic family (`sans-serif`, `serif`,
  `monospace`) and prefer cross-platform names (typography §1).
- For assets that must survive any renderer (emails, third-party embeds,
  systems without CJK fonts), deliver text as outlines when tooling allows, or
  warn the user about fallback risk (typography §4).

## 7. Logo rules (generic)

A logo must state a semantic brief (message / visual nouns / relationship),
survive a 48 px render (include one in every logo deliverable), keep ≤ 6
layers in fixed order, and carry provenance metadata when derived from an icon
set:

```xml
data-role="logo" data-logo-intent="..." data-icon-source="..."
data-icon-name="..." data-icon-license="..."
```

Never let halos outshout the glyph, never add filler motifs, never use strokes
thinner than ~1.5 px at 48 px. Full rules and auto-fail list:
`references/design-principles.md` §6. Brand-specific logo instances (e.g. the
bundled demo brand) live in `brand-packs/`.

## 8. Memory and preferences

Learned taste ("用户更喜欢玻璃质感") belongs in session memory or the host
agent's memory facility. Rules: session-only by default; persist across
sessions only with explicit consent; store derived one-line notes, never raw
conversation; let the user retract ("忘记这个偏好") at any time. Never write
user-specific preferences into this skill's files — this is a public artifact.

## 9. Brand packs (demo included)

`brand-packs/zhiliao-study.md` is a complete worked example: one fictional
product with fixed copy, a seasonal/theme registry and a logo instance. Use it
as a reference for how to structure a brand pack; when the user has their own
brand, derive (don't copy) from it. Nothing in this skill hardcodes that brand
into new assets.

## 10. Commands

```bash
npm test        # gate behavior tests + repository structure tests
npm run check   # grade every SVG under examples/ and docs/
node evals/grade.mjs file.svg   # grade single file(s), errors exit non-zero
node scripts/render.mjs file.svg  # best-effort render to PNG for T2
```
