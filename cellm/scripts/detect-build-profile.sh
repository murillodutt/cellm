#!/usr/bin/env bash
# CELLM - PostToolUse hook: detect nuxt build commands and ingest perf-report.json
# Pure telemetry — no hookSpecificOutput, fail silently on all errors.
#
# URL resolution: source _get-base-url.sh for BASE_URL
#
# Related files (File Context System):
#  - cellm-plugin/cellm/hooks/hooks.json
#  - cellm-plugin/cellm/scripts/_get-base-url.sh
#  - oracle/server/api/build/ingest.post.ts

CELLM_DIR="${HOME}/.cellm"
# shellcheck disable=SC2034
DEFAULT_PORT=31415

source "$(dirname "${BASH_SOURCE[0]}")/_get-port.sh"
source "$(dirname "${BASH_SOURCE[0]}")/_get-base-url.sh"

# Read stdin (PostToolUse JSON payload)
input=""
[[ ! -t 0 ]] && input=$(head -c 65536)

[[ -z "${input}" ]] && exit 0

# Extract tool_input.command — support both jq and grep fallback
if command -v jq >/dev/null 2>&1; then
  tool_command=$(printf '%s' "${input}" | jq -r '.tool_input.command // empty' 2>/dev/null)
  cwd=$(printf '%s' "${input}" | jq -r '.cwd // empty' 2>/dev/null)
else
  tool_command=$(printf '%s' "${input}" | grep -o '"command"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*"command"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/')
  cwd=$(printf '%s' "${input}" | grep -o '"cwd"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*"cwd"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/')
fi

[[ -z "${tool_command}" ]] && exit 0

# Check if command contains "nuxt build" (case insensitive)
if ! printf '%s' "${tool_command}" | grep -qi 'nuxt[[:space:]]\+build'; then
  exit 0
fi

[[ -z "${cwd}" ]] && exit 0

# Walk up from cwd looking for perf-report.json (max 10 levels, stop at git root)
find_perf_report() {
  local dir="${1}"
  local level=0
  local max_levels=10

  while [[ "${level}" -lt "${max_levels}" ]]; do
    # Primary location: .nuxt/perf-report.json
    if [[ -f "${dir}/.nuxt/perf-report.json" ]]; then
      printf '%s' "${dir}/.nuxt/perf-report.json"
      return 0
    fi

    # Nuxt 4.4+ alternate location
    if [[ -f "${dir}/node_modules/.cache/nuxt/.nuxt/perf-report.json" ]]; then
      printf '%s' "${dir}/node_modules/.cache/nuxt/.nuxt/perf-report.json"
      return 0
    fi

    # Stop at git root
    if [[ -d "${dir}/.git" ]]; then
      break
    fi

    # Move up one level
    local parent
    parent=$(dirname "${dir}")

    # Stop if we've reached the filesystem root
    [[ "${parent}" == "${dir}" ]] && break

    dir="${parent}"
    level=$((level + 1))
  done

  return 1
}

perf_report_path=$(find_perf_report "${cwd}") || exit 0

[[ -z "${perf_report_path}" ]] && exit 0

# Read the perf-report.json content
perf_report_content=$(cat "${perf_report_path}" 2>/dev/null) || exit 0
[[ -z "${perf_report_content}" ]] && exit 0

# Derive project name from basename of directory containing the report
# perf_report_path is e.g. /path/to/project/.nuxt/perf-report.json
#   or /path/to/project/node_modules/.cache/nuxt/.nuxt/perf-report.json
# We want the top-level project dir in both cases.
report_dir=$(dirname "${perf_report_path}")

# Strip trailing /.nuxt or /node_modules/.cache/nuxt/.nuxt suffixes to get project root
project_root="${report_dir}"
# Remove /.nuxt suffix
if [[ "${project_root}" == */.nuxt ]]; then
  project_root="${project_root%/.nuxt}"
fi
# Remove /node_modules/.cache/nuxt/.nuxt suffix
if [[ "${project_root}" == */node_modules/.cache/nuxt/.nuxt ]]; then
  project_root="${project_root%/node_modules/.cache/nuxt/.nuxt}"
fi

project=$(basename "${project_root}")

# Validate we have a usable project name
[[ -z "${project}" ]] && exit 0

