import { createServer, type Server } from "node:http";
import {
  mkdtempSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { createMemoryCache } from "@quantize-io/core";

import { createDaemonApp } from "../src/app.js";
import { pickPort } from "../src/startup.js";

let server: Server;
let baseUrl: string;
let tmp: string;
const sharedCache = createMemoryCache();

const mockClaude = async (prompt: string): Promise<string> => {
  // Return original body text preserving content sufficiently to pass validation
  const marker = "TEXT:";
  const idx = prompt.indexOf(marker);
  if (idx === -1) return prompt;
  return prompt.slice(idx + marker.length).trim();
};

beforeAll(async () => {
  tmp = mkdtempSync(join(tmpdir(), "quantize-daemon-"));
  const { handler } = createDaemonApp({
    callClaude: mockClaude,
    cache: sharedCache,
  });
  server = createServer(handler);
  const port = await pickPort("127.0.0.1", 31500, 31599);
  await new Promise<void>((resolve) => server.listen(port, "127.0.0.1", resolve));
  baseUrl = `http://127.0.0.1:${port}`;
});

afterAll(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()));
  rmSync(tmp, { recursive: true, force: true });
});

describe("daemon", () => {
  it("GET /health returns ok and version", async () => {
    const t0 = Date.now();
    const res = await fetch(`${baseUrl}/health`);
    const ms = Date.now() - t0;
    expect(res.status).toBe(200);
    const body = (await res.json()) as { status: string; version: string; uptime_ms: number };
    expect(body.status).toBe("ok");
    expect(body.version).toBe("0.1.0");
    expect(ms).toBeLessThan(500);
  });

  it("GET /rules returns filtered rules text", async () => {
    const res = await fetch(`${baseUrl}/rules?level=full`);
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toContain("| full ");
    expect(text).not.toContain("| ultra ");
  });

  it("GET /rules rejects invalid level", async () => {
    const res = await fetch(`${baseUrl}/rules?level=pwned`);
    expect(res.status).toBe(400);
  });

  it("POST /compress returns 400 on missing path", async () => {
    const res = await fetch(`${baseUrl}/compress`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(400);
  });

  it("POST /compress succeeds and records metrics", async () => {
    const target = join(tmp, "doc.md");
    writeFileSync(
      target,
      "# Guide\n\nSee https://example.com for more.\n\n```\nconst x = 1;\n```\n\nBullet A.\n",
    );

    const first = await fetch(`${baseUrl}/compress`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ path: target }),
    });
    expect(first.status).toBe(200);
    const firstBody = (await first.json()) as { ok: boolean; cache_hit: boolean };
    expect(firstBody.ok).toBe(true);
    expect(firstBody.cache_hit).toBe(false);

    // Second call with a fresh file holding the original content: should hit cache.
    const target2 = join(tmp, "doc2.md");
    const original = "# Guide\n\nSee https://example.com for more.\n\n```\nconst x = 1;\n```\n\nBullet A.\n";
    writeFileSync(target2, original);
    const second = await fetch(`${baseUrl}/compress`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ path: target2 }),
    });
    const secondBody = (await second.json()) as { ok: boolean; cache_hit: boolean };
    expect(secondBody.ok).toBe(true);
    expect(secondBody.cache_hit).toBe(true);

    const metricsRes = await fetch(`${baseUrl}/metrics`);
    const metrics = (await metricsRes.json()) as {
      request_count: number;
      cache_hit_ratio: number;
    };
    expect(metrics.request_count).toBeGreaterThanOrEqual(2);
    expect(metrics.cache_hit_ratio).toBeGreaterThan(0);
  });
});
