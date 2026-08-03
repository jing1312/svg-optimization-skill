# svg-optimization-skill

手写 SVG 配图生成与优化技能：README banner、界面示意图、流程图、社交卡片。

## 核心思想

SVG 的 `<text>` **不会自动撑开**容器 `<rect>`——文字宽度和卡片宽度是两个独立
数字，必须手动测量、回填、重排。本 skill 把「浏览器实测文字宽度 → 回填坐标 →
重排布局 → 浏览器迭代验证」沉淀成一套可复现的工作流，并附带了离线测量工具，
保证每次测量的尺子一致。

## 安装

### Claude Code / Codex

将整个 `skills/svg-optimization/` 目录复制到你的 skills 目录：

```bash
# Claude Code
cp -r skills/svg-optimization ~/.claude/skills/

# Codex
cp -r skills/svg-optimization ~/.codex/skills/
```

### opencode

复制到 `~/.agents/skills/svg-optimization/`：

```bash
cp -r skills/svg-optimization ~/.agents/skills/
```

### 手动使用

不需要安装任何东西——`scripts/measure_text.html` 双击即可在浏览器中使用；
`references/design-patterns.md` 和 `assets/examples/` 里的样例可以直接抄。

## 目录结构

```text
skills/svg-optimization/
├── SKILL.md                        主流程：生成 → 测量 → 回填 → 验证 → 迭代
├── README.md                       本文件
├── references/
│   └── design-patterns.md          banner / UI 示意图 / 手绘图标 / 配色，可抄代码
├── scripts/
│   └── measure_text.html           离线文字宽度测量工具（浏览器打开即用）
├── assets/
│   └── examples/                   真实项目产出的完整样例
│       ├── banner-example.svg      1100×300 项目 banner（实测宽度重排后）
│       └── popup-mockup-example.svg 860×730 弹窗界面示意图（含投影/状态徽章）
└── evals/
    └── evals.json                  基准测试用例
```

## 一句话工作流

1. **结构先行**：defs → 背景 → 装饰 → 内容分组，`viewBox` 必写
2. **先测后画**：measure_text.html 量出文字宽度，`rect.width = 文字宽 + 2×内边距`
3. **链式排布**：同行元素 x 坐标依次相加，改一个宽就重跑整条链
4. **浏览器验证**：打开 SVG 看渲染（不是看代码），溢出/重叠/出界就重测重排
5. **迭代 2–4 轮**是常态，直到渲染正确再交付

## 验证

```bash
cd evals
node run_eval.mjs          # 跑基准测试（需要按说明放置工作区）
```

## License

MIT
