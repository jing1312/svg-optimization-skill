# SVG Design Patterns

These patterns are starting structures. Replace copy, measure every string,
and adapt the palette and icon to the actual subject before delivery.

## Banner composition

For a 1100 x 300 README banner, reserve roughly 68% for text and 32% for a
semantic visual anchor. This avoids both a centered pile and an icon floating
without relation to the title.

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="1100" height="300"
     viewBox="0 0 1100 300"
     font-family="PingFang SC, Microsoft YaHei, sans-serif"
     role="img" aria-labelledby="title desc">
  <title id="title">OpenStudy project banner</title>
  <desc id="desc">Project title and capability tags with a knowledge icon.</desc>
  <defs><!-- background, tile, halo, and shadow definitions --></defs>
  <rect width="1100" height="300" rx="24" fill="url(#bg)"/>

  <text x="70" y="112" font-size="68" font-weight="700" fill="#FFFFFF">开卷助手</text>
  <text x="70" y="174" font-size="24" fill="#F5F3F0">整理公开课程资料 · 生成练习与复习提纲</text>

  <g font-size="18">
    <rect x="70" y="210" width="224" height="44" rx="22" fill="#FFFFFF" fill-opacity=".09"/>
    <text x="182" y="238.3" text-anchor="middle" fill="#FFFFFF">Chrome / Edge</text>
  </g>

  <!-- Semantic logo lockup in the right region; see logo-system.md. -->
</svg>
```

Useful checks:

- Title baseline to subtitle baseline: about 0.85-1.05 x title size.
- Subtitle to metadata row: 28-36 px.
- Metadata pill width: measured text + 24-40 px.
- Text region right edge and logo tile left edge: at least 40 px.
- Background decoration: one motif, low opacity, outside the reading path.

### Edge-clipped bubble depth

For a richer background, use large translucent forms that enter from outside
the canvas and are cut by the rounded boundary. A fully visible circle floating
in the middle usually reads as decoration pasted on top; a clipped fragment
feels integrated with the surface.

```svg
<defs>
  <clipPath id="bannerClip">
    <rect width="1100" height="300" rx="24"/>
  </clipPath>
  <radialGradient id="bubble" cx=".3" cy=".26" r=".82">
    <stop offset="0" stop-color="#FFFFFF" stop-opacity=".18"/>
    <stop offset=".5" stop-color="#A79AE8" stop-opacity=".08"/>
    <stop offset="1" stop-color="#5F61C7" stop-opacity=".01"/>
  </radialGradient>
</defs>

<g clip-path="url(#bannerClip)" aria-hidden="true">
  <!-- center is above the canvas: only the lower segment is visible -->
  <circle cx="1048" cy="-82" r="226" fill="url(#bubble)"/>
  <circle cx="1048" cy="-82" r="194" fill="none"
          stroke="#FFFFFF" stroke-opacity=".09" stroke-width="1.5"/>

  <!-- center is beyond the left/bottom edge -->
  <circle cx="-58" cy="322" r="184" fill="url(#bubble)" opacity=".65"/>
</g>
```

Use two to four forms at clearly different scales. Keep their centers outside
the content field, avoid equal spacing, and never let a bright edge pass behind
small text. One faint outline or highlight arc is enough to suggest glass.

## App icon lockup

Treat the icon and product name as one aligned header. A horizontal lockup
often works better inside a compact UI than a large icon stacked over a title.

```svg
<g data-role="logo"
   data-logo-intent="knowledge verification"
   data-icon-source="lucide"
   data-icon-name="book-open-check"
   data-icon-license="ISC">
  <circle data-role="logo-halo" cx="44" cy="44" r="43" fill="url(#halo)"/>
  <rect data-role="logo-tile" x="10" y="10" width="68" height="68" rx="17" fill="url(#tile)"/>
  <g data-role="logo-glyph" transform="translate(23.6 23.6) scale(1.7)"
     fill="none" stroke="#FFFFFF" stroke-width="1.7"
     stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 5v16"/>
    <path d="m16 12 2 2 4-4"/>
    <path d="M22 6V5a2 2 0 0 0-1.999-2L16 3.002A5 5 0 0 0 12 5a5 5 0 0 0-4-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 1.999 2H8a5 5 0 0 1 4 2 5 5 0 0 1 4-2h4.001A2 2 0 0 0 22 17v-1.344"/>
  </g>
