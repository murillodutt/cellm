import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

import { defineCommand } from "citty";

import {
  VALID_MODES,
  filterRulesByMode,
  isValidMode,
  readFlag,
  safeWriteFlag,
} from "@quantize-io/core";

const QT_ROOT = join(homedir(), ".quantize");
const FLAG_PATH = join(QT_ROOT, "active-mode");
const PRESENCE_PATH = join(QT_ROOT, "presence.json");
const VERSION = "0.1.0";

function readPresence(): Record<string, unknown> | null {
  if (!existsSync(PRESENCE_PATH)) return null;
  try {
    return JSON.parse(readFileSync(PRESENCE_PATH, "utf8"));
  } catch {
    return null;
  }
}

function isPidAlive(pid: number): boolean {
  try {
    // signal 0 probes liveness without sending a real signal
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function verifyDaemonLiveness(
  presence: Record<string, unknown> | null,
): { presence: Record<string, unknown> | null; alive: boolean } {
  if (!presence) return { presence: null, alive: false };
  const pid = typeof presence["pid"] === "number" ? (presence["pid"] as number) : null;
  if (pid === null || !isPidAlive(pid)) {
    return { presence: null, alive: false };
  }
  return { presence, alive: true };
}

export const statusCommand = defineCommand({
  meta: {
    name: "status",
    description: "Print current mode, daemon presence, version, and paths.",
  },
  args: {
    json: {
      type: "boolean",
      description: "Force JSON output (default: true).",
      default: true,
    },
  },
  async run({ args }) {
    const mode = readFlag(FLAG_PATH, [...VALID_MODES]);
    const { presence: livePresence, alive } = verifyDaemonLiveness(readPresence());
    const payload = {
      version: VERSION,
      mode: mode ?? "off",
      daemon: livePresence,
      daemon_alive: alive,
      paths: {
        root: QT_ROOT,
        flag: FLAG_PATH,
        presence: PRESENCE_PATH,
      },
    };
    if (args.json) {
      process.stdout.write(`${JSON.stringify(payload)}\n`);
    } else {
      process.stdout.write(
        `qt ${VERSION}  mode=${payload.mode}  daemon=${alive ? "up" : "down"}\n`,
      );
    }
  },
});

export const modeCommand = defineCommand({
  meta: {
    name: "mode",
    description: "Set or clear the active response mode (flag file).",
  },
  args: {
    level: {
      type: "positional",
      required: true,
      description: `One of: ${[...VALID_MODES].join(", ")}.`,
    },
  },
  async run({ args }) {
    if (!isValidMode(args.level)) {
      process.stdout.write(
        `${JSON.stringify({ ok: false, error: `invalid mode: ${args.level}` })}\n`,
      );
      process.exit(1);
    }
    safeWriteFlag(FLAG_PATH, args.level);
    process.stdout.write(
      `${JSON.stringify({ ok: true, mode: args.level, flag: FLAG_PATH })}\n`,
    );
  },
});

export const rulesCommand = defineCommand({
  meta: {
    name: "rules",
    description: "Print the bundled rules.md filtered by the given level.",
  },
  args: {
    level: {
      type: "string",
      description: "Mode to filter by (default: full).",
      default: "full",
    },
  },
  async run({ args }) {
    if (!isValidMode(args.level)) {
      process.stdout.write(
        `${JSON.stringify({ ok: false, error: `invalid mode: ${args.level}` })}\n`,
      );
      process.exit(1);
    }
    process.stdout.write(filterRulesByMode(args.level));
  },
});
