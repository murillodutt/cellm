import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { createMemoryCache } from "../src/cache.js";
import {
  buildCompressPrompt,
  buildFixPrompt,
  compressFile,
  stripLlmWrapper,
  type CallClaude,
  type CompressEvent,
} from "../src/compress.js";
import { filterRulesByMode, VALID_MODES } from "../src/rules.js";

describe("compress.stripLlmWrapper", () => {
  it("strips an outer ```markdown fence", () => {
    const input = "```markdown\n# Title\n\nbody\n```";
    expect(stripLlmWrapper(input)).toBe("# Title\n\nbody");
  });

  it("strips an outer ~~~ fence", () => {
    const input = "~~~\n# A\n~~~";
    expect(stripLlmWrapper(input)).toBe("# A");
  });

  it("leaves text without outer fence untouched", () => {
    const input = "# Title\n\n```\ninner\n```\n";
    expect(stripLlmWrapper(input)).toBe(input);
  });
});

describe("compress prompts", () => {
  it("buildCompressPrompt includes the original and key rules", () => {
    const p = buildCompressPrompt("ORIGINAL_BODY");
    expect(p).toContain("ORIGINAL_BODY");
    expect(p).toContain("STRICT RULES");
    expect(p).toContain("Preserve ALL URLs exactly");
  });

  it("buildFixPrompt instructs to not recompress", () => {
    const p = buildFixPrompt("O", "C", ["URL mismatch: lost=x"]);
    expect(p).toContain("DO NOT recompress");
    expect(p).toContain("URL mismatch: lost=x");
    expect(p).toContain("ORIGINAL (reference only):\nO");
    expect(p).toContain("COMPRESSED (fix this):\nC");
  });
});

describe("rules.filterRulesByMode", () => {
  it("keeps preservation invariants and enforcement blocks", () => {
    const out = filterRulesByMode("full");
    expect(out).toContain("Preservation invariants");
    expect(out).toContain("Enforcement");
  });

  it("keeps the row for the active mode and drops others", () => {
    const out = filterRulesByMode("lite");
    expect(out).toContain("| lite ");
    expect(out).not.toContain("| ultra ");
    expect(out).toContain("- lite:");
    expect(out).not.toContain("- ultra:");
  });

  it("exposes every mode declared in VALID_MODES", () => {
    const raw = filterRulesByMode("full");
    for (const m of VALID_MODES.filter((x) => x !== "off")) {
      const all = filterRulesByMode(m);
      expect(all).toContain(`| ${m} `);
    }
    expect(raw).toBeTruthy();
  });
});

describe("compressFile end-to-end with mock Claude", () => {
  let tmp: string;
  let target: string;

  beforeEach(() => {
    tmp = mkdtempSync(join(tmpdir(), "quantize-m2-"));
    target = join(tmp, "doc.md");
    writeFileSync(
      target,
      [
        "# Guide",
        "",
        "See https://example.com for more.",
        "",
        "```",
        "const x = 1;",
        "```",
        "",
        "Bullet A.",
        "",
        "Bullet B more words than strictly necessary.",
        "",
      ].join("\n"),
    );
  });

  afterEach(() => {
    rmSync(tmp, { recursive: true, force: true });
  });

  it("happy path: writes backup, compressed file, events fire in order", async () => {
    const mockCompressed = [
      "# Guide",
      "",
      "See https://example.com for more.",
      "",
      "```",
      "const x = 1;",
      "```",
      "",
      "Bullet A.",
      "",
      "Bullet B.",
      "",
    ].join("\n");

    const callClaude: CallClaude = async () => mockCompressed;
    const events: CompressEvent[] = [];
    const result = await compressFile({
      filepath: target,
      callClaude,
      cache: createMemoryCache(),
      onEvent: (e) => events.push(e),
    });

    expect(result.compressed).toBe(true);
    expect(result.rolledBack).toBe(false);
    expect(result.cacheHit).toBe(false);
    expect(result.retries).toBe(0);
    expect(existsSync(join(tmp, "doc.original.md"))).toBe(true);
    expect(readFileSync(target, "utf8")).toBe(mockCompressed);

    const types = events.map((e) => e.type);
    expect(types[0]).toBe("start");
    expect(types[types.length - 1]).toBe("done");
  });

  it("surgical fix: first call loses a URL, second call restores it", async () => {
    const lossy = [
      "# Guide",
      "",
      "See for more.",
      "",
      "```",
      "const x = 1;",
      "```",
      "",
      "Bullet A.",
      "",
      "Bullet B.",
      "",
    ].join("\n");
    const fixed = lossy.replace("See for more.", "See https://example.com for more.");

    let call = 0;
    const callClaude: CallClaude = async () => {
      call += 1;
      return call === 1 ? lossy : fixed;
    };

    const result = await compressFile({
      filepath: target,
      callClaude,
      cache: createMemoryCache(),
    });

    expect(result.compressed).toBe(true);
    expect(result.retries).toBe(1);
    expect(result.rolledBack).toBe(false);
    expect(readFileSync(target, "utf8")).toBe(fixed);
  });

  it("rollback: persistent failure restores original and removes backup", async () => {
    const lossy = "# Guide\n\nSee for more.\n";
    const callClaude: CallClaude = async () => lossy;
    const original = readFileSync(target, "utf8");

    const result = await compressFile({
      filepath: target,
      callClaude,
      cache: createMemoryCache(),
    });

    expect(result.compressed).toBe(false);
    expect(result.rolledBack).toBe(true);
    expect(readFileSync(target, "utf8")).toBe(original);
    expect(existsSync(join(tmp, "doc.original.md"))).toBe(false);
  });

  it("cache hit: second call with same content does not invoke Claude", async () => {
    const mockCompressed = readFileSync(target, "utf8");
    let calls = 0;
    const callClaude: CallClaude = async () => {
      calls += 1;
      return mockCompressed;
    };
    const cache = createMemoryCache();

    const first = await compressFile({ filepath: target, callClaude, cache });
    expect(first.cacheHit).toBe(false);
    expect(calls).toBe(1);

    // Prepare a fresh file with the original bytes to retry compression
    const target2 = join(tmp, "doc2.md");
    writeFileSync(target2, readFileSync(join(tmp, "doc.original.md"), "utf8"));

    const second = await compressFile({ filepath: target2, callClaude, cache });
    expect(second.cacheHit).toBe(true);
    expect(calls).toBe(1);
    expect(existsSync(join(tmp, "doc2.original.md"))).toBe(true);
  });

  it("sensitive path: refuses before reading", async () => {
    const dangerous = join(tmp, "credentials.md");
    writeFileSync(dangerous, "# Secret\n");
    const callClaude: CallClaude = async () => "";
    await expect(
      compressFile({ filepath: dangerous, callClaude }),
    ).rejects.toThrow(/sensitive/i);
  });

  it("pre-existing backup aborts without calling Claude", async () => {
    writeFileSync(join(tmp, "doc.original.md"), "pre-existing\n");
    let called = false;
    const callClaude: CallClaude = async () => {
      called = true;
      return "";
    };
    const result = await compressFile({ filepath: target, callClaude });
    expect(result.compressed).toBe(false);
    expect(result.reason).toBe("backup exists");
    expect(called).toBe(false);
  });
});
