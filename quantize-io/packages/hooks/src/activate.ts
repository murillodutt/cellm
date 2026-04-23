import { unlinkSync } from "node:fs";

import {
  VALID_MODES,
  filterRulesByMode,
  isValidMode,
  safeWriteFlag,
  type Mode,
} from "@quantize-io/core";

import { flagPath } from "./paths.js";

const INDEPENDENT_MODES: ReadonlySet<Mode> = new Set(["commit", "review", "compress"]);

function resolveDefaultMode(): Mode {
  const envValue = (process.env["QT_DEFAULT_MODE"] ?? "").toLowerCase();
  if (envValue && isValidMode(envValue)) return envValue;
  return "full";
}

export interface ActivateResult {
  mode: Mode;
  skipped: boolean;
  stdout: string;
}

export function runActivate(opts: { mode?: Mode } = {}): ActivateResult {
  const mode: Mode = opts.mode ?? resolveDefaultMode();
  const flag = flagPath();

  if (mode === "off") {
    try {
      unlinkSync(flag);
    } catch {
      /* best-effort */
    }
    return { mode, skipped: true, stdout: "OK" };
  }

  safeWriteFlag(flag, mode);

  if (INDEPENDENT_MODES.has(mode)) {
    const banner = `quantize-io MODE ACTIVE — level: ${mode}. Behavior defined by /qt-${mode} skill.`;
    return { mode, skipped: false, stdout: banner };
  }

  const filtered = filterRulesByMode(mode);
  const stdout = `quantize-io MODE ACTIVE — level: ${mode}\n\n${filtered}`;
  return { mode, skipped: false, stdout };
}

export { VALID_MODES };
