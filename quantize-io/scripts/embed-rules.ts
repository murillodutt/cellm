#!/usr/bin/env bun
// Regenerates packages/core/src/rules.embedded.ts from packages/core/src/rules.md.
// Run this whenever rules.md changes. Typecheck + tests will read from the
// embedded constant, so the disk read path (removed) is no longer needed.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "packages", "core", "src", "rules.md");
const OUT = join(ROOT, "packages", "core", "src", "rules.embedded.ts");

const raw = readFileSync(SRC, "utf8");
// Escape backticks and ${} for template literal embedding.
const escaped = raw.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");

const banner =
  "// DO NOT EDIT — auto-embedded from src/rules.md by scripts/embed-rules.ts.\n" +
  "// Regenerate with: bun scripts/embed-rules.ts\n" +
  "// Inlined so the core bundles to a single portable file (no runtime disk read).\n\n";

const body = `export const RULES_MD_RAW: string = \`${escaped}\`;\n`;

writeFileSync(OUT, banner + body);
process.stdout.write(`[+] rules.embedded.ts regenerated from rules.md (${raw.length} bytes)\n`);
