#!/usr/bin/env node
import { defineCommand, runMain } from "citty";

import { compressCommand } from "./commands/compress.js";
import { benchmarkCommand } from "./commands/benchmark.js";
import { statusCommand, modeCommand, rulesCommand } from "./commands/status.js";
import { uninstallCommand } from "./commands/uninstall.js";

const main = defineCommand({
  meta: {
    name: "qt",
    version: "0.1.0",
    description:
      "Quantize-IO — token I/O quantization for LLM hosts. Standalone CLI.",
  },
  subCommands: {
    compress: compressCommand,
    benchmark: benchmarkCommand,
    status: statusCommand,
    mode: modeCommand,
    rules: rulesCommand,
    uninstall: uninstallCommand,
  },
});

runMain(main);
