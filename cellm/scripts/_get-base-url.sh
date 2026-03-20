#!/usr/bin/env bash
# CELLM — Shared base URL resolution for Oracle worker
# Source this file, then call: get_base_url
#
# Resolution order:
#   1. CELLM_WORKER_URL env var (set in .mcp.json or by user)
#   2. Port from worker.json via _get-port.sh
#   3. Default: http://127.0.0.1:31415
#
# Related files (File Context System):
#  - cellm-plugin/cellm/scripts/_get-port.sh
#  - cellm-plugin/cellm/.mcp.json

get_base_url() {
  if [[ -n "${CELLM_WORKER_URL:-}" ]]; then
    echo "${CELLM_WORKER_URL}"
    return
  fi
  local port
  port=$(get_port)
  echo "http://127.0.0.1:${port}"
}
