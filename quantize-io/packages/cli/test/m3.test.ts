import { describe, expect, it } from "vitest";

import {
  VALID_MODES,
  isValidMode,
  filterRulesByMode,
} from "@quantize-io/core";

describe("cli re-exports of core contracts", () => {
  it("valid modes include the core mode set", () => {
    expect(VALID_MODES).toContain("full");
    expect(VALID_MODES).toContain("off");
    expect(VALID_MODES).toContain("wenyan-ultra");
  });

  it("isValidMode rejects unknown modes", () => {
    expect(isValidMode("full")).toBe(true);
    expect(isValidMode("pwned")).toBe(false);
  });

  it("filterRulesByMode returns deterministic content per mode", () => {
    const full = filterRulesByMode("full");
    const lite = filterRulesByMode("lite");
    expect(full).toContain("| full ");
    expect(full).not.toContain("| lite ");
    expect(lite).toContain("| lite ");
    expect(lite).not.toContain("| full ");
  });
});
