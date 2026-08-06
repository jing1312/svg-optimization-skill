# Logo System

## 1. Semantic brief

```text
message: 打开的知识材料 + 核验动作 (opened learning material + verification)
visual nouns: open book glyph, check, chapter node ring, shield liner
relationship: the check sits on the page; nodes orbit as a ring; the shield
              liners the tile so verification reads as protection, not decoration
```

## 2. Icon source

Core glyph derived from Lucide `book-open-check` (ISC license — see
`THIRD_PARTY_NOTICES.md`). Render with `fill="none"`, `stroke-linecap="round"`,
`stroke-linejoin="round"`, stroke width ≥ 1.8 at 24 px scale so it survives 48 px.

## 3. Allowed layer stack (max six, in order)

1. Theme gradient halo behind the tile (opacity ≤ 0.5, must terminate to 0).
2. Rounded-square tile with soft theme-tinted shadow.
3. Translucent inner liner / keyline (inset 6–10 % of tile).
4. Core glyph (the Lucide book-open-check stroke).
5. Chapter-relationship ring: nodes on a circle path around the tile, ≥ 3 nodes,
   node radius ≥ 6 % of tile.
6. One clipped gloss pass across the top half.

The verification shield is drawn as a small liner badge (≤ 30 % of tile width)
overlapping the tile corner — it must never cover the check.

## 4. Required metadata

Every formal logo group carries:

```xml
data-role="logo"
data-logo-intent="knowledge verification"
data-icon-source="lucide"
data-icon-name="book-open-check"
data-icon-license="ISC"
```

Secondary motifs are declared:

```xml
data-logo-secondary-motif="chapter relationship + verification shield"
```

## 5. Rejection conditions (auto-fail)

- Gratuitous bolts, sparkles, magic wands.
- Filler flowers / waveforms / molecules placed to fill space.
- Halo louder than the glyph (halo opacity > 0.5 or halo radius > 2.2× tile).
- Stroke width < 1.2 at 24 px scale, or any detail thinner than 1.5 px in the
  48 px preview.
- More than six logo layers, or a second competing glyph.

## 6. Size checks

Always preview at 48 px beside the full tile. In the 48 px render: the check
must stay legible, nodes must stay discrete, and the shield badge must merge
into the silhouette without adding mud.
