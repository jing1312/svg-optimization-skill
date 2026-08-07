# Style Mastery · the Dreamlight System

This skill's house style. It exists because of a hard lesson: six styles done
averagely read as templated, and two different "template faces" were burned
getting there (the pastel-SaaS face and the dark-gold-luxury face). The fix is
not another face — it is doing **one** style so well that it stops looking
generated. Dreamlight draws with light itself: luminous atmospheres, one
flowing gesture, glass depth, and typography that floats inside the scene.

## 1. Why one style mastered

- A style is a *vocabulary*: it only reads as intentional when every element
  speaks it. Mixing vocabularies (pill chips in an editorial, hairline folios
  in a dreamscape) is what makes work look templated.
- Mastery is visible in the second decimal: how a gradient terminates, where
  the highlight sits on a sphere, the exact saturation of a shadow. Those are
  per-style problems; you can only solve them deeply for one style at a time.
- Range comes later, *inside* the style: climates (dawn / noon / dusk /
  moonrise), not new styles. Same physics, different weather.

## 2. Color: recipes, not vibes

**Luminous base (cool, canonical).** Vertical 5–6-stop spectral drift, every
stop within ~2 % lightness of its neighbor — the base must read as light, not
as stripes:

```text
#f5f7ff → #eef0ff → #ece6fb → #f2e4f6 → #f9e9ee → #fdf0ea
```

**Dusk base (warm climate for the same style).** Horizon glow upward:

```text
#252b55 → #37407c → #6a5e9e → #c98ba0 → #f4c39a
```

Rules:

- Palette = one analogous family (aqua→sky→violet→rose, or rose→peach→gold→
  lilac) + **one** surprise hue used once. Never a rainbow.
- Shadows are tinted with the dominant hue family (violet shadow in a cool
  scene, peach shadow in a warm one). Gray shadows kill luminosity.
- The light source itself is layered radials (white core → tinted mid → 0),
  never a flat white circle.
- No pure black, no pure white content — ivory `#fdf6ec` and deep violet ink
  `#37326e` are the extremes.

## 3. Light rules

1. **One primary bloom.** Every scene has exactly one light source that
   everything else answers to (consistent highlight direction on all orbs).
2. **Atmospheric depth, three planes:** far = blurred + low opacity + desaturated;
   mid = the gesture; near = sharp + full saturation + specular. If everything
   is equally sharp, nothing is luminous.
3. **Gradients terminate.** Every halo/ribbon/bloom ends at `stop-opacity="0"`;
   airiness dies the moment a gradient ends hard.
4. **Bounded blur:** `stdDeviation ≤ 24`, and blur is used at most twice per
   composition (one halo/atmosphere pass, one depth-of-field pass).

## 4. The gesture: silk, never neon tubes

A ribbon drawn as constant-width strokes reads as glowing wire / chart line —
the #1 reason dreamy scenes turn tacky. A ribbon is **silk**:

- **Built as a filled band**: a closed path whose top and bottom edges are two
  separate curves. Never three parallel strokes.
- **Tapered ends, full belly**: end width ≤ 20 px, belly 60–90 px on hero
  scale. Tension comes from the taper.
- **Two translucent layers**: outer layer wide, blurred (`stdDeviation` 10–14),
  opacity ~0.55 — the shadow of the silk in the air; inner layer narrower,
  sharp, opacity ~0.9 — the lit face; plus one white edge-light (1–1.5 px @
  0.5) along the top edge.
- **One distant echo**: a shrunken band of the same shape high up, opacity
  ~0.2 — silk comes in bolts, not single threads.
- The gradient runs **along the sweep** (`userSpaceOnUse`), colors travel with
  the band instead of banding across it.

The gesture divides the canvas into a quiet zone (typography) and an active
zone (orbs, sparkles). If the ribbon decorates around the text instead of
carrying the composition, delete it.

## 5. The background must float

A flat vertical gradient is a wall, not an atmosphere. Every scene carries:

- ≥ 3 large **drift fields**: asymmetric radial fades at different heights and
  scales, some spilling off the canvas, tints from the palette family, opacity
  0.2–0.4. They are weather, not decoration — place them off-axis from the
  bloom.
