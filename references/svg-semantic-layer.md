# SVG Semantic Layer

## Purpose

SVG should not only contain geometry. It should preserve design intent.

A semantic SVG allows AI agents and tooling to understand:

- why an element exists
- what role it plays
- what material it represents
- how it should be modified

---

# Semantic Group Metadata

Use semantic groups instead of anonymous containers.

Example:

```xml
<g
 data-role="hero-object"
 data-purpose="visual-focus"
 data-material="glass"
 data-light-source="top-left">
</g>
```

---

# Core Roles

## visual-focus

The primary attention target.

Rules:
- only one main focus per composition
- highest contrast
- largest visual weight

---

## atmosphere

Background environmental elements.

Examples:
- ambient light
- texture
- subtle gradients

Rules:
- never compete with the hero

---

## information

Text and functional content.

Examples:
- title
- metadata
- labels

Rules:
- follows typography tokens

---

## material-layer

Physical surface simulation.

Examples:
- glass
- paper
- ceramic
- metal

---

# Material Metadata

Recommended:

```xml
<g
 data-material="ceramic"
 data-texture="glaze"
 data-reflection="soft"
 data-depth="medium">
</g>
```

---

# Motion Metadata

Animations should expose intent.

Example:

```xml
<g
 data-motion="ambient"
 data-motion-purpose="light-drift"
 data-duration="12000ms">
</g>
```

---

# Design Provenance

Every generated SVG should declare:

```xml
<svg
 data-style-id="dreamlight"
 data-palette="night"
 data-layout="hero">
```

This enables:

- style migration
- automated review
- AI editing
- quality analysis

---

# Semantic Editing Rules

When modifying SVG:

1. Preserve semantic roles.
2. Change materials without breaking hierarchy.
3. Change palette without changing composition unless requested.
4. Remove decorative elements that have no semantic purpose.
