#!/usr/bin/env bash
# CELLM Health Gate — Shared health check with retry for critical hooks
# Source this file, then call: health_gate "critical" or health_gate "non-critical"
# Requires: _get-port.sh and _get-base-url.sh sourced beforehand (or source them here)

# Ensure get_base_url is available
if ! declare -f get_base_url >/dev/null 2>&1; then
  source "$(dirname "${BASH_SOURCE[0]}")/_get-port.sh"
  source "$(dirname "${BASH_SOURCE[0]}")/_get-base-url.sh"
fi

RETRY_DELAYS=(0.5 1 2)  # 3.5s max total

health_gate() {
  local criticality="$1"
  local base_url
  base_url=$(get_base_url)

  # First attempt
  curl -sf --max-time 0.3 "${base_url}/health" >/dev/null 2>&1 && return 0

  # Non-critical: exit silently
  [[ "$criticality" != "critical" ]] && exit 0

  # Critical: retry with progressive delays
  for delay in "${RETRY_DELAYS[@]}"; do
    sleep "$delay"
    curl -sf --max-time 0.5 "${base_url}/health" >/dev/null 2>&1 && return 0
  done

  # All retries exhausted — block the hook
  echo "[CELLM] Worker offline after retries, blocking hook" >&2
  exit 2
}
