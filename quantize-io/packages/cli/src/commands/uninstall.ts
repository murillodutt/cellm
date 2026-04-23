import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

import { defineCommand } from "citty";

const QT_ROOT = join(homedir(), ".quantize");
const CLAUDE_SETTINGS = join(homedir(), ".claude", "settings.json");

interface HookEntry {
  hooks?: Array<{ type?: string; command?: string }>;
}

function stripQuantizeHooks(raw: string): {
  changed: boolean;
  next: string;
} {
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return { changed: false, next: raw };
  }
  if (!json || typeof json !== "object") return { changed: false, next: raw };

  const obj = json as Record<string, unknown>;
  const hooks = obj["hooks"] as Record<string, HookEntry[] | undefined> | undefined;
  if (!hooks || typeof hooks !== "object") return { changed: false, next: raw };

  let changed = false;
  for (const event of Object.keys(hooks)) {
    const entries = hooks[event];
    if (!Array.isArray(entries)) continue;
    const filtered = entries
      .map((entry) => ({
        ...entry,
        hooks: (entry.hooks ?? []).filter(
          (h) =>
            !(h.command ?? "").includes("quantize-io") &&
            !(h.command ?? "").includes("compress-llm"),
        ),
      }))
      .filter((entry) => (entry.hooks ?? []).length > 0);
    if (filtered.length !== entries.length || filtered.some((e, i) => e.hooks?.length !== entries[i]?.hooks?.length)) {
      changed = true;
      hooks[event] = filtered;
    }
  }

  return { changed, next: `${JSON.stringify(obj, null, 2)}\n` };
}

export const uninstallCommand = defineCommand({
  meta: {
    name: "uninstall",
    description: "Remove quantize-io/compress-llm hooks from Claude settings and purge ~/.quantize/.",
  },
  args: {
    "dry-run": {
      type: "boolean",
      description: "Show what would be removed without mutating disk.",
      default: false,
    },
  },
  async run({ args }) {
    const steps: Record<string, unknown> = {};

    if (existsSync(CLAUDE_SETTINGS)) {
      const raw = readFileSync(CLAUDE_SETTINGS, "utf8");
      const { changed, next } = stripQuantizeHooks(raw);
      steps["claude_settings"] = { path: CLAUDE_SETTINGS, changed };
      if (changed && !args["dry-run"]) {
        writeFileSync(CLAUDE_SETTINGS, next);
      }
    } else {
      steps["claude_settings"] = { path: CLAUDE_SETTINGS, changed: false };
    }

    if (existsSync(QT_ROOT)) {
      steps["quantize_root"] = { path: QT_ROOT, removed: !args["dry-run"] };
      if (!args["dry-run"]) {
        rmSync(QT_ROOT, { recursive: true, force: true });
      }
    } else {
      steps["quantize_root"] = { path: QT_ROOT, removed: false };
    }

    process.stdout.write(
      `${JSON.stringify({ ok: true, dryRun: args["dry-run"], steps })}\n`,
    );
  },
});
