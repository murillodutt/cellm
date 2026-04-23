import {
  createApp,
  createRouter,
  defineEventHandler,
  getQuery,
  readBody,
  setResponseStatus,
  toNodeListener,
  type App,
} from "h3";
import { z } from "zod";

import {
  VALID_MODES,
  compressFile,
  createMemoryCache,
  filterRulesByMode,
  isValidMode,
  type CallClaude,
  type Cache,
} from "@quantize-io/core";

import { createMetrics, type MetricsCollector } from "./metrics.js";

export const DAEMON_VERSION = "0.1.0";

const CompressBody = z.object({
  path: z.string().min(1),
  mode: z.string().optional(),
});

export interface DaemonAppOptions {
  callClaude?: CallClaude;
  cache?: Cache;
  metrics?: MetricsCollector;
}

export interface DaemonHandle {
  app: App;
  handler: ReturnType<typeof toNodeListener>;
  metrics: MetricsCollector;
}

export function createDaemonApp(options: DaemonAppOptions = {}): DaemonHandle {
  const metrics = options.metrics ?? createMetrics();
  const cache = options.cache ?? createMemoryCache();
  const startedAt = Date.now();

  const app = createApp();
  const router = createRouter();

  router.get(
    "/health",
    defineEventHandler(() => ({
      status: "ok",
      version: DAEMON_VERSION,
      uptime_ms: Date.now() - startedAt,
    })),
  );

  router.get(
    "/rules",
    defineEventHandler((event) => {
      const query = getQuery(event);
      const levelRaw = typeof query["level"] === "string" ? query["level"] : "full";
      if (!isValidMode(levelRaw)) {
        setResponseStatus(event, 400);
        return { ok: false, error: `invalid level: ${levelRaw}` };
      }
      return filterRulesByMode(levelRaw);
    }),
  );

  router.get(
    "/metrics",
    defineEventHandler(() => metrics.snapshot()),
  );

  router.post(
    "/compress",
    defineEventHandler(async (event) => {
      const raw = await readBody(event);
      const parsed = CompressBody.safeParse(raw);
      if (!parsed.success) {
        setResponseStatus(event, 400);
        return { ok: false, error: parsed.error.issues };
      }
      const mode = parsed.data.mode ?? "full";
      if (!isValidMode(mode)) {
        setResponseStatus(event, 400);
        return { ok: false, error: `invalid mode: ${mode}` };
      }

      const compressOpts: Parameters<typeof compressFile>[0] = {
        filepath: parsed.data.path,
        mode,
        cache,
      };
      if (options.callClaude) compressOpts.callClaude = options.callClaude;

      const result = await compressFile(compressOpts);
      metrics.record({
        bytesIn: result.bytesIn,
        bytesOut: result.bytesOut,
        cacheHit: result.cacheHit,
      });
      return {
        ok: result.compressed,
        mode,
        path: parsed.data.path,
        original_bytes: result.bytesIn,
        compressed_bytes: result.bytesOut,
        cache_hit: result.cacheHit,
        retries: result.retries,
        rolled_back: result.rolledBack,
        reason: result.reason ?? null,
      };
    }),
  );

  app.use(router);

  return { app, handler: toNodeListener(app), metrics };
}

export { VALID_MODES };
