import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');

function publicFiles(directory = repoRoot, prefix = '') {
  const excluded = new Set(['.git', '.eval-workspace', 'node_modules', 'tests']);
  const files = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (excluded.has(entry.name)) continue;
    const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) files.push(...publicFiles(join(directory, entry.name), relativePath));
    else files.push(relativePath);
  }
  return files;
}

function read(relativePath) {
  return readFileSync(join(repoRoot, relativePath), 'utf8');
}

const publicExamples = [
  'assets/examples/banner-example.svg',
  'assets/examples/popup-mockup-example.svg',
  'assets/examples/dreamy-detail-board.svg',
  'assets/examples/style-options-example.svg',
  'assets/examples/logo-concepts.svg',
  'assets/examples/brand-theme-pair.svg',
];

const brandTokens = new Set([
  '#F5F3F0', '#FBFAF8', '#24263A', '#686979', '#5F61C7', '#383B73',
  '#A79AE8', '#56B59A', '#E8A38F', '#D8D8E5', '#FFFFFF', '#54516F',
]);

function hexColors(svg) {
  return [...svg.matchAll(/#[0-9A-Fa-f]{6}/g)].map(match => match[0].toUpperCase());
}

test('private feedback handoff is not published', () => {
  assert.equal(existsSync(join(repoRoot, 'USER-FEEDBACK-HANDOFF.md')), false);
  assert.doesNotMatch(read('README.md'), /USER-FEEDBACK-HANDOFF|用户逐轮真实反馈/);
});

test('public files do not contain shared-chat or repository-specific handoff artifacts', () => {
  const unsafeFilename = /(?:^|\/)(?:user[-_ ]?feedback|handoff|chat[-_ ]?transcript|raw[-_ ]?prompt)/i;
  const unsafeContent = /chatgpt\.com\/share\/|USER-FEEDBACK-HANDOFF/i;
  assert.deepEqual(publicFiles().filter(file => unsafeFilename.test(file)), []);
  assert.deepEqual(publicFiles().filter(file => unsafeContent.test(read(file))), []);
});

test('public files do not expose local home directories', () => {
  const homePath = /[A-Za-z]:[\\/]+Users[\\/]+[^\s"'`/\\]+/;
  const leaks = publicFiles().filter(file => homePath.test(read(file)));
  assert.deepEqual(leaks, []);
});

test('public templates use clearly fictional identifiers', () => {
  assert.match(read('assets/examples/banner-example.svg'), /开卷助手/);
  assert.match(read('assets/examples/popup-mockup-example.svg'), /开卷助手/);
  assert.match(read('assets/examples/popup-mockup-example.svg'), /example\.com/);
  assert.match(read('evals/fixtures/broken-banner.svg'), /开卷助手/);
});

test('logo guidance starts with a semantic brief instead of a fixed glyph', () => {
  const skill = read('SKILL.md');
  const logoSystem = read('references/logo-system.md');
  assert.match(skill, /## Logo brief/);
  assert.match(skill, /semantic|语义/i);
  assert.doesNotMatch(skill, /default logo glyph|default to a \*\*lightning bolt/i);
  assert.match(logoSystem, /secondary-motif sentence/);
});

test('banner guidance and example use clipped, edge-entering bubble depth', () => {
  const skill = read('SKILL.md');
  const svg = read('assets/examples/banner-example.svg');

  assert.match(skill, /centers? outside|中心.*画布外/i);
  assert.match(skill, /clip the whole decoration layer/i);
  assert.match(skill, /fragments, not a row of fully visible circles/i);
  assert.match(svg, /<clipPath id="bannerClip">/);
  assert.match(svg, /<g clip-path="url\(#bannerClip\)"/);

  const circles = [...svg.matchAll(/<circle\b[^>]*cx="(-?[\d.]+)"[^>]*cy="(-?[\d.]+)"[^>]*r="([\d.]+)"[^>]*>/g)];
  const edgeEntering = circles.filter(([, cx, cy, radius]) => {
    const x = Number(cx);
    const y = Number(cy);
    const r = Number(radius);
    return x - r < 0 || x + r > 1100 || y - r < 0 || y + r > 300;
  });

  assert.ok(edgeEntering.length >= 3, `expected at least 3 edge-entering bubbles, found ${edgeEntering.length}`);
});

test('style chooser uses complete directions and host-compatible fallbacks', () => {
  const skill = read('SKILL.md');
  const system = read('references/style-system.md');
  const options = read('assets/examples/style-options-example.svg');
  assert.match(skill, /clickable cards/);
  assert.match(skill, /style-options\.svg/);
  assert.match(skill, /Markdown table/);
  assert.match(system, /A · Deep-sea glass|A · 深海玻璃/);
  assert.match(system, /D · Swiss editorial|D · 瑞士编辑/);
  assert.match(options, /相同内容/);
  assert.ok((options.match(/<g transform="translate\(/g) || []).length >= 3);
  assert.equal((options.match(/开卷助手/g) || []).length >= 3, true);
});

test('design system foundation defines coherent visual roles and rejection gates', () => {
  const skill = read('SKILL.md');
  const systemPath = join(repoRoot, 'references', 'design-system.md');
  assert.equal(existsSync(systemPath), true);

  const system = read('references/design-system.md');
  assert.match(skill, /references\/design-system\.md/);
  assert.match(system, /## 2\. Visual hierarchy/);
  assert.match(system, /## 3\. Role-based color system/);
  assert.match(system, /## 4\. Typography scale/);
  assert.match(system, /## 5\. Spacing rhythm/);
  assert.match(system, /## 6\. Material and effect budget/);
  assert.match(system, /## 8\. Motion principles/);
  assert.match(system, /## 9\. Anti-pattern gate/);
  assert.match(system, /random gradients/);
  assert.match(system, /obvious decorative curves/);
  assert.match(system, /unrelated motifs/);
  assert.match(system, /logo container overpowering glyph/);
  assert.match(system, /motion without semantic purpose/);
});

test('design workflow follows brief, system, rendering, and comparison order', () => {
  const skill = read('SKILL.md');
  const orderedSteps = [
    'Define the visual brief',
    'Choose one design language',
    'Write a semantic logo brief',
    'Assign role-based color tokens',
    'Map every text role',
    'Add motion only when',
    'Measure every visible string',
    'Render the file in a browser',
    'Compare the candidate',
  ];
  let previous = -1;
  for (const step of orderedSteps) {
    const position = skill.indexOf(step);
    assert.ok(position > previous, `workflow step is missing or out of order: ${step}`);
    previous = position;
  }
});

test('self-evolution boundary is local, allowlisted, and human-reviewed', () => {
  const system = read('references/design-system.md');
  assert.match(system, /local preference ranking, not autonomous rewriting/i);
  assert.match(system, /allowlisted numeric weight/i);
  assert.match(system, /Never persist raw feedback, private prompts/i);
  assert.match(system, /Never send\s+the profile to a remote service/i);
  assert.match(system, /human-reviewed code change/i);
});

test('approved seasonal themes share one brand semantic system', () => {
  const pair = read('assets/examples/brand-theme-pair.svg');
  assert.match(pair, /J · 梦幻极光/);
  assert.match(pair, /K · 夏日汽水/);
  assert.match(pair, /data-role="logo"|book-open-check/);
  assert.ok((pair.match(/开卷助手/g) || []).length >= 4);
  assert.match(pair, /共享 Logo、文案和信息结构/);
});

test('public SVG examples use one shared brand token palette', () => {
  for (const file of publicExamples) {
    const svg = read(file);
    assert.match(svg, /viewBox="[^"]+"/);
    assert.match(svg, /<title\b[^>]*>[^<]+<\/title>/);
    assert.match(svg, /<desc\b[^>]*>[^<]+<\/desc>/);
    assert.match(svg, /#5F61C7/i, `${file} should expose the primary indigo token`);
    assert.match(svg, /#A79AE8/i, `${file} should expose the supporting indigo token`);

    const unexpected = [...new Set(hexColors(svg).filter(color => !brandTokens.has(color)))];
    assert.deepEqual(unexpected, [], `${file} contains non-system colors: ${unexpected.join(', ')}`);
  }
});

test('equivalent success states use one stable mint token', () => {
  const statefulExamples = publicExamples.filter(file => file !== 'assets/examples/banner-example.svg');
  for (const file of statefulExamples) {
    const svg = read(file);
    assert.match(svg, /#56B59A/i, `${file} should use semantic.success for ready or checked states`);
    assert.doesNotMatch(svg, /#(?:16A34A|15803D|0F9F6E|27AF9C|42AAA8|7DC5B5)/i);
  }
});

test('dreamy detail board encodes motifs and a measured type ladder', () => {
  const board = read('assets/examples/dreamy-detail-board.svg');
  const system = read('references/style-system.md');
  assert.match(board, /CHAPTER RELATIONSHIP/);
  assert.match(board, /SOURCE TO OUTLINE/);
  assert.match(board, /READ \/ TEST \/ RECALL/);
  assert.match(board, /CARD VERIFICATION/);
  assert.match(board, /章节页/);
  assert.match(board, /概念索引/);
  assert.match(board, /原文段落/);
  assert.match(board, /复习提纲/);
  assert.match(board, /读/);
  assert.match(board, /练/);
  assert.match(board, /忆/);
  assert.match(board, /题面/);
  assert.match(board, /答案/);
  assert.match(board, /data-motif="chapter-map"/);
  assert.doesNotMatch(board, /verification shield|知识星座/);
  assert.match(board, /Georgia, Times New Roman, serif/);
  assert.match(system, /three-level text ladder/);
  assert.match(system, /motif budget/);
  assert.match(system, /node constellations/);
});

test('logo concepts declare a meaningful secondary motif', () => {
  const logos = read('assets/examples/logo-concepts.svg');
  assert.match(logos, /data-logo-secondary-motif="chapter relationship \+ verification shield"/);
  assert.match(logos, /verification shield/);
  assert.doesNotMatch(logos, /M56 93c/);
  assert.match(logos, /M58 91 112 50 169 95/);
});

test('detail-board microcopy is centered on its visual containers', () => {
  const board = read('assets/examples/dreamy-detail-board.svg');
  assert.match(board, /\.motif-label[^}]*text-anchor: middle/);
  assert.ok((board.match(/text-anchor="middle"/g) || []).length >= 10);
  assert.match(board, /text x="35" y="15" text-anchor="middle"[^>]*>01<\/text>/);
  assert.match(board, /text x="27" y="68" text-anchor="middle"[^>]*>读<\/text>/);
  assert.match(board, /text x="455" y="603" class="motif-label"/);
});

test('preference guidance keeps learning local and structured', () => {
  const skill = read('SKILL.md');
  const readme = read('README.md');
  assert.match(skill, /allowlisted numeric weights/);
  assert.match(skill, /never store raw feedback/);
  assert.match(skill, /never silently choose/);
  assert.match(readme, /Persistence is opt-in/);
});

for (const file of [
  'assets/examples/banner-example.svg',
  'assets/examples/popup-mockup-example.svg',
]) {
  test(`${file} uses an attributed, accessible, semantic icon`, () => {
    const svg = read(file);
    assert.match(svg, /<title\b[^>]*>[^<]+<\/title>/);
    assert.match(svg, /<desc\b[^>]*>[^<]+<\/desc>/);
    assert.match(svg, /data-role="logo"/);
    assert.match(svg, /data-logo-intent="[^"]+"/);
    assert.match(svg, /data-icon-source="lucide"/);
    assert.match(svg, /data-icon-name="book-open-check"/);
    assert.match(svg, /data-icon-license="ISC"/);
  });

  test(`${file} keeps the halo subordinate to the logo tile`, () => {
    const svg = read(file);
    const halo = svg.match(/<circle\b[^>]*data-role="logo-halo"[^>]*r="([\d.]+)"[^>]*>/);
    const tile = svg.match(/<rect\b[^>]*data-role="logo-tile"[^>]*width="([\d.]+)"[^>]*>/);
    assert.ok(halo, 'missing data-role="logo-halo"');
    assert.ok(tile, 'missing data-role="logo-tile"');
    assert.ok(+halo[1] <= +tile[1] * 0.72, `halo radius ${halo[1]} overwhelms tile width ${tile[1]}`);
  });
}

test('logo quality CLI accepts a good example', () => {
  const result = spawnSync(process.execPath, [
    'evals/grade.mjs',
    '--check-logo',
    'assets/examples/banner-example.svg',
  ], { cwd: repoRoot, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /logo-quality: PASS/);
});

test('logo quality CLI rejects a generic unattributed bolt', () => {
  const result = spawnSync(process.execPath, [
    'evals/grade.mjs',
    '--check-logo',
    'tests/fixtures/generic-bolt-logo.svg',
  ], { cwd: repoRoot, encoding: 'utf8' });
  assert.equal(result.status, 1, result.stderr || result.stdout);
  assert.match(result.stdout, /logo-quality: FAIL/);
});
