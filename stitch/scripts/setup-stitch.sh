#!/bin/sh
# Stitch MCP auto-setup — runs on SessionStart
# Checks if Stitch auth is configured; if not, guides user through setup.
# Also exports STITCH_API_KEY from ~/.cellm/ if stored there.
# Fail-silent: always exits 0.

STITCH_STATE_FILE="${HOME}/.cellm/stitch-auth-state.json"
STITCH_KEY_FILE="${HOME}/.cellm/stitch-api-key"

# Fast path: already configured
if [ -f "$STITCH_STATE_FILE" ]; then
  exit 0
fi

# Check if any auth method is available
HAS_AUTH=false
AUTH_METHOD=""

# Method 1: STITCH_API_KEY env var
if [ -n "${STITCH_API_KEY:-}" ]; then
  HAS_AUTH=true
  AUTH_METHOD="env:STITCH_API_KEY"
fi

# Method 2: Key file at ~/.cellm/stitch-api-key
if [ "$HAS_AUTH" = "false" ] && [ -f "$STITCH_KEY_FILE" ]; then
  STORED_KEY=$(cat "$STITCH_KEY_FILE" 2>/dev/null | tr -d '[:space:]')
  if [ -n "$STORED_KEY" ]; then
    HAS_AUTH=true
    AUTH_METHOD="file:~/.cellm/stitch-api-key"
  fi
fi

# Method 3: STITCH_ACCESS_TOKEN env var
if [ "$HAS_AUTH" = "false" ] && [ -n "${STITCH_ACCESS_TOKEN:-}" ]; then
  HAS_AUTH=true
  AUTH_METHOD="env:STITCH_ACCESS_TOKEN"
fi

# Method 4: gcloud ADC (Application Default Credentials)
ADC_FILE="${HOME}/.config/gcloud/application_default_credentials.json"
if [ "$HAS_AUTH" = "false" ] && [ -f "$ADC_FILE" ]; then
  HAS_AUTH=true
  AUTH_METHOD="gcloud:ADC"
fi

if [ "$HAS_AUTH" = "true" ]; then
  # Auth found — mark as configured
  mkdir -p "$(dirname "$STITCH_STATE_FILE")"
  printf '{"configured":true,"method":"%s","timestamp":"%s"}\n' "$AUTH_METHOD" "$(date -u +%Y-%m-%dT%H:%M:%SZ)" > "$STITCH_STATE_FILE"
  exit 0
fi

# No auth found — emit guidance (non-blocking)
cat <<'GUIDE'
{"additionalContext":"[Stitch] No authentication configured. The Stitch MCP server needs credentials to generate screens.\n\nQuick setup (pick one):\n1. Persistent key: echo 'your-key' > ~/.cellm/stitch-api-key\n2. Env var: export STITCH_API_KEY=your-key\n3. OAuth wizard: ! npx @_davideast/stitch-mcp init\n4. gcloud ADC: ! gcloud auth application-default login\n\nAfter setup, run /reload-plugins to reconnect.\nLocal .stitch/ analysis works without auth. Only invoke/consume need it."}
GUIDE

exit 0
