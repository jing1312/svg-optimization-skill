# Premium Craft

Gates prove an asset is **not broken**; they cannot prove it is **worth looking
at**. This file is the second half of the promise: the concrete rules that
separate premium work from AI-template paste. Apply it whenever the deliverable
should feel 高档 / editorial / flagship — which, for hero images, banners and
specimen sheets, means always.

## 1. Where premium actually comes from

1. **Typographic tension.** Display vs metadata must differ by ≥ 6× in size
   (e.g. 88 px display vs 11 px eyebrow). Mix a display serif (CJK:
   `Songti SC / STSong / SimSun / Noto Serif SC`; Latin: `Georgia`) with a
   tracked-out sans for metadata. One sans at three sizes is a template.
2. **Weight in the palette.** Floaty pastels read cheap because nothing
   anchors them. Premium work usually has either (a) a deep ground — ink
   `#101318`, espresso `#171310` — with ivory text and ONE metallic accent, or
   (b) warm paper `#f7f5f0` with near-black ink and one muted accent. Choose
   one; never mix pastel gradients with dark editorial chrome.
3. **Traces of order.** Hairlines (1 px, ≤ 0.16 alpha), index numerals (01/02,
   N°), corner ticks, baseline rules, letter-spaced eyebrows, right-aligned
   folios. These say "a grid existed here". Rounded rectangles with glow say
   "a prompt existed here".
4. **Restraint as identity.** ≤ 2 chromatic colors + neutrals. ≤ 1 accent
   (metallic family: `#c9a86a` gold / `#b08968` bronze / `#9aa2af` steel).
   Every element must earn its place; if it merely fills space, delete it.
5. **Asymmetry.** Centered eyebrow + centered title + centered subtitle +
   centered button is the single most recognizable AI layout. Put the display
   block on one side, a specimen/annotation on the other, metadata in a footer
   band. Let whitespace be uneven on purpose.

## 2. Anti-pattern blacklist (auto-reject)

- Pill chips and capsule buttons (rx = height/2) as the default control shape —
  use hairline-outlined rectangles (rx ≤ 4), underlined text links, or plain
  tracked text with an arrow.
- Gradient halo blobs / aurora fog as decoration for its own sake. If a
  gradient appears, it must be a *material* (one ribbon, one spot, fading to 0),
  not wallpaper.
- Rows of small colored dots / swatch confetti pretending to be design.
- More than one rounded-corner radius per asset; rx > 16 on editorial work.
- Drop-shadow glows on text, neon text-stroke tricks, emoji-grade iconography.
- Three centered text blocks stacked with a button underneath.
- Pastel base + pastel accent + pastel text (no dark anchor → no weight).
- Decoration without semantics: every mark answers "what does this explain?"
  or it goes.

## 3. The ink register (reusable tokens)

The flagship register used by this repo's own specimens:

```text
ground     #101318 → #151923      (2-stop vertical, barely perceptible)
frame      #efe9dc @ 0.12–0.16, 1 px, inset ≥ 20 px from canvas edge
ivory      #efe9dc                 display / primary text
paper      #c9cdd6                 body text
muted      #8b93a1                 metadata, ≥ 11 px only
gold       #c9a86a                 the single accent; numerals, ticks, key lines
hairline   #efe9dc @ 0.12          rules, separators, annotation lines
```

Typographic scale: eyebrow 11 px / ls 5–6 · body 13–15 px · display 56–92 px.
Index numerals: Georgia italic 13–15 px in gold. Corner ticks: 10 px L-marks,
gold @ 0.6, aligned to the frame corners.

## 4. Premium self-check (after gates pass)

1. Squint: do you see 2–3 value masses, or confetti?
2. Is there exactly one accent color, used ≤ 4 times?
3. Does the largest text vs smallest text differ by ≥ 6×?
4. Are there visible hairlines / numerals / rules proving a grid existed?
5. Is anything centered out of habit rather than intent?
6. Remove your favorite element: is the piece still complete? (If yes, it was
   decoration — keep it out.)
7. Would this survive printed at A2 on a wall? Premium survives scale;
   templates only survive at thumbnail size.
