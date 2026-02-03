#!/bin/bash
# CELLM Oracle MCP Launcher
#
# Priority order:
# 1. CELLM_DEV_ORACLE_PATH from ~/.cellm/cellm.json (development)
# 2. Global npm package @cellm-ai/oracle (production)
# 3. Plugin-relative path (monorepo development)

CELLM_CONFIG="$HOME/.cellm/cellm.json"
MCP_SERVER_PATH=""

# 1. Check for dev path in cellm.json
if [[ -f "$CELLM_CONFIG" ]]; then
  DEV_PATH=$(jq -r '.CELLM_DEV_ORACLE_PATH // empty' "$CELLM_CONFIG" 2>/dev/null)
  if [[ -n "$DEV_PATH" && -f "$DEV_PATH/scripts/mcp-server.ts" ]]; then
    MCP_SERVER_PATH="$DEV_PATH/scripts/mcp-server.ts"
  fi
fi

# 2. Check for global npm package
if [[ -z "$MCP_SERVER_PATH" ]]; then
  # Try to find @cellm-ai/oracle in global node_modules
  NPM_GLOBAL_PATH=$(npm root -g 2>/dev/null)
  if [[ -n "$NPM_GLOBAL_PATH" && -f "$NPM_GLOBAL_PATH/@cellm-ai/oracle/scripts/mcp-server.js" ]]; then
    MCP_SERVER_PATH="$NPM_GLOBAL_PATH/@cellm-ai/oracle/scripts/mcp-server.js"
  fi
fi

# 3. Fallback to plugin-relative path (monorepo)
if [[ -z "$MCP_SERVER_PATH" ]]; then
  # CELLM_PLUGIN_ROOT is set by Claude Code when running plugin scripts
  MONOREPO_PATH="${CELLM_PLUGIN_ROOT:-}/../../oracle/scripts/mcp-server.ts"
  if [[ -f "$MONOREPO_PATH" ]]; then
    MCP_SERVER_PATH="$MONOREPO_PATH"
  fi
fi

# Error if no path found
if [[ -z "$MCP_SERVER_PATH" ]]; then
  echo "Error: Could not find CELLM Oracle MCP server." >&2
  echo "Install with: npm install -g @cellm-ai/oracle" >&2
  echo "Or set CELLM_DEV_ORACLE_PATH in ~/.cellm/cellm.json" >&2
  exit 1
fi

# Run the MCP server
exec bun run "$MCP_SERVER_PATH"
