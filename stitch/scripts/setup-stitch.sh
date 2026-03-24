#!/bin/sh
# Stitch MCP auto-setup — runs on SessionStart
# Checks if Stitch auth is configured in .mcp.json headers.
# Resolves API key from multiple sources and injects into .mcp.json if empty.
# Fail-silent: always exits 0.

STITCH_KEY_FILE="${HOME}/.cellm/stitch-api-key"
PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"
MCP_JSON="${PLUGIN_ROOT}/.mcp.json"

# Bail if .mcp.json does not exist
[ -f "$MCP_JSON" ] || exit 0

# Check if X-Goog-Api-Key is already set in .mcp.json
CURRENT_KEY=""
if command -v jq >/dev/null 2>&1; then
  CURRENT_KEY=$(jq -r '.mcpServers.Stitch.headers["X-Goog-Api-Key"] // ""' "$MCP_JSON" 2>/dev/null)
else
  CURRENT_KEY=$(sed -n 's/.*"X-Goog-Api-Key"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' "$MCP_JSON" | head -1)
fi

# If key is already set, nothing to do
if [ -n "$CURRENT_KEY" ]; then
  exit 0
fi

# Try to resolve key from stored sources
RESOLVED_KEY=""

# Source 1: STITCH_API_KEY env var
if [ -n "${STITCH_API_KEY:-}" ]; then
  RESOLVED_KEY="$STITCH_API_KEY"
fi

# Source 2: ~/.cellm/stitch-api-key file
if [ -z "$RESOLVED_KEY" ] && [ -f "$STITCH_KEY_FILE" ]; then
  STORED_KEY=$(cat "$STITCH_KEY_FILE" 2>/dev/null | tr -d '[:space:]')
  if [ -n "$STORED_KEY" ]; then
    RESOLVED_KEY="$STORED_KEY"
  fi
fi

# If we found a key, inject it into .mcp.json
if [ -n "$RESOLVED_KEY" ]; then
  if command -v jq >/dev/null 2>&1; then
    TMP=$(mktemp)
    jq --arg key "$RESOLVED_KEY" '.mcpServers.Stitch.headers["X-Goog-Api-Key"] = $key' "$MCP_JSON" > "$TMP" && mv "$TMP" "$MCP_JSON"
  else
    sed -i.bak "s/\"X-Goog-Api-Key\"[[:space:]]*:[[:space:]]*\"\"/\"X-Goog-Api-Key\": \"$RESOLVED_KEY\"/" "$MCP_JSON"
    rm -f "${MCP_JSON}.bak"
  fi
  exit 0
fi

# No key found — emit guidance asking user to provide their API key
cat <<'GUIDE'
{"additionalContext":"[Stitch] API Key not configured. The Stitch MCP server needs an API key to connect.\n\nTo authenticate:\n1. Get your API key at: https://stitch.withgoogle.com/settings?pli=1\n2. Save it: echo 'YOUR_KEY' > ~/.cellm/stitch-api-key\n3. Run /reload-plugins to reconnect\n\nAlternatively, set the env var: export STITCH_API_KEY=your-key\n\nLocal .stitch/ analysis works without auth. Only invoke/consume need it."}
GUIDE

exit 0
