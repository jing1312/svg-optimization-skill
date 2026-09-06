# V2 Style Library

The style system is no longer a list of visual effects. It is a composition of
three independent dimensions:

```
Archetype (material language)
        ×
Palette (color season)
        ×
Layout (composition grammar)
```

Choose one from each axis. Never randomly mix decorative effects.

---

# 1. Archetypes (Material Language)

Archetypes define how the world feels.

## Dreamlight

**Position:** premium future / emotional technology

Use:
- soft atmospheric light
- one dominant gesture
- controlled glass depth
- generous whitespace

Rules:
- one main light source
- one ribbon or energy gesture maximum
- glow explains depth, never decoration
- avoid floating bubbles and random particles

Good for:
- AI products
- flagship banners
- premium launches

---

## Editorial

**Position:** intelligence / culture / authority

Rules:
- strict grid
- strong typography hierarchy
- oversized headline
- limited color
- whitespace is the luxury element

Good for:
- reports
- posters
- brand stories

---

## Material Craft

**Position:** human / tactile / crafted

Materials:
- paper
- ceramic
- fabric
- natural surfaces

Rules:
- texture must imply a physical process
- shadows are warm and subtle
- no artificial glass effects

Good for:
- education
- lifestyle
- handmade brands

---

## Glass Intelligence

**Position:** advanced technology / interface

Rules:
- transparency creates hierarchy
- blur only behind surfaces
- never blur text
- reflections must have a light source

Limits:
- opacity: 0.06–0.14
- keyline: 1px maximum
- one reflection pass

Good for:
- AI interfaces
- dashboards
- futuristic products

---

## Mono System

**Position:** precision / enterprise / tools

Rules:
- monochrome foundation
- one accent color
- geometry over decoration
- no gradients unless semantic

Good for:
- developer tools
- documentation
- professional products

---

# 2. Palette Axis

Palette is independent from material.

## Light Season

Airy, calm, optimistic.

Base:
- high lightness surfaces
- tinted whites
- soft shadows

## Night Season

Deep, cinematic, technical.

Base:
- near-black with hue bias
- bright controlled accents

## Earth Season

Warm, organic, crafted.

Base:
- sand
- clay
- paper

## Brand Season

Derived from user brand colors.

Rules:
- maximum four chromatic colors
- preserve temperature
- record tokens, not raw colors

---

# 3. Layout Axis

## Hero

One statement.
One motif.
One atmosphere.

## Grid

Repeated information blocks.

Rules:
- same geometry
- same spacing
- controlled emphasis

## Poster

Editorial composition.

Rules:
- oversized typography
- intentional asymmetry
- strong negative space

## Object Showcase

Product-first composition.

Rules:
- object owns attention
- background supports material

---

# 4. Style Selection Rule

When the user asks for a style change, identify the axis:

"Change feeling" → Archetype

"Change colors" → Palette

"Change arrangement" → Layout

Never change all three at once unless the user requests a complete redesign.

---

# 5. Anti-Collage Rule

Reject assets that look like:

- stickers placed on backgrounds
- unrelated gradients
- multiple competing light sources
- random decorative particles
- icon + title + subtitle template cards

Before adding an element ask:

"What information or material behavior does this element communicate?"

If the answer is unclear, remove it.

---

# 6. Provenance Metadata

Every generated SVG should register its design decisions:

```xml
<g
 data-style-id="dreamlight"
 data-palette="night"
 data-layout="hero">
```

The goal is repeatable visual intelligence, not one-time decoration.
