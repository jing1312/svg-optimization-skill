import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function optionValue(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : '';
}

const WS = resolve(optionValue('--workspace') || process.env.SVG_EVAL_WORKSPACE || join(REPO_ROOT, '.eval-workspace'));
const ITER = optionValue('--iteration') || 'iteration-1';
const OUT_DIR = join(WS, ITER);

const EVALS = [
  { id: 1, name: 'eval-1-readme-banner-generation', label: 'README banner 生成' },
  { id: 2, name: 'eval-2-fix-overflowing-banner', label: '修复文字溢出的 banner' },
  { id: 3, name: 'eval-3-popup-ui-mockup', label: '弹窗界面示意图' },
];

const runs = [];
for (const ev of EVALS) {
  for (const config of ['with_skill', 'without_skill']) {
    const grading = JSON.parse(readFileSync(join(OUT_DIR, ev.name, config, 'grading.json'), 'utf8'));
    const passed = grading.filter(g => g.passed).length;
    const total = grading.length;
    runs.push({
      eval_id: ev.id,
      eval_name: ev.label,
      configuration: config,
      run_number: 1,
      result: {
        pass_rate: +(passed / total).toFixed(2),
        passed,
        failed: total - passed,
        total,
      },
      expectations: grading,
    });
  }
}

function stats(list) {
  if (!list.length) return { mean: 0, stddev: 0, min: 0, max: 0 };
  const mean = list.reduce((a, b) => a + b, 0) / list.length;
  const variance = list.reduce((a, b) => a + (b - mean) ** 2, 0) / list.length;
  return {
    mean: +mean.toFixed(3),
    stddev: +Math.sqrt(variance).toFixed(3),
    min: +Math.min(...list).toFixed(3),
    max: +Math.max(...list).toFixed(3),
  };
}

const withRates = runs.filter(r => r.configuration === 'with_skill').map(r => r.result.pass_rate);
const withoutRates = runs.filter(r => r.configuration === 'without_skill').map(r => r.result.pass_rate);

const benchmark = {
  metadata: {
    skill_name: 'svg-optimization',
    skill_path: 'SKILL.md',
    executor_model: process.env.SVG_EVAL_MODEL || 'unspecified',
    timestamp: new Date().toISOString(),
    evals_run: [1, 2, 3],
    runs_per_configuration: 1,
  },
  runs,
  run_summary: {
    with_skill: { pass_rate: stats(withRates) },
    without_skill: { pass_rate: stats(withoutRates) },
    delta: { pass_rate: `+${(stats(withRates).mean - stats(withoutRates).mean).toFixed(3)}` },
  },
  notes: [
    'iteration-1 定量评分：有/无 skill 全部断言通过（11/11、12/12、15/15），评分器无法区分二者——结构正确性门槛（无溢出/无重叠/不越界）两侧都满足',
    '评分器 v1 曾误报 3 类失败：<g font-size> 继承字号、低透明度装饰圆刻意出界裁剪、mockup 不需要胶囊断言——已修正为 v2',
    '定量无法衡量的差距需要人工评审：视觉层次、字距、基线对齐、图标质量、配色一致性',
    'with_skill 输出普遍采用技能规定的模式（defs 渐变复用、font-family 根级、胶囊 rx=高/2、x 链式排布、20px 内边距），baseline 输出结构各异',
    '评测 2 中 with_skill 运行用浏览器 getBBox 实测验证了文字宽度，符合技能工作流；baseline 用估算',
  ],
};

writeFileSync(join(OUT_DIR, 'benchmark.json'), JSON.stringify(benchmark, null, 2));

let md = `# svg-optimization Benchmark — ${ITER}\n\n`;
md += `- skill: svg-optimization\n- 时间: ${benchmark.metadata.timestamp}\n- 运行数: 3 用例 × 2 配置\n\n`;
md += '## 通过率\n\n| 配置 | mean | stddev | min | max |\n|---|---|---|---|---|\n';
for (const cfg of ['with_skill', 'without_skill']) {
  const s = benchmark.run_summary[cfg].pass_rate;
  md += `| ${cfg} | ${s.mean} | ${s.stddev} | ${s.min} | ${s.max} |\n`;
}
md += `\n| delta | ${benchmark.run_summary.delta.pass_rate} |\n`;
md += '\n## 各用例\n\n| 用例 | 配置 | 通过 |\n|---|---|---|\n';
for (const r of runs) {
  md += `| ${r.eval_name} | ${r.configuration} | ${r.result.passed}/${r.result.total} |\n`;
}
md += '\n## 分析\n\n';
for (const n of benchmark.notes) md += `- ${n}\n`;
writeFileSync(join(OUT_DIR, 'benchmark.md'), md);
console.log('benchmark.json + benchmark.md written to', OUT_DIR);