</g>
<text x="116" y="42" font-size="24" font-weight="700">Product name</text>
<text x="116" y="68" font-size="14" fill="#686979">Short functional description</text>
```

The halo diameter may exceed the tile, but its radius must remain at or below
72% of the tile width. Keep the center transparent enough that the tile edge
and glyph remain crisp.

## UI mockup

A browser-extension mockup should show a believable operational surface:

1. Compact browser chrome, 40-48 px tall.
2. One main popup/card occupying about 65-75% of the canvas width and at least
   75% of its height.
3. A horizontal brand lockup.
4. One or two content sections with clear labels.
5. Repeated status items using one semantic color.
6. Peer actions in one row.
7. A progress or completion state near the bottom.

Avoid placing a card around every section. Use dividers, headings, spacing, and
background tints before adding another border.

### Status item

```svg
<rect x="0" y="0" width="164" height="54" rx="8"
      fill="#F5F3F0" stroke="#D8D8E5"/>
<circle cx="24" cy="27" r="9" fill="#56B59A"/>
<path d="m20.5 27 2.5 2.5 4.8-5" fill="none" stroke="#FFFFFF"
      stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<text x="42" y="32.2" font-size="15" font-weight="600" fill="#383B73">页面就绪</text>
```

The icon owns a fixed 18 px area. The label begins after that area plus a
12-18 px gap. Do not center the label independently inside the full card; that
causes it to collide with the icon.

### Peer actions

```svg
<rect x="0" y="0" width="256" height="56" rx="8" fill="url(#action)"/>
<text x="128" y="33.6" font-size="16" font-weight="700"
      fill="#FFFFFF" text-anchor="middle">Primary action</text>

<rect x="272" y="0" width="256" height="56" rx="8"
      fill="#FFFFFF" stroke="#5F61C7" stroke-width="1.5"/>
<text x="400" y="33.6" font-size="16" font-weight="600"
      fill="#383B73" text-anchor="middle">Secondary action</text>
```

## Text measurement and centering

Use the included browser tool or `CanvasRenderingContext2D.measureText`. Match
family, weight, and size exactly.

For a 44 px pill with 18 px text:

```text
baseline = y + 44 / 2 + 18 * 0.35
         = y + 28.3
```

Use `text-anchor="middle"` and the rectangle center for horizontal centering.
For left-aligned icon labels, reserve the icon width and gap first, then place
text. Never center icon and text independently in the same box.

## Color construction

Build a palette by roles rather than by collecting variations of one hue:

- canvas or page surface;
- primary text and secondary text;
- one brand accent;
- one supporting accent if needed;
- semantic success, warning, and error colors;
- borders and disabled states.

On a deep-blue banner, cyan can provide contrast and a green success color can
remain semantically distinct. On light UI surfaces, use neutral grays for
structure so the brand color does not occupy every element.

## Final visual pass

- Inspect the full asset at 100%.
- Inspect the logo at 32-64 px.
- Confirm the glyph still reads without the product title.
- Confirm halos, shadows, and decorations disappear before the glyph does.
- Check that equal states use equal colors.
- Check that repeated items share width, inset, and baseline.
- Verify no text or vector extends beyond the viewBox.

## Theme tokens (single source of truth)

The 12 built-in themes and their token keys (bg, surface, primary, primaryDark,
accent, title, body, muted, success, warning, danger) live in
`src/editor/theme-tokens.mjs`. When generating SVG by hand, pick one theme and
draw every color from its tokens; the visual editor maps colors back to the
nearest token on theme switches and preserves anything that is farther than a
token radius (hand-picked accents survive re-theming).

The repaint engine (`src/editor/color-map.mjs`) encodes the final mapping
rules: identical source colors always map to the same token (tie clustering);
text never lands on a mid-tone token — light source text stays light, dark
stays dark, with WCAG contrast floors (3:1 large, 4.5:1 body) guarded by
polarity locking; highlights and decorations below 0.3 opacity are skipped;
semantic success/warning/danger tokens stay fixed across all themes; and a
color counts as chromatic only above a dual threshold (saturation ≥ 0.18 AND
absolute max-min channel spread ≥ 24) so near-black navy text is not mistaken
for brand color. The same module can distill an arbitrary color set into a
token palette (`paletteFromColors`), which powers the editor's cross-theme
default component colors.
