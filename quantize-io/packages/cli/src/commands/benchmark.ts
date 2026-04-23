import { readFileSync, readdirSync, statSync } from "node:fs";
import { basename, extname, join } from "node:path";

import { defineCommand } from "citty";
import { encode } from "gpt-tokenizer";

interface Row {
  name: string;
  originalTokens: number;
  compressedTokens: number;
  savedPct: number;
}

function countTokens(text: string): number {
  return encode(text).length;
}

function collectPairs(dir: string): Array<{ original: string; compressed: string; stem: string }> {
  const entries = readdirSync(dir);
  const pairs: Array<{ original: string; compressed: string; stem: string }> = [];
  for (const entry of entries) {
    if (!entry.endsWith(".original.md")) continue;
    const stem = entry.slice(0, -".original.md".length);
    const compressed = join(dir, `${stem}${extname(entry) ? "" : ""}.md`.replace("..md", ".md"));
    const compressedPath = join(dir, `${stem}.md`);
    const originalPath = join(dir, entry);
    try {
      if (statSync(compressedPath).isFile()) {
        pairs.push({ original: originalPath, compressed: compressedPath, stem });
      }
    } catch {
      /* ignore */
    }
    // keep reference to compressed variable for potential future use
    void compressed;
  }
  return pairs;
}

function renderTable(rows: Row[]): string {
  const header = "| File | Original tokens | Compressed tokens | Saved % |";
  const sep = "|------|-----------------|-------------------|---------|";
  const body = rows
    .map(
      (r) =>
        `| ${r.name} | ${r.originalTokens} | ${r.compressedTokens} | ${r.savedPct.toFixed(2)}% |`,
    )
    .join("\n");
  return `${header}\n${sep}\n${body}`;
}

export const benchmarkCommand = defineCommand({
  meta: {
    name: "benchmark",
    description: "Count tokens for every original/compressed pair in a directory.",
  },
  args: {
    path: {
      type: "positional",
      required: true,
      description: "Directory containing *.original.md + *.md pairs.",
    },
    json: {
      type: "boolean",
      description: "Print JSON instead of a Markdown table.",
      default: false,
    },
  },
  async run({ args }) {
    const pairs = collectPairs(args.path);
    const rows: Row[] = pairs.map(({ original, compressed, stem }) => {
      const originalText = readFileSync(original, "utf8");
      const compressedText = readFileSync(compressed, "utf8");
      const originalTokens = countTokens(originalText);
      const compressedTokens = countTokens(compressedText);
      const savedPct =
        originalTokens > 0
          ? ((originalTokens - compressedTokens) / originalTokens) * 100
          : 0;
      return {
        name: basename(stem),
        originalTokens,
        compressedTokens,
        savedPct,
      };
    });

    const totals = rows.reduce(
      (acc, r) => {
        acc.o += r.originalTokens;
        acc.c += r.compressedTokens;
        return acc;
      },
      { o: 0, c: 0 },
    );
    const totalSaved =
      totals.o > 0 ? ((totals.o - totals.c) / totals.o) * 100 : 0;

    if (args.json) {
      process.stdout.write(
        `${JSON.stringify(
          {
            pairs: rows,
            total: {
              original_tokens: totals.o,
              compressed_tokens: totals.c,
              saved_pct: Math.round(totalSaved * 100) / 100,
            },
          },
          null,
          2,
        )}\n`,
      );
    } else {
      process.stdout.write(
        `${renderTable(rows)}\n\nTotal: ${totals.o} → ${totals.c} (${totalSaved.toFixed(2)}% saved)\n`,
      );
    }
  },
});
