#!/usr/bin/env bash
# CELLM - Version Guard v2 — Pure bash, zero spawns, POSIX-compatible
# Detects when the LLM writes dependency versions or runs install commands.
#
# Event: PreToolUse (Write|Edit|Bash)
# Behavior: Non-blocking (permissionDecision: allow), injects additionalContext

set -euo pipefail

cleanup() { exit 0; }
trap cleanup EXIT

input=""
[[ ! -t 0 ]] && input=$(head -c 65536)
[[ -z "${input}" ]] && exit 0

# Extract tool_name from JSON using sed (macOS compatible)
tool_name=$(echo "${input}" | sed -n 's/.*"tool_name"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -1)
[[ -z "${tool_name}" ]] && exit 0

allow_ctx() {
  printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"allow","additionalContext":"%s"}}\n' "$1"
  exit 0
}

case "${tool_name}" in
  Write)
    file_path=$(echo "${input}" | sed -n 's/.*"file_path"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -1)
    case "${file_path}" in
      *package.json|*package.json5)
        allow_ctx "[VERSION-GUARD] You are writing a package.json. STOP: verify EVERY version number against a current source (context7 MCP, nuxt-remote MCP, WebSearch). Your training data versions are WRONG."
        ;;
      *Dockerfile*|*docker-compose*|*.github/workflows/*|*.gitlab-ci*)
        echo "${input}" | grep -qiE 'node:[0-9]|bun:[0-9]|FROM node|FROM bun|setup-node@|setup-bun@' && \
          allow_ctx "[VERSION-GUARD] Infrastructure config with pinned versions detected. WebSearch for current stable versions before writing."
        ;;
    esac
    ;;
  Edit)
    file_path=$(echo "${input}" | sed -n 's/.*"file_path"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -1)
    case "${file_path}" in
      *package.json*)
        echo "${input}" | grep -qE '"[^"]+"\s*:\s*"[\^~]?[0-9]+\.[0-9]+' && \
          allow_ctx "[VERSION-GUARD] You are editing dependency versions in package.json. Verify each version against a current source. Your training data is outdated."
        ;;
    esac
    ;;
  Bash)
    echo "${input}" | grep -qiE '(npm install|npm i |bun add|bun install|bun init|bun create|yarn add|pnpm add|pnpm install|npx create-|bunx create-|nuxi init|npm init)' && \
      allow_ctx "[VERSION-GUARD] Package install command detected. If you specified version numbers, verify them against current releases."
    ;;
esac

exit 0