- **Floating motes**: 8–14 particles, r 1.5–5 px, opacity 0.2–0.6, scattered
  along the gesture's flow and around the orbs — varied sizes, never aligned
  rows, never confetti clusters. They are what makes the air visible.
- The bloom itself sits slightly off-center; centered blooms pin the scene.

## 6. Orbs (glass depth)

- ≥ 3 per scene, three sizes deliberately: one **large and edge-cropped**
  (anchoring), one **medium and sharp** (character), one **small** (accent).
- Each orb: radial fill with the highlight offset toward the light source, a
  0.8–1 px rim-light stroke on the lit side, a white specular dot, and a
  tinted soft shadow below. A flat circle is a dot, not an orb.
- Small lens sparkles (four-point, hand-drawn path, NOT circles) at ≤ 4 energy
  points: ribbon crossings, orb rims, near the bloom. Sparkle is punctuation,
  never confetti.

## 7. Typography in light fields

- Deep desaturated ink (`#37326e` family in cool scenes, `#4a2f3f` in warm),
  serif display with letter-spacing 3–6 px. Display vs meta ≥ 5× size.
- A single soft **tinted** drop-shadow (`flood-color` = dominant hue @ ≤ 0.35)
  lifts the title out of the atmosphere — never a gray/black shadow.
- Max three text elements: title / one line / one whisper of metadata. Light
  scenes drown in copy.
- **Size floors** on hero-scale canvases (≥ 1200 px wide): eyebrow/meta ≥ 13 px,
  body ≥ 14 px. Text under 13 px reads as noise in real rendering, not as
  refinement; tracking 4–6 px gives the meta room to breathe.

## 8. Meaning before ornament

Atmosphere is not an excuse for decoration without a story. Every primary
element in a Dreamlight piece must state, in one sentence, what product action
or idea it carries — exactly like the motif brief in
`design-principles.md` §1, but applied to scenery:

- The **ribbon gesture** is the act of drawing itself — one confident stroke.
- **Orbs** are nodes of a relationship; fine hairline chords between them make
  the relationship readable. At least one node may carry the **check mark**:
  verification lives inside the light, not outside it.
- Ambient details take product meaning where the subject allows (star trails as
  fragrance notes, mist as morning, mountains as origin).
- One faint **construction trace** (a radius circle, a centerline, two ticks)
  may be inscribed around the verified node — the gates made visible, quiet,
  gold at ≤ 0.35 opacity. Geometry as ornament, never as chrome.

If an element cannot say what it means, delete it. Collage is a removal
problem, in atmosphere as much as in layout.

## 9. Anti-patterns — both burned template faces

Pastel-SaaS face (auto-reject): pill chips, aurora fog with no composition,
**aligned dot rows / confetti clusters** (note: sparse floating motes of varied
size per §5 are required, and are not this), centered
eyebrow-title-subtitle-button triads, 2-stop flat pastel bases, decoration
without a gesture, ribbons drawn as constant-width glowing strokes.

Dark-gold-luxury face (also auto-reject): near-black + gold hairlines + index
numerals + serif small caps + drafting annotations as a substitute for beauty.
That face described premium mechanically and produced spec sheets, not images
worth looking at. Chrome is not craft.

And forever: flat gradient wallpaper (backgrounds must float, §5), glow on
text, > 1 accent hue, anything that exists to fill space rather than to carry
light, and drafting chrome (radius callouts, tick marks) used as decoration.

## 10. Self-check (after gates pass)

1. Does the scene have ONE believable light source, and does everything obey it?
2. Can you name the gesture in one sentence, and does the title sit in its
   quiet zone?
3. Three depth planes present — blurred far, gestural mid, sharp near?
4. Remove the sparkles and the smallest orb: is it still alive? (Then they
   were punctuation.) Add them back only if the scene got worse.
5. Print it in your head at poster size: does the color hold, or does it read
   as stripes and stickers?
6. Does it beat the seasonal series it descends from? If not, iterate.
