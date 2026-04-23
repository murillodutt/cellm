import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

import { defineCommand } from "citty";

import { compressFile, isValidMode } from "@quantize-io/core";

export const compressCommand = defineCommand({
  meta: {
    name: "compress",
    description: "Compress a markdown/txt file in place (backup written to <stem>.original.md).",
  },
  args: {
    path: {
      type: "positional",
      required: true,
      description: "Path to the file to compress.",
    },
    mode: {
      type: "string",
      description: "Response mode used as cache partition (default: full).",
      default: "full",
    },
    human: {
      type: "boolean",
      description: "Print human-readable summary instead of JSON.",
      default: false,
    },
  },
  async run({ args }) {
    if (!isValidMode(args.mode)) {
      const payload = {
        ok: false,
        error: `Invalid mode '${args.mode}'. See qt rules for the valid set.`,
      };
      process.stdout.write(`${JSON.stringify(payload)}\n`);
      process.exit(1);
    }

    const before = readFileSync(args.path);
    const hash = createHash("sha256").update(before).digest("hex");
    const result = await compressFile({
      filepath: args.path,
      mode: args.mode,
    });

    const savedPct =
      result.bytesIn > 0
        ? Math.round(((result.bytesIn - result.bytesOut) / result.bytesIn) * 10000) / 100
        : 0;

    const payload = {
      ok: result.compressed,
      path: args.path,
      hash,
      mode: args.mode,
      original_bytes: result.bytesIn,
      compressed_bytes: result.bytesOut,
      saved_pct: savedPct,
      cache_hit: result.cacheHit,
      retries: result.retries,
      rolled_back: result.rolledBack,
      reason: result.reason ?? null,
    };

    if (args.human) {
      process.stdout.write(
        `compressed=${payload.ok} saved=${savedPct}% retries=${payload.retries} cacheHit=${payload.cache_hit}\n`,
      );
    } else {
      process.stdout.write(`${JSON.stringify(payload)}\n`);
    }

    if (result.rolledBack) process.exit(2);
    if (!result.compressed && result.reason !== "not natural_language" && result.reason !== "backup exists") {
      process.exit(1);
    }
  },
});