# Build request body using jq when available, manual construction otherwise
base_url=$(get_base_url)

if command -v jq >/dev/null 2>&1; then
  body=$(jq -n \
    --argjson profile "${perf_report_content}" \
    --arg project "${project}" \
    '{"profile": $profile, "project": $project}' 2>/dev/null) || exit 0
else
  # [ASCLEPIUS F2] Manual construction — sanitize project name (strip quotes/backslashes)
  safe_project=$(printf '%s' "${project}" | tr -d '"\\\n\r')
  body="{\"profile\": ${perf_report_content}, \"project\": \"${safe_project}\"}"
fi

# POST to Oracle — capture response to extract build_profile_id
ingest_response=$(curl -sf --max-time 5 --connect-timeout 2 \
  -X POST -H "Content-Type: application/json" \
  -d "${body}" \
  "${base_url}/api/build/ingest" 2>/dev/null) || true

# Extract numeric build_profile_id from response (e.g. {"id":"build-123","success":true})
# [ASCLEPIUS M1] Extract build_profile_id with jq or grep fallback — correlation was lost without jq
build_profile_id=""
if [[ -n "${ingest_response}" ]]; then
  if command -v jq >/dev/null 2>&1; then
    raw_id=$(printf '%s' "${ingest_response}" | jq -r '.id // empty' 2>/dev/null)
  else
    raw_id=$(printf '%s' "${ingest_response}" | grep -o '"id"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*"id"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/')
  fi
  # Strip "build-" prefix to get numeric ID
  if [[ -n "${raw_id}" ]]; then
    build_profile_id="${raw_id#build-}"
  fi
fi

# Search for cpuprofile adjacent to the project root
cpuprofile_path=""
if [[ -f "${project_root}/nuxt-build.cpuprofile" ]]; then
  cpuprofile_path="${project_root}/nuxt-build.cpuprofile"
elif [[ -f "${cwd}/nuxt-build.cpuprofile" ]]; then
  cpuprofile_path="${cwd}/nuxt-build.cpuprofile"
fi

# Summarize and ingest cpuprofile if found
if [[ -n "${cpuprofile_path}" ]]; then
  # [ASCLEPIUS M2] Timeout in seconds for cpuprofile summarization (default: 5s)
  # CELLM_CPUPROFILE_TIMEOUT_MS is deprecated — name implies ms but timeout(1) uses seconds.
  # Convert _MS to seconds if set, otherwise use _SECS or default 5.
  if [[ -n "${CELLM_CPUPROFILE_TIMEOUT_SECS:-}" ]]; then
    timeout_secs="${CELLM_CPUPROFILE_TIMEOUT_SECS}"
  elif [[ -n "${CELLM_CPUPROFILE_TIMEOUT_MS:-}" ]]; then
    # Interpret as milliseconds and convert to seconds (min 1s)
    timeout_secs=$(( (CELLM_CPUPROFILE_TIMEOUT_MS + 999) / 1000 ))
    [[ "${timeout_secs}" -lt 1 ]] && timeout_secs=1
  else
    timeout_secs=5
  fi

  # Build args for summarizer
  summarize_args="--input ${cpuprofile_path} --project ${project} --ingest"
  if [[ -n "${build_profile_id}" ]]; then
    summarize_args="${summarize_args} --build-profile-id ${build_profile_id}"
  fi

  # Primary: cellm-oracle CLI
  if command -v cellm-oracle >/dev/null 2>&1; then
    cli_args="analyze ${cpuprofile_path} --json --ingest --project ${project}"
    if [[ -n "${build_profile_id}" ]]; then
      cli_args="${cli_args} --build-profile-id ${build_profile_id}"
    fi
    # shellcheck disable=SC2086
    timeout "${timeout_secs}" cellm-oracle ${cli_args} >/dev/null 2>&1 || true
  # Fallback: bun script
  elif command -v bun >/dev/null 2>&1 && [[ -f "${CELLM_DIR}/oracle/scripts/summarize-cpuprofile.ts" ]]; then
    # shellcheck disable=SC2086
    timeout "${timeout_secs}" bun run "${CELLM_DIR}/oracle/scripts/summarize-cpuprofile.ts" ${summarize_args} >/dev/null 2>&1 || true
  fi
  # Fallback 2: skip silently (only JSON profile was ingested)
fi

exit 0
