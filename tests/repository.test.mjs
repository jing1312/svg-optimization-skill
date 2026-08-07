import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { wellFormedXml, gradeSvg } from "../evals/grade.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => fs.readFileSync(path.join(repoRoot, rel), "utf8");
const walkSvgs = (dir) => {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkSvgs(p));
    else if (entry.name.endsWith(".svg")) out.push(p);
  }
  return out;
};

const GALLERY_MOTIFS = [
  "chapter-relations", "outline-generation", "review-path",
  "card-verification", "classroom-waveform", "export-pack",
];

// --- repository hygiene -----------------------------------------------------

test("public files contain no secrets or private identifiers", () => {
  const patterns = [/api[_-]?key/i, /Bearer\s+[A-Za-z0-9]/, /PRIVATE KEY/, /password\s*=/i, /\/home\/[a-z0-9]/i, /(C:[/\\]|\/)Users\//i];
  const offenders = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (["tests", "node_modules"].includes(entry.name) || entry.name.startsWith(".git")) continue;
      const p = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(p);
      else if (/\.(md|svg|mjs|json|html|yml)$/.test(entry.name)) {
        const src = fs.readFileSync(p, "utf8");
        for (const re of patterns) if (re.test(src)) offenders.push(`${path.relative(repoRoot, p)} ~ ${re}`);
      }
    }
  };
  walk(repoRoot);
  assert.deepEqual(offenders, []);
});

test("skill files are not hardcoded to the demo brand", () => {
  const skill = read("SKILL.md");
  assert.ok(!skill.includes("知了学习"), "SKILL.md must stay brand-neutral");
  const styles = read("references/style-library.md");
  assert.ok(!styles.includes("知了学习"), "style library must stay brand-neutral");
});

// --- SKILL.md contract -------------------------------------------------------

test("SKILL.md keeps the cross-agent contract sections", () => {
  const doc = read("SKILL.md");
  for (const section of ["When to use", "Workflow", "Style-choice flow", "Verification tiers", "Typography", "Logo rules", "Memory", "Brand packs"]) {
    assert.ok(doc.includes(section), `missing section: ${section}`);
  }
  assert.match(doc, /T0/, "tiered verification must exist");
  assert.match(doc, /grade\.mjs/);
  assert.match(doc, /render\.mjs/);
});

test("references cover principles, styles, typography and verification", () => {
  assert.match(read("references/design-principles.md"), /Six-layer effect budget/);
  assert.match(read("references/design-principles.md"), /G1–G4|G1/);
  const styles = read("references/style-library.md");
  for (const a of ["Flat", "Aurora", "Glassmorphism", "Neon", "Ink sketch", "Editorial"]) {
    assert.ok(styles.includes(a), `missing archetype: ${a}`);
  }
  assert.match(styles, /Deriving a custom style from a brand color/);
  const premium = read("references/premium-craft.md");
  assert.match(premium, /Anti-pattern/);
  assert.match(premium, /Dreamlight/);
  assert.match(premium, /spectral drift|Luminous base/);
  assert.match(premium, /Meaning before ornament/);
  assert.match(read("references/typography.md"), /text to outlines|outlines/);
  assert.match(read("references/verification.md"), /T2/);
});

test("brand pack keeps the demo brand frozen and complete", () => {
  const doc = read("brand-packs/zhiliao-study.md");
  assert.match(doc, /知了学习 · 知识组织与核验助手/);
  for (const d of ["J", "K", "L", "M", "N", "O", "P", "Q", "R", "S1", "S2"]) {
    assert.ok(doc.includes(d), `missing direction: ${d}`);
  }
  assert.match(doc, /single fused mark|单一符号/i);
  assert.match(doc, /page becomes the check/);
});

// --- generic examples prove breadth -----------------------------------------

test("style sheet shows three different grammars, not three recolors", () => {
  const src = read("examples/style-gallery.svg");
  for (const id of ["dreamlight", "paper", "glass"]) {
    assert.ok(src.includes(`data-style-id="${id}"`), `missing grammar: ${id}`);
  }
  // each grammar must carry its own construction language
  assert.match(src, /绸带|ribbon/i, "dreamlight needs the silk gesture");
  assert.match(src, /stroke-dasharray="5 7"/, "paper needs the stitched frame");
  assert.match(src, /fill-opacity="0\.07"/, "glass needs the translucent vessel");
});

test("generic banner builds a fictional brand inside the house style", () => {
  const src = read("examples/banner-generic.svg");
  assert.match(src, /viewBox="0 0 1100 300"/);
  assert.match(src, /data-motif="moonrise"/);
  assert.match(src, /data-motif="scent-notes"/);
  assert.match(src, /data-role="banner-title"/);
  assert.match(src, /data-role="cta"/);
  assert.ok(!src.includes("知了"), "generic example must not reuse the demo brand");
});

