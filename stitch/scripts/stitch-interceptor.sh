#!/usr/bin/env bash
# Stitch - Design Intent Interceptor — Pure bash, zero spawns, POSIX-compatible
#
# Dual gate: .stitch/ directory exists AND prompt matches design keywords.
# Injects Stitch pipeline guidance when both gates pass.
# Event: UserPromptSubmit
# Behavior: Non-blocking, fail-silent (always exit 0)
#
# No set -e: stdin/json edge cases must not fail the hook.

INPUT=$(cat || true)

# Extract prompt from JSON using sed (macOS compatible)
PROMPT=$(echo "$INPUT" | sed -n 's/.*"prompt"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -1)
[ -z "$PROMPT" ] && exit 0

# Gate 1: .stitch/ directory must exist at git root
GIT_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || true)
[ -z "$GIT_ROOT" ] && exit 0
[ -d "$GIT_ROOT/.stitch" ] || exit 0

# Gate 2: prompt must match design-related keywords
echo "$PROMPT" | grep -qiE '(stitch|design|DESIGN\.md|visual|screen|canvas|vibe|mockup|wireframe|layout|prototype|figma|palette|typography|color scheme|brand|aesthetic)' || exit 0

MSG="[Stitch] Design artifacts detected in .stitch/. Use the stitch-bridge pipeline: 1. Run stitch-analyst to parse DESIGN.md, HTML screens, and SITE.md into structured design tokens. 2. Ingest into DSE via stitch-ingest for project-wide token alignment. 3. Use stitch-prompt to compose enhancement prompts if refinement needed. Available artifacts: $(ls "$GIT_ROOT/.stitch/" 2>/dev/null | tr '\n' ', ' | sed 's/,$//')."

# Wrap in hook JSON envelope
if command -v jq >/dev/null 2>&1; then
  printf '%s' "$MSG" | jq -Rc '{additionalContext:.}'
else
  escaped=$(printf '%s' "$MSG" | sed 's/\\/\\\\/g; s/"/\\"/g')
  printf '{"additionalContext":"%s"}\n' "$escaped"
fi
