---
name: svg-optimization-skill
description: >
  Optimize brand SVG banners, popup mockups, logos and illustration boards for a
  study/knowledge-verification product. Use when asked to design, restyle, fix
  overflow in, or enrich 1100x300 banners, 860x730 popup mockups, or logo tiles
  with the dreamy summer gradient system (directions J/K/L). Enforces semantic
  motif briefs, a layered effect budget, Lucide book-open-check logo metadata,
  and privacy-first local preference learning.
---

# SVG Optimization Skill

## 1. When to use

Trigger this skill when the user wants to:

- create or restyle a promo banner (default canvas `1100 300`),
- create or restyle a browser-extension popup mockup (default canvas `860 730`),
- refine the product logo (core glyph: Lucide `book-open-check`),
- build illustration boards or style-choice cards for this brand,
- diagnose overflow, tiny text, or "too bland / too collage-like" SVG assets.

Do not trigger for generic icons, screenshots, or non-SVG deliverables.

## 2. Canonical brand copy

Keep wording identical across all directions unless the user explicitly rewrites it:

- Product: 知了学习
- Title: 知了学习 · 知识组织与核验助手
- Subtitle: 把章节连成关系网，让每次复习都有据可查
- Popup CTA: 开始核验

The product story is **knowledge organization + verification**: chapters become
relationship graphs, review paths become checkable, notes become exported packs.

## 3. Workflow

1. Write a motif brief before drawing (see `references/design-patterns.md` §1).
   If a motif cannot be explained in one sentence tied to the copy, delete it.
2. Pick the direction. If style is unclear, the user asks for a redesign, or the
   user says "太简单/不好看", follow the style-choice flow (§4) before finalizing.
3. Build the asset using the six-layer effect stack
   (`references/style-system.md` §3). Do not stack unbounded blurs, repeated
   glows, or scattered decorative dots.
4. Validate geometry: every `<text>` must fit its container; measure with
   `scripts/measure_text.html` when fonts are ambiguous.
5. Run `npm test` and `npm run check`; for SVG edits also XML-parse every file.
   Passing structure tests does not prove the art is good — additionally open the
   SVG in a real browser screenshot and state what was visually inspected.

## 4. Style-choice flow

When direction is ambiguous:

1. Read `references/style-system.md`.
2. Produce 2-3 complete directions using the same title, copy, logo semantics
   and canvas.
3. Each direction must show both a full banner thumbnail and a popup/UI crop.
4. Prefer clickable cards; otherwise generate `style-options.svg`; with text-only
   channels use a Markdown table. Never depend on editor-specific features.
5. Only after the user picks, produce the final themed assets.

Do not force the chooser for simple overflow or measurement fixes.

## 5. Logo rules

Core glyph is Lucide `book-open-check` (ISC), expressing "opened learning
material + verification action". Allowed additions: chapter-relationship node
ring, verification shield outline, page highlight/liner/theme-tinted shadow, and
at most one semantically justified secondary structure. Forbidden: gratuitous
bolts/sparkles/magic wands, filler flowers/waveforms/molecules, halos louder than
the glyph, strokes so thin they collapse at 48 px.

Every formal logo group must carry:

```xml
data-role="logo"
data-logo-intent="knowledge verification"
data-icon-source="lucide"
data-icon-name="book-open-check"
data-icon-license="ISC"
```

Secondary motifs are declared via
`data-logo-secondary-motif="chapter relationship + verification shield"`.
Full brief: `references/logo-system.md`.

## 6. Preferences and privacy (hard boundary)

- Preference learning is **local, structured, forgettable**. Never upload raw
  feedback; never encode user-specific preferences into this public SKILL.md.
- Persist only whitelisted numeric weights through `scripts/preferences.mjs`:

```bash
node scripts/preferences.mjs show
node scripts/preferences.mjs record --key material.glass --delta 1
node scripts/preferences.mjs forget --key material.glass
node scripts/preferences.mjs reset
```

- Preferences only re-rank recommendations; they never auto-select for the user
  and never rewrite this skill.
- See `PRIVACY.md` for the full public-release boundary.

## 7. Verification

```bash
npm test        # unit + repository structure tests (21 tests)
npm run check   # XML well-formedness + logo quality gates
git diff --check
```

Declare "done" only after fresh command output plus real-browser visual evidence.
