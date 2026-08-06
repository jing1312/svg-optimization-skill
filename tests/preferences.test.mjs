import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cli = path.join(repoRoot, "scripts", "preferences.mjs");

let tmpDir;
let storeFile;

function run(args) {
  return spawnSync(process.execPath, [cli, ...args], {
    encoding: "utf8",
    env: { ...process.env, SVG_SKILL_PREFS: storeFile },
  });
}

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "svg-prefs-"));
  storeFile = path.join(tmpDir, "preferences.json");
});

test("record rejects non-whitelisted keys", () => {
  const res = run(["record", "--key", "vibes.sparkle", "--delta", "1"]);
  assert.equal(res.status, 1);
  assert.match(res.stderr, /whitelist/);
  assert.equal(fs.existsSync(storeFile), false);
});

test("record rejects non-numeric delta", () => {
  const res = run(["record", "--key", "material.glass", "--delta", "lots"]);
  assert.equal(res.status, 1);
  assert.match(res.stderr, /finite number/);
});

test("weights accumulate and clamp to [-5, 5]", () => {
  assert.equal(run(["record", "--key", "material.glass", "--delta", "9"]).status, 0);
  let shown = JSON.parse(run(["show"]).stdout);
  assert.equal(shown.weights["material.glass"], 5);
  assert.equal(run(["record", "--key", "material.glass", "--delta=-12"]).status, 0);
  shown = JSON.parse(run(["show"]).stdout);
  assert.equal(shown.weights["material.glass"], -5);
});

test("forget deletes a single key outright", () => {
  run(["record", "--key", "material.paper", "--delta", "2"]);
  run(["record", "--key", "palette.dark_cyan", "--delta", "1"]);
  assert.equal(run(["forget", "--key", "material.paper"]).status, 0);
  const shown = JSON.parse(run(["show"]).stdout);
  assert.equal(shown.weights["material.paper"], undefined);
  assert.equal(shown.weights["palette.dark_cyan"], 1);
});

test("reset clears every stored weight", () => {
  run(["record", "--key", "material.paper", "--delta", "2"]);
  run(["record", "--key", "palette.light_cobalt", "--delta", "-1"]);
  assert.equal(run(["reset"]).status, 0);
  const shown = JSON.parse(run(["show"]).stdout);
  assert.deepEqual(shown.weights, {});
});

test("recovers from corrupted JSON by backing up and starting fresh", () => {
  fs.writeFileSync(storeFile, "{{{ not json");
  const res = run(["show"]);
  assert.equal(res.status, 0);
  const shown = JSON.parse(res.stdout);
  assert.deepEqual(shown.weights, {});
  assert.equal(shown.recovered, true);
  const backups = fs.readdirSync(tmpDir).filter((f) => f.includes(".corrupt-"));
  assert.equal(backups.length, 1);
});