test("hero carries the skill's meaning: verify-nodes motif + atelier mark", () => {
  for (const f of ["docs/images/hero-cover.svg", "examples/hero-summer.svg"]) {
    const src = read(f);
    assert.match(src, /data-motif="verify-nodes"/, `${f} must keep the semantic motif`);
    assert.match(src, /data-role="atelier-mark"/, `${f} must keep the atelier mark`);
    assert.match(src, /RibbonCore/i, `${f} ribbon must be a layered filled band`);
    assert.ok(!/R 86|drafting|刻度/.test(src), `${f} must not carry drafting chrome`);
  }
  // the summer variant is the same composition in a warm climate
  assert.match(read("examples/hero-summer.svg"), /#fff6f0/);
  assert.ok(!read("docs/images/hero-cover.svg").includes("#fff6f0"), "cool hero must not drift into the warm recipe");
});

// --- brand-pack examples keep their structure --------------------------------

test("every shipped SVG is well-formed XML with an accessible title", () => {
  const files = walkSvgs(path.join(repoRoot, "examples")).concat(walkSvgs(path.join(repoRoot, "docs")));
  assert.ok(files.length >= 14, "expected the full example set");
  for (const f of files) {
    const src = fs.readFileSync(f, "utf8");
    assert.deepEqual(wellFormedXml(src), [], `${path.basename(f)} XML errors`);
    assert.match(src, /xmlns="http:\/\/www\.w3\.org\/2000\/svg"/, `${path.basename(f)} namespace`);
    assert.match(src, /<title[^>]*>.+<\/title>/s, `${path.basename(f)} title`);
  }
});

test("zhiliao banner/popup/gallery keep their canonical structure", () => {
  const banner = read("examples/zhiliao-study/banner-example.svg");
  assert.match(banner, /viewBox="0 0 1100 300"/);
  assert.match(banner, /data-role="edge-clipped-bubbles"/);
  assert.match(banner, /data-motif="review-path"/, "banner must tell the review-path story visually");
  assert.ok(!banner.includes("rx=\"15\""), "no pill tags on the banner");
  const popup = read("examples/zhiliao-study/popup-mockup-example.svg");
  assert.match(popup, /viewBox="0 0 860 730"/);
  assert.match(popup, /data-role="logo"/);
  assert.match(popup, /data-role="cta"/);
  const gallery = read("examples/zhiliao-study/ornate-style-gallery.svg");
  const motifs = [...gallery.matchAll(/data-motif="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(motifs.sort(), [...GALLERY_MOTIFS].sort());
});

test("logo is a single fused mark, not an icon assembly", () => {
  const src = read("examples/zhiliao-study/logo-concepts.svg");
  const logos = src.match(/<g[^>]*data-role="logo"[^>]*>/g) ?? [];
  assert.ok(logos.length >= 2);
  for (const g of logos) {
    assert.ok(g.includes("data-logo-intent"), "logo group missing intent");
    assert.ok(g.includes("page becomes the check"), "logo must declare the fused semantics");
    assert.ok(!g.includes("data-icon-source"), "the mark is original, not icon-derived");
  }
  // the current mark's geometry must carry no shield — prose may describe the retired one
  const symbols = [...src.matchAll(/<symbol[\s\S]*?<\/symbol>/g)].map((m) => m[0]).join("\n");
  assert.ok(!/ shield|shield /i.test(symbols), "mark geometry contains a shield");
  for (const sym of [...src.matchAll(/<symbol[\s\S]*?<\/symbol>/g)].map((m) => m[0])) {
    const checks = sym.match(/l ?\d+ \d+ l ?\d+ -\d+|l\d+ \d+ l\d+ -\d+/g) ?? [];
    assert.ok(checks.length <= 1, `symbol carries ${checks.length} checks — one gesture only`);
  }
  assert.match(src, /data-role="logo-preview" data-size="48"/);
});

test("brand pack declares the single-mark logo", () => {
  const doc = read("brand-packs/zhiliao-study.md");
  assert.match(doc, /单一符号|single mark|一笔/);
  assert.ok(!/节点环|shield badge|盾牌/.test(doc), "brand pack must not describe ring or shield");
});

test("every shipped asset passes all gates including contrast", () => {
  const offenders = [];
  for (const f of walkSvgs(path.join(repoRoot, "examples")).concat(walkSvgs(path.join(repoRoot, "docs")))) {
    const { issues } = gradeSvg(f);
    if (issues.length) offenders.push(`${path.relative(repoRoot, f)}: ${issues.join("; ")}`);
  }
  assert.deepEqual(offenders, []);
});

// --- tooling ------------------------------------------------------------------

test("package.json wires test/check/render with zero runtime dependencies", () => {
  const pkg = JSON.parse(read("package.json"));
  assert.match(pkg.scripts.test, /node --test/);
  assert.match(pkg.scripts.check, /grade\.mjs/);
  assert.equal(pkg.dependencies, undefined);
  assert.equal(pkg.devDependencies, undefined, "the skill must stay dependency-free");
});
