---
name: svg-optimization-skill
description: >
  Design, generate, restyle and validate SVG assets with a complete visual
  system. Produces clean, premium, consistent SVGs with design tokens,
  typography rules, material logic, motion principles and verification gates.
---

# SVG Visual System Engine V2

Create SVG assets that are:

1. visually authored, not randomly generated
2. structurally correct and render-safe
3. consistent through reusable design rules
4. adaptable across brands and styles

This skill follows a design-system-first workflow.

## Core Principle

SVG is not markup. SVG is a visual system.

Never begin with effects. Begin with:

1. message
2. motif
3. composition
4. material
5. tokens
6. rendering

## V2 Workflow

Every asset follows these steps:

### 1. Create a Motif Brief

Before drawing define:

- message: what the image communicates
- visual nouns: what objects/materials represent it
- relationship: why elements belong together

Delete any element without a clear role.

### 2. Apply Design Tokens

Use:

`references/design-tokens.md`

Before choosing colors, typography or motion.

The asset must define:

- color roles
- type hierarchy
- spacing rhythm
- material behavior
- motion intent

### 3. Select Style System

Use:

`references/style-library.md`

Styles are systems, not filters.

A style defines:

- composition rules
- material rules
- color behavior
- forbidden patterns

### 4. Avoid Generic AI Aesthetics

Always check:

`references/anti-ai.md`

Avoid:

- random gradient blobs
- meaningless glow objects
- sticker collections
- excessive glass effects
- decorative elements without purpose

Luxury comes from removal.

### 5. Add Motion Only With Purpose

Use:

`references/motion-library.md`

Motion must explain:

- atmosphere
- material response
- interaction

Never animate because SVG supports animation.

## Visual Quality Rules

### Composition

Prefer:

- one dominant motif
- one supporting gesture
- one controlled detail

Do not create collections of unrelated objects.

### Color

Rules:

- maximum four chromatic colors
- every color needs a role
- shadows follow material temperature
- glow requires a light source

### Typography

Default scale:

```
display 72
 title 48
section 32
heading 24
 body 18
caption 13
```

Typography hierarchy is more important than decoration.

## Verification

Run the highest available verification tier:

T0:
- visual reasoning check

T1:
```bash
node evals/grade.mjs asset.svg
```

Checks:
- XML validity
- references
- duplicate IDs
- overflow
- overlap
- contrast

T2:
```bash
node scripts/render.mjs asset.svg
```

Inspect rendered output for:

- hierarchy
- typography
- spacing
- material consistency
- visual balance

Passing technical gates does not prove beauty.

## Commands

```bash
npm test
npm run check
node evals/grade.mjs file.svg
node scripts/render.mjs file.svg
```
