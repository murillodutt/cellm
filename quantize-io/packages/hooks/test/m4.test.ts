import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { runActivate } from "../src/activate.js";
import { runTrack } from "../src/track.js";
import { renderStatusline } from "../src/statusline.js";

let tmp: string;
let originalHome: string | undefined;

beforeEach(() => {
  tmp = mkdtempSync(join(tmpdir(), "quantize-hooks-"));
  originalHome = process.env["HOME"];
  process.env["HOME"] = tmp;
  vi.resetModules();
});

afterEach(() => {
  if (originalHome !== undefined) process.env["HOME"] = originalHome;
  else delete process.env["HOME"];
  delete process.env["QT_DEFAULT_MODE"];
  rmSync(tmp, { recursive: true, force: true });
});

describe("activate hook", () => {
  it("default mode 'full' writes flag and emits rules header", () => {
    const result = runActivate();
    expect(result.mode).toBe("full");
    expect(result.skipped).toBe(false);
    expect(result.stdout).toContain("quantize-io MODE ACTIVE — level: full");
    expect(readFileSync(join(tmp, ".quantize", "active-mode"), "utf8").trim()).toBe(
      "full",
    );
  });

  it("mode=off skips activation and removes flag", () => {
    runActivate({ mode: "ultra" });
    expect(existsSync(join(tmp, ".quantize", "active-mode"))).toBe(true);
    const result = runActivate({ mode: "off" });
    expect(result.skipped).toBe(true);
    expect(result.stdout).toBe("OK");
    expect(existsSync(join(tmp, ".quantize", "active-mode"))).toBe(false);
  });

  it("QT_DEFAULT_MODE env overrides default", () => {
    process.env["QT_DEFAULT_MODE"] = "ultra";
    const result = runActivate();
    expect(result.mode).toBe("ultra");
  });

  it("independent modes emit short banner only", () => {
    const result = runActivate({ mode: "commit" });
    expect(result.stdout).toContain("Behavior defined by /qt-commit skill.");
  });
});

describe("track hook", () => {
  it("slash command /qt ultra sets mode", () => {
    const result = runTrack({ prompt: "/qt ultra" });
    expect(result.modeAfter).toBe("ultra");
    expect(result.stdout).toContain("MODE ACTIVE (ultra)");
  });

  it("natural language activation defaults to full", () => {
    const result = runTrack({ prompt: "please activate quantize-io" });
    expect(result.modeAfter).toBe("full");
    expect(result.stdout).toContain("MODE ACTIVE (full)");
  });

  it("deactivation removes flag and emits nothing", () => {
    runTrack({ prompt: "/qt full" });
    const result = runTrack({ prompt: "stop quantize-io" });
    expect(result.modeAfter).toBeNull();
    expect(result.stdout).toBe("");
  });

  it("normal mode phrase deactivates", () => {
    runTrack({ prompt: "/qt ultra" });
    const result = runTrack({ prompt: "normal mode please" });
    expect(result.modeAfter).toBeNull();
  });

  it("no match when prompt is unrelated", () => {
    const result = runTrack({ prompt: "hello world" });
    expect(result.modeAfter).toBeNull();
    expect(result.stdout).toBe("");
  });

  it("independent mode commit skips additionalContext emission", () => {
    const result = runTrack({ prompt: "/qt-commit" });
    expect(result.modeAfter).toBe("commit");
    expect(result.stdout).toBe("");
  });
});

describe("statusline hook", () => {
  it("returns empty when no flag", () => {
    expect(renderStatusline()).toBe("");
  });

  it("renders [QT] for full mode", () => {
    runActivate({ mode: "full" });
    const out = renderStatusline();
    expect(out).toContain("[QT]");
    expect(out.startsWith("\x1b[38;5;172m")).toBe(true);
    expect(out.endsWith("\x1b[0m")).toBe(true);
  });

  it("renders [QT:ULTRA] for non-full mode", () => {
    runActivate({ mode: "ultra" });
    expect(renderStatusline()).toContain("[QT:ULTRA]");
  });

  it("renders [QT:WENYAN-FULL] preserving hyphen case", () => {
    runActivate({ mode: "wenyan-full" });
    expect(renderStatusline()).toContain("[QT:WENYAN-FULL]");
  });
});
