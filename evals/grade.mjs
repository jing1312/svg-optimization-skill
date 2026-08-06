#!/usr/bin/env node
/**
 * evals/grade.mjs — structural + logo quality gates (no runtime deps).
 *
 * Usage:
 *   node evals/grade.mjs                 # grade every assets/examples/*.svg
 *   node evals/grade.mjs path/to/a.svg   # grade specific files
 *
 * Exits non-zero when any gate fails. `npm run check` runs this.
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/** Minimal well-formedness checker for our SVG/XML files. */
export function wellFormedXml(src) {
  const errors = [];
  const body = src.replace(/<\?xml[^?]*\?>/g, "").replace(/<!--[\s\S]*?-->/g, " ");
  const tagRe = /<(\/?)([A-Za-z0-9_:.-]+)((?:"[^"]*"|'[^']*'|[^<>"'])*?)(\/?)>/g;
  const stack = [];
  let cursor = 0;
  for (const m of body.matchAll(tagRe)) {
    const textBetween = body.slice(cursor, m.index);
    if (textBetween.includes("<")) errors.push(`stray '<' outside a tag near "${textBetween.trim().slice(0, 30)}"`);
    cursor = m.index + m[0].length;
    const [full, closing, name, attrs, selfClose] = m;
    const attrSrc = attrs.trim();
    if (attrSrc && !/^([A-Za-z0-9_:.-]+\s*=\s*("[^"]*"|'[^']*')(\s+[A-Za-z0-9_:.-]+\s*=\s*("[^"]*"|'[^']*'))*\s*\/?)?$/.test(attrSrc)) {
      errors.push(`malformed attributes in <${name}>: "${attrSrc.slice(0, 60)}"`);
      continue;
    }
    if (closing) {
      const open = stack.pop();
      if (open !== name) errors.push(`mismatched close </${name}>, expected </${open ?? "?"}>`);
    } else if (!selfClose) {
      stack.push(name);
    }
  }
  if (stack.length) errors.push(`unclosed tags: ${stack.join(", ")}`);
  if (body.slice(cursor).includes("<")) errors.push("stray '<' after last tag");
  return errors;
}

const LOGO_REQUIRED = ["data-logo-intent", "data-icon-source", "data-icon-name", "data-icon-license"];
const MAX_BLUR = 24;

// ---------------------------------------------------------------------------
// Geometry gate — catches the basic layout bugs by construction:
//   G1 text escapes the canvas          G2 text overflows its container rect
//   G3 text collides with motif/logo    G4 two texts overlap
// Text advance is estimated (CJK = 1em, Latin ≈ 0.56em), so every new asset is
// screened before a human ever looks at it.
// ---------------------------------------------------------------------------

const CJK_RE = /[\u2E80-\u9FFF\uF900-\uFAFF\uFF01-\uFF60\u3000-\u303F\u3040-\u30FF]/;

function charAdvance(ch, fs) {
  if (ch === " ") return fs * 0.32;
  if (ch === "\u00B7") return fs * 0.5;
  if (ch === "\u2014" || ch === "\u2013") return fs;
  if (CJK_RE.test(ch)) return fs;
  return fs * 0.56;
}

export function estimateTextWidth(str, fs, letterSpacing = 0) {
  let w = 0;
  for (const ch of str) w += charAdvance(ch, fs);
  if (letterSpacing > 0 && str.length > 1) w += (str.length - 1) * letterSpacing;
  return w;
}

function parseTransform(tr) {
  let tx = 0, ty = 0, s = 1;
  if (!tr) return { tx, ty, s };
  const t = tr.match(/translate\(\s*(-?[\d.]+)[ ,]+(-?[\d.]+)/);
  if (t) { tx = Number(t[1]); ty = Number(t[2]); }
  const sc = tr.match(/scale\(\s*(-?[\d.]+)/);
  if (sc) s = Number(sc[1]);
  return { tx, ty, s };
}

function composeStack(stack) {
  let tx = 0, ty = 0, s = 1;
  for (const m of stack) {
    tx += s * m.tx;
    ty += s * m.ty;
    s *= m.s;
  }
  return { tx, ty, s };
}

/** Single pass over tags, tracking group transforms, motif ancestry, clip state. */
export function collectGeometry(src) {
  const texts = [], containers = [], motifs = [], logos = [];
  const groupStack = [];
  let motifCount = 0;
  const DEF_TAGS = new Set(["clipPath", "defs", "symbol", "filter"]);
  const tagRe = /<(\/?)([a-zA-Z][\w-]*)((?:[^<>"']|"[^"]*"|'[^']*')*?)(\/?)>/g;
  for (const m of src.matchAll(tagRe)) {
    const [, closing, name, attrSrc] = m;
    if (closing) {
      if (DEF_TAGS.has(name)) { groupStack.pop(); continue; }
      if (groupStack.some((g) => g.skip)) continue;
      if (name === "g") groupStack.pop();
      continue;
    }
    const inDef = groupStack.some((g) => g.skip);
    if (DEF_TAGS.has(name)) {
      groupStack.push({ skip: true });
      continue;
    }
    if (inDef) continue;
    const attrs = {};
    for (const am of attrSrc.matchAll(/([\w:-]+)="([^"]*)"/g)) attrs[am[1]] = am[2];
    const parent = groupStack.length ? groupStack[groupStack.length - 1] : null;
    if (name === "g") {
      groupStack.push({
        t: parseTransform(attrs.transform),
        motifIndex: attrs["data-motif"] ? motifCount++ : (parent ? parent.motifIndex : null),
        logo: attrs["data-role"] === "logo" || Boolean(parent && parent.logo),
        clipped: Boolean(attrs["clip-path"]) || Boolean(parent && parent.clipped),
      });
      if (attrs["data-motif"]) motifs.push(null);
      continue;
    }
    const M = composeStack([...groupStack.map((g) => g.t), parseTransform(attrs.transform)]);
    const motifIndex = parent ? parent.motifIndex : null;
    const clipped = parent ? parent.clipped : false;
    const Ax = (v) => M.tx + M.s * v;
    const Ay = (v) => M.ty + M.s * v;
    const S = (v) => M.s * v;

    if (name === "text") {
      const end = m.index + m[0].length;
      const stop = src.indexOf("</text>", end);
      const inner = stop === -1 ? "" : src.slice(end, stop);
      const pushBox = (content, attrs2, fs2) => {
        const w = S(estimateTextWidth(content, fs2, Number(attrs2["letter-spacing"] ?? attrs["letter-spacing"] ?? 0) || 0));
        const ax = Ax(Number(attrs2.x ?? attrs.x ?? 0)), ay = Ay(Number(attrs2.y ?? attrs.y ?? 0));
        let x1 = ax, x2 = ax + w;
        if ((attrs2["text-anchor"] ?? attrs["text-anchor"]) === "middle") { x1 = ax - w / 2; x2 = ax + w / 2; }
        if ((attrs2["text-anchor"] ?? attrs["text-anchor"]) === "end") { x1 = ax - w; x2 = ax; }
        texts.push({ content, x1, x2, y1: ay - S(fs2 * 0.88), y2: ay + S(fs2 * 0.32), motifIndex, clipped });
      };
      const tspans = [...inner.matchAll(/<tspan([^>]*)>([\s\S]*?)<\/tspan>/g)];
      if (tspans.length) {
        for (const ts of tspans) {
          const ta = {};
          for (const am of ts[1].matchAll(/([\w:-]+)="([^"]*)"/g)) ta[am[1]] = am[2];
          const content = ts[2].replace(/<[^>]+>/g, "").trim();
          if (content) pushBox(content, ta, Number(ta["font-size"] ?? attrs["font-size"] ?? 16));
        }
      } else {
        const content = inner.replace(/<[^>]+>/g, "").trim();
        if (content) pushBox(content, {}, Number(attrs["font-size"] ?? 16));
      }
    } else if (name === "rect") {
      const x = Ax(Number(attrs.x ?? 0)), y = Ay(Number(attrs.y ?? 0));
      const w = S(Number(attrs.width ?? 0)), h = S(Number(attrs.height ?? 0));
      const box = { x1: x, y1: y, x2: x + w, y2: y + h, w, h };
      if (h <= 90 && w <= 460 && attrs.fill !== "none") containers.push(box);
      if (motifIndex !== null) motifs[motifIndex] = unionBox(motifs[motifIndex], box);
    } else if (name === "circle") {
      const cx = Ax(Number(attrs.cx ?? 0)), cy = Ay(Number(attrs.cy ?? 0)), r = S(Number(attrs.r ?? 0));
      const box = { x1: cx - r, y1: cy - r, x2: cx + r, y2: cy + r };
      if (motifIndex !== null) motifs[motifIndex] = unionBox(motifs[motifIndex], box);
    } else if (name === "use") {
      const x = Ax(Number(attrs.x ?? 0)), y = Ay(Number(attrs.y ?? 0));
      const w = S(Number(attrs.width ?? 0)), h = S(Number(attrs.height ?? 0));
      const box = { x1: x, y1: y, x2: x + w, y2: y + h };
      if (parent && parent.logo) logos.push(box);
      if (motifIndex !== null) motifs[motifIndex] = unionBox(motifs[motifIndex], box);
    }
  }
  return { texts, containers, motifs: motifs.filter(Boolean), logos };
}

function unionBox(a, b) {
  if (!a) return b;
  return { x1: Math.min(a.x1, b.x1), y1: Math.min(a.y1, b.y1), x2: Math.max(a.x2, b.x2), y2: Math.max(a.y2, b.y2) };
}

export function checkGeometry(src) {
  const issues = [];
  const vb = src.match(/viewBox="(-?[\d.]+) (-?[\d.]+) (-?[\d.]+) (-?[\d.]+)"/);
  const W = vb ? Number(vb[3]) : null, H = vb ? Number(vb[4]) : null;
  const { texts, containers, motifs, logos } = collectGeometry(src);

  for (const t of texts) {
    if (!t.content) continue;
    const short = t.content.length > 14 ? `${t.content.slice(0, 14)}…` : t.content;
    if (W && H && !t.clipped && (t.x1 < 2 || t.x2 > W - 2 || t.y1 < 2 || t.y2 > H - 2)) {
      issues.push(`geometry G1: text "${short}" escapes canvas (box ${Math.round(t.x1)},${Math.round(t.y1)}–${Math.round(t.x2)},${Math.round(t.y2)} vs ${W}×${H})`);
    }
    for (const r of containers) {
      const cx = (t.x1 + t.x2) / 2, cy = (t.y1 + t.y2) / 2;
      if (cx > r.x1 && cx < r.x2 && cy > r.y1 && cy < r.y2) {
        if (t.x1 < r.x1 + 5 || t.x2 > r.x2 - 5 || t.y1 < r.y1 + 2 || t.y2 > r.y2 - 2) {
          issues.push(`geometry G2: text "${short}" overflows its container (${Math.round(r.w)}×${Math.round(r.h)}px) — needs ≥ ${Math.ceil(t.x2 - t.x1) + 10}px width`);
        }
      }
    }
    const zones = motifs.map((b, i) => ({ b, hit: t.motifIndex === i, tag: `motif ${i} (${motifLabel(src, i)})` }))
      .concat(logos.map((b) => ({ b, hit: false, tag: "logo box" })));
    for (const z of zones) {
      if (z.hit) continue;
      const ox = Math.min(t.x2, z.b.x2) - Math.max(t.x1, z.b.x1);
      const oy = Math.min(t.y2, z.b.y2) - Math.max(t.y1, z.b.y1);
      if (ox > 1 && oy > 1) issues.push(`geometry G3: text "${short}" collides with ${z.tag}`);
    }
  }
  for (let i = 0; i < texts.length; i++) {
    for (let j = i + 1; j < texts.length; j++) {
      const a = texts[i], b = texts[j];
      if (!a.content || !b.content) continue;
      const ox = Math.min(a.x2, b.x2) - Math.max(a.x1, b.x1);
      const oy = Math.min(a.y2, b.y2) - Math.max(a.y1, b.y1);
      if (ox > 2 && oy > 2) issues.push(`geometry G4: "${a.content.slice(0, 12)}" overlaps "${b.content.slice(0, 12)}"`);
    }
  }
  return issues;
}

function motifLabel(src, i) {
  const names = [...src.matchAll(/data-motif="([^"]+)"/g)].map((m) => m[1]);
  return names[i] ?? "?";
}

export function gradeSvg(filePath) {
  const src = fs.readFileSync(filePath, "utf8");
  const issues = wellFormedXml(src);

  if (!/viewBox="[^"]+"/.test(src)) issues.push("missing viewBox");
  if (!/<title[ >]/.test(src)) issues.push("missing accessible <title>");

  // Logo metadata gate
  const logoGroups = src.match(/<g[^>]*data-role="logo"[^>]*>/g) ?? [];
  for (const g of logoGroups) {
    for (const attr of LOGO_REQUIRED) {
      if (!g.includes(attr)) issues.push(`logo group missing ${attr}`);
    }
  }

  // Blur bound (no unbounded glow)
  for (const m of src.matchAll(/stdDeviation="([0-9.]+)"/g)) {
    if (Number(m[1]) > MAX_BLUR) issues.push(`stdDeviation ${m[1]} exceeds ${MAX_BLUR}`);
  }

  // Semantic motifs: any data-motif must carry a one-sentence message
  const motifGroups = src.match(/<g[^>]*data-motif="[^"]+"[^>]*>/g) ?? [];
  for (const g of motifGroups) {
    if (!g.includes("data-motif-message=")) issues.push("motif without data-motif-message");
  }

  // Geometry gate: overflow, container fit, motif/logo collision, text overlap
  issues.push(...checkGeometry(src));

  return { file: path.relative(root, filePath), issues };
}

function main() {
  const args = process.argv.slice(2);
  const walkSvgs = (dir) => {
    const out = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, entry.name);
      if (entry.isDirectory()) out.push(...walkSvgs(p));
      else if (entry.name.endsWith(".svg")) out.push(p);
    }
    return out;
  };
  const files = args.length ? args.map((f) => path.resolve(f)) : walkSvgs(path.join(root, "assets"));

  let failed = 0;
  for (const f of files) {
    const { file, issues } = gradeSvg(f);
    if (issues.length === 0) {
      console.log(`PASS  ${file}`);
    } else {
      failed++;
      console.log(`FAIL  ${file}`);
      for (const i of issues) console.log(`      - ${i}`);
    }
  }
  console.log(`${files.length - failed}/${files.length} files passed`);
  process.exit(failed ? 1 : 0);
}

const isMain = process.argv[1] && fs.realpathSync(process.argv[1]) === fs.realpathSync(new URL(import.meta.url).pathname);
if (isMain) main();
