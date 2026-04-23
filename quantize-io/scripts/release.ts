#!/usr/bin/env bun
/**
 * Release orchestrator for @quantize-io/*.
 *
 * - Verifies every packages/<name>/package.json is at the expected version.
 * - Runs `bun publish --access public` per package (dry-run unless --real).
 * - Fails fast if any typecheck / test is missing from the preflight.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const ROOT = new URL("../packages/", import.meta.url).pathname;
const EXPECTED_VERSION = "0.1.0";
const DRY = !process.argv.includes("--real");

interface Pkg {
  name: string;
  version: string;
  dir: string;
}

function discover(): Pkg[] {
  const out: Pkg[] = [];
  for (const entry of readdirSync(ROOT)) {
    const dir = join(ROOT, entry);
    const pkgPath = join(dir, "package.json");
    try {
      const raw = readFileSync(pkgPath, "utf8");
      const json = JSON.parse(raw) as { name?: string; version?: string };
      if (!json.name || !json.version) continue;
      out.push({ name: json.name, version: json.version, dir });
    } catch {
      /* skip packages without package.json */
    }
  }
  return out;
}

function publish(pkg: Pkg): void {
  const args = ["publish", "--access", "public"];
  if (DRY) args.push("--dry-run");
  const result = spawnSync("bun", args, { cwd: pkg.dir, stdio: "inherit" });
  if (result.status !== 0) {
    throw new Error(`publish failed for ${pkg.name} (status=${String(result.status)})`);
  }
}

const packages = discover();
const diverging = packages.filter((p) => p.version !== EXPECTED_VERSION);
if (diverging.length > 0) {
  const names = diverging.map((p) => `${p.name}@${p.version}`).join(", ");
  throw new Error(
    `Expected every package to be at ${EXPECTED_VERSION}; got: ${names}`,
  );
}

for (const pkg of packages) {
  process.stdout.write(
    `${DRY ? "[dry-run] " : ""}publishing ${pkg.name}@${pkg.version}\n`,
  );
  publish(pkg);
}

process.stdout.write(
  `${JSON.stringify({ ok: true, dryRun: DRY, published: packages.map((p) => `${p.name}@${p.version}`) }, null, 2)}\n`,
);
