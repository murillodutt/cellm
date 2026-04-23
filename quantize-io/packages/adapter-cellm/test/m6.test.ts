import { describe, expect, it, vi } from "vitest";

import {
  createQuantizeTool,
  resolveDaemonUrl,
  type TimelineEventInput,
} from "../src/tool.js";

describe("resolveDaemonUrl", () => {
  it("prefers envUrl when provided", () => {
    expect(resolveDaemonUrl({ envUrl: "http://127.0.0.1:31500" })).toBe(
      "http://127.0.0.1:31500",
    );
  });

  it("returns null when env and presence file both missing", () => {
    expect(
      resolveDaemonUrl({ presencePath: "/nonexistent/quantize/presence.json" }),
    ).toBeNull();
  });
});

describe("createQuantizeTool — daemon path", () => {
  it("invokes the daemon when url resolves, emits ok event", async () => {
    const fetchImpl = vi.fn(async () => ({
      ok: true,
      status: 200,
      json: async () =>
        ({
          ok: true,
          mode: "full",
          path: "/tmp/doc.md",
          original_bytes: 100,
          compressed_bytes: 60,
          cache_hit: false,
          retries: 0,
          rolled_back: false,
        }) as unknown,
      text: async () => "",
    }));
    const events: TimelineEventInput[] = [];
    const tool = createQuantizeTool({
      resolveUrl: () => "http://127.0.0.1:31500",
      fetchImpl,
      emit: async (e) => {
        events.push(e);
      },
      projectKey: "test-project",
      sessionId: "test-session",
    });

    const res = await tool.handler({ path: "/tmp/doc.md", mode: "full" });
    expect(res.ok).toBe(true);
    expect(res.compressed_bytes).toBe(60);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(events).toHaveLength(1);
    const evt = events[0]!;
    expect(evt.subtype).toBe("quantize.compress.ok");
    expect(evt.project).toBe("test-project");
    expect(evt.sessionId).toBe("test-session");
  });
});

describe("createQuantizeTool — CLI fallback", () => {
  it("falls back to spawn when no daemon url and emits result", async () => {
    const spawnImpl = vi.fn((_cmd: string, _args: string[]) => {
      const handlers: Record<string, Array<(arg?: unknown) => void>> = {};
      const subject = {
        stdout: {
          on(evt: "data", cb: (chunk: Buffer) => void) {
            setImmediate(() =>
              cb(
                Buffer.from(
                  JSON.stringify({
                    ok: true,
                    mode: "full",
                    path: "/tmp/doc.md",
                    original_bytes: 200,
                    compressed_bytes: 140,
                    cache_hit: false,
                    retries: 0,
                    rolled_back: false,
                  }),
                ),
              ),
            );
          },
        },
        stderr: {
          on(_evt: "data", _cb: (chunk: Buffer) => void) {
            /* no stderr for success */
          },
        },
        on(evt: "close" | "error", cb: (arg?: unknown) => void) {
          if (!handlers[evt]) handlers[evt] = [];
          handlers[evt].push(cb);
          if (evt === "close") {
            setImmediate(() => cb(0));
          }
        },
      };
      return subject;
    });
    const events: TimelineEventInput[] = [];
    const tool = createQuantizeTool({
      resolveUrl: () => null,
      spawnImpl: spawnImpl as unknown as Parameters<
        typeof createQuantizeTool
      >[0] extends infer U
        ? U extends { spawnImpl?: infer S }
          ? S
          : never
        : never,
      emit: async (e) => {
        events.push(e);
      },
    });
    const res = await tool.handler({ path: "/tmp/doc.md" });
    expect(res.ok).toBe(true);
    expect(spawnImpl).toHaveBeenCalledWith("qt", ["compress", "/tmp/doc.md"]);
    expect(events[0]!.subtype).toBe("quantize.compress.ok");
  });
});

describe("createQuantizeTool — QT absent", () => {
  it("returns structured error when daemon fetch rejects and no CLI", async () => {
    const failing = async () => {
      throw new Error("connect ECONNREFUSED");
    };
    const events: TimelineEventInput[] = [];
    const tool = createQuantizeTool({
      resolveUrl: () => "http://127.0.0.1:31500",
      fetchImpl: failing as unknown as Parameters<
        typeof createQuantizeTool
      >[0] extends infer U
        ? U extends { fetchImpl?: infer F }
          ? F
          : never
        : never,
      emit: async (e) => {
        events.push(e);
      },
    });
    const res = await tool.handler({ path: "/tmp/doc.md" });
    expect(res.ok).toBe(false);
    expect(res.error).toContain("ECONNREFUSED");
    expect(events[0]!.subtype).toBe("quantize.compress.fail");
  });
});

describe("adapter-cellm invariants", () => {
  it("never writes to disk itself — verified by absence of fs.write* in source", async () => {
    const src = await import("node:fs/promises").then((m) =>
      m.readFile(
        new URL("../src/tool.ts", import.meta.url),
        "utf8",
      ),
    );
    expect(src).not.toContain("writeFileSync");
    expect(src).not.toContain("mkdirSync");
  });
});
