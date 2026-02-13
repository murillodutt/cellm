# CELLM Health Gate — Shared health check with retry for critical hooks
# Source this file, then call: health_gate "critical" or health_gate "non-critical"

RETRY_DELAYS=(0.5 1 2)  # 3.5s max total

health_gate() {
  local criticality="$1"
  local port
  port=$(get_port)

  # First attempt
  curl -sf --max-time 0.3 "http://127.0.0.1:${port}/health" >/dev/null 2>&1 && return 0

  # Non-critical: exit silently
  [[ "$criticality" != "critical" ]] && exit 0

  # Critical: retry with progressive delays
  for delay in "${RETRY_DELAYS[@]}"; do
    sleep "$delay"
    curl -sf --max-time 0.5 "http://127.0.0.1:${port}/health" >/dev/null 2>&1 && return 0
  done

  # All retries exhausted — block the hook
  log "Worker offline after retries, blocking hook"
  exit 2
}
