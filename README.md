<div align="center">
  <img src="docs/images/hero-cover.svg" alt="SVG Visual System Engine" width="100%" />
</div>

<div align="center">

# svg-optimization-skill

## SVG Visual System Engine

**SVG 不是代码片段，而是一套视觉语言。**

让 AI Agent 生成具有设计规则、材质逻辑、排版体系和质量审查能力的 SVG 资产，
再用可视化编辑器手工打磨，最后经质量门禁与评测管线放行。

[![ci](https://github.com/jing1312/svg-optimization-skill/actions/workflows/ci.yml/badge.svg)](https://github.com/jing1312/svg-optimization-skill/actions/workflows/ci.yml)

</div>

---

A practical skill for creating and repairing compact SVG assets used in
READMEs, documentation, and product pages. It combines hand-authored
composition with measured typography, semantically selected open-source icon
paths, a design-token system, a JSON-driven SVG generator, and a full visual
editor — all verified by automated quality gates and eval tooling.

## Why

大多数 AI 生成 SVG 的问题不是"不会画"，而是：元素堆叠没有视觉中心、渐变和
玻璃效果滥用、字体层级混乱、配色没有系统、每次生成都是随机风格。

这个 Skill 把 SVG 设计从"效果生成"升级为"视觉系统生成"：

- **Archetype** — 五种核心视觉语言：Dreamlight / Editorial / Material Craft /
  Glass Intelligence / Mono System
- **Palette** — 颜色是角色不是装饰：surface / ink / accent / material /
  shadow / glow 全部走 token
- **Layout** — Hero / Grid / Poster / Object Showcase，一个主题一个主视觉一个层级

## Design Token System

所有 SVG 资产的单一数据源（`scripts/tokens.js`）：

| Token 类别 | 值 | 说明 |
|---|---|---|
| 字号阶梯 | 72 / 48 / 32 / 24 / 18 / 13 | Display → Caption |
| 间距系统 | 4 / 8 / 16 / 24 / 32 / 48 / 64 / 96 / 128 | `T.space(n)` 按步取值 |
| 线宽系统 | 1 / 1.5 / 2 / 3 / 4 | Hairline → Heavy |
| 行高比例 | 1.12 / 1.25 / 1.30 / 1.35 / 1.55 / 1.50 | Display → Caption |
| viewBox 尺寸 | banner / card / gallery / poster 等 | 按布局角色命名 |

```js
import { T } from "./scripts/tokens.js";
T.font.title        // 48
T.space(2)          // 16
T.stroke.medium     // 2
T.canvas.banner     // { w: 1100, h: 300 }
```

## SVG Generator

`scripts/generate-svg.mjs` — 输入 JSON 配置，按 token 系统自动计算坐标，输出
合规 SVG。支持 `banner` / `card` / `gallery` / `poster` 四种布局和
`brand` / `dreamlight` / `editorial` / `glass` / `mono` / `earth` 六种配色。

```bash
node scripts/generate-svg.mjs config.json > output.svg
echo '{"layout":"banner","palette":"brand","title":"Hello"}' | node scripts/generate-svg.mjs --stdin
node scripts/generate-svg.mjs --layout banner --palette dreamlight --title "标题" --subtitle "副标题"
```

```js
import { generate } from "./scripts/generate-svg.mjs";
const svg = generate({ layout: "gallery", palette: "editorial", title: "功能展示",
  cols: 3, rows: 2, items: [{ title: "卡片一", subtitle: "描述" }] });
```

## Examples

### Hand-authored examples (`assets/examples/`)

Every figure below is a hand-authored SVG — no image generators, no design
tools, just the workflow documented in this repository. Open any of them in
`scripts/editor.html` to see the visual editor round-trip.

<p align="center">
  <img src="assets/examples/banner-example.svg" alt="Banner produced with this skill" width="640">
</p>

<table>
  <tr>
    <td align="center">
      <img src="assets/examples/style-options-example.svg" alt="Style options comparison" width="340"><br>
      <sub>Complete style directions compared side by side</sub>
    </td>
    <td align="center">
      <img src="assets/examples/brand-theme-pair.svg" alt="Seasonal brand and theme pair" width="340"><br>
      <sub>Seasonal brand suite with matching theme tokens</sub>
    </td>
  </tr>
  <tr>
    <td align="center">
      <img src="assets/examples/dreamy-detail-board.svg" alt="Dreamy detail board" width="340"><br>
      <sub>Detail board with layered material and soft palette</sub>
    </td>
    <td align="center">
      <img src="assets/examples/popup-mockup-example.svg" alt="Popup mockup" width="340"><br>
      <sub>Popup mockup with measured typography</sub>
    </td>
  </tr>
  <tr>
    <td align="center" colspan="2">
      <img src="assets/examples/logo-concepts.svg" alt="Logo concept sheet" width="480"><br>
      <sub>Logo concepts with semantic motifs and bounded effects</sub>
    </td>
  </tr>
</table>

### Visual reference standards (`examples/`)

`examples/v2/`（dreamlight-hero / editorial-poster / glass-intelligence）与
`examples/zhiliao-study/`、`examples/hero-summer.svg` 等是 AI 的视觉参考标准：
每种风格声明 `data-style-id`、语义 motif 与材质预算，由质量门禁全量扫描。

## Workflow

1. Define the visual brief, reading order, and semantic motif using
   `references/design-system.md`.
2. If style is unclear or a redesign is requested, compare two or three
   complete directions from `references/style-system.md` (or the v2 style
   library in `references/style-library.md`) and let the user pick.
3. Choose the canvas and layout, then assign color, typography, spacing, and
   material roles from the shared design system.
4. Measure visible strings with `scripts/measure_text.html`.
5. Source a relevant glyph from Lucide, Tabler, or Phosphor and record its
   license — or derive tokens with `scripts/tokens.js`.
6. Build and render the SVG in a browser, or generate a base with
   `scripts/generate-svg.mjs`.
7. Add motion only when it explains state or progress, with a static fallback.
8. Inspect at intrinsic and small sizes, compare against the incumbent, and
   apply the anti-pattern gate.
9. Run the automated checks.

## Visual editor

`scripts/editor.html` is a single-file, offline, dependency-free visual editor
(double-click to open; Chrome/Edge recommended). Drag an SVG in, edit it by
hand, and Ctrl+S writes back to the same file.

- Full smart snapping: red guide lines (edge/center), live equal-gap badges,
  and same-kind recognition that snaps a third badge into the column with the
  matching width and gap. Hold Ctrl to place freely.
- Double-click text to retype — containers re-measure and re-fit automatically.
- 8-way resize handles for rect / circle / ellipse / text / image **and
  g / path** (anchor-preserving scale transforms — consecutive resizes compose,
  and snapping/marquee stay correct because the mover's bbox already reflects
  the composed transform).
- Layout templates (布局 dropdown) arrange the current selection on the canvas:
  left-right columns, centered stack, title + feature row, and diagonal flow.
  Every arrangement is one undo step.
- Component colors follow the theme dropdown by default; `🎨 收藏配色` locks a
  palette captured from the selection so new components keep it across themes,
  and `↺ 跟随主题` restores theme-following. The chosen theme itself is
  remembered between sessions.
- `◐ 体检` runs a WCAG contrast check: it tests every text fill against the
  topmost solid background beneath it (3:1 for large text, 4.5:1 otherwise),
  marks failures with dashed red boxes and ratio badges (Esc clears), and the
  theme button pre-checks contrast before you apply a recolor.
- The mix dropdown (混色) styles newly inserted components: solid, vertical
  band gradient, diagonal aurora gradient, or cycling multi-color.
- 12 built-in themes with preview-then-confirm recoloring that preserves
  hand-picked colors; PNG 2x/4x export (Shift-click trims empty canvas margins
  to the content bounds); one-click clean-SVG copy; autosaved drafts with
  restore.
- Shortcuts: arrows nudge 1px (Shift 10px), Alt-drag duplicates, Ctrl+Z/Y undo,
  Ctrl+C/V, F focus selection, Ctrl+0 reset view, wheel zoom, Space+drag pan.

Rebuild the artifact after editing `src/editor/*`:

```bash
node scripts/build-editor.mjs
```

### Config previewer (`tools/editor/`)

A separate lightweight previewer for the JSON generator: pick layout / palette /
text and gallery rows, edit the JSON config directly, and export SVG or 2x PNG.
Serve the repo over HTTP (`npx serve .`) and open `/tools/editor/`.

## Installation

Copy this repository directory into the skills folder used by your agent:

```bash
# Codex
cp -r svg-optimization-skill ~/.codex/skills/svg-optimization

# Claude Code
cp -r svg-optimization-skill ~/.claude/skills/svg-optimization

# Agents / OpenCode
cp -r svg-optimization-skill ~/.agents/skills/svg-optimization
```

No runtime dependency is required for normal skill use. Node.js 18 or newer is
needed only for automated checks, generator tooling, and evals.

## Validation

SVG 输出经过三层检查：Design Intent → Structural Validation → Aesthetic Review
→ Release。

```bash
npm test
npm run check

# Quality gates over examples/ and docs/ (XML, refs, logo, blur, motifs,
# geometry G1–G4, contrast C1)
node evals/grade.mjs

# Check one logo-bearing SVG
node evals/grade.mjs --check-logo assets/examples/banner-example.svg

# Grade a generated eval workspace
node evals/grade.mjs --workspace ./my-eval-workspace --iteration iteration-1
node evals/aggregate.mjs --workspace ./my-eval-workspace --iteration iteration-1
node evals/viewer.mjs --workspace ./my-eval-workspace --iteration iteration-1
```

The eval workspace defaults to `.eval-workspace/` and can also be set with
`SVG_EVAL_WORKSPACE`.

## AI Design Rules

生成前必须回答：这个 SVG 要传达什么？核心视觉元素是什么？每个材质为什么存在？

禁止：随机光球、无意义渐变、玻璃效果堆叠、元素拼贴、模板化卡片布局。

> 高级感来自控制，而不是增加。

## Local preference controls

Persistence is opt-in. When enabled, the profile stays outside this repository
and stores only small numeric weights for known style dimensions. It never
stores prompts, raw feedback, project content, URLs, or local paths.

```bash
node scripts/preferences.mjs show
node scripts/preferences.mjs forget --key material.glass
node scripts/preferences.mjs reset
```

On hosts without a writable profile, keep preferences in the current session.

## Repository layout

```text
assets/examples/             Browser-verified banner, mockup, logo, and style choices
brand-packs/                 Frozen brand pack (zhiliao-study)
docs/                        Specs, plans, and hero/effect figures
examples/                    v2 visual reference standards + brand-pack renders
evals/                       Quality gates (grade.mjs), workspace grader, aesthetic scoring
memory/                      Design memory: successful compositions and rejected rules
references/                  Design system, style library, logo system, tokens, typography…
scripts/                     tokens.js, generate-svg.mjs, render.mjs, measure_text.html,
                             preferences.mjs, build-editor.mjs
src/editor/                  Visual editor modules (built into scripts/editor.html)
tools/editor/                Config-driven previewer for the generator
SKILL.md                     Agent workflow and delivery checklist
PRIVACY.md                   Rules for safe public artifacts
THIRD_PARTY_NOTICES.md       Icon licenses and attribution
```

## Privacy

Do not store raw conversations, original user feedback, internal handoff
notes, private prompts, local paths, or secrets in this repository. Convert
useful feedback into anonymous, reusable guidance. See `PRIVACY.md`.

## Philosophy

> 门禁保证 SVG 不坏。设计系统保证 SVG 不普通。

这个项目不是 SVG 模板库，它是一套让 AI 理解视觉设计的方法。

## License

Project code and documentation are MIT licensed. Embedded Lucide icon paths
are available under the ISC license; see `THIRD_PARTY_NOTICES.md` and the
bundled `LICENSE` file.
