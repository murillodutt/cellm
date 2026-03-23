#!/bin/sh
# Resolve STITCH_API_KEY from multiple sources and output as JSON env block.
# Priority: 1. Existing env var  2. ~/.cellm/stitch-api-key file  3. Empty (graceful)
# Used by .mcp.json env resolution or as standalone check.

STITCH_KEY_FILE="${HOME}/.cellm/stitch-api-key"

# Priority 1: env var already set
if [ -n "${STITCH_API_KEY:-}" ]; then
  printf '%s' "$STITCH_API_KEY"
  exit 0
fi

# Priority 2: persistent key file
if [ -f "$STITCH_KEY_FILE" ]; then
  KEY=$(cat "$STITCH_KEY_FILE" 2>/dev/null | tr -d '[:space:]')
  if [ -n "$KEY" ]; then
    printf '%s' "$KEY"
    exit 0
  fi
fi

# Priority 3: no key found — empty output
exit 0
