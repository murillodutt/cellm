#!/bin/sh
# Stitch MCP auto-setup — runs on SessionStart
# Checks if Stitch auth is configured; if not, guides user through setup.
# Fail-silent: always exits 0.

set -e

STITCH_STATE_FILE="${HOME}/.cellm/stitch-auth-state.json"

# Fast path: already configured
if [ -f "$STITCH_STATE_FILE" ]; then
  exit 0
fi

# Check if any auth method is available
HAS_AUTH=false

# Method 1: STITCH_API_KEY env var
if [ -n "${STITCH_API_KEY:-}" ]; then
  HAS_AUTH=true
fi

# Method 2: STITCH_ACCESS_TOKEN env var
if [ -n "${STITCH_ACCESS_TOKEN:-}" ]; then
  HAS_AUTH=true
fi

# Method 3: gcloud ADC (Application Default Credentials)
ADC_FILE="${HOME}/.config/gcloud/application_default_credentials.json"
if [ -f "$ADC_FILE" ]; then
  HAS_AUTH=true
fi

if [ "$HAS_AUTH" = "true" ]; then
  # Auth found — mark as configured
  mkdir -p "$(dirname "$STITCH_STATE_FILE")"
  printf '{"configured":true,"method":"auto-detected","timestamp":"%s"}\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" > "$STITCH_STATE_FILE"
  exit 0
fi

# No auth found — emit guidance (non-blocking)
cat <<'GUIDE'
{"additionalContext":"[Stitch] No authentication configured. The Stitch MCP server needs credentials to generate screens.\n\nQuick setup (pick one):\n1. API Key: export STITCH_API_KEY=your-key\n2. OAuth: npx @_davideast/stitch-mcp init\n3. gcloud: gcloud auth application-default login\n\nLocal .stitch/ analysis works without auth. Only invoke/consume need it."}
GUIDE

exit 0
