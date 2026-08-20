<div align="center">
  <img src="docs/images/hero-cover.svg" alt="SVG Visual System Engine" width="100%" />
</div>

<div align="center">

# svg-optimization-skill

## SVG Visual System Engine

**SVG 不是代码片段，而是一套视觉语言。**

让 AI Agent 生成具有设计规则、材质逻辑、排版体系和质量审查能力的 SVG 资产。

[![ci](https://github.com/jing1312/svg-optimization-skill/actions/workflows/ci.yml/badge.svg)](https://github.com/jing1312/svg-optimization-skill/actions/workflows/ci.yml)

</div>

---

## 为什么需要它

大多数 AI 生成 SVG 的问题不是"不会画"，而是：

- 元素堆叠，没有视觉中心
- 渐变和玻璃效果滥用
- 字体层级混乱
- 配色没有系统
- 动效只是装饰
- 每次生成都是随机风格

这个 Skill 把 SVG 设计从"效果生成"升级为"视觉系统生成"。

---

# Design System

V2 使用三层视觉决策模型：

```
Archetype
    ↓
Palette
    ↓
Layout
```

## Archetype

五种核心视觉语言：

| 系统 | 定位 |
|---|---|
| Dreamlight | 高级未来、情绪科技 |
| Editorial | 杂志、文化、权威 |
| Material Craft | 工艺、纸张、自然材质 |
| Glass Intelligence | AI、界面、未来产品 |
| Mono System | 专业工具、企业系统 |

---

## Palette

颜色不是装饰，而是角色：

- surface
- ink
- accent
- material
- shadow
- glow

所有资产遵循 token 系统，而不是随机选色。

---

## Layout

布局决定信息关系：

- Hero
- Grid
- Poster
- Object Showcase

一个优秀 SVG：

> 一个主题，一个主视觉，一个清晰层级。

---

# Design Token System

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

---

# SVG 生成工具

`scripts/generate-svg.mjs` — 输入 JSON 配置，按 token 系统自动计算坐标，输出合规 SVG。

## 支持的布局

| 布局 | 说明 | viewBox |
|---|---|---|
| `banner` | 横幅，含 logo + 标题 + CTA | 1100 × 300 |
| `card` | 单卡片，含图标 + 标题 + 副标题 | 380 × 300 |
| `gallery` | 多卡片网格，自动计算尺寸 | 按列行数动态 |
| `poster` | 竖版海报，衬线字体 | 900 × 1200 |

## 支持的配色

`brand` / `dreamlight` / `editorial` / `glass` / `mono` / `earth`

## 命令行用法

```bash
# 从 JSON 文件生成
node scripts/generate-svg.mjs config.json > output.svg

# 从 stdin 生成
echo '{"layout":"banner","palette":"brand","title":"Hello"}' | node scripts/generate-svg.mjs --stdin

# 从参数生成
node scripts/generate-svg.mjs --layout banner --palette dreamlight --title "标题" --subtitle "副标题"
```

## 编程用法

```js
import { generate } from "./scripts/generate-svg.mjs";
const svg = generate({
  layout: "gallery",
  palette: "editorial",
  title: "功能展示",
  cols: 3,
  rows: 2,
  items: [
    { title: "卡片一", subtitle: "描述" },
    // ...
  ],
});
```

---

# 交互式编辑器

`tools/editor/` — 浏览器中的实时 WYSIWYG SVG 编辑器。

## 功能

- **左侧实时预览**：所见即所得的 SVG 画布
- **右侧参数面板**：
  - 布局类型（Banner / Card / Gallery / Poster）
  - 配色方案（6 种 palette）
  - 文字内容（标题、副标题、CTA）
  - Gallery 列行数
  - JSON 配置直接编辑
- **Token 展示**：字号、间距、线宽 token 可视化
- **导出**：SVG 文件 / PNG 文件（2x retina）/ 复制 SVG 代码

## 启动

```bash
# 方式一：直接用浏览器打开
# 注意：因为使用了 ES Module import，需要通过 HTTP 服务器访问

# 方式二：用任意静态服务器
npx serve .   # 然后访问 /tools/editor/

# 方式三：Python
python3 -m http.server 8080   # 然后访问 http://localhost:8080/tools/editor/
```

编辑器会自动从 `scripts/tokens.js` 加载 token 系统，所有生成的 SVG 都遵循统一的设计规范。

---

# AI Design Rules

生成前必须回答：

1. 这个 SVG 要传达什么？
2. 核心视觉元素是什么？
3. 每个材质为什么存在？

禁止：

- 随机光球
- 无意义渐变
- 玻璃效果堆叠
- 元素拼贴
- 模板化卡片布局

高级感来自控制，而不是增加。

---

# Quality Pipeline

SVG 输出经过三层检查：

```
Design Intent
      ↓
Structural Validation
      ↓
Aesthetic Review
      ↓
Release
```

包含：

- XML 检查
- 引用完整性
- 几何验证
- 对比度检查
- 排版审查
- 材质审查
- 动效审查

运行质量门禁：

```bash
node evals/grade.mjs
```

---

# Examples

当前 V2 示例：

```
examples/v2/

├── dreamlight-hero.svg
├── editorial-poster.svg
└── glass-intelligence.svg
```

这些不是效果展示，而是 AI 的视觉参考标准。

---

# Installation

```bash
git clone https://github.com/jing1312/svg-optimization-skill.git
```

将 `SKILL.md` 和 `references/` 提供给支持 Agent Skill 的 AI Agent。

---

# Project Structure

```
SKILL.md

references/
 ├── design-tokens.md
 ├── style-library.md
 ├── aesthetic-score.md
 ├── motion-library.md
 └── anti-ai.md

scripts/
 ├── tokens.js          # 设计 token 系统（单一数据源）
 ├── generate-svg.mjs   # SVG 生成工具
 └── render.mjs         # SVG → PNG 渲染

tools/
 └── editor/
     ├── index.html     # 交互式编辑器
     ├── style.css
     └── app.js

examples/
 └── v2/

evals/
 ├── grade.mjs          # 质量门禁
 └── aesthetic-score.mjs
```

---

# Philosophy

> 门禁保证 SVG 不坏。
>
> 设计系统保证 SVG 不普通。

这个项目不是 SVG 模板库。

它是一套让 AI 理解视觉设计的方法。
