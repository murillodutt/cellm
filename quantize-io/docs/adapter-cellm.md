# Adapter CELLM

`@quantize-io/adapter-cellm` exposes a factory `createQuantizeTool()` that any MCP host (including CELLM
Oracle) can import to register a `quantize_compress` tool.

## Contract

| Boundary | Rule |
|----------|------|
| Core imports | `@quantize-io/adapter-cellm` does NOT import `@quantize-io/core`. |
| Disk writes | Adapter never writes to `~/.quantize/` — only the CLI and the daemon do. |
| Transport | HTTP (daemon) or subprocess (`qt compress`) — never in-process. |

## Factory options

```ts
import { createQuantizeTool } from "@quantize-io/adapter-cellm";

const tool = createQuantizeTool({
  projectKey: "my-project",
  sessionId: "sess-abc",
  emit: async (event) => {
    await oracleTimeline.insert({
      sourceType: "agent",
      subtype: event.subtype, // quantize.compress.ok | quantize.compress.fail
      title: event.title,
      content: event.content,
      project: event.project,
      sessionId: event.sessionId,
      createdAtEpoch: Date.now(),
    });
  },
});

hostRegisterTool(tool);
```

## Discovery order

1. `QT_DAEMON_URL` environment variable.
2. `~/.quantize/presence.json` `daemon_url` field.
3. Subprocess `qt compress` (requires `qt` in PATH).
4. Structured error with install hint.

## Timeline subtypes

| Subtype | When |
|---------|------|
| `quantize.compress.ok` | Successful compression (including cache hits). |
| `quantize.compress.fail` | Any error path — daemon fetch failure, CLI exit ≠ 0, or rollback. |
