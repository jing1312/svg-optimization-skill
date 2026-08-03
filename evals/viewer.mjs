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
const PREV_ITER = optionValue('--previous') || '';
const OUT_DIR = join(WS, ITER);

const benchmark = JSON.parse(readFileSync(join(OUT_DIR, 'benchmark.json'), 'utf8'));
const EVALS = [
  { id: 1, name: 'eval-1-readme-banner-generation' },
  { id: 2, name: 'eval-2-fix-overflowing-banner' },
  { id: 3, name: 'eval-3-popup-ui-mockup' },
];
const PROMPTS = JSON.parse(readFileSync(join(REPO_ROOT, 'evals', 'evals.json'), 'utf8'));

const cfgLabel = { with_skill: '用技能', without_skill: '不用技能（基线）' };
const cfgColor = { with_skill: '#2f5fb8', without_skill: '#8a94a6' };

let evalsHtml = '';
for (const ev of EVALS) {
  const prompt = PROMPTS.evals.find(e => e.id === ev.id).prompt;
  let panels = '';
  for (const cfg of ['with_skill', 'without_skill']) {
    const dir = join(OUT_DIR, ev.name, cfg, 'outputs');
    const svg = readFileSync(join(dir, 'result.svg'), 'utf8');
    const notes = readFileSync(join(dir, 'notes.md'), 'utf8');
    const grading = JSON.parse(readFileSync(join(OUT_DIR, ev.name, cfg, 'grading.json'), 'utf8'));
    const passed = grading.filter(g => g.passed).length;
    const total = grading.length;
    const gradesHtml = grading.map(g =>
      `<div class="grade ${g.passed ? 'ok' : 'bad'}">${g.passed ? '✓' : '✗'} <b>${g.text}</b> <span class="ev">${g.evidence}</span></div>`
    ).join('');
    const svgData = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    let prevHtml = '';
    if (PREV_ITER) {
      try {
        const prevSvg = readFileSync(join(WS, PREV_ITER, ev.name, cfg, 'outputs', 'result.svg'), 'utf8');
        const prevData = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(prevSvg);
        prevHtml = `<details><summary>上一轮（${PREV_ITER}）</summary><div class="svg-box" style="border-style:dashed"><img src="${prevData}" alt="previous"></div></details>`;
      } catch { /* no previous */ }
    }
    panels += `
    <div class="panel" style="border-top:4px solid ${cfgColor[cfg]}">
      <div class="panel-head"><b>${cfgLabel[cfg]}</b> <span class="score">${passed}/${total} 通过</span></div>
      <div class="svg-box"><img src="${svgData}" alt="${cfg} result"></div>
      ${prevHtml}
      <details><summary>评分明细</summary>${gradesHtml}</details>
      <details><summary>notes.md</summary><pre>${notes.replace(/</g, '&lt;')}</pre></details>
      <textarea class="fb" data-run="${ev.id}-${cfg}" placeholder="你的反馈（可选）：这个输出好在哪/哪里不好？"></textarea>
    </div>`;
  }
  evalsHtml += `
  <div class="eval-block">
    <h2>用例 ${ev.id}：${ev.name}</h2>
    <div class="prompt"><b>Prompt:</b> ${prompt.replace(/</g, '&lt;')}</div>
    <div class="panels">${panels}</div>
  </div>`;
}

const summaryRows = ['with_skill', 'without_skill'].map(cfg => {
  const s = benchmark.run_summary[cfg].pass_rate;
  return `<tr><td>${cfgLabel[cfg]}</td><td>${s.mean}</td><td>${s.stddev}</td><td>${s.min}</td><td>${s.max}</td></tr>`;
}).join('');

const notesHtml = benchmark.notes.map(n => `<li>${n}</li>`).join('');

