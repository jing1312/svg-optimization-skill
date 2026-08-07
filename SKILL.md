---
name: svg-optimization-skill
description: >
  Design, generate, restyle and validate SVG assets through a complete visual
  direction system. Creates premium SVG assets using design tokens, style
  archetypes, composition logic, material behavior, motion principles and
  multi-layer quality review.
---

# SVG Visual Direction Engine V2

SVG is not markup. SVG is a visual system.

This skill does not generate decorative graphics. It directs AI to create
repeatable visual assets with a coherent design language.

## Design Philosophy

A high quality SVG is built in this order:

```
Intent
  ↓
Visual Concept
  ↓
Composition
  ↓
Style System
  ↓
Design Tokens
  ↓
Material
  ↓
Motion
  ↓
Verification
```

Never start from effects.

Blur, gradients, shadows and particles are implementation details, not design.

---

# V2 Creation Workflow

## Step 1 — Understand Intent

Before drawing, identify:

- purpose: why this asset exists
- audience: who sees it
- emotion: what should it feel like
- message: what must be remembered

If the purpose is unclear, ask before generating.

---

## Step 2 — Create Visual Direction

Write a short design brief:

```
Message:
Visual nouns:
Main motif:
Supporting gesture:
Material:
Atmosphere:
```

Every element must have a reason to exist.

Remove anything that only makes the image busier.

---

## Step 3 — Select Visual System

Choose:

```
Archetype × Palette × Layout
```

Read:

`references/style-library.md`

Examples:

```
Dreamlight × Night × Hero
Editorial × Light × Poster
Glass Intelligence × Night × Object Showcase
```

Never mix styles randomly.

---

## Step 4 — Apply Design Tokens

Read:

`references/design-tokens.md`

Define:

- color roles
- typography scale
- spacing rhythm
- material behavior
- motion intent

Do not select isolated colors or effects.

---

## Step 5 — Build Composition

Composition rules:

Prefer:

- one dominant motif
- one supporting gesture
- one controlled detail

Avoid:

- unrelated objects
- equal visual weights everywhere
- template card layouts unless the content requires them

Negative space is a design element.

---

## Step 6 — Apply Material Logic

Materials must behave physically.

Glass:
- transparency
- reflection
- depth

Paper:
- grain
- edge
- warm shadow

Light:
- direction
- source
- falloff

Never use material effects as decoration.

---

## Step 7 — Add Motion Carefully

Read:

`references/motion-library.md`

Motion categories:

- atmosphere
- material response
- interaction

Animation must answer:

"What becomes clearer because this moves?"

If no answer exists, remove the animation.

---

# Anti AI Aesthetic Rules

Always check:

`references/anti-ai.md`

Reject:

- random gradient blobs
- meaningless glow spheres
- excessive glass layers
- decorative particle fields
- icon-title-subtitle templates

Premium design comes from editing, not accumulation.

---

# Typography System

Default hierarchy:

```
display 72
 title 48
section 32
heading 24
 body 18
caption 13
```

Typography has priority over decoration.

Check:

- scale
- spacing
- readability
- alignment

---

# Quality Review

Technical correctness is necessary but not sufficient.

Run:

## T0 Visual Reasoning

Check:

- concept clarity
- hierarchy
- composition
- style consistency

## T1 Machine Validation

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

## T2 Render Review

```bash
node scripts/render.mjs asset.svg
```

Inspect:

- visual balance
- typography
- spacing
- material realism
- aesthetic quality

A green technical check does not mean the design is good.

---

# Final Delivery Checklist

Before delivering any SVG:

- Does it communicate one clear idea?
- Does every element have a purpose?
- Is the style system identifiable?
- Are colors token-based?
- Is typography hierarchical?
- Are materials believable?
- Is motion meaningful?
- Has the rendered output been reviewed?

The goal is not more SVG.

The goal is better visual intelligence.
