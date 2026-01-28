#!/bin/bash
# CELLM Plugin - Configure OTEL Environment
#
# This script configures OpenTelemetry environment variables using
# CLAUDE_ENV_FILE (available only in SessionStart hooks).
#
# Variables configured:
# - CLAUDE_CODE_ENABLE_TELEMETRY: Enable Claude Code telemetry
# - OTEL_METRICS_EXPORTER: Use OTLP for metrics
# - OTEL_LOGS_EXPORTER: Use OTLP for logs
# - OTEL_EXPORTER_OTLP_PROTOCOL: HTTP/JSON protocol (worker only supports JSON)
# - OTEL_EXPORTER_OTLP_ENDPOINT: CELLM Worker endpoint

set -euo pipefail

# Error handling
cleanup() {
  local exit_code=$?
  if [[ $exit_code -ne 0 ]]; then
    echo "[!] OTEL configuration failed with exit code $exit_code" >&2
  fi
}

trap cleanup EXIT

WORKER_PORT="${CELLM_PORT:-31415}"

# Only configure if CLAUDE_ENV_FILE is available (SessionStart only)
if [ -n "${CLAUDE_ENV_FILE:-}" ]; then
  cat >> "$CLAUDE_ENV_FILE" <<EOF
export CLAUDE_CODE_ENABLE_TELEMETRY=1
export OTEL_METRICS_EXPORTER=otlp
export OTEL_LOGS_EXPORTER=otlp
export OTEL_EXPORTER_OTLP_PROTOCOL=http/json
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:${WORKER_PORT}
EOF
fi

exit 0
