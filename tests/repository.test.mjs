import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { wellFormedXml } from "../evals/grade.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => fs.readFileSync(path.join(repoRoot, rel), "utf8");
const examples = path.join(repoRoot, "assets", "examples");

const GALLERY_MOTIFS = [
  "chapter-relations",
  "outline-generation",
  "review-path",
  "card-verification",
  "classroom-waveform",
  "export-pack",
];

// --- documentation gates -----------------------------------------------------

test("privacy boundary document exists with public-release rules", () => {
  const doc = read("PRIVACY.md");
  assert.match(doc, /Never commit/);
  assert.match(doc, /forget.*reset|reset.*forget/s);
  assert.match(doc, /explicit consent/i);
});

test("public files contain no private identifiers", () => {
  const patterns = [/api[_-]?key/i, /Bearer\s+[A-Za-z0-9]/, /PRIVATE KEY/, /password\s*=/i, /\/home\/[a-z0-9]/i, /\/Users\/[a-z0-9]/i, /C:\\Users\\/i];
  const offenders = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name === "tests" || entry.name === "node_modules" || entry.name.startsWith(".git")) continue;
      const p = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(p);
      else if (/\.(md|svg|mjs|json|html)$/.test(entry.name)) {
        const src = fs.readFileSync(p, "utf8");
        for (const re of patterns) if (re.test(src)) offenders.push(`${path.relative(repoRoot, p)} ~ ${re}`);
      }
    }
  };
  walk(repoRoot);
  assert.deepEqual(offenders, []);
});

test("SKILL.md keeps trigger, workflow, logo and privacy sections", () => {
  const doc = read("SKILL.md");
  for (const section of ["When to use", "Workflow", "Logo rules", "Preferences and privacy"]) {
    assert.ok(doc.includes(section), `missing section: ${section}`);
  }
  assert.match(doc, /data-icon-license/);
});

test("style system documents J/K/L and the six-motif grammar", () => {
  const doc = read("references/style-system.md");
  for (const dir of ["J · 梦幻极光", "K · 夏日汽水", "L · 暖阳纸片"]) {
    assert.ok(doc.includes(dir), `missing direction: ${dir}`);
  }
  for (const motif of ["章节关系", "提纲生成", "复习路径", "卡片核验", "课堂波形", "资料导出包"]) {
    assert.ok(doc.includes(motif), `missing motif: ${motif}`);
  }
  assert.match(doc, /terminate at `stop-opacity="0"`/);
});

test("logo system keeps semantic brief and rejection conditions", () => {
  const doc = read("references/logo-system.md");
  assert.match(doc, /Semantic brief/);
  assert.match(doc, /Rejection conditions/);
  assert.match(doc, /book-open-check/);
});

// --- SVG structure gates -----------------------------------------------------

test("every example SVG is well-formed XML with an accessible title", () => {
  const files = fs.readdirSync(examples).filter((f) => f.endsWith(".svg"));
  assert.ok(files.length >= 7, "expected the seven canonical examples");
  for (const f of files) {
    const src = fs.readFileSync(path.join(examples, f), "utf8");
    const errors = wellFormedXml(src);
    assert.deepEqual(errors, [], `${f} XML errors: ${errors.join("; ")}`);
    assert.match(src, /xmlns="http:\/\/www\.w3\.org\/2000\/svg"/, `${f} missing svg namespace`);
    assert.match(src, /<title[^>]*>.+<\/title>/s, `${f} missing accessible <title>`);
  }
});

test("banner uses 1100x300 canvas with edge-clipped bubbles and big title", () => {
  const src = read("assets/examples/banner-example.svg");
  assert.match(src, /viewBox="0 0 1100 300"/);
  assert.match(src, /role="img"/);
  assert.match(src, /data-role="edge-clipped-bubbles"/);
  const title = src.match(/data-role="banner-title"[^>]*font-size="(\d+)"/);
  assert.ok(title, "banner title missing data-role");
  assert.ok(Number(title[1]) >= 34, "banner title must be >= 34px");
});

test("popup mockup uses 860x730 dark browser backdrop with logo and CTA", () => {
  const src = read("assets/examples/popup-mockup-example.svg");
  assert.match(src, /viewBox="0 0 860 730"/);
  assert.match(src, /data-role="browser-backdrop"[^>]*#0b1020|#0b1020[^"]*"[^>]*data-role="browser-backdrop"/);
  assert.match(src, /data-role="logo"/);
  assert.match(src, /data-role="cta"/);
});

test("ornate gallery carries exactly the six semantic motifs with briefs", () => {
  const src = read("assets/examples/ornate-style-gallery.svg");
  const motifs = [...src.matchAll(/data-motif="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(motifs.sort(), [...GALLERY_MOTIFS].sort());
  for (const g of src.match(/<g[^>]*data-motif="[^"]+"[^>]*>/g)) {
    assert.match(g, /data-motif-message="[^"]+"/, "every motif needs a one-sentence message");
  }
});

test("detail board reuses four motifs from the shared grammar", () => {
  const src = read("assets/examples/dreamy-detail-board.svg");
  const motifs = [...src.matchAll(/data-motif="([^"]+)"/g)].map((m) => m[1]);
  assert.equal(motifs.length, 4);
  for (const m of motifs) assert.ok(GALLERY_MOTIFS.includes(m), `${m} is outside the six-motif grammar`);
});

test("logo concepts declare provenance metadata and 48 px previews", () => {
  const src = read("assets/examples/logo-concepts.svg");
  const logos = src.match(/<g[^>]*data-role="logo"[^>]*>/g) ?? [];
  assert.ok(logos.length >= 2, "expected J and K logo groups");
  for (const g of logos) {
    for (const attr of ["data-logo-intent", "data-icon-source", "data-icon-name", "data-icon-license", "data-logo-secondary-motif"]) {
      assert.ok(g.includes(attr), `logo group missing ${attr}`);
    }
  }
  const previews = src.match(/data-role="logo-preview" data-size="48"/g) ?? [];
  assert.ok(previews.length >= 2, "expected a 48px preview per theme");
});

test("style chooser offers J/K/L each with banner thumbnail and popup crop", () => {
  const src = read("assets/examples/style-options-example.svg");
  for (const id of ["J", "K", "L"]) {
    assert.ok(src.includes(`data-style-id="${id}"`), `missing option ${id}`);
  }
  assert.ok((src.match(/data-role="banner-thumb"/g) ?? []).length >= 3);
  assert.ok((src.match(/data-role="popup-crop"/g) ?? []).length >= 3);
});

test("brand theme pair contains both seasonal suites", () => {
  const src = read("assets/examples/brand-theme-pair.svg");
  assert.match(src, /data-theme-id="J"/);
  assert.match(src, /data-theme-id="K"/);
  assert.match(src, /data-role="logo"/);
});

test("regression: blurs stay bounded and no asset drops the SVG namespace", () => {
  const files = fs.readdirSync(examples).filter((f) => f.endsWith(".svg"));
  for (const f of files) {
    const src = fs.readFileSync(path.join(examples, f), "utf8");
    for (const m of src.matchAll(/stdDeviation="([0-9.]+)"/g)) {
      assert.ok(Number(m[1]) <= 24, `${f}: stdDeviation ${m[1]} exceeds the 24 bound`);
    }
  }
});

test("deep-sea baseline banner survives as the A regression file", () => {
  const src = read("assets/examples/banner-deepsea-baseline.svg");
  assert.match(src, /viewBox="0 0 1100 300"/);
  assert.match(src, /#0a2740/);
  assert.match(src, /data-role="edge-clipped-bubbles"/);
});
