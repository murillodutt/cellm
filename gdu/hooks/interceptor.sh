#!/usr/bin/env bash
# GDU - Frontend Intent Interceptor v2 — Pure bash, zero spawns, POSIX-compatible
#
# Detects frontend work intent (subject + action verb) and injects GDU framework.
# Event: UserPromptSubmit
# Behavior: Non-blocking, injects context via stdout
#
# No set -e: stdin/json edge cases must not fail the hook (UserPromptSubmit hook error).

INPUT=$(cat || true)

# Extract prompt from JSON using sed (macOS compatible)
PROMPT=$(echo "$INPUT" | sed -n 's/.*"prompt"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -1)
[ -z "$PROMPT" ] && exit 0

# Needs BOTH a subject keyword AND an action verb
echo "$PROMPT" | grep -qiE '(interface|dashboard|tela|page|pagina|component|componente|layout|ui|frontend|visual|botao|button|estilo|style|tailwind|vue|nuxt|form|formulario|modal|sidebar|navbar|header|footer|card|table|tabela|menu|dialog|toast|dropdown)' || exit 0
echo "$PROMPT" | grep -qiE '(cria|crie|fac|faz|constr|desenh|mont|implement|ajust|refator|build|create|make|design|add|update|fix|refactor|style)' || exit 0

MSG="[GDU] Frontend intent detected. Engage the Goold Design UI (GDU) Framework before writing code. Process: 1. Contextual Anchoring (verify Tailwind config, DSE tokens, Nuxt structure). 2. Architectural Deconstruction (Atomic Design: atoms/molecules/organisms). 3. Propose a Markdown Spec to the user. 4. Implement only after approval. Consult Nuxt UI MCP Server (nuxt-ui-remote) for component APIs."
# Wrap in hook JSON envelope — plain text stdout causes "UserPromptSubmit hook error"
escaped=$(printf '%s' "$MSG" | sed 's/\\/\\\\/g; s/"/\\"/g')
printf '{"additionalContext":"%s"}\n' "$escaped"
