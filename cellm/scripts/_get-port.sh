#!/usr/bin/env bash
# CELLM — Shared port extraction from worker.json
# Source this file, then call: get_port
#
# Returns Oracle worker port with proper validation.
# Supports jq (preferred) with grep fallback.

get_port() {
  local worker_json="${CELLM_DIR:-$HOME/.cellm}/worker.json"
  local default_port="${DEFAULT_PORT:-31415}"

  if [[ -f "${worker_json}" ]]; then
    local port=""
    if command -v jq >/dev/null 2>&1; then
      port=$(jq -r '.port // empty' "${worker_json}" 2>/dev/null || echo "")
    else
      port=$(grep -o '"port"[[:space:]]*:[[:space:]]*[0-9]*' "${worker_json}" 2>/dev/null | grep -o '[0-9]*' || echo "")
    fi
    if [[ -n "${port}" ]] && [[ "${port}" =~ ^[0-9]+$ ]] && [[ "${port}" -ge 1 ]] && [[ "${port}" -le 65535 ]]; then
      echo "${port}"
      return
    fi
  fi
  echo "${default_port}"
}
