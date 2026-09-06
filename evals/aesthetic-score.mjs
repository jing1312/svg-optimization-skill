#!/usr/bin/env node
/**
 * V2 aesthetic review helper.
 *
 * This layer intentionally does not replace technical SVG validation.
 * It provides a repeatable design-system review model.
 */

import fs from "node:fs";

const weights = {
  composition: 25,
  hierarchy: 20,
  color: 15,
  typography: 15,
  material: 15,
  motion: 10,
};

function countMatches(source, pattern) {
  return (source.match(pattern) || []).length;
}

export function scoreSvg(source) {
  const issues = [];
  let score = 100;

  const colors = new Set(
    [...source.matchAll(/#[0-9a-fA-F]{3,8}/g)].map((m) => m[0].toLowerCase()),
  );

  if (colors.size > 6) {
    score -= 10;
    issues.push("too many colors; define clear color roles");
  }

  const blurCount = countMatches(source, /<filter|feGaussianBlur/g);
  if (blurCount > 3) {
    score -= 8;
    issues.push("excessive glow or blur usage");
  }

  const gradients = countMatches(source, /linearGradient|radialGradient/g);
  if (gradients > 5) {
    score -= 8;
    issues.push("gradient density is too high");
  }

  const textSizes = [...source.matchAll(/font-size=["']([0-9.]+)/g)].map((m) => Number(m[1]));
  if (textSizes.length && new Set(textSizes).size < 2) {
    score -= 10;
    issues.push("weak typography hierarchy");
  }

  const metadata = /data-style-id=|data-palette=|data-layout=/.test(source);
  if (!metadata) {
    score -= 5;
    issues.push("missing V2 design provenance metadata");
  }

  return {
    score: Math.max(0, score),
    weights,
    issues,
  };
}

if (process.argv[2]) {
  const result = scoreSvg(fs.readFileSync(process.argv[2], "utf8"));
  console.log(`SVG Quality: ${result.score}/100`);
  for (const issue of result.issues) console.log(`- ${issue}`);
}
