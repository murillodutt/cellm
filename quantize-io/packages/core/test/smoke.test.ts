import { describe, expect, it } from "vitest";
import { VERSION } from "../src/index.js";

describe("@quantize-io/core smoke", () => {
  it("exposes VERSION constant", () => {
    expect(VERSION).toBe("0.1.0");
  });
});
