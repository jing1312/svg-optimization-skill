# Rejected Design Patterns Memory

Patterns that repeatedly create low-quality AI SVG output.

## Gradient Dependency

Avoid:

- multiple competing gradients
- gradient as a replacement for composition
- every element using color transitions

Reason:
Gradient should explain light or material, not create visual noise.

## Decorative Glow

Avoid:

- random light blobs
- floating particles without meaning
- excessive bloom

Reason:
Glow must represent a light source or atmosphere.

## Template Composition

Avoid:

- icon + title + subtitle + button cards
- identical repeated layouts

Reason:
UI templates are not automatically visual design.

## Material Abuse

Avoid:

- blur-only glass
- texture-only paper
- fake shadows

Reason:
Material requires physical logic.
