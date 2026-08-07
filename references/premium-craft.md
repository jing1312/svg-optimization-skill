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

1. **One light source, many tints.** Every scene answers to exactly one light
   source — all speculars and orb highlights must agree on its direction.
   Drift fields, fog and colored washes are **not** light sources; they are
   tinted air. Keep them low-contrast and clearly subordinate, or the scene
   reads as "several lamps" instead of "one sun."
2. **Three value steps, not one flat whisper.** Premium is built from clear
   foreground/midground/background **values**, not from making everything
   translucent. Far = desaturated, low contrast, no detail; mid = the gesture
   or structure, medium saturation; near = one subject at full saturation with
   a crisp specular and edge reflection. If background, ribbon, orbs and text
   all sit at the same lightness/opacity, the result is pale wallpaper with no
   hierarchy. Push at least one element to full density so the others can stay
   airy *by contrast*.
3. **Gradients terminate.** Every halo/ribbon/bloom ends at `stop-opacity="0"`;
   airiness dies the moment a gradient ends hard.
4. **Bounded blur:** `stdDeviation ≤ 24`, and blur is used at most twice per
   composition (one halo/atmosphere pass, one depth-of-field pass).

## 4. The gesture: silk, never neon tubes

A ribbon drawn as three constant-width strokes reads as glowing wire — that is
the #1 reason dreamy scenes turn tacky. A ribbon is **silk**, so build it as a
filled shape, not a stroke:

- **Closed band, two edges**: the top and bottom edges are two separate curves
  enclosing a fill. Never parallel glowing lines.
- **Tapered ends, full belly**: pinch the band to a point at both ends and let
  the middle swell. An even-width band has no tension.
- **Two translucent layers**: an outer wide layer (blurred, `stdDeviation`
  8–14, opacity ~0.55) as the soft move, plus a narrower sharp core (opacity
  ~0.9) as the lit edge — offset them slightly for thickness. Add one white
  edge-light stroke along the top edge, and 1–2 short highlight folds on the
  belly.
- **Deepen the value**: the gesture is the mid-ground, so give it real
  saturation and opacity (~0.7). A ribbon at 0.4 opacity on a pale base is
  wallpaper, not a gesture.
- One distant thin echo of the same gesture, opacity ~0.2, may sit higher up.

The gesture still divides the canvas into a quiet zone (text) and an active
zone (orbs/sparkles). If it decorates around the text instead of carrying the
composition, delete it.

## 5. Orbs (glass depth) + floating background

Orbs:
- ≥ 3 per scene, three sizes on purpose: one **large and edge-cropped**
  (anchoring), one **medium and sharp** (character), one **small** (accent).
- Each orb: radial fill with the highlight offset toward the light source, a
  rim-light arc on the lit side, a white specular dot, and a tinted soft shadow
  below. Give the near orb a real edge reflection so it reads as glass, not a
  flat decal.
- The near subject orb is the only element at full density — deepen its radial
  and shadow so the airy layers around it have something to be airy *against*.

Background:
- The base gradient alone is a wall. Add 2–3 large drift fields (tinted air,
  not light) plus a handful of floating motes at varied opacity/size so the
  scene breathes. Motes are sparse and scattered, never a grid or a confetti
  burst; at most one or two get a soft glow, the rest are bare dots.
- One bloom sits slightly off-center as the sun; keep halo opacity honest but
  never so even that foreground and background flatten into the same value.

## 6. Typography in light fields

- Deep desaturated ink (`#37326e` family in cool scenes, `#4a2f3f` in warm),
  serif display with letter-spacing 3–6 px. Display vs meta ≥ 5× size.
- A single soft **tinted** drop-shadow (`flood-color` = dominant hue @ ≤ 0.35)
  lifts the title out of the atmosphere — never a gray/black shadow.
- **Hierarchy floors, counted honestly.** Product assets (banners, cards)
  carry at most three text levels: title / one line / one whisper. One
  functional control (a CTA) may exist in addition — but *functional*, never a
  decorative pill. Covers and README heroes may add a kicker above the title
  and a brand folio below — but a folio is a *mark* (symbol + wordmark), not a
  paragraph, and spec lines (gate lists, version notes) belong in the README,
  never on the artwork. Count every `<text>` you ship; if you can't name the
  job of each one, cut it.

## 7. Meaning before ornament

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

## 8. Anti-patterns — both burned template faces

Pastel-SaaS face (auto-reject): pill chips, aurora fog with no composition,
**aligned rows of dots / confetti bursts** (sparse floating motes per §5 are
required and are *not* this — the test is alignment and uniformity), centered
eyebrow-title-subtitle-button triads, 2-stop flat pastel bases, decoration
without a gesture, ribbons drawn as constant-width glowing strokes.

Dark-gold-luxury face (also auto-reject): near-black + gold hairlines + index
numerals + serif small caps + drafting annotations as a substitute for beauty.
That face described premium mechanically and produced spec sheets, not images
worth looking at. Chrome is not craft.

And forever: gradient blobs for wallpaper, glow on text, > 1 accent hue,
anything that exists to fill space rather than to carry light.

## 9. Self-check (after gates pass)

1. Does the scene have ONE believable light source, and does everything obey it?
2. Can you name the gesture in one sentence, and does the title sit in its
   quiet zone?
3. Three depth planes present — blurred far, gestural mid, sharp near?
4. Remove the sparkles and the smallest orb: is it still alive? (Then they
   were punctuation.) Add them back only if the scene got worse.
5. Print it in your head at poster size: does the color hold, or does it read
   as stripes and stickers?
6. Does it beat the seasonal series it descends from? If not, iterate.
