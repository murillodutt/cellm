#!/bin/sh
# Stitch MCP OAuth Launcher
# Uses stitch-mcp's own gcloud SDK to get fresh OAuth access token.
# Sets both STITCH_ACCESS_TOKEN (for API calls) and STITCH_API_KEY (to bypass proxy startup check).

STITCH_GCLOUD="$HOME/.stitch-mcp/google-cloud-sdk/bin/gcloud"
SYSTEM_GCLOUD="/opt/homebrew/share/google-cloud-sdk/bin/gcloud"

if [ -x "$STITCH_GCLOUD" ]; then
  GCLOUD="$STITCH_GCLOUD"
elif [ -x "$SYSTEM_GCLOUD" ]; then
  GCLOUD="$SYSTEM_GCLOUD"
elif command -v gcloud >/dev/null 2>&1; then
  GCLOUD="gcloud"
else
  echo "Error: gcloud not found. Run: npx @_davideast/stitch-mcp init" >&2
  exit 1
fi

TOKEN=$("$GCLOUD" auth print-access-token 2>/dev/null)
if [ -z "$TOKEN" ]; then
  echo "Error: Failed to get access token. Run: npx @_davideast/stitch-mcp init" >&2
  exit 1
fi

export STITCH_ACCESS_TOKEN="$TOKEN"
export STITCH_API_KEY="$TOKEN"
export GOOGLE_CLOUD_PROJECT="${GOOGLE_CLOUD_PROJECT:-gen-lang-client-0434294445}"

# Use global binary if available, fallback to npx with absolute path
if [ -x "$HOME/.nvm/versions/node/v24.12.0/bin/stitch-mcp" ]; then
  exec "$HOME/.nvm/versions/node/v24.12.0/bin/stitch-mcp" proxy
else
  exec "$HOME/.nvm/versions/node/v24.12.0/bin/npx" @_davideast/stitch-mcp proxy
fi
