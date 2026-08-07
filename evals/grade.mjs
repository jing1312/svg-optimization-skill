#!/usr/bin/env node
/**
 * evals/grade.mjs — zero-dependency quality gates for SVG assets.
 *
 * Usage:
 *   node evals/grade.mjs                 # grade every SVG under examples/ and docs/
 *   node evals/grade.mjs path/to/a.svg   # grade specific files
 *
 * Errors exit non-zero; warnings never do. `npm run check` runs this.
 *
 * ERROR gates
 *   XML   well-formedness (tags, attributes, CDATA/comments), viewBox, <title>
 *   R1    every url(#id) / href="#id" reference resolves
 *   R2    ids are unique per document
 *   LOGO  data-role="logo" groups carry provenance metadata
 *   BLUR  stdDeviation bounded (no unbounded glow)
 *   MOTIF every data-motif carries a data-motif-message
 *   G1    text stays inside the canvas (clip-path groups exempt)
 *   G2    text fits its chip/pill/button container with >=5px padding
 *   G3    text never intersects a data-motif or logo bounding box
 *   G4    two texts never overlap
 *   C1    text-vs-background contrast (WCAG 4.5:1 normal / 3:1 large text),
 *         reported only when a confident solid background is found
 * WARNINGS
 *   W1    external raster embeds (<image href="http…">) break portability
 *
 * Geometry model: full affine transform composition (translate/scale/rotate/
 * skew/matrix), shapes collected as sampled point sets (rect/circle/ellipse/
 * line/polygon/polyline/path — beziers and arcs sampled), font-size /
 * letter-spacing / text-anchor read from attributes, inline style="" and
 * <style> class rules. Text advance is still a font-independent estimate
 * (CJK=1em, Latin≈0.56em) — the render tier is the release authority.
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/* ------------------------------------------------------------------ XML -- */

