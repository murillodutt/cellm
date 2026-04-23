import { createServer } from "node:net";
import { mkdirSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

export const PORT_RANGE_START = 31500;
export const PORT_RANGE_END = 31599;

export async function pickPort(
  host = "127.0.0.1",
  start = PORT_RANGE_START,
  end = PORT_RANGE_END,
): Promise<number> {
  for (let port = start; port <= end; port += 1) {
    const free = await new Promise<boolean>((resolve) => {
      const server = createServer();
      server.once("error", () => resolve(false));
      server.once("listening", () => {
        server.close(() => resolve(true));
      });
      server.listen(port, host);
    });
    if (free) return port;
  }
  throw new Error(
    `No free port in range ${start}-${end}. Is another quantize-io daemon running?`,
  );
}

export interface Presence {
  version: string;
  daemon_url: string;
  pid: number;
  modes: readonly string[];
  started_at: number;
  capabilities: readonly string[];
}

export function writePresence(
  root: string,
  presence: Presence,
): { daemonPath: string; presencePath: string } {
  mkdirSync(root, { recursive: true });
  const daemonPath = join(root, "daemon.json");
  const presencePath = join(root, "presence.json");
  writeFileSync(
    daemonPath,
    JSON.stringify(
      { pid: presence.pid, url: presence.daemon_url, started_at: presence.started_at },
      null,
      2,
    ),
  );
  writeFileSync(presencePath, JSON.stringify(presence, null, 2));
  return { daemonPath, presencePath };
}

export function defaultQuantizeRoot(): string {
  return join(homedir(), ".quantize");
}
