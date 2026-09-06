#!/usr/bin/env node
/**
 * scripts/render.mjs — best-effort SVG → PNG render for verification tier T2.
 *
 * Usage:
 *   node scripts/render.mjs path/to/asset.svg [--scale 2] [--out dir]
 *
 * Tries, in order, whatever the environment already has — no npm install:
 *   1. playwright (if importable)            — most faithful (real browser)
 *   2. chromium / chromium-browser / google-chrome / chrome headless
 *   3. rsvg-convert — rsvg is NOT a browser (no <style>-attr quirks, limited
 *      filter support, CJK only if system fonts exist); treat its PNG as a
 *      geometry check, not a beauty check.
 * If nothing is available it prints a manual fallback and exits 2, so agents
 * without any rasterizer degrade to tier T0/T1 instead of failing.
 */

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

function which(cmd) {
  try {
    return execFileSync(process.platform === "win32" ? "where" : "which", [cmd], { stdio: "pipe" }).toString().trim().split(/\r?\n/)[0];
  } catch {
    return null;
  }
}

async function withPlaywright(svgAbs, pngAbs, scale) {
  const { chromium } = await import("playwright");
  const browser = await chromium.launch();
  const page = await browser.newPage({ deviceScaleFactor: scale });
  await page.goto(`file://${svgAbs}`);
  const box = await page.evaluate(() => {
    const svg = document.querySelector("svg");
    const r = svg.getBoundingClientRect();
    return { w: Math.ceil(r.width), h: Math.ceil(r.height) };
  });
  await page.setViewportSize({ width: box.w, height: box.h });
  await page.locator("svg").screenshot({ path: pngAbs });
  await browser.close();
  return "playwright";
}

function withChromium(svgAbs, pngAbs, bin, scale) {
  execFileSync(bin, [
    "--headless=new", "--no-sandbox", "--disable-gpu",
    `--force-device-scale-factor=${scale}`,
    "--hide-scrollbars",
    `--screenshot=${pngAbs}`,
    `file://${svgAbs}`,
  ], { stdio: "pipe" });
  return path.basename(bin);
}

function withRsvg(svgAbs, pngAbs, scale) {
  execFileSync("rsvg-convert", ["-z", String(scale), "-o", pngAbs, svgAbs], { stdio: "pipe" });
  return "rsvg-convert";
}

async function main() {
  const args = process.argv.slice(2);
  const scaleIdx = args.indexOf("--scale");
  const outIdx = args.indexOf("--out");
  const scale = scaleIdx >= 0 ? Number(args[scaleIdx + 1]) : 2;
  const files = args.filter((a, i) => !a.startsWith("--")
    && !(scaleIdx >= 0 && i === scaleIdx + 1)
    && !(outIdx >= 0 && i === outIdx + 1));
  if (!files.length) {
    console.error("usage: node scripts/render.mjs file.svg [more.svg] [--scale 2] [--out dir]");
    process.exit(1);
  }

  const chromiumBin = ["chromium", "chromium-browser", "google-chrome", "google-chrome-stable", "chrome"]
    .map(which).find(Boolean) ?? null;
  let playwright = null;
  try {
    await import("playwright");
    playwright = true;
  } catch { /* optional */ }

  let rc = 0;
  for (const f of files) {
    const svgAbs = path.resolve(f);
    if (!fs.existsSync(svgAbs)) { console.error(`[render] missing: ${f}`); rc = 1; continue; }
    const parsed = path.parse(svgAbs);
    const pngAbs = path.join(outIdx >= 0 ? path.resolve(args[outIdx + 1]) : parsed.dir, `${parsed.name}.png`);
    let engine = null;
    try {
      if (playwright) engine = await withPlaywright(svgAbs, pngAbs, scale);
      else if (chromiumBin) engine = withChromium(svgAbs, pngAbs, chromiumBin, scale);
      else if (which("rsvg-convert")) engine = withRsvg(svgAbs, pngAbs, scale);
    } catch (e) {
      console.error(`[render] ${engine ?? "renderer"} failed on ${f}: ${e.message?.split("\n")[0]}`);
      engine = null;
    }
    if (engine) {
      console.log(`[render] ${path.basename(f)} -> ${path.relative(process.cwd(), pngAbs)} (${engine}${engine === "rsvg-convert" ? ": geometry-check only, not a browser" : ""})`);
    } else {
      rc = rc || 2;
      console.error([
        `[render] no rasterizer available for ${f}.`,
        "[render] Tier T2 unavailable — run tier T0 (static self-check) and say so explicitly:",
        "[render]   * open the SVG in any browser / viewer manually, or",
        "[render]   * install playwright / chromium / rsvg-convert and re-run this script.",
      ].join("\n"));
    }
  }
  process.exit(rc);
}

main();
