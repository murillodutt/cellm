#!/usr/bin/env node
import { defineCommand, runMain } from "citty";

import { runActivate } from "./activate.js";
import { readStdin, runTrack } from "./track.js";
import { renderStatusline } from "./statusline.js";

const activate = defineCommand({
  meta: { name: "activate", description: "SessionStart activation hook." },
  async run() {
    const result = runActivate();
    process.stdout.write(result.stdout);
  },
});

const track = defineCommand({
  meta: { name: "track", description: "UserPromptSubmit mode tracker hook." },
  async run() {
    try {
      const raw = await readStdin();
      const data = JSON.parse(raw) as { prompt?: string };
      const result = runTrack({ prompt: data.prompt ?? "" });
      if (result.stdout) process.stdout.write(result.stdout);
    } catch {
      /* silent fail */
    }
  },
});

const statusline = defineCommand({
  meta: { name: "statusline", description: "Render Claude Code statusline badge." },
  run() {
    const out = renderStatusline();
    if (out) process.stdout.write(out);
  },
});

const main = defineCommand({
  meta: {
    name: "@quantize-io/hooks",
    version: "0.1.0",
    description: "Host hooks for Claude Code / Codex (SessionStart + UserPromptSubmit + statusline).",
  },
  subCommands: { activate, track, statusline },
});

runMain(main);