export function wellFormedXml(src) {
  const errors = [];
  const body = src
    .replace(/<\?xml[^?]*\?>/g, "")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<!\[CDATA\[[\s\S]*?\]\]>/g, " ");
  const tagRe = /<(\/?)([A-Za-z0-9_:.-]+)((?:[^<>"']|"[^"]*"|'[^']*')*?)(\/?)>/g;
  const stack = [];
  let cursor = 0;
  for (const m of body.matchAll(tagRe)) {
    const textBetween = body.slice(cursor, m.index);
    if (textBetween.includes("<")) errors.push(`stray '<' outside a tag near "${textBetween.trim().slice(0, 30)}"`);
    cursor = m.index + m[0].length;
    const [, closing, name, attrs, selfClose] = m;
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

/* ------------------------------------------------------- CSS-lite layer -- */

function parseStyleDecl(decl, out) {
  for (const part of decl.split(";")) {
    const kv = part.split(":").map((s) => s.trim());
    if (kv.length !== 2) continue;
    const [k, v] = kv;
    if (["font-size", "letter-spacing", "text-anchor", "font-weight", "fill", "fill-opacity", "opacity"].includes(k)) out[k] = v;
  }
  return out;
}

/** Parse `style="…"` plus class rules from <style> blocks (single-selector). */
export function cssIndex(src) {
  const classRules = new Map();
  for (const sm of src.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)) {
    for (const rm of sm[1].matchAll(/([.#][\w-]+)\s*\{([^}]*)\}/g)) {
      const key = rm[1];
      if (!classRules.has(key)) classRules.set(key, {});
      parseStyleDecl(rm[2], classRules.get(key));
    }
  }
  return {
    propsFor(attrs) {
      const props = {};
      for (const cls of (attrs.class ?? "").split(/\s+/)) {
        if (cls && classRules.has(`.${cls}`)) Object.assign(props, classRules.get(`.${cls}`));
      }
      if (attrs.style) parseStyleDecl(attrs.style, props);
      // presentation attributes lose to style/classes
      for (const k of ["font-size", "letter-spacing", "text-anchor", "font-weight", "fill", "fill-opacity", "opacity"]) {
        if (attrs[k] != null && props[k] == null) props[k] = attrs[k];
      }
      return props;
    },
  };
}

const px = (v, emBase = 16) => {
  if (v == null) return null;
  const m = String(v).trim().match(/^(-?[\d.]+)(px|em)?$/);
  if (!m) return null;
  return Number(m[1]) * (m[2] === "em" ? emBase : 1);
};

/* ----------------------------------------------------- transform stack -- */

const I6 = () => ({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 });

function mul(P, Q) {
  return {
    a: P.a * Q.a + P.c * Q.b,
    b: P.b * Q.a + P.d * Q.b,
    c: P.a * Q.c + P.c * Q.d,
    d: P.b * Q.c + P.d * Q.d,
    e: P.a * Q.e + P.c * Q.f + P.e,
    f: P.b * Q.e + P.d * Q.f + P.f,
  };
}

const rad = (deg) => (deg * Math.PI) / 180;

/** Parse a full SVG transform list into one affine matrix. */
export function transformMatrix(tr) {
  let M = I6();
  if (!tr) return M;
  const fnRe = /(matrix|translate|scale|rotate|skewX|skewY)\s*\(([^)]*)\)/g;
  for (const m of tr.matchAll(fnRe)) {
    const nums = (m[2].match(/-?[\d.]+(?:[eE][-+]?\d+)?/g) ?? []).map(Number);
    let T = I6();
    if (m[1] === "matrix" && nums.length >= 6) T = { a: nums[0], b: nums[1], c: nums[2], d: nums[3], e: nums[4], f: nums[5] };
    else if (m[1] === "translate") T = { ...I6(), e: nums[0] ?? 0, f: nums[1] ?? 0 };
    else if (m[1] === "scale") T = { ...I6(), a: nums[0] ?? 1, d: nums.length > 1 ? nums[1] : nums[0] ?? 1 };
    else if (m[1] === "rotate") {
      const a = rad(nums[0] ?? 0), ca = Math.cos(a), sa = Math.sin(a);
      const R = { a: ca, b: sa, c: -sa, d: ca, e: 0, f: 0 };
      if (nums.length >= 3) T = mul(mul({ ...I6(), e: nums[1], f: nums[2] }, R), { ...I6(), e: -nums[1], f: -nums[2] });
      else T = R;
    } else if (m[1] === "skewX") T = { ...I6(), c: Math.tan(rad(nums[0] ?? 0)) };
    else if (m[1] === "skewY") T = { ...I6(), b: Math.tan(rad(nums[0] ?? 0)) };
    M = mul(M, T);
  }
  return M;
}

const applyM = (M, x, y) => ({ x: M.a * x + M.c * y + M.e, y: M.b * x + M.d * y + M.f });

function bboxOfPoints(pts) {
  let x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity;
  for (const p of pts) {
    x1 = Math.min(x1, p.x); y1 = Math.min(y1, p.y);
    x2 = Math.max(x2, p.x); y2 = Math.max(y2, p.y);
  }
  return { x1, y1, x2, y2, w: x2 - x1, h: y2 - y1 };
}

/* ------------------------------------------------------------ path bbox -- */

/** Sample a path-data string into local-space points (beziers/arc included). */
export function pathPoints(d, steps = 8) {
  const pts = [];
  const cmds = d.match(/[MmLlHhVvCcSsQqTtAaZz][^MmLlHhVvCcSsQqTtAaZz]*/g) ?? [];
  let cx = 0, cy = 0, sx = 0, sy = 0, prevC = null, prevQ = null;
  const push = (x, y) => { pts.push({ x, y }); cx = x; cy = y; };
  for (const raw of cmds) {
    const t = raw[0];
    const n = (raw.slice(1).match(/-?(?:\d*\.\d+|\d+\.?)(?:[eE][-+]?\d+)?/g) ?? []).map(Number);
    const rel = t === t.toLowerCase();
    const T = t.toUpperCase();
    let i = 0;
    const next = (k) => n.slice(i, (i += k));
    if (T === "M") {
      let first = true;
      while (i < n.length) {
        const [x, y] = next(2);
        push(rel ? cx + x : x, rel ? cy + y : y);
        if (first) { sx = cx; sy = cy; first = false; }
      }
      prevC = prevQ = null;
    } else if (T === "L") {
      while (i < n.length) { const [x, y] = next(2); push(rel ? cx + x : x, rel ? cy + y : y); }
      prevC = prevQ = null;
    } else if (T === "H") {
      while (i < n.length) { const [x] = next(1); push(rel ? cx + x : x, cy); }
      prevC = prevQ = null;
    } else if (T === "V") {
      while (i < n.length) { const [y] = next(1); push(cx, rel ? cy + y : y); }
      prevC = prevQ = null;
    } else if (T === "C") {
      while (i < n.length) {
        const [x1, y1, x2, y2, x, y] = next(6);
        const P1 = rel ? { x: cx + x1, y: cy + y1 } : { x: x1, y: y1 };
        const P2 = rel ? { x: cx + x2, y: cy + y2 } : { x: x2, y: y2 };
        const P3 = rel ? { x: cx + x, y: cy + y } : { x: x, y: y };
        for (let s = 1; s <= steps; s++) {
          const u = s / steps, v = 1 - u;
          pts.push({
            x: v ** 3 * cx + 3 * v * v * u * P1.x + 3 * v * u * u * P2.x + u ** 3 * P3.x,
            y: v ** 3 * cy + 3 * v * v * u * P1.y + 3 * v * u * u * P2.y + u ** 3 * P3.y,
          });
        }
        prevC = P2; prevQ = null; push(P3.x, P3.y);
      }
    } else if (T === "S") {
      while (i < n.length) {
        const [x2, y2, x, y] = next(4);
        const P1 = prevC ? { x: 2 * cx - prevC.x, y: 2 * cy - prevC.y } : { x: cx, y: cy };
        const P2 = rel ? { x: cx + x2, y: cy + y2 } : { x: x2, y: y2 };
        const P3 = rel ? { x: cx + x, y: cy + y } : { x: x, y: y };
        for (let s = 1; s <= steps; s++) {
          const u = s / steps, v = 1 - u;
          pts.push({
            x: v ** 3 * cx + 3 * v * v * u * P1.x + 3 * v * u * u * P2.x + u ** 3 * P3.x,
            y: v ** 3 * cy + 3 * v * v * u * P1.y + 3 * v * u * u * P2.y + u ** 3 * P3.y,
          });
        }
        prevC = P2; push(P3.x, P3.y);
      }
    } else if (T === "Q") {
      while (i < n.length) {
        const [x1, y1, x, y] = next(4);
        const P1 = rel ? { x: cx + x1, y: cy + y1 } : { x: x1, y: y1 };
        const P3 = rel ? { x: cx + x, y: cy + y } : { x: x, y: y };
        for (let s = 1; s <= steps; s++) {
          const u = s / steps, v = 1 - u;
          pts.push({ x: v * v * cx + 2 * v * u * P1.x + u * u * P3.x, y: v * v * cy + 2 * v * u * P1.y + u * u * P3.y });
        }
        prevQ = P1; prevC = null; push(P3.x, P3.y);
      }
    } else if (T === "T") {
      while (i < n.length) {
        const [x, y] = next(2);
        const P1 = prevQ ? { x: 2 * cx - prevQ.x, y: 2 * cy - prevQ.y } : { x: cx, y: cy };
        const P3 = rel ? { x: cx + x, y: cy + y } : { x: x, y: y };
        for (let s = 1; s <= steps; s++) {
          const u = s / steps, v = 1 - u;
          pts.push({ x: v * v * cx + 2 * v * u * P1.x + u * u * P3.x, y: v * v * cy + 2 * v * u * P1.y + u * u * P3.y });
        }
        prevQ = P1; push(P3.x, P3.y);
      }
    } else if (T === "A") {
      while (i < n.length) {
        const [rx0, ry0, rot, fa, fs_, x, y] = next(7);
        const X = rel ? cx + x : x, Y = rel ? cy + y : y;
        pts.push(...arcPoints(cx, cy, X, Y, Math.abs(rx0), Math.abs(ry0), rot, !!fa, !!fs_));
        push(X, Y);
      }
      prevC = prevQ = null;
    } else if (T === "Z") {
      push(sx, sy); prevC = prevQ = null;
    }
  }
  return pts;
}

/** Arc endpoint → center parameterization (SVG spec F.6), sampled. */
function arcPoints(x1, y1, x2, y2, rx, ry, phiDeg, fA, fS, steps = 12) {
  if (rx === 0 || ry === 0) return [{ x: x2, y: y2 }];
  const phi = rad(phiDeg), cp = Math.cos(phi), sp = Math.sin(phi);
  const dx = (x1 - x2) / 2, dy = (y1 - y2) / 2;
  const xp = cp * dx + sp * dy, yp = -sp * dx + cp * dy;
  let lam = (xp * xp) / (rx * rx) + (yp * yp) / (ry * ry);
  if (lam > 1) { const s = Math.sqrt(lam); rx *= s; ry *= s; }
  const sign = fA === fS ? -1 : 1;
  const num = Math.max(0, rx * rx * ry * ry - rx * rx * yp * yp - ry * ry * xp * xp);
  const den = rx * rx * yp * yp + ry * ry * xp * xp;
  const co = sign * Math.sqrt(num / den);
  const cxp = (co * rx * yp) / ry, cyp = (-co * ry * xp) / rx;
  const cx = cp * cxp - sp * cyp + (x1 + x2) / 2, cy = sp * cxp + cp * cyp + (y1 + y2) / 2;
  const ang = (ux, uy, vx, vy) => {
    const dot = ux * vx + uy * vy, len = Math.hypot(ux, uy) * Math.hypot(vx, vy);
    let a = Math.acos(Math.min(1, Math.max(-1, dot / len)));
    if (ux * vy - uy * vx < 0) a = -a;
    return a;
  };
  const th1 = ang(1, 0, (xp - cxp) / rx, (yp - cyp) / ry);
  let dth = ang((xp - cxp) / rx, (yp - cyp) / ry, (-xp - cxp) / rx, (-yp - cyp) / ry);
  if (!fS && dth > 0) dth -= 2 * Math.PI;
  if (fS && dth < 0) dth += 2 * Math.PI;
  const out = [];
  for (let s = 1; s < steps; s++) {
    const th = th1 + (dth * s) / steps;
    out.push({ x: cx + cp * rx * Math.cos(th) - sp * ry * Math.sin(th), y: cy + sp * rx * Math.cos(th) + cp * ry * Math.sin(th) });
  }
  return out;
}

/* ----------------------------------------------------- geometry collect -- */

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

function readAttrs(attrSrc) {
  const attrs = {};
  for (const am of attrSrc.matchAll(/([\w:-]+)\s*=\s*("[^"]*"|'[^']*')/g)) attrs[am[1]] = am[2].slice(1, -1);
  return attrs;
}

const DEF_TAGS = new Set(["defs", "clipPath", "symbol", "filter", "pattern", "marker", "style", "title", "desc", "metadata", "linearGradient", "radialGradient", "mask"]);

/** Local-space sample points for a shape tag (beziers/arcs included). */
function shapePoints(name, attrs) {
  if (name === "rect") {
    const x = Number(attrs.x ?? 0), y = Number(attrs.y ?? 0), w = Number(attrs.width ?? 0), h = Number(attrs.height ?? 0);
    return [{ x, y }, { x: x + w, y }, { x: x + w, y: y + h }, { x, y: y + h }];
  }
  if (name === "circle" || name === "ellipse") {
    const cx = Number(attrs.cx ?? 0), cy = Number(attrs.cy ?? 0);
    const rx = name === "circle" ? Number(attrs.r ?? 0) : Number(attrs.rx ?? 0);
    const ry = name === "circle" ? Number(attrs.r ?? 0) : Number(attrs.ry ?? 0);
    const pts = [];
    for (let s = 0; s < 20; s++) { const a = (2 * Math.PI * s) / 20; pts.push({ x: cx + rx * Math.cos(a), y: cy + ry * Math.sin(a) }); }
    return pts;
  }
  if (name === "line") return [{ x: Number(attrs.x1 ?? 0), y: Number(attrs.y1 ?? 0) }, { x: Number(attrs.x2 ?? 0), y: Number(attrs.y2 ?? 0) }];
  if (name === "polygon" || name === "polyline") {
    const nums = (attrs.points ?? "").match(/-?[\d.]+/g)?.map(Number) ?? [];
    const pts = [];
    for (let i = 0; i + 1 < nums.length; i += 2) pts.push({ x: nums[i], y: nums[i + 1] });
    return pts;
  }
  if (name === "path") return pathPoints(attrs.d ?? "");
  if (name === "use" || name === "image") {
    const x = Number(attrs.x ?? 0), y = Number(attrs.y ?? 0), w = Number(attrs.width ?? 0), h = Number(attrs.height ?? 0);
    return [{ x, y }, { x: x + w, y: y + h }];
  }
  return null;
}

/** Union bbox of the shapes inside a `<clipPath id>` (local coordinates). */
export function clipPathBox(src, id) {
  const m = src.match(new RegExp(`<clipPath(?:[^<>"']|"[^"]*"|'[^']*')*?\\bid\\s*=\\s*["']${id}["'](?:[^<>"']|"[^"]*"|'[^']*')*>([\\s\\S]*?)</clipPath>`));
  if (!m) return null;
  let box = null;
  for (const sm of m[1].matchAll(/<(rect|circle|ellipse|polygon|path)((?:[^<>"']|"[^"]*"|'[^']*')*?)\/?>/g)) {
    const pts = shapePoints(sm[1], readAttrs(sm[2]));
    if (!pts?.length) continue;
    const b = bboxOfPoints(pts);
    box = box ? unionBox(box, b) : b;
  }
  return box;
}

const intersectBox = (a, b) => {
  if (!a) return b ?? null;
  if (!b) return a;
  return { x1: Math.max(a.x1, b.x1), y1: Math.max(a.y1, b.y1), x2: Math.min(a.x2, b.x2), y2: Math.min(a.y2, b.y2) };
};
const nonEmpty = (b) => b && b.x2 > b.x1 && b.y2 > b.y1;

/** Single pass over tags: transforms composed, ancestry tracked, shapes sampled. */
export function collectGeometry(src) {
  const css = cssIndex(src);
  const texts = [], containers = [], motifs = [], logos = [], painted = [];
  const groupStack = [];
  let motifCount = 0;
  const tagRe = /<(\/?)([A-Za-z][\w-]*)((?:[^<>"']|"[^"]*"|'[^']*')*?)(\/?)>/g;

  const shapesFromPoints = (pts, M) => (pts.length ? bboxOfPoints(pts.map((p) => applyM(M, p.x, p.y))) : null);

  for (const m of src.matchAll(tagRe)) {
    const [, closing, name, attrSrc, selfClose] = m;
    if (closing) {
      if (DEF_TAGS.has(name)) { groupStack.pop(); continue; }
      if (groupStack.some((g) => g.skip)) continue;
      if (name === "g") groupStack.pop();
      continue;
    }
    if (DEF_TAGS.has(name)) { if (!selfClose) groupStack.push({ skip: true }); continue; }
    if (groupStack.some((g) => g.skip)) continue;

    const attrs = readAttrs(attrSrc);
    const props = css.propsFor(attrs);
    const parent = groupStack.length ? groupStack[groupStack.length - 1] : null;
    const parentM = parent?.M ?? I6();
    const M = mul(parentM, transformMatrix(attrs.transform));
    const motifIndex = attrs["data-motif"] != null ? motifCount++ : parent?.motifIndex ?? null;
    const inLogo = attrs["data-role"] === "logo" || Boolean(parent?.logo);
    const clipped = attrs["clip-path"] != null || Boolean(parent?.clipped);

    if (name === "g") {
      let clipBox = parent?.clipBox ?? null;
      const cm = attrs["clip-path"]?.match(/^url\(\s*#([^)"'\s]+)/);
      if (cm) {
        const local = clipPathBox(src, cm[1]);
        if (local) {
          const corners = [{ x: local.x1, y: local.y1 }, { x: local.x2, y: local.y1 }, { x: local.x2, y: local.y2 }, { x: local.x1, y: local.y2 }].map((p) => applyM(M, p.x, p.y));
          clipBox = intersectBox(clipBox, bboxOfPoints(corners));
        }
      }
      groupStack.push({ M, motifIndex, logo: inLogo, clipped, clipBox });
      if (attrs["data-motif"] != null) motifs.push(null);
      continue;
    }

    // --- shapes → world-space bbox via sampled points, clipped to clip-path
    let pts = shapePoints(name, attrs);
    if (pts && pts.length) {
      let box = shapesFromPoints(pts, M);
      const cb = parent?.clipBox ?? null;
      if (cb) box = intersectBox(box, cb);
      if (!nonEmpty(box)) { /* fully clipped away: paints nothing */ }
      else {
        const fill = props.fill ?? (["rect", "circle", "ellipse", "polygon"].includes(name) ? "#000" : null);
        const hasFill = fill != null && fill !== "none" && fill !== "transparent";
        const alpha = props.opacity != null ? Number(props.opacity) : (props["fill-opacity"] != null ? Number(props["fill-opacity"]) : 1);
        if (hasFill) {
          const urlM = fill.match(/^url\(\s*#([^)"'\s]+)/);
          painted.push({ box, kind: urlM ? "url" : "solid", fill, urlId: urlM ? urlM[1] : null, opacity: Number.isFinite(alpha) ? alpha : 1 });
        }
        if (name === "rect" && hasFill && box.h <= 120 && box.w <= 520) containers.push(box);
        if (motifIndex !== null) motifs[motifIndex] = unionBox(motifs[motifIndex], box);
        if (inLogo) logos.push(box);
      }
    }

    // --- text (incl. tspan children)
    if (name === "text") {
      const end = m.index + m[0].length;
      const stop = src.indexOf("</text>", end);
      const inner = stop === -1 ? "" : src.slice(end, stop);
      const anchorOf = (p2) => p2["text-anchor"] ?? attrs["text-anchor"] ?? "start";
      const pushBox = (content, p2) => {
        const fs2 = px(p2["font-size"]) ?? 16;
        const ls = px(p2["letter-spacing"]) ?? 0;
        const textLength = px(p2.textLength ?? attrs.textLength);
        const w = textLength != null ? textLength : estimateTextWidth(content, fs2, ls || 0);
        const lx = Number(p2.x ?? attrs.x ?? 0), ly = Number(p2.y ?? attrs.y ?? 0);
        let x1 = lx, x2 = lx + w;
        const anchor = anchorOf(p2);
        if (anchor === "middle") { x1 = lx - w / 2; x2 = lx + w / 2; }
        if (anchor === "end") { x1 = lx - w; x2 = lx; }
        // local-space box, then transformed as a whole (rotation-safe)
        const y1 = ly - fs2 * 0.88, y2 = ly + fs2 * 0.32;
        const corners = [{ x: x1, y: y1 }, { x: x2, y: y1 }, { x: x2, y: y2 }, { x: x1, y: y2 }].map((p) => applyM(M, p.x, p.y));
        const box = bboxOfPoints(corners);
        const weight = String(p2["font-weight"] ?? attrs["font-weight"] ?? "400");
        const bold = weight === "bold" || Number(weight) >= 600 || ["600", "700", "800", "900"].includes(weight);
        const alpha = props.opacity != null ? Number(props.opacity) : (props["fill-opacity"] != null ? Number(props["fill-opacity"]) : 1);
        texts.push({ content, box, fs: fs2, bold, alpha, fill: props.fill ?? null, motifIndex, clipped, cy: (box.y1 + box.y2) / 2, cx: (box.x1 + box.x2) / 2 });
      };
      const inherited = css.propsFor(attrs);
      const tspans = [...inner.matchAll(/<tspan([^>]*)>([\s\S]*?)<\/tspan>/g)];
      if (tspans.length) {
        for (const ts of tspans) {
          const ta = readAttrs(ts[1]);
          const p2 = css.propsFor({ ...attrs, ...ta });
          const content = ts[2].replace(/<[^>]+>/g, "").trim();
          if (content) pushBox(content, { ...inherited, ...p2 });
        }
      } else {
        const content = inner.replace(/<[^>]+>/g, "").trim();
        if (content) pushBox(content, inherited);
      }
    }
  }
  return { texts, containers, motifs: motifs.filter(Boolean), logos, painted };
}

function unionBox(a, b) {
  if (!a) return b;
  return { x1: Math.min(a.x1, b.x1), y1: Math.min(a.y1, b.y1), x2: Math.max(a.x2, b.x2), y2: Math.max(a.y2, b.y2) };
}

/** Parse `<linearGradient>/<radialGradient>` def: stops + geometry. */
function gradientDef(src, id) {
  const open = src.match(new RegExp(`<(linearGradient|radialGradient)((?:[^<>"']|"[^"]*"|'[^']*')*?)\\bid\\s*=\\s*["']${id}["'](?:[^<>"']|"[^"]*"|'[^']*')*>`))
    ?? src.match(new RegExp(`<(linearGradient|radialGradient)\\bid\\s*=\\s*["']${id}["']((?:[^<>"']|"[^"]*"|'[^']*')*?)>`));
  if (!open) return null;
  const a = readAttrs(open[2]);
  const stops = [];
  const body = src.slice(open.index + open[0].length).match(/^([\s\S]*?)<\/(?:linearGradient|radialGradient)>/);
  if (body) {
    let lastOffset = 0;
    for (const sm of body[1].matchAll(/<stop((?:[^<>"']|"[^"]*"|'[^']*')*?)\/?>(?:<\/stop>)?/g)) {
      const sa = readAttrs(sm[1]);
      const color = parseColor(sa["stop-color"] ?? "#000");
      if (!color) continue;
      const off = sa.offset != null ? Number(String(sa.offset).replace("%", "")) / (String(sa.offset).includes("%") ? 100 : 1) : null;
      stops.push({ offset: Number.isFinite(off) ? off : null, color, op: sa["stop-opacity"] != null ? Number(sa["stop-opacity"]) : 1 });
    }
    for (const s of stops) {
      if (s.offset == null) s.offset = lastOffset;
      lastOffset = s.offset;
    }
  }
  return { kind: open[1], attrs: a, stops };
}

/**
 * Gradient color at a world-space point. objectBoundingBox (default) maps the
 * containing shape's bbox to 0..1; userSpaceOnUse uses raw coordinates.
 * Returns {color, op} — or the worst-case blend when geometry is ambiguous.
 */
function gradientColorAt(def, shapeBox, px, py) {
  const stops = def.stops;
  if (!stops.length) return null;
  let t = null;
  const g = def.attrs;
  if (def.kind === "linearGradient") {
    const units = g.gradientUnits ?? "objectBoundingBox";
    const sc = units === "userSpaceOnUse" ? { x1: Number(g.x1 ?? 0), y1: Number(g.y1 ?? 0), x2: Number(g.x2 ?? 1), y2: Number(g.y2 ?? 0) }
      : { x1: Number(g.x1 ?? 0), y1: Number(g.y1 ?? 0), x2: Number(g.x2 ?? 1), y2: Number(g.y2 ?? 0) };
    let qx, qy;
    if (units === "userSpaceOnUse") { qx = px; qy = py; }
    else if (shapeBox && shapeBox.w > 0 && shapeBox.h > 0) {
      qx = (px - shapeBox.x1) / shapeBox.w; qy = (py - shapeBox.y1) / shapeBox.h;
    }
    if (qx != null) {
      const dx = sc.x2 - sc.x1, dy = sc.y2 - sc.y1, len2 = dx * dx + dy * dy;
      t = len2 > 0 ? Math.min(1, Math.max(0, ((qx - sc.x1) * dx + (qy - sc.y1) * dy) / len2)) : 0;
    }
  } else if (def.kind === "radialGradient" && shapeBox && shapeBox.w > 0 && shapeBox.h > 0) {
    const units = g.gradientUnits ?? "objectBoundingBox";
    const cx = units === "userSpaceOnUse" ? Number(g.cx ?? 0.5) : Number(g.cx ?? 0.5), cy = Number(g.cy ?? 0.5), r = Number(g.r ?? 0.5);
    const qx = units === "userSpaceOnUse" ? px : shapeBox.x1 + cx * shapeBox.w;
    const qy = units === "userSpaceOnUse" ? py : shapeBox.y1 + cy * shapeBox.h;
    const rr = units === "userSpaceOnUse" ? r : r * Math.max(shapeBox.w, shapeBox.h);
    t = rr > 0 ? Math.min(1, Math.hypot(px - qx, py - qy) / rr) : 1;
  }
  if (t == null) {
    // Ambiguous geometry: take the least contrasty stop (conservative).
    return null;
  }
  const sorted = [...stops].sort((a, b) => a.offset - b.offset);
  let lo = sorted[0], hi = sorted[sorted.length - 1];
  for (let i = 0; i < sorted.length - 1; i++) {
    if (t >= sorted[i].offset && t <= sorted[i + 1].offset) { lo = sorted[i]; hi = sorted[i + 1]; break; }
  }
  const span = hi.offset - lo.offset || 1;
  const f = Math.min(1, Math.max(0, (t - lo.offset) / span));
  return { color: blend(hi.color, f, lo.color), op: lo.op + (hi.op - lo.op) * f };
}

const blend = (fg, a, bg) => fg.map((c, i) => c * a + bg[i] * (1 - a));

/* --------------------------------------------------------- color/contrast -- */

function parseColor(v) {
  if (v == null || v === "none" || v === "transparent" || v.startsWith("url(")) return null;
  let m = v.trim().match(/^#([0-9a-fA-F]{6})$/);
  if (m) return [parseInt(m[1].slice(0, 2), 16), parseInt(m[1].slice(2, 4), 16), parseInt(m[1].slice(4, 6), 16)];
  m = v.trim().match(/^#([0-9a-fA-F]{3})$/);
  if (m) return [0, 1, 2].map((i) => parseInt(m[1][i] + m[1][i], 16));
  m = v.trim().match(/^rgba?\(\s*([\d.]+)[ ,]+([\d.]+)[ ,]+([\d.]+)/);
  if (m) return [Number(m[1]), Number(m[2]), Number(m[3])];
  const named = { black: [0, 0, 0], white: [255, 255, 255] };
  return named[v.trim().toLowerCase()] ?? null;
}

const lum = ([r, g, b]) => {
  const f = (c) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const ratio = (a, b) => { const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x); return (hi + 0.05) / (lo + 0.05); };

/* -------------------------------------------------------------- geometry -- */

export function checkGeometry(src) {
  const issues = [];
  const vb = src.match(/viewBox\s*=\s*["']\s*(-?[\d.]+)[\s,]+(-?[\d.]+)[\s,]+(-?[\d.]+)[\s,]+(-?[\d.]+)\s*["']/);
  let W = vb ? Number(vb[3]) : null, H = vb ? Number(vb[4]) : null;
  if (W == null || H == null) {
    const wh = src.match(/<svg[^>]*\bwidth\s*=\s*["']([\d.]+)/) ?? null;
    const hh = src.match(/<svg[^>]*\bheight\s*=\s*["']([\d.]+)/) ?? null;
    if (wh && hh) { W = Number(wh[1]); H = Number(hh[1]); }
  }
  const { texts, containers, motifs, logos, painted } = collectGeometry(src);

  for (const t of texts) {
    if (!t.content) continue;
    const short = t.content.length > 14 ? `${t.content.slice(0, 14)}…` : t.content;
    const b = t.box;
    if (W && H && !t.clipped && (b.x1 < 2 || b.x2 > W - 2 || b.y1 < 2 || b.y2 > H - 2)) {
      issues.push(`geometry G1: text "${short}" escapes canvas (box ${Math.round(b.x1)},${Math.round(b.y1)}–${Math.round(b.x2)},${Math.round(b.y2)} vs ${W}×${H})`);
    }
    for (const r of containers) {
      if (t.cx > r.x1 && t.cx < r.x2 && t.cy > r.y1 && t.cy < r.y2) {
        if (b.x1 < r.x1 + 5 || b.x2 > r.x2 - 5 || b.y1 < r.y1 + 2 || b.y2 > r.y2 - 2) {
          issues.push(`geometry G2: text "${short}" overflows its container (${Math.round(r.w)}×${Math.round(r.h)}px) — needs ≥ ${Math.ceil(b.x2 - b.x1) + 10}px width`);
        }
      }
    }
    const zones = motifs.map((zb, i) => ({ b: zb, hit: t.motifIndex === i, tag: `motif ${i} (${motifLabel(src, i)})` }))
      .concat(logos.map((zb) => ({ b: zb, hit: false, tag: "logo box" })));
    for (const z of zones) {
      if (z.hit) continue;
      const ox = Math.min(b.x2, z.b.x2) - Math.max(b.x1, z.b.x1);
      const oy = Math.min(b.y2, z.b.y2) - Math.max(b.y1, z.b.y1);
      if (ox > 1 && oy > 1) issues.push(`geometry G3: text "${short}" collides with ${z.tag}`);
    }
    // C1 contrast: resolve the actual background under the text in paint order
    // (topmost containing shape wins; translucent layers composite onto what's
    // below; gradient backgrounds are checked against every visible stop).
    const fg = parseColor(t.fill);
    if (fg) {
      const cands = [];
      for (let i = painted.length - 1; i >= 0; i--) {
        const p = painted[i];
        if (p.box.x1 <= t.cx && t.cx <= p.box.x2 && p.box.y1 <= t.cy && t.cy <= p.box.y2) cands.push(p);
      }
      const resolve = (i) => {
        if (i >= cands.length) return [];
        const c = cands[i];
        const below = resolve(i + 1);
        if (c.kind === "solid") {
          const col = parseColor(c.fill);
          if (!col) return below;
          if (c.opacity >= 0.999) return [col];
          return below.length ? below.map((b) => blend(col, c.opacity, b)) : [];
        }
        const def = gradientDef(src, c.urlId);
        if (!def || !def.stops.length) return below;
        const at = gradientColorAt(def, c.box, t.cx, t.cy);
        const scenarios = at ? [at] : def.stops.filter((s) => s.op >= 0.15).map((s) => ({ color: s.color, op: s.op }));
        if (!scenarios.length) return below;
        const out = [];
        for (const s of scenarios) {
          if (s.op >= 0.999) out.push(s.color);
          else if (below.length) out.push(...below.map((b) => blend(s.color, s.op, b)));
          else out.push(s.color);
        }
        return out;
      };
      const bgs = resolve(0);
      if (bgs.length) {
        let worst = Infinity, worstBg = null;
        for (const bgc of bgs) {
          const eff = t.alpha >= 1 ? fg : blend(fg, t.alpha, bgc);
          const r = ratio(eff, bgc);
          if (r < worst) { worst = r; worstBg = bgc; }
        }
        const large = t.fs >= 24 || (t.fs >= 18.5 && t.bold);
        const need = large ? 3.0 : 4.5;
        if (worst < need) issues.push(`contrast C1: text "${short}" ratio ${worst.toFixed(1)}:1 < ${need}:1 (min for ${large ? "large" : "normal"} text, vs rgb(${worstBg.map(Math.round).join(",")}))`);
      }
    }
  }
  for (let i = 0; i < texts.length; i++) {
    for (let j = i + 1; j < texts.length; j++) {
      const a = texts[i], b = texts[j];
      if (!a.content || !b.content) continue;
      const ox = Math.min(a.box.x2, b.box.x2) - Math.max(a.box.x1, b.box.x1);
      const oy = Math.min(a.box.y2, b.box.y2) - Math.max(a.box.y1, b.box.y1);
      if (ox > 2 && oy > 2) issues.push(`geometry G4: "${a.content.slice(0, 12)}" overlaps "${b.content.slice(0, 12)}"`);
    }
  }
  return issues;
}

function motifLabel(src, i) {
  const names = [...src.matchAll(/data-motif="([^"]*)"/g)].map((m) => m[1]);
  return names[i] || "?";
}

/* ----------------------------------------------------------- full grading -- */

const LOGO_REQUIRED = ["data-logo-intent", "data-icon-source", "data-icon-name", "data-icon-license"];
const MAX_BLUR = 24;

export function gradeSvg(filePath) {
  const src = fs.readFileSync(filePath, "utf8");
  const issues = wellFormedXml(src);
  const warnings = [];

  if (!/viewBox\s*=/.test(src)) issues.push("missing viewBox");
  if (!/<title[ >]/.test(src)) issues.push("missing accessible <title>");

  // R1 dangling references + R2 duplicate ids
  const ids = [...src.matchAll(/\bid\s*=\s*["']([^"']+)["']/g)].map((m) => m[1]);
  const idSet = new Set();
  for (const id of ids) {
    if (idSet.has(id)) issues.push(`reference R2: duplicate id "${id}" (first match wins silently)`);
    idSet.add(id);
  }
  const refs = new Set();
  for (const m of src.matchAll(/url\(\s*#([^)"'\s]+)\s*\)/g)) refs.add(m[1]);
  for (const m of src.matchAll(/(?:href|xlink:href)\s*=\s*["']#([^"']+)["']/g)) refs.add(m[1]);
  for (const r of refs) if (!idSet.has(r)) issues.push(`reference R1: url(#${r}) has no target — element renders as if the paint/clip never existed`);

  // W1 external raster embeds
  for (const m of src.matchAll(/<image[^>]*(?:href|xlink:href)\s*=\s*["'](https?:[^"']+)["']/g)) {
    warnings.push(`portability W1: external raster embed ${m[1].slice(0, 60)} breaks offline/portable rendering`);
  }

  // Logo metadata gate
  for (const g of src.match(/<g[^>]*data-role="logo"[^>]*>/g) ?? []) {
    for (const attr of LOGO_REQUIRED) if (!g.includes(attr)) issues.push(`logo group missing ${attr}`);
  }

  // Blur bound (no unbounded glow)
  for (const m of src.matchAll(/stdDeviation\s*=\s*["']([0-9.]+)/g)) {
    if (Number(m[1]) > MAX_BLUR) issues.push(`stdDeviation ${m[1]} exceeds ${MAX_BLUR}`);
  }

  // Semantic motifs must carry a one-sentence message
  for (const g of src.match(/<g[^>]*data-motif="[^"]*"[^>]*>/g) ?? []) {
    if (!g.includes("data-motif-message=")) issues.push("motif without data-motif-message");
  }

  // Geometry + contrast
  issues.push(...checkGeometry(src));

  return { file: path.relative(root, filePath), issues, warnings };
}

/* -------------------------------------------------------------------- CLI -- */

function main() {
  const args = process.argv.slice(2);
  const walkSvgs = (dir) => {
    const out = [];
    if (!fs.existsSync(dir)) return out;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, entry.name);
      if (entry.isDirectory()) out.push(...walkSvgs(p));
      else if (entry.name.endsWith(".svg")) out.push(p);
    }
    return out;
  };
  const files = args.length ? args.map((f) => path.resolve(f)) : [...walkSvgs(path.join(root, "examples")), ...walkSvgs(path.join(root, "docs"))];

  let failed = 0;
  for (const f of files) {
    const { file, issues, warnings } = gradeSvg(f);
    if (issues.length === 0) {
      console.log(`PASS  ${file}${warnings.length ? `  (${warnings.length} warning${warnings.length > 1 ? "s" : ""})` : ""}`);
      for (const w of warnings) console.log(`      ~ ${w}`);
    } else {
      failed++;
      console.log(`FAIL  ${file}`);
      for (const i of issues) console.log(`      - ${i}`);
      for (const w of warnings) console.log(`      ~ ${w}`);
    }
  }
  console.log(`${files.length - failed}/${files.length} files passed`);
  process.exit(failed ? 1 : 0);
}

const isMain = process.argv[1] && fs.realpathSync(process.argv[1]) === fs.realpathSync(new URL(import.meta.url).pathname);
if (isMain) main();
