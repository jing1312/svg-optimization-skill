# Typography & Font Portability

Fonts are the #1 silent portability bug in SVG: the file has zero embedded
fonts, so every renderer substitutes from its own system. Plan for it.

## 1. Safe font stacks

Always end a stack with a generic family. Prefer names that exist on ≥ 2 of
the big platforms, in this order of portability:

| Role | Stack |
|---|---|
| CJK sans | `"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans SC", system-ui, sans-serif` |
| CJK serif | `"Songti SC", "STSong", "SimSun", "Noto Serif SC", serif` |
| Latin sans | `system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif` |
| Latin serif | `Georgia, "Times New Roman", serif` |
| Mono | `ui-monospace, "SFMono-Regular", Consolas, "Liberation Mono", monospace` |

Avoid platform-exclusive names (`SF Pro`, `HarmonyOS Sans`, `DengXian`…)
anywhere but first position, and never rely on a webfont name unless the SVG
embeds its `@font-face` (rare; bloats the file and may be stripped by
sanitizers).

## 2. Width estimates (pre-flight only)

- CJK glyph ≈ `font-size × 1.0`; Latin/digit ≈ `font-size × 0.56`;
  space ≈ `0.32 × font-size`; `·` ≈ `0.5 × font-size`.
- Add `letter-spacing × (n - 1)` when set.
- Reserved width = estimate + `0.12 × font-size` per side.
- Real fonts deviate (SimSun is narrower than PingFang at the same size), so
  the estimate is for *container sizing*, never a release proof. The render
  tier is the proof.

## 3. Layout habits that survive fallback

- Left-align body copy whenever possible; centered blocks are fine for ≤ 2
  short lines.
- Give CTA chips/headline pills ≥ 10 px extra width beyond the estimate —
  fallback fonts are usually wider than your design font for Latin.
- Keep ≥ 1.35× line height for multi-line text; tighter settings clip
  descenders on some Linux fonts.
- Avoid `textLength` for shrinking text into boxes; measure and re-type
  instead. (`textLength` is honored by the gates when present.)

## 4. When the render shows fallback damage

Symptoms: tofu boxes, visibly wrong metrics (overflow that the estimate
didn't predict), wrong vibe (serif ad rendering in sans). Fixes in order:

1. **Fix the stack** — a missing platform name usually means the stack ends
   too early (§1).
2. **Swap the archetype's font role** — a serif headline that cannot be
   guaranteed may become a sans with display weight; keep the composition.
3. **Convert text to outlines** when the asset must be renderer-proof
   (email, third-party embed, merch). Any vector editor or
   `fonttools`/`opentype`-style tooling can outline text; the result is
   uneditable but pixel-identical everywhere. Warn the user that outlined
   assets lose editability and accessibility `<title>` still carries meaning.
4. **Embed nothing proprietary** — if you embed fonts, they must be licensed
   for embedding; otherwise this is a legal bug as much as a visual one.

## 5. Gate behavior

`evals/grade.mjs` reads `font-size` / `letter-spacing` / `text-anchor` from
attributes, inline `style="…"` and simple class rules in a `<style>` block,
and composes full affine transforms. It cannot know which font the renderer
will pick — that is exactly why T2 rendering exists.
