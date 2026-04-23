import { unlinkSync } from "node:fs";

import {
  VALID_MODES,
  isValidMode,
  readFlag,
  safeWriteFlag,
  type Mode,
} from "@quantize-io/core";

import { flagPath } from "./paths.js";

const INDEPENDENT_MODES: ReadonlySet<Mode> = new Set(["commit", "review", "compress"]);
const ACTIVATE_RE = /\b(activate|enable|turn on|start|talk like)\b.*\bquantize-io\b/i;
const ACTIVATE_POST_RE = /\bquantize-io\b.*\b(mode|activate|enable|turn on|start)\b/i;
const DEACTIVATE_RE = /\b(stop|disable|deactivate|turn off)\b.*\bquantize-io\b/i;
const DEACTIVATE_POST_RE = /\bquantize-io\b.*\b(stop|disable|deactivate|turn off)\b/i;
const NORMAL_MODE_RE = /\bnormal mode\b/i;

export interface TrackInput {
  prompt: string;
}

export interface TrackOutput {
  modeAfter: Mode | null;
  stdout: string;
}

function parseSlash(prompt: string): Mode | null {
  const trimmed = prompt.trim().toLowerCase();
  if (!trimmed.startsWith("/qt")) return null;
  const parts = trimmed.split(/\s+/);
  const cmd = parts[0] ?? "";
  const arg = parts[1] ?? "";

  switch (cmd) {
    case "/qt-commit":
      return "commit";
    case "/qt-review":
      return "review";
    case "/qt-compress":
      return "compress";
    case "/qt": {
      if (arg && isValidMode(arg)) return arg;
      return "full";
    }
    default:
      return null;
  }
}

function isDeactivation(prompt: string): boolean {
  return (
    DEACTIVATE_RE.test(prompt) ||
    DEACTIVATE_POST_RE.test(prompt) ||
    NORMAL_MODE_RE.test(prompt)
  );
}

function isNaturalActivation(prompt: string): boolean {
  if (!ACTIVATE_RE.test(prompt) && !ACTIVATE_POST_RE.test(prompt)) return false;
  return !isDeactivation(prompt);
}

export function runTrack(input: TrackInput): TrackOutput {
  const prompt = input.prompt ?? "";
  const flag = flagPath();

  if (isDeactivation(prompt)) {
    try {
      unlinkSync(flag);
    } catch {
      /* best-effort */
    }
    return { modeAfter: null, stdout: "" };
  }

  const slashMode = parseSlash(prompt);
  if (slashMode) {
    if (slashMode === "off") {
      try {
        unlinkSync(flag);
      } catch {
        /* best-effort */
      }
    } else {
      safeWriteFlag(flag, slashMode);
    }
  } else if (isNaturalActivation(prompt)) {
    safeWriteFlag(flag, "full");
  }

  const active = readFlag(flag, [...VALID_MODES]);
  if (!active || !isValidMode(active) || INDEPENDENT_MODES.has(active)) {
    return { modeAfter: active as Mode | null, stdout: "" };
  }

  const payload = {
    hookSpecificOutput: {
      hookEventName: "UserPromptSubmit",
      additionalContext:
        `quantize-io MODE ACTIVE (${active}). ` +
        "Drop articles/filler/pleasantries/hedging. Fragments OK. " +
        "Code/commits/security: write normal.",
    },
  };
  return { modeAfter: active, stdout: JSON.stringify(payload) };
}

export async function readStdin(): Promise<string> {
  let buf = "";
  for await (const chunk of process.stdin) {
    buf += chunk;
  }
  return buf;
}

