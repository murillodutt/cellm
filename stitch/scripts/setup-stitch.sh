#!/bin/sh
# Stitch MCP auto-setup — runs on SessionStart
# Checks if Stitch MCP is already registered via `claude mcp list`.
# If not, resolves API key from stored sources and registers via `claude mcp add`.
# If no key found, emits guidance with link to obtain one.
# Fail-silent: always exits 0.

STITCH_KEY_FILE="${HOME}/.cellm/stitch-api-key"
MCP_NAME="stitch"
STITCH_URL="https://stitch.googleapis.com/mcp"

# Check if already registered
if claude mcp list 2>/dev/null | grep -qi "$MCP_NAME"; then
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

# If we found a key, register the MCP server
if [ -n "$RESOLVED_KEY" ]; then
  claude mcp add "$MCP_NAME" \
    --transport http "$STITCH_URL" \
    --header "X-Goog-Api-Key: $RESOLVED_KEY" \
    -s user 2>/dev/null
  exit 0
fi

# No key found — emit guidance
cat <<'GUIDE'
{"additionalContext":"[Stitch] API Key not configured. The Stitch MCP server needs an API key to connect.\n\nTo authenticate:\n1. Get your API key at: https://stitch.withgoogle.com/settings?pli=1\n2. Register manually:\n   claude mcp add stitch --transport http https://stitch.googleapis.com/mcp --header \"X-Goog-Api-Key: YOUR_KEY\" -s user\n3. Or save for auto-setup: echo 'YOUR_KEY' > ~/.cellm/stitch-api-key\n\nLocal .stitch/ analysis works without auth. Only invoke/consume need it."}
GUIDE

exit 0
