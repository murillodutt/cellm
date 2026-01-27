#!/usr/bin/env bash
# check-worker-health.sh - Fast Oracle worker health check (2s timeout)
# Part of: CELLM Plugin System
# Purpose: Verify Oracle worker is responsive without blocking session start

set -euo pipefail

# Configuration
readonly WORKER_URL="${CELLM_WORKER_URL:-http://127.0.0.1:31415}"
readonly TIMEOUT=2
readonly LOG_DIR="${CELLM_DATA_DIR:-$HOME/.cellm}/logs"
readonly LOG_FILE="$LOG_DIR/health-check.log"

# Ensure log directory exists
mkdir -p "$LOG_DIR"

# Logging function
log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" >> "$LOG_FILE"
}

# Health check with fast timeout
check_health() {
  if curl -sf --max-time "$TIMEOUT" "${WORKER_URL}/health" >/dev/null 2>&1; then
    log "[+] Worker is healthy"
    return 0
  else
    log "[!] Worker not responding (may be offline)"
    return 1
  fi
}

# Main execution
main() {
  log "[i] Starting health check (${TIMEOUT}s timeout)"

  if check_health; then
    log "[+] Health check PASSED"
    exit 0
  else
    log "[!] Worker offline - run '/cellm-init' to start Oracle"
    # Exit 0 for graceful degradation (don't block Claude Code)
    exit 0
  fi
}

main "$@"
