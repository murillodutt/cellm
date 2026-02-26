#!/usr/bin/env bash
# CELLM - Version Guard (PreToolUse hook)
# Detects when the LLM is about to write dependency versions or run install
# commands, and injects a warning to verify versions before proceeding.
#
# This hook is INDEPENDENT of Oracle Worker — it runs purely on local
# pattern matching against tool_input. No network calls, no health gate.
#
# Event: PreToolUse (Write|Edit|Bash)
# Behavior: Non-blocking (permissionDecision: allow), injects additionalContext
# Timeout: 2s (completes in <100ms — no I/O, just jq + grep)

set -euo pipefail

# Configuration
CELLM_DIR="${HOME}/.cellm"
LOG_FILE="${CELLM_DIR}/oracle-hook.log"

# Error handling: log to file, never write stderr (causes "hook error" in Claude Code)
cleanup() {
  local exit_code=$?
  if [[ $exit_code -ne 0 ]]; then
    echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] [VersionGuard] Script failed with exit code $exit_code" >> "${HOME}/.cellm/oracle-hook.log" 2>/dev/null || true
  fi
  exit 0
}
trap cleanup EXIT

log() {
  echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] [VersionGuard] $1" >> "${LOG_FILE}" 2>/dev/null || true
}

# Require jq (consistent with check-node-tags.sh)
if ! command -v jq &> /dev/null; then
  log "jq not found, skipping"
  exit 0
fi

# Allow response — WITH context injection
allow_with_context() {
  local context="$1"
  jq -n \
    --arg event "PreToolUse" \
    --arg decision "allow" \
    --arg context "$context" \
    '{
      hookSpecificOutput: {
        hookEventName: $event,
        permissionDecision: $decision,
        additionalContext: $context
      }
    }'
  exit 0
}

main() {
  # Read JSON from stdin
  local input=""
  if [[ ! -t 0 ]]; then
    input=$(head -c 65536)
  fi

  if [[ -z "${input}" ]]; then
    exit 0
  fi

  # Extract tool name
  local tool_name
  tool_name=$(echo "${input}" | jq -r '.tool_name // ""')

  case "${tool_name}" in
    Write)
      # Extract file_path and content in one jq call
      local file_path content
      read -r file_path <<< "$(echo "${input}" | jq -r '.tool_input.file_path // ""')"
      content=$(echo "${input}" | jq -r '.tool_input.content // ""')

      case "${file_path}" in
        *package.json|*package.json5)
          log "TRIGGERED: Writing ${file_path}"
          allow_with_context "[VERSION-GUARD] You are writing a package.json. STOP: verify EVERY version number against a current source (context7 MCP, nuxt-remote MCP, WebSearch). Your training data versions are WRONG — major frameworks have shipped new major versions since your training cutoff."
          ;;
        *Dockerfile*|*docker-compose*|*.github/workflows/*|*.gitlab-ci*)
          if echo "${content}" | grep -qiE 'node:[0-9]|bun:[0-9]|FROM\s+node|FROM\s+bun|setup-node@|setup-bun@|image:.*[0-9]+\.[0-9]+'; then
            log "TRIGGERED: Infra config with pinned versions: ${file_path}"
            allow_with_context "[VERSION-GUARD] Infrastructure config with pinned versions detected. WebSearch for current stable versions of all runtimes/tools before writing."
          fi
          ;;
      esac
      ;;

    Edit)
      local file_path new_string
      read -r file_path <<< "$(echo "${input}" | jq -r '.tool_input.file_path // ""')"
      new_string=$(echo "${input}" | jq -r '.tool_input.new_string // ""')

      case "${file_path}" in
        *package.json*)
          if echo "${new_string}" | grep -qE '"[^"]+"\s*:\s*"[\^~]?[0-9]+\.[0-9]+'; then
            log "TRIGGERED: Editing versions in ${file_path}"
            allow_with_context "[VERSION-GUARD] You are editing dependency versions in package.json. Verify each version against a current source. Your training data is outdated."
          fi
          ;;
      esac
      ;;

    Bash)
      local command
      command=$(echo "${input}" | jq -r '.tool_input.command // ""')

      # Match install commands anywhere in the string (handles && chaining)
      if echo "${command}" | grep -qiE '(^|\s|&&|;|\()\s*(npm\s+install|npm\s+i(\s|$)|bun\s+add|bun\s+install|bun\s+init|bun\s+create|yarn\s+add|pnpm\s+add|pnpm\s+install|npx\s+create-|bunx\s+create-|nuxi\s+init|npm\s+init)'; then
        log "TRIGGERED: Install command: ${command}"
        allow_with_context "[VERSION-GUARD] Package install command detected. If you specified version numbers, verify them. If using create-*/init, verify the tool generates current framework versions. Major frameworks have shipped new major versions since your training cutoff."
      fi
      ;;
  esac

  # Default: allow silently (no output = implicit allow)
  exit 0
}

main "$@"
