# Logo System

This project creates logo lockups for documentation graphics. It does not
replace a full brand-identity process. The aim is a clear, attributable mark
that matches the subject and survives small rendering sizes.

## Selection sequence

1. Describe the subject in one noun phrase.
2. Describe the primary action in one verb.
3. Choose a tone: precise, friendly, technical, editorial, or playful.
4. Search a mature icon library by the noun and verb.
5. Render two or three candidates at 48 px before choosing one.
6. Assemble the selected path into the surrounding palette.

Do not select the container style before the glyph. A polished tile cannot
rescue a semantically unrelated symbol.

## Source hierarchy

1. Existing official project mark, used without redrawing.
2. One icon from Lucide, Tabler Icons, or Phosphor Icons.
3. A simple geometric mark derived from a documented product concept.
4. A custom illustration only when the request explicitly needs one.

When using a library icon, preserve its viewBox proportions and stroke joins.
Do not copy only part of the path unless the modification is documented.

## Container recipes

### Product tile

Use for an app, browser extension, or compact product identity:

- corner radius: 20-25% of tile size;
- glyph bounds: 58-68% of tile size;
- border: 1 px light inset at 15-25% opacity;
- shadow: one soft shadow, vertical offset around 8-12% of tile size;
- optional halo radius: 55-72% of tile width.

### Bare mark

Use in flow diagrams, architecture figures, and dense documentation:

- no tile or halo;
- one semantic color plus neutral text;
- glyph height matched optically to adjacent capital height;
- clearspace at least one quarter of glyph width.

### Monochrome mark

Use when the asset must work in print or a one-color README theme:

- one fill or stroke color;
- no gradient-dependent contrast;
- no shadow as a structural requirement;
- verify against both light and dark backgrounds.

## Provenance attributes

Copy-ready logo groups should declare their role and provenance:

```svg
<g data-role="logo"
   data-logo-intent="transcription"
   data-icon-source="lucide"
   data-icon-name="audio-lines"
   data-icon-license="ISC">
  <!-- tile and glyph -->
</g>
```

Keep the library license in `THIRD_PARTY_NOTICES.md`. These attributes make
automated checks possible and prevent an icon path from losing its origin.

## Rejection checklist

Reject a candidate before polishing when any answer is yes:

- Would the same symbol fit almost any AI product?
- Does the symbol describe speed while the product describes knowledge?
- Is the mark only a letter with no established brand reason?
- Does it require reading the title to make sense?
- Does it become an indistinct blob below 48 px?
- Is the halo more visually dominant than the tile?
- Does the icon touch the tile edge or look vertically off-center?
- Is the path source or license unknown?

## Evaluation boundary

`node evals/grade.mjs --check-logo <file.svg>` checks provenance, semantic
intent metadata, glyph structure, effect proportion, and accessibility. It
cannot measure distinctiveness or taste. Use the rendered small-size test and
the rejection checklist for those judgments.
