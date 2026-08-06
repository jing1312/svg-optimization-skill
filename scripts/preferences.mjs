#!/usr/bin/env node
/**
 * Local, structured, forgettable preference store for the SVG-optimization skill.
 *
 * Privacy contract (see PRIVACY.md):
 *  - Only whitelisted keys with numeric weights are persisted.
 *  - Storage is a local JSON file; never uploaded, never written into the
 *    public SKILL.md.
 *  - `forget` and `reset` delete data outright.
 *  - Corrupted storage is recovered safely (backed up, then started fresh).
 *
 * Usage:
 *   node scripts/preferences.mjs show
 *   node scripts/preferences.mjs record --key material.glass --delta 1
 *   node scripts/preferences.mjs forget --key material.glass
 *   node scripts/preferences.mjs reset
 *
 * Storage location can be overridden with SVG_SKILL_PREFS (used by tests).
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { parseArgs } from "node:util";

export const WHITELIST = Object.freeze([
  "background.edge_clipped_bubbles",
  "composition.unified_brand_suite",
  "material.glass",
  "material.paper",
  "logo.avoid_generic_bolt",
  "palette.dark_cyan",
  "palette.light_cobalt",
]);

export const WEIGHT_MIN = -5;
export const WEIGHT_MAX = 5;

export function storagePath() {
  if (process.env.SVG_SKILL_PREFS) return process.env.SVG_SKILL_PREFS;
  return path.join(os.homedir(), ".config", "svg-optimization-skill", "preferences.json");
}

function readStore(file) {
  if (!fs.existsSync(file)) return { weights: {}, recovered: false };
  const raw = fs.readFileSync(file, "utf8");
  try {
    const parsed = JSON.parse(raw);
    const weights = parsed && typeof parsed === "object" && parsed.weights && typeof parsed.weights === "object"
      ? parsed.weights
      : {};
    const clean = {};
    for (const [k, v] of Object.entries(weights)) {
      if (WHITELIST.includes(k) && Number.isFinite(Number(v))) clean[k] = Number(v);
    }
    return { weights: clean, recovered: false };
  } catch {
    const backup = `${file}.corrupt-${Date.now()}.bak`;
    fs.copyFileSync(file, backup);
    fs.writeFileSync(file, JSON.stringify({ weights: {} }, null, 2));
    console.warn(`[preferences] corrupted store backed up to ${backup}; starting fresh`);
    return { weights: {}, recovered: true };
  }
}

function writeStore(file, weights) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify({ weights, updatedAt: new Date().toISOString() }, null, 2));
}

const clampWeight = (v) => Math.min(WEIGHT_MAX, Math.max(WEIGHT_MIN, v));

function fail(msg) {
  console.error(`[preferences] ${msg}`);
  process.exitCode = 1;
}

export function run(argv, env = process.env) {
  const file = env.SVG_SKILL_PREFS || storagePath();
  let values, positionals;
  try {
    ({ values, positionals } = parseArgs({
      args: argv,
      allowPositionals: true,
      options: { key: { type: "string" }, delta: { type: "string" } },
    }));
  } catch (e) {
    fail(`argument error: ${e.message} (use --delta=-N for negative numbers)`);
    return null;
  }
  const cmd = positionals[0];

  switch (cmd) {
    case "show": {
      const { weights, recovered } = readStore(file);
      console.log(JSON.stringify({ weights, recovered }, null, 2));
      return weights;
    }
    case "record": {
      const key = values.key;
      if (!key || !WHITELIST.includes(key)) {
        fail(`key must be one of the whitelist:\n  ${WHITELIST.join("\n  ")}`);
        return null;
      }
      const delta = Number(values.delta);
      if (!Number.isFinite(delta)) {
        fail("--delta must be a finite number");
        return null;
      }
      const { weights } = readStore(file);
      weights[key] = clampWeight((weights[key] ?? 0) + delta);
      writeStore(file, weights);
      console.log(JSON.stringify({ key, weight: weights[key] }));
      return weights;
    }
    case "forget": {
      const key = values.key;
      if (!key || !WHITELIST.includes(key)) {
        fail(`key must be one of the whitelist:\n  ${WHITELIST.join("\n  ")}`);
        return null;
      }
      const { weights } = readStore(file);
      delete weights[key];
      writeStore(file, weights);
      console.log(JSON.stringify({ forgotten: key }));
      return weights;
    }
    case "reset": {
      writeStore(file, {});
      console.log(JSON.stringify({ reset: true }));
      return {};
    }
    default:
      fail("usage: preferences.mjs <show|record|forget|reset> [--key K] [--delta N]");
      return null;
  }
}

const isMain = process.argv[1] && fs.realpathSync(process.argv[1]) === fs.realpathSync(new URL(import.meta.url).pathname);
if (isMain) run(process.argv.slice(2));
