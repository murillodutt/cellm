import { VALID_MODES, isValidMode, readFlag } from "@quantize-io/core";

import { flagPath } from "./paths.js";

const ORANGE = "\x1b[38;5;172m";
const RESET = "\x1b[0m";

export function renderStatusline(): string {
  const mode = readFlag(flagPath(), [...VALID_MODES]);
  if (!mode || !isValidMode(mode) || mode === "off") return "";
  if (mode === "full") return `${ORANGE}[QT]${RESET}`;
  return `${ORANGE}[QT:${mode.toUpperCase()}]${RESET}`;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const out = renderStatusline();
  if (out) process.stdout.write(out);
}
