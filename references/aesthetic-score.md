# Aesthetic Quality Score (V2)

Structural validation proves an SVG is not broken.
Aesthetic scoring evaluates whether it is designed.

The score is divided into six dimensions.

```
Aesthetic Score =
Composition 25
+ Hierarchy 20
+ Color 15
+ Typography 15
+ Material 15
+ Motion 10
```

---

# 1. Composition (25)

Evaluate:

- Is there one clear visual focus?
- Does the layout have intentional negative space?
- Are elements aligned to a hidden grid?
- Does the composition avoid random decoration?

Fail signals:

- sticker collection feeling
- multiple competing focal points
- empty space filled only for decoration

---

# 2. Hierarchy (20)

Evaluate:

- Can the viewer identify primary information in 2 seconds?
- Are size differences meaningful?
- Are secondary elements actually secondary?

Fail signals:

- everything has equal emphasis
- too many highlights
- weak title/body distinction

---

# 3. Color System (15)

Evaluate:

- Does every color have a role?
- Is there a dominant palette?
- Are accents controlled?

Rules:

- maximum 4 chromatic colors
- one dominant accent
- avoid unrelated gradients

Fail signals:

- rainbow palettes
- decorative color noise
- inconsistent temperature

---

# 4. Typography (15)

Evaluate:

- hierarchy scale
- line-height
- spacing
- font pairing

Default quality targets:

```
display 72
headline 48
section 32
body 18
caption 13
```

Fail signals:

- random font sizes
- insufficient spacing
- title/body ratio collapse

---

# 5. Material Quality (15)

Evaluate whether effects describe real material behavior.

Glass:
- transparency
- reflection
- depth

Paper:
- grain
- edge
- shadow

Light:
- direction
- atmosphere

Fail signals:

- glow without a source
- blur everywhere
- fake luxury effects

---

# 6. Motion Quality (10)

Evaluate animation purpose.

Good motion:

- explains material
- guides attention
- improves interaction

Bad motion:

- constant floating
- random rotation
- decorative movement

---

# AI Pattern Penalties

Subtract points for:

- random gradient blobs
- excessive glass cards
- icon/title/subtitle template layouts
- unnecessary particles
- multiple unrelated effects

The goal is not more effects.
The goal is intentional visual decisions.
