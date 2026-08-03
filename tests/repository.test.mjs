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

test('private feedback handoff is not published', () => {
  assert.equal(existsSync(join(repoRoot, 'USER-FEEDBACK-HANDOFF.md')), false);
  assert.doesNotMatch(read('README.md'), /USER-FEEDBACK-HANDOFF|用户逐轮真实反馈/);
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

test('approved seasonal themes share one brand semantic system', () => {
  const pair = read('assets/examples/brand-theme-pair.svg');
  assert.match(pair, /J · 梦幻极光/);
  assert.match(pair, /K · 夏日汽水/);
  assert.match(pair, /data-role="logo"|book-open-check/);
  assert.ok((pair.match(/开卷助手/g) || []).length >= 4);
  assert.match(pair, /共享 Logo、文案和信息结构/);
});

test('dreamy detail board encodes motifs and a measured type ladder', () => {
  const board = read('assets/examples/dreamy-detail-board.svg');
  const system = read('references/style-system.md');
  assert.match(board, /CHAPTER RELATIONSHIP/);
  assert.match(board, /SOURCE TO OUTLINE/);
  assert.match(board, /READ \/ TEST \/ RECALL/);
  assert.match(board, /CARD VERIFICATION/);
  assert.match(board, /Georgia, Times New Roman, serif/);
  assert.match(system, /three-level text ladder/);
  assert.match(system, /node constellations/);
});

test('logo concepts declare a meaningful secondary motif', () => {
  const logos = read('assets/examples/logo-concepts.svg');
  assert.match(logos, /data-logo-secondary-motif="chapter relationship \+ verification shield"/);
  assert.match(logos, /verification shield/);
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