const html = `<!DOCTYPE html>
<html lang="zh-CN"><head><meta charset="UTF-8"><title>svg-optimization 评测 — ${ITER}</title>
<style>
  body { font-family: "PingFang SC", "Microsoft YaHei", sans-serif; max-width: 1200px; margin: 0 auto; padding: 24px; color: #1c2733; background: #f7f9fc; }
  h1 { font-size: 24px; } h2 { font-size: 18px; margin-top: 36px; }
  .meta { color: #8a94a6; font-size: 13px; }
  .eval-block { background: #fff; border: 1px solid #e3e8f0; border-radius: 12px; padding: 18px 20px; margin-bottom: 24px; }
  .prompt { background: #f2f4f9; border-radius: 8px; padding: 10px 14px; font-size: 13px; margin-bottom: 14px; line-height: 1.6; }
  .panels { display: flex; gap: 16px; flex-wrap: wrap; }
  .panel { flex: 1 1 420px; background: #fbfcfe; border: 1px solid #e3e8f0; border-radius: 10px; padding: 12px 14px; }
  .panel-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; font-size: 14px; }
  .score { color: #2f5fb8; font-weight: 600; font-size: 13px; }
  .svg-box { background: #fff; border: 1px solid #eef1f6; border-radius: 8px; padding: 8px; display: flex; justify-content: center; }
  .svg-box img { max-width: 100%; height: auto; }
  details { margin-top: 8px; font-size: 12.5px; }
  summary { cursor: pointer; color: #5b6b82; }
  .grade { padding: 2px 0; } .grade.ok { color: #1a9e4b; } .grade.bad { color: #c0392b; }
  .grade .ev { color: #8a94a6; margin-left: 6px; }
  pre { background: #f2f4f9; padding: 10px; border-radius: 6px; font-size: 12px; white-space: pre-wrap; }
  .fb { width: 100%; min-height: 56px; margin-top: 10px; border: 1px solid #dfe5ef; border-radius: 8px; padding: 8px; font-family: inherit; font-size: 12.5px; box-sizing: border-box; }
  table { border-collapse: collapse; font-size: 13px; } th, td { border: 1px solid #e3e8f0; padding: 6px 12px; text-align: left; }
  .btn { margin-top: 20px; padding: 10px 20px; background: #2f5fb8; color: #fff; border: none; border-radius: 8px; font-size: 14px; cursor: pointer; }
  .btn.ghost { background: #fff; color: #2f5fb8; border: 1px solid #2f5fb8; margin-left: 8px; }
</style></head>
<body>
<h1>svg-optimization 技能评测 <span class="meta">${ITER} · ${benchmark.metadata.timestamp}</span></h1>
<p class="meta">打开左侧看渲染效果，对比「用技能」和「不用技能」的输出。每个面板下有评分明细和 notes。在文本框中写下你的反馈，最后点「导出反馈」保存。</p>
${evalsHtml}
<h2>基准对比（通过率）</h2>
<table><tr><th>配置</th><th>mean</th><th>stddev</th><th>min</th><th>max</th></tr>${summaryRows}</table>
<p style="color:#8a94a6;font-size:13px;">delta 通过率: ${benchmark.run_summary.delta.pass_rate}</p>
<h2>分析备注</h2>
<ul>${notesHtml}</ul>
<button class="btn" onclick="exportFeedback()">生成反馈内容</button>
<button class="btn ghost" onclick="copyFeedback()">复制反馈内容</button>
<a class="btn ghost" id="dlBtn" download="feedback.json" style="display:none;text-decoration:none;">下载 feedback.json</a>
<div id="toast" style="display:none;margin-top:12px;padding:10px 14px;background:#e8f7ee;border:1px solid #bfe8cd;border-radius:8px;color:#1a9e4b;font-size:13px;"></div>
<textarea id="fbOut" readonly style="display:none;width:100%;height:200px;margin-top:10px;font-family:Consolas,monospace;font-size:12px;border:1px solid #dfe5ef;border-radius:8px;padding:8px;box-sizing:border-box;"></textarea>
<script>
function collectFeedback() {
  const reviews = [];
  document.querySelectorAll('.fb').forEach(el => {
    const run_id = el.dataset.run;
    const feedback = el.value.trim();
    if (feedback) reviews.push({ run_id, feedback, timestamp: new Date().toISOString() });
  });
  return JSON.stringify({ reviews, status: 'complete' }, null, 2);
}
function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.style.display = 'block';
}
function exportFeedback() {
  const json = collectFeedback();
  const out = document.getElementById('fbOut');
  out.value = json;
  out.style.display = 'block';
  const dl = document.getElementById('dlBtn');
  const blob = new Blob([json], { type: 'application/json' });
  if (dl.href) URL.revokeObjectURL(dl.href);
  dl.href = URL.createObjectURL(blob);
  dl.style.display = 'inline-block';
  const n = document.querySelectorAll('.fb').length;
  const filled = document.querySelectorAll('.fb').filter(e => e.value.trim()).length;
  toast('反馈已生成：共 ' + n + ' 个反馈框，' + filled + ' 条已填写。点下方「下载 feedback.json」保存；如无法下载，点「复制反馈内容」后直接粘贴发给我。');
}
function copyFeedback() {
  const out = document.getElementById('fbOut');
  const json = collectFeedback();
  out.value = json;
  out.style.display = 'block';
  out.select();
  navigator.clipboard.writeText(json).then(
    () => toast('已复制到剪贴板，直接粘贴到对话里发给我即可'),
    () => toast('复制失败，请手动选中下方内容复制')
  );
}
</script>
</body></html>`;

const outFile = join(OUT_DIR, 'viewer.html');
writeFileSync(outFile, html);
console.log('viewer written to', outFile);
