#!/usr/bin/env bash
# CELLM — Long Session Guard
# Event: UserPromptSubmit
# Behavior: read-only, never blocks. Emits hookSpecificOutput.additionalContext
#           when the active session crosses pre-set risk thresholds.
#
# Empirical basis (24-hang historical analysis, 2026-04-27):
#   - Hangs concentrate in sessions with median 54 Edit/Write events
#     vs 22 in sessions without hangs (ratio 2.5x).
#   - Payload size, system_reminders count, and turn_index do NOT
#     correlate with hang severity inside the hang sample.
#   - Session size + duration is the only consistent risk factor.
#
# Thresholds (warn / strong) below are derived from the historical
# distribution. Strong threshold matches the median of hang sessions.
#
# Related files:
#  - cellm-plugin/cellm/hooks/hooks.json (registration)
#  - cellm-plugin/cellm/skills/tilly/tests/long-session-guard.test.ts
#  - docs/technical/SPEC-FREEZE-DIAGNOSTIC-LOOP.md

# Intentionally NOT using `set -e` / `set -o pipefail`.
# Many of the metric extractions below use grep | head, which closes the
# upstream pipe early and triggers SIGPIPE. With pipefail/-e, the script
# would exit silently mid-flight after capturing first_ts and never reach
# the decision block. Each command guards its own failure with `|| ...`.
set -u
cleanup() { exit 0; }
trap cleanup EXIT

# --- Tunable thresholds (override via env) ---
WARN_EDITS="${CELLM_LSG_WARN_EDITS:-40}"
WARN_DURATION_MIN="${CELLM_LSG_WARN_MIN:-180}"
WARN_BYTES="${CELLM_LSG_WARN_BYTES:-4194304}"        # 4 MiB
WARN_EVENTS="${CELLM_LSG_WARN_EVENTS:-1500}"

STRONG_EDITS="${CELLM_LSG_STRONG_EDITS:-55}"
STRONG_DURATION_MIN="${CELLM_LSG_STRONG_MIN:-240}"

input=""
[[ ! -t 0 ]] && input=$(head -c 65536)
[[ -z "${input}" ]] && exit 0

# Extract session_id without jq dependency (silent-fails if missing).
session_id=$(printf '%s' "${input}" | sed -n 's/.*"session_id"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -1)
[[ -z "${session_id}" || "${session_id}" == "null" ]] && exit 0

# Discover the active JSONL transcript. Slug derives from cwd in stdin or env.
cwd=$(printf '%s' "${input}" | sed -n 's/.*"cwd"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -1)
[[ -z "${cwd}" ]] && cwd="${CLAUDE_PROJECT_DIR:-${PWD}}"
slug=$(printf '%s' "${cwd}" | sed 's/\//-/g')
projects_dir="${HOME}/.claude/projects/${slug}"

[[ -d "${projects_dir}" ]] || exit 0

jsonl="${projects_dir}/${session_id}.jsonl"
[[ -f "${jsonl}" ]] || exit 0

# --- Cheap metrics ---
# stat: try BSD (-f %z) then GNU (-c %s); default 0.
session_bytes=$(stat -f %z "${jsonl}" 2>/dev/null || stat -c %s "${jsonl}" 2>/dev/null || printf '0')
# wc/grep can prefix whitespace; tr -d strips it for arithmetic safety.
session_events=$(wc -l < "${jsonl}" 2>/dev/null | tr -d ' \n' || printf '0')
[[ -z "${session_events}" ]] && session_events=0

edit_count=$(grep -c '"name":"Edit"\|"name":"Write"' "${jsonl}" 2>/dev/null | tr -d ' \n' || printf '0')
[[ -z "${edit_count}" ]] && edit_count=0

# Duration: first vs last timestamp using grep+head/tail (no jq).
first_ts=$(grep -o '"timestamp":"[^"]*"' "${jsonl}" 2>/dev/null | head -1 | sed 's/"timestamp":"\(.*\)"/\1/')
last_ts=$(grep -o '"timestamp":"[^"]*"' "${jsonl}" 2>/dev/null | tail -1 | sed 's/"timestamp":"\(.*\)"/\1/')
duration_min=0
if [[ -n "${first_ts}" && -n "${last_ts}" ]]; then
  first_epoch=$(date -j -f "%Y-%m-%dT%H:%M:%S" "${first_ts:0:19}" +%s 2>/dev/null || date -d "${first_ts}" +%s 2>/dev/null || echo 0)
  last_epoch=$(date -j -f "%Y-%m-%dT%H:%M:%S" "${last_ts:0:19}" +%s 2>/dev/null || date -d "${last_ts}" +%s 2>/dev/null || echo 0)
  if [[ "${first_epoch}" -gt 0 && "${last_epoch}" -gt 0 ]]; then
    duration_min=$(( (last_epoch - first_epoch) / 60 ))
  fi
fi

# --- Decision ---
level="ok"
reasons=()

if [[ "${edit_count}" -ge "${STRONG_EDITS}" ]]; then
  level="strong"; reasons+=("edits=${edit_count}>=${STRONG_EDITS}")
elif [[ "${edit_count}" -ge "${WARN_EDITS}" ]]; then
  level="warn"; reasons+=("edits=${edit_count}")
fi

if [[ "${duration_min}" -ge "${STRONG_DURATION_MIN}" ]]; then
  level="strong"; reasons+=("duration=${duration_min}min>=${STRONG_DURATION_MIN}")
elif [[ "${duration_min}" -ge "${WARN_DURATION_MIN}" && "${level}" == "ok" ]]; then
  level="warn"; reasons+=("duration=${duration_min}min")
fi

if [[ "${session_bytes}" -ge "${WARN_BYTES}" && "${level}" == "ok" ]]; then
  level="warn"; reasons+=("size=$((session_bytes/1024/1024))MiB")
fi

if [[ "${session_events}" -ge "${WARN_EVENTS}" && "${level}" == "ok" ]]; then
  level="warn"; reasons+=("events=${session_events}")
fi

[[ "${level}" == "ok" ]] && exit 0

# Build advisory message — one line, neutral, recommends close-block-and-rotate.
reason_str=$(printf '%s, ' "${reasons[@]}")
reason_str="${reason_str%, }"

if [[ "${level}" == "strong" ]]; then
  msg="[LONG-SESSION-GUARD strong] (${reason_str}). Empirical risk of model freeze rises sharply. Close current block, write handoff, open a fresh session before continuing large edits."
else
  msg="[LONG-SESSION-GUARD warn] (${reason_str}). Approaching freeze risk zone. Consider closing block and rotating session soon."
fi

# Sanitize for JSON embedding (no jq): escape quotes/backslashes, strip control chars.
msg=$(printf '%s' "${msg}" | tr '\n\t\r' '   ' | sed 's/["\\]/\\&/g')

printf '{"hookSpecificOutput":{"hookEventName":"UserPromptSubmit","additionalContext":"%s"}}\n' "${msg}"
