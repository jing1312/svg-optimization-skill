# svg-optimization-skill

A design skill for producing **dreamy, summer-warm, airy SVG brand assets** —
promo banners, extension popup mockups, logos and illustration boards — for a
study / knowledge-verification product. Every motif is semantic (explainable in
one sentence), every effect stays inside a six-layer budget, and preference
learning is local, structured and forgettable.

## What it does

- Builds restylable `1100x300` banners, `860x730` popup mockups and logo tiles.
- Enforces a **motif brief** (message / visual nouns / relationship) before any
  shape is drawn — if a motif can't be explained in one sentence tied to the
  copy, it is deleted rather than decorated.
- Applies a controlled **six-layer effect stack**: gradient base, one ambient
  halo, one colored soft shadow, one translucent liner, one clipped gloss, one
  primary illustration. No unbounded blur, no repeated glow, no scattered dots.
- Renders the logo as Lucide `book-open-check` (ISC) + chapter-relationship node
  ring + verification shield, carrying full provenance metadata.

## Quick start

Requires Node.js 18+.

```bash
npm install            # no runtime deps; this just sets up the lockfile-less tree
npm test               # 21 unit + repository-structure tests
npm run check          # XML well-formedness + logo quality gates
git diff --check       # whitespace/formatting sanity
```

### Local preference CLI

Preference learning is session-only by default. Persisted weights are whitelist
keys with clamped numeric values only — never raw feedback. See `PRIVACY.md`.

```bash
node scripts/preferences.mjs show
node scripts/preferences.mjs record --key material.glass --delta 1
node scripts/preferences.mjs forget --key material.glass
node scripts/preferences.mjs reset
```

Offline text measurement (to keep `<text>` from overflowing) lives in
`scripts/measure_text.html` — open it in a browser.

## Style directions

`references/style-system.md` documents three seasonal palettes plus the frozen
historical sets. Current default is **J · 梦幻极光** applied to the official
banner and popup; **K · 夏日汽水** stays a swappable seasonal theme, and **L ·
暖阳纸片** is an alternate quiet option. The original deep-sea look is kept at
`assets/examples/banner-deepsea-baseline.svg` as a regression baseline.

## Example assets

| File | Canvas | Shows |
|---|---|---|
| `banner-example.svg` | 1100×300 | Official J-theme banner, edge-clipped bubbles |
| `popup-mockup-example.svg` | 860×730 | Extension popup on a dark browser backdrop |
| `style-options-example.svg` | 1060×1090 | J/K/L chooser, banner thumb + popup crop each |
| `brand-theme-pair.svg` | 1200×760 | J × K seasonal suite |
| `logo-concepts.svg` | 1240×660 | Logo refinement incl. 48 px previews |
| `ornate-style-gallery.svg` | 1320×960 | Six semantic motif cards |
| `dreamy-detail-board.svg` | 920×800 | Four-card base illustration grammar |
| `banner-deepsea-baseline.svg` | 1100×300 | Frozen A-direction regression baseline |

## Repository layout

```
SKILL.md                  skill triggers, workflow, logo + privacy rules
PRIVACY.md                public-release boundary
THIRD_PARTY_NOTICES.md    Lucide (ISC) attribution
LICENSE                   project license (ISC)
references/               design-patterns, style-system, logo-system
assets/examples/          the SVG assets above
scripts/                  preferences.mjs, measure_text.html
evals/grade.mjs           structural + logo quality gates
tests/                    21 unit + repository tests
```

## Privacy

Public by design: no raw chat, feedback, credentials, machine paths or usernames
are ever committed; preferences persist only whitelisted numeric weights and are
forgettable. See [`PRIVACY.md`](PRIVACY.md).

## License

ISC — see [`LICENSE`](LICENSE). The logo glyph is adapted from the Lucide icon
`book-open-check` (ISC); see [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md).
