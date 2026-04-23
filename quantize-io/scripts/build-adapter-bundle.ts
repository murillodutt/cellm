#!/usr/bin/env bun
// Produces packages/adapter-claude-code/bundles/hooks.js — a single-file,
// zero-install bundle of the hooks runtime (activate / track / statusline).
//
// Plugin manifests point to ${CLAUDE_PLUGIN_ROOT}/bundles/hooks.js, so the
// installed adapter works without NPM publish and without `bun install` on
// the user's machine. Regenerate this file whenever hooks / core change:
//
//   bun scripts/embed-rules.ts            # if rules.md changed
//   bun scripts/build-adapter-bundle.ts   # always after hooks/core edits
//
// The output is committed to the repo so the marketplace sync picks it up.
import { existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const ENTRY = join(ROOT, "packages", "hooks", "src", "index.ts");
const OUT_DIR = join(ROOT, "packages", "adapter-claude-code", "bundles");
const OUT = join(OUT_DIR, "hooks.js");

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

const result = await Bun.build({
  entrypoints: [ENTRY],
  target: "bun",
  format: "esm",
  outdir: OUT_DIR,
  naming: "hooks.js",
  minify: false,
});

if (!result.success) {
  for (const log of result.logs) process.stderr.write(`${log}\n`);
  process.exit(1);
}

const info = result.outputs[0];
process.stdout.write(
  `[+] adapter-bundle built: ${OUT} (${info ? info.size + " bytes" : "unknown size"})\n`,
);
