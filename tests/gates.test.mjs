import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  wellFormedXml, estimateTextWidth, transformMatrix, collectGeometry,
  checkGeometry, clipPathBox, gradeSvg,
} from "../evals/grade.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const fix = (f) => path.join(repoRoot, "tests", "fixtures", f);
const gate = (f, prefix) => gradeSvg(fix(f)).issues.filter((i) => i.startsWith(prefix));

// --- unit: xml / width / transforms ----------------------------------------

test("wellFormedXml catches mismatched closes and stray angle brackets", () => {
  assert.ok(wellFormedXml("<svg><text>x</txet></svg>").some((e) => e.includes("mismatched")));
  assert.ok(wellFormedXml("<svg><rect/></svg").some((e) => e.includes("stray")));
  assert.deepEqual(wellFormedXml(`<svg xmlns="x"><g a='1'>t</g></svg>`), []);
});

test("estimateTextWidth treats CJK as 1em and Latin as ~0.56em", () => {
  assert.equal(estimateTextWidth("复习", 16), 32);
  const latin = estimateTextWidth("abc", 16);
  assert.ok(Math.abs(latin - 3 * 16 * 0.56) < 0.01);
  assert.ok(estimateTextWidth("a b", 16) > estimateTextWidth("ab", 16));
});

test("transformMatrix composes rotate into a real affine matrix", () => {
  const M = transformMatrix("rotate(90)");
  assert.ok(Math.abs(M.a) < 1e-9 && Math.abs(M.b - 1) < 1e-9);
  const S = transformMatrix("translate(10 20) scale(2)");
  assert.equal(S.e, 10); assert.equal(S.f, 20); assert.equal(S.a, 2);
});

test("rotated text bounding box is the rotated AABB, not the raw one", () => {
  const src = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><title>t</title>
    <g transform="rotate(45 200 200)"><text x="100" y="200" font-size="20">abcdefghij</text></g></svg>`;
  const [t] = collectGeometry(src).texts;
  const w = t.box.x2 - t.box.x1, h = t.box.y2 - t.box.y1;
  // 45° rotation: the AABB becomes a square of side (w0+h0)/√2 ≈ 96 — very
  // different from the raw 112×24 box, and only correct if transforms compose.
  assert.ok(Math.abs(w - h) < 2, `rotated AABB must be ~square, got ${w}x${h}`);
  assert.ok(h > 60 && h < 120, `expected rotated height ≈96, got ${h}`);
});

// --- unit: clip-path awareness ----------------------------------------------

test("clip-path intersects painted geometry so clipped decor cannot act as background", () => {
  const src = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><title>t</title>
    <defs><clipPath id="c"><rect x="50" y="50" width="100" height="100"/></clipPath></defs>
    <g clip-path="url(#c)"><circle cx="40" cy="60" r="30" fill="#ff0000"/></g></svg>`;
  const box = clipPathBox(src, "c");
  assert.deepEqual([box.x1, box.y1, box.x2, box.y2], [50, 50, 150, 150]);
  const [p] = collectGeometry(src).painted;
  assert.equal(p.box.x1, 50, "circle must be clipped to the clip region");
  assert.equal(p.box.y1, 50);
});

// --- fixture gates -----------------------------------------------------------

test("G1–G4: canvas escape, container overflow, motif occlusion, text overlap", () => {
  const geo = gate("geometry-bad.svg", "geometry");
  for (const g of ["G1", "G2", "G3", "G4"]) assert.ok(geo.some((i) => i.includes(g)), `must flag ${g}`);
});

test("R1/R2: dangling url(#ref) and duplicate ids are errors", () => {
  const issues = gradeSvg(fix("refs-bad.svg")).issues;
  assert.ok(issues.filter((i) => i.includes("R1")).length >= 2, "both dangling refs");
  assert.ok(issues.some((i) => i.includes("R2") && i.includes('"dup"')));
});

test("font-size inside style='' and rotate() no longer hide overflow", () => {
  const geo = gate("style-transform-bad.svg", "geometry");
  assert.equal(geo.filter((i) => i.includes("G1")).length, 2, "style attr + rotation overflows");
});

test("path-based motifs now participate in the occlusion gate", () => {
  assert.ok(gate("path-occlusion-bad.svg", "geometry").some((i) => i.includes("G3")));
});

test("C1: low-contrast body text fails, large text keeps the 3:1 threshold", () => {
  const c = gate("contrast-bad.svg", "contrast");
  assert.equal(c.length, 1, "only the 14px gray line may fail");
  assert.match(c[0], /低对比度正文/);
});

test("positive control fixture passes every gate", () => {
  const { issues } = gradeSvg(fix("gate-good.svg"));
  assert.deepEqual(issues, []);
});

test("gate-good stays clean even if rendered (reference integrity holds)", () => {
  const issues = gradeSvg(fix("gate-good.svg")).issues;
  assert.ok(!issues.some((i) => i.includes("R1") || i.includes("R2")));
});
