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

## 4. The gesture (composition spine)

One ribbon family crosses the scene and leads the eye to the title:

- **Band A** — wide (60–90 px), blurred (`stdDeviation 14–18`), opacity ~0.5,
  the atmosphere of the move.
- **Band B** — sharp core (2.5–4 px), opacity ~0.9, a luminous gradient or
  white-sheen — the edge of the same move.
- **Band C** — thin echo, offset, opacity ~0.3 — the memory of the move.

All three are variations of **one** bezier gesture: large radii, no kinks,
entering and leaving through the canvas edges. The gesture divides the canvas
into one quiet zone (for text) and one active zone (for orbs/sparkles). If the
ribbon is decoration around the text instead of the spine of the composition,
delete it.

## 5. Orbs (glass depth)

- ≥ 3 per scene, three sizes deliberately: one **large and edge-cropped**
  (anchoring), one **medium and sharp** (character), one **small** (accent).
- Each orb: radial fill with the highlight offset toward the light source, a
  0.8–1 px rim-light stroke on the lit side, a white specular dot, and a
  tinted soft shadow below. A flat circle is a dot, not an orb.
- Small lens sparkles (four-point, hand-drawn path, NOT circles) at ≤ 4 energy
  points: ribbon crossings, orb rims, near the bloom. Sparkle is punctuation,
  never confetti.

## 6. Typography in light fields

- Deep desaturated ink (`#37326e` family in cool scenes, `#4a2f3f` in warm),
  serif display with letter-spacing 3–6 px. Display vs meta ≥ 5× size.
- A single soft **tinted** drop-shadow (`flood-color` = dominant hue @ ≤ 0.35)
  lifts the title out of the atmosphere — never a gray/black shadow.
- Max three text elements: title / one line / one whisper of metadata. Light
  scenes drown in copy.

## 7. Anti-patterns — both burned template faces

Pastel-SaaS face (auto-reject): pill chips, aurora fog with no composition,
rows of colored dots, centered eyebrow-title-subtitle-button triads, 2-stop
flat pastel bases, decoration without a gesture.

Dark-gold-luxury face (also auto-reject): near-black + gold hairlines + index
numerals + serif small caps + drafting annotations as a substitute for beauty.
That face described premium mechanically and produced spec sheets, not images
worth looking at. Chrome is not craft.

And forever: gradient blobs for wallpaper, glow on text, > 1 accent hue,
anything that exists to fill space rather than to carry light.

## 8. Self-check (after gates pass)

1. Does the scene have ONE believable light source, and does everything obey it?
2. Can you name the gesture in one sentence, and does the title sit in its
   quiet zone?
3. Three depth planes present — blurred far, gestural mid, sharp near?
4. Remove the sparkles and the smallest orb: is it still alive? (Then they
   were punctuation.) Add them back only if the scene got worse.
5. Print it in your head at poster size: does the color hold, or does it read
   as stripes and stickers?
6. Does it beat the seasonal series it descends from? If not, iterate.
