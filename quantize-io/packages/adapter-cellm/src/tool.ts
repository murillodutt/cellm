import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

import { z } from "zod";

export const QuantizeCompressInput = z.object({
  path: z.string().min(1),
  mode: z.string().optional(),
});

export type QuantizeCompressInput = z.infer<typeof QuantizeCompressInput>;

export interface CompressResponse {
  ok: boolean;
  mode: string;
  path: string;
  original_bytes?: number;
  compressed_bytes?: number;
  cache_hit?: boolean;
  retries?: number;
  rolled_back?: boolean;
  reason?: string | null;
  error?: string;
}

export interface TimelineEventInput {
  subtype: "quantize.compress.ok" | "quantize.compress.fail";
  title: string;
  content: string;
  payload: Record<string, unknown>;
  project: string | null;
  sessionId: string | null;
}

export type TimelineEmitter = (event: TimelineEventInput) => Promise<void>;

export interface ResolveDaemonUrlOptions {
  envUrl?: string | undefined;
  presencePath?: string;
}

export function resolveDaemonUrl(opts: ResolveDaemonUrlOptions = {}): string | null {
  if (opts.envUrl && opts.envUrl.length > 0) return opts.envUrl;
  const presence = opts.presencePath ?? join(homedir(), ".quantize", "presence.json");
  try {
    const raw = readFileSync(presence, "utf8");
    const parsed = JSON.parse(raw) as { daemon_url?: string };
    if (parsed.daemon_url && typeof parsed.daemon_url === "string") {
      return parsed.daemon_url;
    }
  } catch {
    /* presence missing or unreadable */
  }
  return null;
}

interface FetchLike {
  (input: string, init?: { method?: string; headers?: Record<string, string>; body?: string }): Promise<{
    ok: boolean;
    status: number;
    json(): Promise<unknown>;
    text(): Promise<string>;
  }>;
}

interface SpawnLike {
  (cmd: string, args: string[]): { stdout: { on(evt: "data", cb: (chunk: Buffer) => void): void }; stderr: { on(evt: "data", cb: (chunk: Buffer) => void): void }; on(evt: "close" | "error", cb: (arg?: unknown) => void): void };
}

export interface QuantizeToolOptions {
  projectKey?: string | null;
  sessionId?: string | null;
  emit?: TimelineEmitter;
  resolveUrl?: (opts?: ResolveDaemonUrlOptions) => string | null;
  fetchImpl?: FetchLike;
  spawnImpl?: SpawnLike;
  qtBinary?: string;
  daemonTimeoutMs?: number;
}

export interface QuantizeTool {
  name: "quantize_compress";
  description: string;
  inputSchema: typeof QuantizeCompressInput;
  handler: (args: QuantizeCompressInput) => Promise<CompressResponse>;
}

async function callDaemon(
  url: string,
  body: QuantizeCompressInput,
  fetchImpl: FetchLike,
  timeoutMs: number,
): Promise<CompressResponse> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetchImpl(`${url}/compress`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const parsed = (await res.json()) as CompressResponse;
    return parsed;
  } finally {
    clearTimeout(timer);
  }
}

async function callCli(
  binary: string,
  body: QuantizeCompressInput,
  spawnImpl: SpawnLike,
): Promise<CompressResponse> {
  return new Promise((resolve, reject) => {
    const args = ["compress", body.path];
    if (body.mode) {
      args.push("--mode");
      args.push(body.mode);
    }
    const proc = spawnImpl(binary, args);
    let stdout = "";
    let stderr = "";
    proc.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    proc.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    proc.on("error", (err) => reject(err));
    proc.on("close", (code) => {
      try {
        const parsed = JSON.parse(stdout.trim());
        resolve(parsed as CompressResponse);
      } catch {
        reject(new Error(`qt CLI failed (code=${String(code)}): ${stderr}`));
      }
    });
  });
}

export function createQuantizeTool(
  options: QuantizeToolOptions = {},
): QuantizeTool {
  const resolveUrl = options.resolveUrl ?? resolveDaemonUrl;
  const fetchImpl =
    options.fetchImpl ?? (globalThis.fetch as unknown as FetchLike);
  const spawnImpl =
    options.spawnImpl ?? ((cmd: string, args: string[]) => spawn(cmd, args));
  const qtBinary = options.qtBinary ?? "qt";
  const daemonTimeoutMs = options.daemonTimeoutMs ?? 30_000;

  return {
    name: "quantize_compress",
    description:
      "Compress a markdown/txt file via Quantize-IO. Uses local daemon if available, otherwise spawns qt CLI. Refuses sensitive paths.",
    inputSchema: QuantizeCompressInput,
    async handler(args: QuantizeCompressInput) {
      const url = resolveUrl({ envUrl: process.env["QT_DAEMON_URL"] });
      let response: CompressResponse;
      try {
        if (url) {
          response = await callDaemon(url, args, fetchImpl, daemonTimeoutMs);
        } else {
          response = await callCli(qtBinary, args, spawnImpl);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        const fail: CompressResponse = {
          ok: false,
          mode: args.mode ?? "full",
          path: args.path,
          error:
            url === null
              ? `Quantize-IO not available. Start the daemon (qt daemon start) or install qt globally (bun add -g @quantize-io/cli). Underlying error: ${message}`
              : message,
        };
        await emitSafe(options.emit, {
          subtype: "quantize.compress.fail",
          title: `quantize_compress ${args.path}`,
          content: fail.error ?? "unknown failure",
          payload: { ...fail },
          project: options.projectKey ?? null,
          sessionId: options.sessionId ?? null,
        });
        return fail;
      }

      await emitSafe(options.emit, {
        subtype: response.ok ? "quantize.compress.ok" : "quantize.compress.fail",
        title: `quantize_compress ${args.path}`,
        content: response.ok
          ? `compressed ${response.original_bytes ?? 0} → ${response.compressed_bytes ?? 0} bytes`
          : response.reason ?? "failed",
        payload: { ...response },
        project: options.projectKey ?? null,
        sessionId: options.sessionId ?? null,
      });
      return response;
    },
  };
}

async function emitSafe(
  emit: TimelineEmitter | undefined,
  event: TimelineEventInput,
): Promise<void> {
  if (!emit) return;
  try {
    await emit(event);
  } catch {
    /* adapter never crashes the host because of telemetry */
  }
}
