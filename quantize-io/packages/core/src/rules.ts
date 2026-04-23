import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export type Mode =
  | "off"
  | "lite"
  | "full"
  | "ultra"
  | "wenyan-lite"
  | "wenyan"
  | "wenyan-full"
  | "wenyan-ultra"
  | "commit"
  | "review"
  | "compress";

export const VALID_MODES: readonly Mode[] = [
  "off",
  "lite",
  "full",
  "ultra",
  "wenyan-lite",
  "wenyan",
  "wenyan-full",
  "wenyan-ultra",
  "commit",
  "review",
  "compress",
] as const;

export function isValidMode(value: string): value is Mode {
  return (VALID_MODES as readonly string[]).includes(value);
}

const HERE = dirname(fileURLToPath(import.meta.url));

function findRulesPath(): string {
  // After build: dist/rules.md (copied by build pipeline). In source execution
  // (bun/tsx/vitest without build): fall back to src/rules.md one level up.
  const local = join(HERE, "rules.md");
  if (existsSync(local)) return local;
  const sibling = join(HERE, "..", "src", "rules.md");
  if (existsSync(sibling)) return sibling;
  return local;
}

export function loadRawRules(): string {
  return readFileSync(findRulesPath(), "utf8");
}

/**
 * Returns the bundled rules body filtered down to the rows that apply to `mode`.
 * Mirrors compress-llm-activate.js:67-89: keeps the mode table row, preservation
 * invariants, enforcement block, and the `Rules per mode` bullet that names the mode.
 */
export function filterRulesByMode(mode: Mode, raw: string = loadRawRules()): string {
  const lines = raw.split("\n");
  const out: string[] = [];
  let section: "preamble" | "mode-table" | "rules" | "invariants" | "enforcement" = "preamble";

  for (const line of lines) {
    if (line.startsWith("## Response Modes")) {
      section = "mode-table";
      out.push(line);
      continue;
    }
    if (line.startsWith("## Rules per mode")) {
      section = "rules";
      out.push(line);
      continue;
    }
    if (line.startsWith("## Preservation invariants")) {
      section = "invariants";
      out.push(line);
      continue;
    }
    if (line.startsWith("## Enforcement")) {
      section = "enforcement";
      out.push(line);
      continue;
    }

    if (section === "mode-table") {
      // Keep table header, separator, and the row for the active mode.
      if (
        line.startsWith("| Mode") ||
        line.startsWith("|------") ||
        line === "" ||
        line.startsWith(`| ${mode} `)
      ) {
        out.push(line);
      }
      continue;
    }

    if (section === "rules") {
      // Keep only the bullet that starts with "- <mode>:"
      if (line.startsWith(`- ${mode}:`) || line === "") {
        out.push(line);
      }
      continue;
    }

    out.push(line);
  }

  return out.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd() + "\n";
}
