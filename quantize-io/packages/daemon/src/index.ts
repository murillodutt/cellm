import { createServer } from "node:http";

import { defineCommand, runMain } from "citty";

import { VALID_MODES, createDaemonApp, DAEMON_VERSION } from "./app.js";
import {
  PORT_RANGE_END,
  PORT_RANGE_START,
  defaultQuantizeRoot,
  pickPort,
  writePresence,
} from "./startup.js";

export const DAEMON_PORT_RANGE = {
  start: PORT_RANGE_START,
  end: PORT_RANGE_END,
} as const;

const startCommand = defineCommand({
  meta: {
    name: "start",
    description: "Start the quantize-io daemon on a free port in the range 31500-31599.",
  },
  async run() {
    const host = "127.0.0.1";
    const port = await pickPort(host);
    const { handler } = createDaemonApp();
    const server = createServer(handler);
    server.listen(port, host, () => {
      const url = `http://${host}:${port}`;
      writePresence(defaultQuantizeRoot(), {
        version: DAEMON_VERSION,
        daemon_url: url,
        pid: process.pid,
        modes: [...VALID_MODES],
        started_at: Date.now(),
        capabilities: ["compress", "rules", "health", "metrics"],
      });
      process.stdout.write(
        `${JSON.stringify({ ok: true, url, pid: process.pid })}\n`,
      );
    });
  },
});

const main = defineCommand({
  meta: {
    name: "@quantize-io/daemon",
    version: DAEMON_VERSION,
    description: "Optional HTTP daemon for Quantize-IO.",
  },
  subCommands: { start: startCommand },
});

export { createDaemonApp, pickPort, writePresence };

if (import.meta.url === `file://${process.argv[1]}`) {
  runMain(main);
}
