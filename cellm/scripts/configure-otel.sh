#!/usr/bin/env bash
# CELLM Plugin - OTEL Configuration Check
#
# This script verifies OTEL is configured and warns if not.
# Actual configuration is done via /cellm-init (modifies settings.json)
#
# Note: CLAUDE_ENV_FILE only persists variables for Bash commands,
# NOT for Claude Code's internal telemetry which reads from the
# parent process environment at startup.

set -euo pipefail

# Error handling: log to file, never write stderr (causes "hook error" in Claude Code)
cleanup() {
  local exit_code=$?
  if [[ $exit_code -ne 0 ]]; then
    echo "[$(date -Iseconds)] configure-otel.sh failed with exit code $exit_code" >> "${HOME}/.cellm/otel-config.log" 2>/dev/null || true
  fi
  exit 0
}
trap cleanup EXIT

LOG_FILE="${HOME}/.cellm/otel-config.log"
mkdir -p "$(dirname "$LOG_FILE")"

log() {
  echo "[$(date -Iseconds)] $*" >> "$LOG_FILE"
}

log "configure-otel.sh called"

# Check if OTEL is configured in the environment
if [ -z "${OTEL_EXPORTER_OTLP_ENDPOINT:-}" ]; then
  log "OTEL not configured in environment"
  log "OTEL not configured — user should run /cellm-init option 7 > 6"
else
  log "OTEL configured: $OTEL_EXPORTER_OTLP_ENDPOINT"
fi

exit 0
