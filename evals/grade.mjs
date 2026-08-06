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

  return { file: path.relative(root, filePath), issues };
}

function main() {
  const args = process.argv.slice(2);
  const files = args.length
    ? args.map((f) => path.resolve(f))
    : fs.readdirSync(path.join(root, "assets", "examples")).filter((f) => f.endsWith(".svg")).map((f) => path.join(root, "assets", "examples", f));

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
