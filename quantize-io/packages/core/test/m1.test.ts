import {
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  detectFileType,
  shouldCompress,
  COMPRESSIBLE_EXTENSIONS,
} from "../src/detect.js";
import { isSensitivePath } from "../src/sensitive.js";
import { readFlag, safeWriteFlag } from "../src/safe-io.js";
import { validate, validateStrings } from "../src/validate.js";

const FIXTURES = join(__dirname, "fixtures");
const FIXTURE_STEMS = [
  "claude-md-preferences",
  "claude-md-project",
  "mixed-with-code",
  "project-notes",
  "todo-list",
] as const;

describe("detect.detectFileType", () => {
  it("classifies .md as natural_language", () => {
    expect(detectFileType("x.md")).toBe("natural_language");
    expect(detectFileType("Y.MARKDOWN")).toBe("natural_language");
  });

  it("classifies code extensions as code", () => {
    expect(detectFileType("x.py")).toBe("code");
    expect(detectFileType("x.ts")).toBe("code");
  });

  it("classifies config extensions as config", () => {
    expect(detectFileType("x.json")).toBe("config");
    expect(detectFileType("x.yaml")).toBe("config");
    expect(detectFileType("x.toml")).toBe("config");
  });

  it("returns unknown for unrecognized extensions", () => {
    expect(detectFileType("x.qqq")).toBe("unknown");
  });

  it("compresses every fixture of type natural_language", () => {
    for (const stem of FIXTURE_STEMS) {
      const original = join(FIXTURES, `${stem}.original.md`);
      const compressed = join(FIXTURES, `${stem}.md`);
      expect(detectFileType(original)).toBe("natural_language");
      expect(detectFileType(compressed)).toBe("natural_language");
    }
  });

  it("shouldCompress returns false for .original.md", () => {
    const f = join(FIXTURES, "claude-md-project.original.md");
    expect(shouldCompress(f)).toBe(false);
  });

  it("shouldCompress returns true for compressed fixtures", () => {
    const f = join(FIXTURES, "claude-md-project.md");
    expect(shouldCompress(f)).toBe(true);
  });

  it("exposes compressible extensions set", () => {
    expect(COMPRESSIBLE_EXTENSIONS.has(".md")).toBe(true);
  });
});

describe("sensitive.isSensitivePath", () => {
  it("flags env-like files", () => {
    expect(isSensitivePath(".env")).toBe(true);
    expect(isSensitivePath("/tmp/.env.production")).toBe(true);
    expect(isSensitivePath("/tmp/.netrc")).toBe(true);
  });

  it("flags credentials/secrets/passwords", () => {
    expect(isSensitivePath("/x/credentials.md")).toBe(true);
    expect(isSensitivePath("/x/secret.txt")).toBe(true);
    expect(isSensitivePath("/x/passwords.csv")).toBe(true);
  });

  it("flags ssh key files", () => {
    expect(isSensitivePath("/h/id_rsa")).toBe(true);
    expect(isSensitivePath("/h/id_ed25519.pub")).toBe(true);
    expect(isSensitivePath("/h/authorized_keys")).toBe(true);
    expect(isSensitivePath("/h/known_hosts")).toBe(true);
  });

  it("flags certificate/key extensions", () => {
    expect(isSensitivePath("/x/cert.pem")).toBe(true);
    expect(isSensitivePath("/x/app.key")).toBe(true);
    expect(isSensitivePath("/x/bundle.p12")).toBe(true);
    expect(isSensitivePath("/x/store.jks")).toBe(true);
  });

  it("flags sensitive path components", () => {
    expect(isSensitivePath("/home/u/.ssh/id_rsa")).toBe(true);
    expect(isSensitivePath("/home/u/.aws/credentials")).toBe(true);
    expect(isSensitivePath("/home/u/.gnupg/pubring.kbx")).toBe(true);
    expect(isSensitivePath("/home/u/.kube/config")).toBe(true);
    expect(isSensitivePath("/home/u/.docker/config.json")).toBe(true);
  });

  it("flags name tokens with punctuation variants", () => {
    expect(isSensitivePath("/x/my-api-key.txt")).toBe(true);
    expect(isSensitivePath("/x/access_key.md")).toBe(true);
    expect(isSensitivePath("/x/private.key")).toBe(true);
    expect(isSensitivePath("/x/token.json")).toBe(true);
  });

  it("accepts benign names", () => {
    expect(isSensitivePath("/x/README.md")).toBe(false);
    expect(isSensitivePath("/x/project-notes.md")).toBe(false);
  });
});

describe("safe-io.safeWriteFlag + readFlag", () => {
  const whitelist = ["full", "off", "lite", "ultra"] as const;
  let tmp: string;

  beforeAll(() => {
    tmp = mkdtempSync(join(tmpdir(), "quantize-safeio-"));
  });

  afterAll(() => {
    rmSync(tmp, { recursive: true, force: true });
  });

  it("writes + reads a valid mode", () => {
    const p = join(tmp, "active-mode");
    safeWriteFlag(p, "full");
    expect(readFlag(p, [...whitelist])).toBe("full");
  });

  it("refuses to read a value outside the whitelist", () => {
    const p = join(tmp, "active-mode-2");
    safeWriteFlag(p, "pwned");
    expect(readFlag(p, [...whitelist])).toBeNull();
  });

  it("refuses to read a symlink target", () => {
    const real = join(tmp, "real-secret");
    writeFileSync(real, "full");
    const link = join(tmp, "active-mode-link");
    symlinkSync(real, link);
    expect(readFlag(link, [...whitelist])).toBeNull();
  });

  it("refuses to overwrite an existing symlink target", () => {
    const victim = join(tmp, "victim");
    writeFileSync(victim, "untouched");
    const link = join(tmp, "active-mode-link-w");
    symlinkSync(victim, link);
    safeWriteFlag(link, "ultra");
    expect(readFileSync(victim, "utf8")).toBe("untouched");
  });
});

describe("validate.validate against upstream fixtures", () => {
  it("each paired fixture validates as isValid", () => {
    for (const stem of FIXTURE_STEMS) {
      const original = join(FIXTURES, `${stem}.original.md`);
      const compressed = join(FIXTURES, `${stem}.md`);
      const result = validate(original, compressed);
      expect(result.errors, `fixture ${stem} should have no errors`).toEqual(
        [],
      );
      expect(result.isValid).toBe(true);
    }
  });

  it("detects heading count mismatch as error", () => {
    const orig = "# A\n\n# B\n";
    const comp = "# A\n";
    const r = validateStrings(orig, comp);
    expect(r.isValid).toBe(false);
    expect(r.errors.some((e) => e.includes("Heading count"))).toBe(true);
  });

  it("detects URL loss as error", () => {
    const orig = "See https://example.com for details.\n";
    const comp = "See docs.\n";
    const r = validateStrings(orig, comp);
    expect(r.isValid).toBe(false);
    expect(r.errors.some((e) => e.includes("URL mismatch"))).toBe(true);
  });

  it("detects code-block mismatch as error", () => {
    const orig = "```\nconst a = 1;\n```\n";
    const comp = "```\nconst a = 2;\n```\n";
    const r = validateStrings(orig, comp);
    expect(r.isValid).toBe(false);
    expect(
      r.errors.some((e) => e.includes("Code blocks not preserved")),
    ).toBe(true);
  });
});
