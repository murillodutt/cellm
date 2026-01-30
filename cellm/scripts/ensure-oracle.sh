#!/usr/bin/env bash
# ensure-oracle.sh - Idempotent Oracle worker startup
# Part of: CELLM Plugin System
# Purpose: Ensure Oracle is running before any hook executes
#
# Design: Following claude-mem pattern - called as FIRST command in every hook
# Behavior:
#   - If Oracle is healthy: exits immediately (~50ms)
#   - If Oracle is down: spawns daemon and waits for health (~3-5s)
#   - Always exits 0 to not block Claude Code

set -euo pipefail

# Error handling and cleanup
cleanup() {
  local exit_code=$?
  # Silent cleanup - never output errors to not pollute Claude Code
  exit 0
}
trap cleanup EXIT

# Configuration
readonly WORKER_URL="${CELLM_WORKER_URL:-http://127.0.0.1:31415}"
readonly CELLM_DIR="${CELLM_DATA_DIR:-$HOME/.cellm}"
readonly LOG_FILE="${CELLM_DIR}/logs/ensure-oracle.log"
readonly HEALTH_TIMEOUT=2
readonly STARTUP_WAIT_MAX=20  # 20 * 0.5s = 10s max wait

# Ensure directories exist
mkdir -p "${CELLM_DIR}/logs"

# Simple logging
log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" >> "$LOG_FILE" 2>/dev/null || true
}

# Fast health check
is_healthy() {
  curl -sf --max-time "$HEALTH_TIMEOUT" "${WORKER_URL}/health" >/dev/null 2>&1
}

# Spawn Oracle daemon
spawn_oracle() {
  log "[~] Spawning Oracle daemon..."

  # Primary method: bun x @cellm-ai/oracle
  if command -v bun >/dev/null 2>&1; then
    nohup bun x @cellm-ai/oracle serve >> "${CELLM_DIR}/logs/oracle-worker.log" 2>&1 &
    disown 2>/dev/null || true
    return 0
  fi

  log "[-] bun not found, cannot spawn Oracle"
  return 1
}

# Wait for Oracle to become healthy
wait_for_health() {
  local i
  for i in $(seq 1 "$STARTUP_WAIT_MAX"); do
    if is_healthy; then
      log "[+] Oracle healthy after ${i} checks"
      return 0
    fi
    sleep 0.5
  done

  log "[!] Oracle failed to start within timeout"
  return 1
}

# Main execution
main() {
  # Fast path: already healthy
  if is_healthy; then
    exit 0
  fi

  log "[!] Oracle not responding, attempting recovery..."

  # Spawn and wait
  if spawn_oracle; then
    wait_for_health
  fi

  # Always exit 0 - never block Claude Code
  exit 0
}

main "$@"
