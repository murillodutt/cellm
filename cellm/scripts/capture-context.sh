#!/usr/bin/env bash
# CELLM Oracle - Capture Context v2 (Stop/PreCompact hook, async)
# Ends session and triggers AI summary generation.
# Runs with "async": true — non-blocking, errors are non-visible.

set -euo pipefail

CELLM_DIR="${HOME}/.cellm"
LOG_FILE="${CELLM_DIR}/oracle-hook.log"
# shellcheck disable=SC2034  # Used by sourced _get-port.sh
DEFAULT_PORT=31415

log() { echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] [Stop] $1" >> "${LOG_FILE}" 2>/dev/null || true; }

source "$(dirname "${BASH_SOURCE[0]}")/_get-port.sh"
source "$(dirname "${BASH_SOURCE[0]}")/_get-base-url.sh"

input=""
[[ ! -t 0 ]] && input=$(head -c 65536)
[[ -z "${input}" ]] && exit 0

command -v jq &>/dev/null || exit 0

base_url=$(get_base_url)
session_id=$(echo "${input}" | jq -r '.session_id // "unknown"')
stop_reason=$(echo "${input}" | jq -r '.stop_hook_reason // "unknown"')
hook_event=$(echo "${input}" | jq -r '.hook_event_name // empty')
transcript_path=$(echo "${input}" | jq -r '.transcript_path // ""')

# Discriminate Stop vs PreCompact: hook_event_name may not exist in input.
# Fallback: Stop events have stop_hook_active field, PreCompact does not.
if [[ -z "${hook_event}" ]]; then
  has_stop_field=$(echo "${input}" | jq -r 'has("stop_hook_active") // false')
  if [[ "${has_stop_field}" == "true" ]]; then
    hook_event="Stop"
  else
    hook_event="PreCompact"
  fi
fi

[[ "${session_id}" == "unknown" || "${session_id}" == "null" || -z "${session_id}" ]] && exit 0

log "Hook triggered (event: ${hook_event}, session: ${session_id}, reason: ${stop_reason})"

if [[ "${hook_event}" == "PreCompact" ]]; then
  payload=$(jq -n --arg sid "${session_id}" --arg reason "${stop_reason}" \
    '{ sessionId: $sid, reason: $reason }')

  curl -sf --max-time 3 --connect-timeout 0.5 \
    -X POST -H "Content-Type: application/json" \
    -d "${payload}" \
    "${base_url}/api/session/compact" >/dev/null 2>&1 || true

  log "Compaction snapshot sent"
else
  payload=$(jq -n --arg sid "${session_id}" --arg reason "${stop_reason}" \
    '{ sessionId: $sid, stopReason: $reason }')

  curl -sf --max-time 3 --connect-timeout 0.5 \
    -X POST -H "Content-Type: application/json" \
    -d "${payload}" \
    "${base_url}/api/session/stop" >/dev/null 2>&1 || true

  log "Session stop sent (summary queued)"

  # Knowledge extraction from transcript (background, longer timeout)
  if [[ -n "${transcript_path}" && -f "${transcript_path}" ]]; then
    kf_payload=$(jq -n --arg sid "${session_id}" --arg tp "${transcript_path}" \
      '{ sessionId: $sid, transcriptPath: $tp }')

    (curl -sf --max-time 120 --connect-timeout 1 \
      -X POST -H "Content-Type: application/json" \
      -d "${kf_payload}" \
      "${base_url}/api/session/extract-knowledge" >/dev/null 2>&1 || true) &

    log "Knowledge extraction triggered (background)"
  fi
fi
