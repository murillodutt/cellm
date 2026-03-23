#!/bin/sh
# Stitch MCP Launcher — resolves API key from multiple sources before starting proxy.
# Priority: 1. STITCH_API_KEY env var  2. ~/.cellm/stitch-api-key file  3. gcloud ADC
# Used by .mcp.json as the MCP server command.

STITCH_KEY_FILE="${HOME}/.cellm/stitch-api-key"

# Resolve API key if not already set
if [ -z "${STITCH_API_KEY:-}" ] && [ -f "$STITCH_KEY_FILE" ]; then
  STORED_KEY=$(cat "$STITCH_KEY_FILE" 2>/dev/null | tr -d '[:space:]')
  if [ -n "$STORED_KEY" ]; then
    export STITCH_API_KEY="$STORED_KEY"
  fi
fi

# Launch the Stitch MCP proxy — it handles its own auth (API key or gcloud ADC)
exec npx -y @_davideast/stitch-mcp proxy
