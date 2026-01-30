#!/usr/bin/env bash
# init-oracle.sh - Interactive Oracle worker installation/management
# Part of: CELLM Plugin System
# Purpose: User-friendly Oracle setup with menus and guided troubleshooting

set -euo pipefail

# Configuration
readonly WORKER_URL="${CELLM_WORKER_URL:-http://127.0.0.1:31415}"
readonly DATA_DIR="${CELLM_DATA_DIR:-$HOME/.cellm}"
readonly LOG_DIR="$DATA_DIR/logs"
readonly LOG_FILE="$LOG_DIR/init-oracle.log"
readonly MARKER_FILE="$DATA_DIR/installed"
readonly PACKAGE_NAME="@cellm-ai/oracle"

# Colors for terminal output
readonly GREEN='\033[0;32m'
readonly RED='\033[0;31m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly CYAN='\033[0;36m'
readonly BOLD='\033[1m'
readonly NC='\033[0m' # No Color

# Mode detection (empty = interactive menu)
MODE="${1:-}"

# Ensure directories exist
mkdir -p "$DATA_DIR" "$LOG_DIR"

# Logging function
log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" >> "$LOG_FILE"
}

# Print functions with colors
print_header() {
  echo ""
  echo -e "${CYAN}${BOLD}╔══════════════════════════════════════════════════════════╗${NC}"
  echo -e "${CYAN}${BOLD}║${NC}  ${BOLD}$*${NC}"
  echo -e "${CYAN}${BOLD}╚══════════════════════════════════════════════════════════╝${NC}"
  echo ""
  log "=== $* ==="
}

print_step() {
  echo -e "${BLUE}$*${NC}"
  log "$*"
}

print_success() {
  echo -e "${GREEN}  [+] $*${NC}"
  log "[+] $*"
}

print_error() {
  echo -e "${RED}  [-] $*${NC}"
  log "[-] $*"
}

print_warning() {
  echo -e "${YELLOW}  [!] $*${NC}"
  log "[!] $*"
}

print_info() {
  echo -e "  [i] $*"
  log "[i] $*"
}

print_progress() {
  echo -e "${YELLOW}  [~] $*${NC}"
  log "[~] $*"
}

# Ask yes/no question
ask_yes_no() {
  local question="$1"
  local default="${2:-y}"

  if [ "$default" = "y" ]; then
    local prompt="[Y/n]"
  else
    local prompt="[y/N]"
  fi

  echo -ne "${CYAN}${question} ${prompt}:${NC} "
  read -r response

  response="${response:-$default}"
  case "$response" in
    [Yy]|[Yy][Ee][Ss]) return 0 ;;
    *) return 1 ;;
  esac
}

# Interactive menu
show_menu() {
  clear
  print_header "CELLM Oracle Setup"

  echo -e "${BOLD}What would you like to do?${NC}"
  echo ""
  echo "  1. Install Oracle (first time setup)"
  echo "  2. Check Status (view current state)"
  echo "  3. Update (upgrade to latest version)"
  echo "  4. Doctor (diagnose and fix issues)"
  echo "  5. Restart Worker (if stuck or slow)"
  echo "  6. Uninstall (remove Oracle completely)"
  echo "  7. Advanced Options"
  echo "  8. Exit"
  echo ""
  echo -ne "${CYAN}Choose option [1-8]:${NC} "
  read -r choice

  case "$choice" in
    1) MODE="install" ;;
    2) MODE="status" ;;
    3) MODE="update" ;;
    4) MODE="doctor" ;;
    5) MODE="restart" ;;
    6) MODE="uninstall" ;;
    7) show_advanced_menu ;;
    8) echo "Goodbye!"; exit 0 ;;
    *) print_error "Invalid option"; sleep 2; show_menu ;;
  esac
}

# Advanced options menu
show_advanced_menu() {
  clear
  print_header "CELLM Oracle - Advanced Options"

  echo -e "${BOLD}Advanced Configuration:${NC}"
  echo ""
  echo "  1. Change Worker Port (current: 31415)"
  echo "  2. Change Data Directory (current: ~/.cellm)"
  echo "  3. View Logs"
  echo "  4. Clear Cache"
  echo "  5. Reset Configuration"
  echo "  6. Configure OTEL Telemetry"
  echo "  7. Back to Main Menu"
  echo ""
  echo -ne "${CYAN}Choose option [1-7]:${NC} "
  read -r choice

  case "$choice" in
    1) configure_port ;;
    2) configure_data_dir ;;
    3) view_logs ;;
    4) clear_cache ;;
    5) reset_configuration ;;
    6) configure_otel_advanced ;;
    7) show_menu ;;
    *) print_error "Invalid option"; sleep 2; show_advanced_menu ;;
  esac
}

# Configure custom port
configure_port() {
  echo ""
  print_info "Current port: 31415"
  echo -ne "${CYAN}Enter new port (or press Enter to keep current):${NC} "
  read -r new_port

  if [ -n "$new_port" ]; then
    if [[ "$new_port" =~ ^[0-9]+$ ]] && [ "$new_port" -ge 1024 ] && [ "$new_port" -le 65535 ]; then
      export CELLM_WORKER_URL="http://127.0.0.1:$new_port"
      print_success "Port changed to $new_port (restart worker to apply)"
      echo "$new_port" > "$DATA_DIR/custom_port"
    else
      print_error "Invalid port number (must be 1024-65535)"
    fi
  fi

  echo ""
  ask_yes_no "Continue with other options?" && show_advanced_menu
}

# Configure data directory
configure_data_dir() {
  echo ""
  print_info "Current directory: $DATA_DIR"
  print_warning "Changing data directory will require moving existing data"
  echo ""

  if ask_yes_no "Continue?"; then
    echo -ne "${CYAN}Enter new directory path:${NC} "
    read -r new_dir

    if [ -n "$new_dir" ]; then
      new_dir="${new_dir/#\~/$HOME}"
      if mkdir -p "$new_dir" 2>/dev/null; then
        print_success "Directory created: $new_dir"
        print_info "Restart Oracle to use new directory"
      else
        print_error "Failed to create directory"
      fi
    fi
  fi

  echo ""
  ask_yes_no "Continue with other options?" && show_advanced_menu
}

# View logs
view_logs() {
  echo ""
  print_step "Recent logs (last 50 lines):"
  echo ""

  if [ -f "$LOG_FILE" ]; then
    tail -50 "$LOG_FILE"
  else
    print_info "No logs found"
  fi

  echo ""
  echo -ne "${CYAN}Press Enter to continue...${NC}"
  read -r
  show_advanced_menu
}

# Clear cache
clear_cache() {
  echo ""
  print_warning "This will clear all cached data"

  if ask_yes_no "Continue?" "n"; then
    local cache_dir="$DATA_DIR/cache"
    if [ -d "$cache_dir" ]; then
      rm -rf "$cache_dir"/*
      print_success "Cache cleared"
    else
      print_info "No cache found"
    fi
  fi

  echo ""
  ask_yes_no "Continue with other options?" && show_advanced_menu
}

# Reset configuration
reset_configuration() {
  echo ""
  print_warning "This will reset all Oracle settings to defaults"
  print_warning "Database and observations will NOT be deleted"

  if ask_yes_no "Continue?" "n"; then
    rm -f "$DATA_DIR/custom_port"
    rm -f "$DATA_DIR/config.json"
    print_success "Configuration reset"
  fi

  echo ""
  ask_yes_no "Continue with other options?" && show_advanced_menu
}

# Install jq if not present
install_jq() {
  if [[ "$OSTYPE" == "darwin"* ]]; then
    if command -v brew >/dev/null 2>&1; then
      print_progress "Installing jq via Homebrew..."
      if brew install jq >/dev/null 2>&1; then
        print_success "jq installed successfully"
        return 0
      else
        print_error "Failed to install jq via Homebrew"
        return 1
      fi
    else
      print_error "Homebrew not found"
      print_info "Install Homebrew: /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
      return 1
    fi
  elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    if command -v apt-get >/dev/null 2>&1; then
      print_progress "Installing jq via apt..."
      if sudo apt-get install -y jq >/dev/null 2>&1; then
        print_success "jq installed successfully"
        return 0
      else
        print_error "Failed to install jq via apt"
        return 1
      fi
    elif command -v yum >/dev/null 2>&1; then
      print_progress "Installing jq via yum..."
      if sudo yum install -y jq >/dev/null 2>&1; then
        print_success "jq installed successfully"
        return 0
      else
        print_error "Failed to install jq via yum"
        return 1
      fi
    else
      print_error "No supported package manager found (apt/yum)"
      return 1
    fi
  else
    print_error "Unsupported OS: $OSTYPE"
    print_info "Install jq manually: https://jqlang.github.io/jq/download/"
    return 1
  fi
}

# Check jq and offer to install if missing
ensure_jq() {
  if command -v jq >/dev/null 2>&1; then
    return 0
  fi

  print_warning "jq not found (required for OTEL configuration)"
  echo ""
  if ask_yes_no "Install jq now?"; then
    if install_jq; then
      return 0
    fi
  fi
  return 1
}

# Configure OTEL in ~/.claude/settings.json
configure_otel_settings() {
  local settings_file="$HOME/.claude/settings.json"
  local backup_file="$HOME/.claude/settings.json.backup.$(date +%s)"

  print_step "Step 6/6: Configuring OTEL telemetry..."

  # Check if jq is available (should have been installed in Step 1)
  if ! command -v jq >/dev/null 2>&1; then
    print_warning "jq not available - OTEL configuration skipped"
    print_info "Run '/cellm-init' option 7 > 6 to configure later"
    return 0
  fi

  # Check if already configured
  if [ -f "$settings_file" ]; then
    local existing_otel=$(jq -r '.env.OTEL_EXPORTER_OTLP_ENDPOINT // empty' "$settings_file" 2>/dev/null)
    if [ -n "$existing_otel" ]; then
      print_success "OTEL already configured (endpoint: $existing_otel)"
      return 0
    fi
  fi

  # Ask user
  echo ""
  print_info "OTEL telemetry sends usage metrics to Oracle dashboard"
  print_info "This enables: token tracking, cost analysis, cache hit rates"
  echo ""
  if ! ask_yes_no "Configure OTEL telemetry?"; then
    print_info "Skipped - run '/cellm-init' option 7 > 6 to configure later"
    return 0
  fi

  # Backup existing settings
  if [ -f "$settings_file" ]; then
    cp "$settings_file" "$backup_file"
    print_info "Backup: $backup_file"
  fi

  # OTEL environment variables
  local otel_env='{
    "CLAUDE_CODE_ENABLE_TELEMETRY": "1",
    "OTEL_METRICS_EXPORTER": "otlp",
    "OTEL_LOGS_EXPORTER": "otlp",
    "OTEL_EXPORTER_OTLP_PROTOCOL": "http/json",
    "OTEL_EXPORTER_OTLP_ENDPOINT": "http://localhost:31415",
    "OTEL_METRIC_EXPORT_INTERVAL": "30000"
  }'

  # Create or merge settings
  mkdir -p "$HOME/.claude"
  if [ -f "$settings_file" ]; then
    # Merge with existing
    jq --argjson otel "$otel_env" '.env = (.env // {}) + $otel' \
      "$settings_file" > "${settings_file}.tmp" && \
      mv "${settings_file}.tmp" "$settings_file"
  else
    # Create new
    echo "{\"env\": $otel_env}" | jq '.' > "$settings_file"
  fi

  print_success "OTEL configured in $settings_file"
  print_warning "Restart Claude Code to activate telemetry"
}

# Advanced OTEL configuration with more options
configure_otel_advanced() {
  clear
  print_header "OTEL Telemetry Configuration"

  local settings_file="$HOME/.claude/settings.json"

  # Show current status
  if [ -f "$settings_file" ] && command -v jq >/dev/null 2>&1; then
    local current=$(jq -r '.env.OTEL_EXPORTER_OTLP_ENDPOINT // "Not configured"' "$settings_file" 2>/dev/null)
    print_info "Current endpoint: $current"
  else
    print_info "Status: Not configured"
  fi

  echo ""
  echo "  1. Enable OTEL (default settings)"
  echo "  2. Disable OTEL"
  echo "  3. Custom endpoint"
  echo "  4. Back"
  echo ""
  echo -ne "${CYAN}Choose option [1-4]:${NC} "
  read -r choice

  case "$choice" in
    1) configure_otel_enable ;;
    2) disable_otel ;;
    3) configure_otel_custom ;;
    4) show_advanced_menu ;;
    *) print_error "Invalid option"; sleep 2; configure_otel_advanced ;;
  esac
}

# Enable OTEL with default settings (non-interactive version)
configure_otel_enable() {
  local settings_file="$HOME/.claude/settings.json"
  local backup_file="$HOME/.claude/settings.json.backup.$(date +%s)"

  echo ""

  # Check if jq is available, offer to install
  if ! ensure_jq; then
    echo ""
    ask_yes_no "Continue?" && configure_otel_advanced
    return 0
  fi

  # Backup existing settings
  if [ -f "$settings_file" ]; then
    cp "$settings_file" "$backup_file"
    print_info "Backup: $backup_file"
  fi

  # OTEL environment variables
  local otel_env='{
    "CLAUDE_CODE_ENABLE_TELEMETRY": "1",
    "OTEL_METRICS_EXPORTER": "otlp",
    "OTEL_LOGS_EXPORTER": "otlp",
    "OTEL_EXPORTER_OTLP_PROTOCOL": "http/json",
    "OTEL_EXPORTER_OTLP_ENDPOINT": "http://localhost:31415",
    "OTEL_METRIC_EXPORT_INTERVAL": "30000"
  }'

  # Create or merge settings
  mkdir -p "$HOME/.claude"
  if [ -f "$settings_file" ]; then
    jq --argjson otel "$otel_env" '.env = (.env // {}) + $otel' \
      "$settings_file" > "${settings_file}.tmp" && \
      mv "${settings_file}.tmp" "$settings_file"
  else
    echo "{\"env\": $otel_env}" | jq '.' > "$settings_file"
  fi

  print_success "OTEL enabled"
  print_warning "Restart Claude Code to activate telemetry"

  echo ""
  ask_yes_no "Continue?" && configure_otel_advanced
}

# Disable OTEL
disable_otel() {
  local settings_file="$HOME/.claude/settings.json"

  echo ""

  if [ -f "$settings_file" ] && command -v jq >/dev/null 2>&1; then
    jq 'del(.env.CLAUDE_CODE_ENABLE_TELEMETRY, .env.OTEL_METRICS_EXPORTER, .env.OTEL_LOGS_EXPORTER, .env.OTEL_EXPORTER_OTLP_PROTOCOL, .env.OTEL_EXPORTER_OTLP_ENDPOINT, .env.OTEL_METRIC_EXPORT_INTERVAL)' \
      "$settings_file" > "${settings_file}.tmp" && mv "${settings_file}.tmp" "$settings_file"
    print_success "OTEL disabled"
    print_warning "Restart Claude Code to apply"
  else
    print_info "No OTEL configuration found"
  fi

  echo ""
  ask_yes_no "Continue?" && configure_otel_advanced
}

# Enable OTEL silently (for doctor mode)
configure_otel_enable_silent() {
  local settings_file="$HOME/.claude/settings.json"

  if ! command -v jq >/dev/null 2>&1; then
    return 1
  fi

  local otel_env='{
    "CLAUDE_CODE_ENABLE_TELEMETRY": "1",
    "OTEL_METRICS_EXPORTER": "otlp",
    "OTEL_LOGS_EXPORTER": "otlp",
    "OTEL_EXPORTER_OTLP_PROTOCOL": "http/json",
    "OTEL_EXPORTER_OTLP_ENDPOINT": "http://localhost:31415",
    "OTEL_METRIC_EXPORT_INTERVAL": "30000"
  }'

  mkdir -p "$HOME/.claude"
  if [ -f "$settings_file" ]; then
    jq --argjson otel "$otel_env" '.env = (.env // {}) + $otel' \
      "$settings_file" > "${settings_file}.tmp" && \
      mv "${settings_file}.tmp" "$settings_file"
  else
    echo "{\"env\": $otel_env}" | jq '.' > "$settings_file"
  fi

  print_success "  OTEL configured"
  print_warning "  Restart Claude Code to activate"
  return 0
}

# Configure OTEL with custom endpoint
configure_otel_custom() {
  local settings_file="$HOME/.claude/settings.json"
  local backup_file="$HOME/.claude/settings.json.backup.$(date +%s)"

  echo ""

  # Check if jq is available, offer to install
  if ! ensure_jq; then
    echo ""
    ask_yes_no "Continue?" && configure_otel_advanced
    return 0
  fi

  echo -ne "${CYAN}Enter OTEL endpoint (e.g., http://localhost:31415):${NC} "
  read -r endpoint

  if [ -z "$endpoint" ]; then
    print_error "No endpoint provided"
    echo ""
    ask_yes_no "Continue?" && configure_otel_advanced
    return 0
  fi

  # Backup existing settings
  if [ -f "$settings_file" ]; then
    cp "$settings_file" "$backup_file"
    print_info "Backup: $backup_file"
  fi

  # OTEL environment variables with custom endpoint
  local otel_env
  otel_env=$(jq -n \
    --arg endpoint "$endpoint" \
    '{
      "CLAUDE_CODE_ENABLE_TELEMETRY": "1",
      "OTEL_METRICS_EXPORTER": "otlp",
      "OTEL_LOGS_EXPORTER": "otlp",
      "OTEL_EXPORTER_OTLP_PROTOCOL": "http/json",
      "OTEL_EXPORTER_OTLP_ENDPOINT": $endpoint,
      "OTEL_METRIC_EXPORT_INTERVAL": "30000"
    }')

  # Create or merge settings
  mkdir -p "$HOME/.claude"
  if [ -f "$settings_file" ]; then
    jq --argjson otel "$otel_env" '.env = (.env // {}) + $otel' \
      "$settings_file" > "${settings_file}.tmp" && \
      mv "${settings_file}.tmp" "$settings_file"
  else
    echo "{\"env\": $otel_env}" | jq '.' > "$settings_file"
  fi

  print_success "OTEL configured with endpoint: $endpoint"
  print_warning "Restart Claude Code to activate telemetry"

  echo ""
  ask_yes_no "Continue?" && configure_otel_advanced
}

# Step 1: Check dependencies
check_dependencies() {
  print_step "Step 1/6: Checking dependencies..."

  local has_errors=0

  # Check Bun (required)
  if command -v bun >/dev/null 2>&1; then
    local bun_version=$(bun --version)
    local bun_major=$(echo "$bun_version" | cut -d. -f1)
    if [ "$bun_major" -ge 1 ]; then
      print_success "Bun $bun_version found"
    else
      print_error "Bun $bun_version found but requires >=1.0.0"
      print_info "Upgrade: curl -fsSL https://bun.sh/install | bash"
      has_errors=1
    fi
  else
    print_error "Bun not found (required)"
    print_info "Install: curl -fsSL https://bun.sh/install | bash"
    has_errors=1
  fi

  # Check jq (required for OTEL)
  if command -v jq >/dev/null 2>&1; then
    local jq_version=$(jq --version 2>/dev/null || echo "unknown")
    print_success "jq $jq_version found"
  else
    print_warning "jq not found (required for OTEL telemetry)"
    if ask_yes_no "  Install jq now?"; then
      if install_jq; then
        : # success, continue
      else
        print_info "  OTEL configuration will be skipped"
      fi
    else
      print_info "  OTEL configuration will be skipped"
    fi
  fi

  if [ $has_errors -eq 1 ]; then
    return 1
  fi

  return 0
}

# Step 2: Install or update package
install_package() {
  print_step "Step 2/6: Installing $PACKAGE_NAME..."

  if [ "$MODE" = "update" ]; then
    print_progress "Updating to latest version..."
  else
    print_progress "Installing from npm registry..."
  fi

  if bun x "$PACKAGE_NAME@latest" --version >/dev/null 2>&1; then
    local version=$(bun x "$PACKAGE_NAME@latest" --version 2>/dev/null || echo "unknown")
    print_success "Installed v$version"
    return 0
  else
    print_error "Installation failed"
    print_info "Check network connection and npm registry access"
    return 2
  fi
}

# Step 3: Start worker daemon
start_worker() {
  print_step "Step 3/6: Starting worker daemon..."

  print_progress "Spawning process on port 31415..."

  # Check if worker is already running
  if curl -sf --max-time 2 "${WORKER_URL}/health" >/dev/null 2>&1; then
    print_warning "Worker already running"
    return 0
  fi

  # Spawn worker in background using Bun
  local worker_log="$LOG_DIR/oracle-worker.log"
  nohup bun x "$PACKAGE_NAME" serve > "$worker_log" 2>&1 &

  local worker_pid=$!
  disown || true

  print_info "Worker started (PID: $worker_pid)"

  # Wait for worker to be ready (max 10s)
  local attempts=0
  local max_attempts=20
  while [ $attempts -lt $max_attempts ]; do
    if curl -sf --max-time 1 "${WORKER_URL}/health" >/dev/null 2>&1; then
      print_success "Worker is responsive"
      return 0
    fi
    sleep 0.5
    attempts=$((attempts + 1))
  done

  print_error "Worker failed to start within 10 seconds"
  print_info "Check logs: $worker_log"
  return 3
}

# Step 4: Validate health
validate_health() {
  print_step "Step 4/6: Validating health..."

  print_progress "Testing /health endpoint..."

  local response_time
  response_time=$(curl -sf -w "%{time_total}" --max-time 5 "${WORKER_URL}/health" -o /dev/null 2>/dev/null || echo "0")

  if [ "$response_time" != "0" ]; then
    local ms=$(echo "$response_time * 1000" | bc)
    print_success "Worker is healthy (response: ${ms}ms)"
    return 0
  else
    print_error "Health check failed"
    print_info "Worker may be starting up, try again in a few seconds"
    return 4
  fi
}

# Step 5: Finalize setup
finalize_setup() {
  print_step "Step 5/6: Finalizing setup..."

  # Create marker file
  echo "$(date -u +%Y-%m-%dT%H:%M:%SZ)" > "$MARKER_FILE"
  print_success "Created marker file"

  # Verify MCP configuration
  local mcp_file="${CLAUDE_PLUGIN_ROOT:-$(dirname "$0")/..}/.mcp.json"
  local mcp_example="${CLAUDE_PLUGIN_ROOT:-$(dirname "$0")/..}/.mcp.json.example"

  if [ -f "$mcp_file" ]; then
    print_success "MCP server configured"
  elif [ -f "$mcp_example" ]; then
    print_warning "MCP not activated yet"
    echo ""
    if ask_yes_no "Activate MCP tools now?"; then
      cp "$mcp_example" "$mcp_file"
      print_success "MCP activated"
    else
      print_info "Run manually: cp cellm/.mcp.json.example cellm/.mcp.json"
    fi
  fi

  echo ""
  print_success "Setup complete!"
  echo ""
  print_info "Run '/oracle-status' to verify worker status"
  print_info "Logs available at: $LOG_DIR"
}

# Status mode - detailed display
show_status() {
  print_header "Oracle Worker Status"

  # Check installation
  if [ -f "$MARKER_FILE" ]; then
    local install_date=$(cat "$MARKER_FILE")
    print_success "Installed: YES ($install_date)"
  else
    print_error "Installed: NO"
    echo ""
    print_info "Run '/cellm-init' or select option 1 to install"
    return 1
  fi

  # Check if running
  if curl -sf --max-time 2 "${WORKER_URL}/health" >/dev/null 2>&1; then
    print_success "Running: YES"

    # Get detailed health info
    local health_json=$(curl -sf --max-time 2 "${WORKER_URL}/health" 2>/dev/null || echo "{}")
    print_success "Healthy: YES"

    # Get version if available
    local version=$(bun x "$PACKAGE_NAME@latest" --version 2>/dev/null || echo "unknown")
    print_info "Version: $version"
  else
    print_error "Running: NO"
    echo ""
    if ask_yes_no "Start worker now?"; then
      start_worker
      validate_health
    fi
    return 1
  fi

  # Database info
  local db_file="$DATA_DIR/compass/compass.db"
  if [ -f "$db_file" ]; then
    local db_size=$(du -h "$db_file" | cut -f1)
    echo ""
    print_step "Database:"
    print_info "Location: $db_file"
    print_info "Size: $db_size"
  fi

  # MCP status
  local mcp_file="${CLAUDE_PLUGIN_ROOT:-$(dirname "$0")/..}/.mcp.json"
  echo ""
  print_step "MCP Integration:"
  if [ -f "$mcp_file" ]; then
    print_success "Activated: YES"
  else
    print_warning "Activated: NO (optional)"
    print_info "Activate: cp cellm/.mcp.json.example cellm/.mcp.json"
  fi

  return 0
}

# Doctor mode - diagnostic and repair
run_doctor() {
  print_header "Oracle Doctor - Diagnostic Mode"

  local issues_found=0
  local fixes_applied=0

  print_step "Running diagnostics..."
  echo ""

  # Check 1: Dependencies
  print_info "[1/7] Checking dependencies..."
  if check_dependencies >/dev/null 2>&1; then
    print_success "Dependencies OK"
  else
    print_error "Missing dependencies"
    issues_found=$((issues_found + 1))
    if ask_yes_no "  Install Bun?"; then
      print_info "  Run: curl -fsSL https://bun.sh/install | bash"
    fi
  fi

  # Check 2: Installation
  print_info "[2/7] Checking installation..."
  if [ -f "$MARKER_FILE" ]; then
    print_success "Oracle installed"
  else
    print_error "Oracle not installed"
    issues_found=$((issues_found + 1))
    if ask_yes_no "  Install now?"; then
      install_package && fixes_applied=$((fixes_applied + 1))
    fi
  fi

  # Check 3: Worker status
  print_info "[3/7] Checking worker status..."
  if curl -sf --max-time 2 "${WORKER_URL}/health" >/dev/null 2>&1; then
    print_success "Worker running"
  else
    print_error "Worker not running"
    issues_found=$((issues_found + 1))
    if ask_yes_no "  Start worker?"; then
      start_worker && fixes_applied=$((fixes_applied + 1))
    fi
  fi

  # Check 4: Port availability
  print_info "[4/7] Checking port availability..."
  if lsof -Pi :31415 -sTCP:LISTEN -t >/dev/null 2>&1; then
    print_success "Port 31415 in use (expected)"
  else
    print_warning "Port 31415 not in use"
    print_info "  Worker may not be running"
  fi

  # Check 5: Database integrity
  print_info "[5/7] Checking database..."
  local db_file="$DATA_DIR/compass/compass.db"
  if [ -f "$db_file" ]; then
    print_success "Database exists"
    # Could add SQLite integrity check here
  else
    print_warning "Database not found (will be created on first use)"
  fi

  # Check 6: MCP configuration
  print_info "[6/7] Checking MCP configuration..."
  local mcp_file="${CLAUDE_PLUGIN_ROOT:-$(dirname "$0")/..}/.mcp.json"
  if [ -f "$mcp_file" ]; then
    print_success "MCP configured"
  else
    print_warning "MCP not activated (optional)"
    if ask_yes_no "  Activate MCP?"; then
      local mcp_example="${CLAUDE_PLUGIN_ROOT:-$(dirname "$0")/..}/.mcp.json.example"
      if [ -f "$mcp_example" ]; then
        cp "$mcp_example" "$mcp_file"
        print_success "  MCP activated"
        fixes_applied=$((fixes_applied + 1))
      fi
    fi
  fi

  # Check 7: OTEL configuration
  print_info "[7/7] Checking OTEL configuration..."
  local settings_file="$HOME/.claude/settings.json"
  if [ -f "$settings_file" ] && command -v jq >/dev/null 2>&1; then
    local otel_endpoint=$(jq -r '.env.OTEL_EXPORTER_OTLP_ENDPOINT // empty' "$settings_file" 2>/dev/null)
    if [ -n "$otel_endpoint" ]; then
      print_success "OTEL configured (endpoint: $otel_endpoint)"
    else
      print_warning "OTEL not configured (optional)"
      if ask_yes_no "  Configure OTEL?"; then
        configure_otel_enable_silent && fixes_applied=$((fixes_applied + 1))
      fi
    fi
  else
    print_warning "OTEL not configured (optional)"
    if ! command -v jq >/dev/null 2>&1; then
      if ask_yes_no "  Install jq to enable OTEL?"; then
        if install_jq; then
          if ask_yes_no "  Configure OTEL now?"; then
            configure_otel_enable_silent && fixes_applied=$((fixes_applied + 1))
          fi
        fi
      fi
    else
      if ask_yes_no "  Configure OTEL?"; then
        configure_otel_enable_silent && fixes_applied=$((fixes_applied + 1))
      fi
    fi
  fi

  # Summary
  echo ""
  print_header "Diagnostic Summary"
  echo -e "  Issues found: ${RED}$issues_found${NC}"
  echo -e "  Fixes applied: ${GREEN}$fixes_applied${NC}"
  echo ""

  if [ $issues_found -eq 0 ]; then
    print_success "Everything looks good!"
  elif [ $fixes_applied -gt 0 ]; then
    print_success "Applied $fixes_applied fix(es)"
    if [ $((issues_found - fixes_applied)) -gt 0 ]; then
      print_warning "Some issues remain - manual intervention may be needed"
    fi
  else
    print_warning "Issues detected but no fixes applied"
  fi
}

# Restart worker
restart_worker() {
  print_header "Restart Oracle Worker"

  print_step "Stopping existing worker..."
  if pgrep -f "$PACKAGE_NAME" >/dev/null 2>&1; then
    pkill -f "$PACKAGE_NAME" || true
    sleep 2
    print_success "Worker stopped"
  else
    print_info "No worker process found"
  fi

  echo ""
  print_step "Starting worker..."
  start_worker

  echo ""
  print_step "Validating health..."
  validate_health

  echo ""
  print_success "Worker restarted successfully!"
}

# Uninstall
uninstall() {
  print_header "Uninstall Oracle"

  print_warning "This will remove:"
  print_warning "  - Oracle worker process"
  print_warning "  - Installation marker"
  print_warning "  - MCP configuration"
  echo ""
  print_info "Will NOT remove:"
  print_info "  - Database and observations"
  print_info "  - Logs"
  echo ""

  if ! ask_yes_no "Continue with uninstall?" "n"; then
    print_info "Uninstall cancelled"
    return 0
  fi

  print_step "Stopping worker..."
  if pgrep -f "$PACKAGE_NAME" >/dev/null 2>&1; then
    pkill -f "$PACKAGE_NAME" || true
    sleep 2
    print_success "Worker stopped"
  fi

  print_step "Removing marker..."
  rm -f "$MARKER_FILE"
  print_success "Marker removed"

  print_step "Removing MCP config..."
  local mcp_file="${CLAUDE_PLUGIN_ROOT:-$(dirname "$0")/..}/.mcp.json"
  if [ -f "$mcp_file" ]; then
    rm -f "$mcp_file"
    print_success "MCP config removed"
  fi

  echo ""
  print_success "Oracle uninstalled"
  print_info "To remove database and logs: rm -rf ~/.cellm"
}

# Update mode
update() {
  print_header "Update Oracle"

  local current_version=$(bun x "$PACKAGE_NAME@latest" --version 2>/dev/null || echo "unknown")
  print_info "Current version: $current_version"

  echo ""
  if ask_yes_no "Check for updates?"; then
    install_package

    local new_version=$(bun x "$PACKAGE_NAME@latest" --version 2>/dev/null || echo "unknown")

    if [ "$current_version" != "$new_version" ]; then
      print_success "Updated: $current_version → $new_version"
      echo ""
      if ask_yes_no "Restart worker to apply update?"; then
        restart_worker
      fi
    else
      print_info "Already on latest version"
    fi
  fi
}

# Main execution
main() {
  log "[i] Starting init-oracle.sh (mode: ${MODE:-interactive})"

  # If no mode specified, show interactive menu
  if [ -z "$MODE" ]; then
    show_menu
  fi

  # Execute based on mode
  case "$MODE" in
    status)
      show_status
      ;;
    doctor)
      run_doctor
      ;;
    restart)
      restart_worker
      ;;
    uninstall)
      uninstall
      ;;
    update)
      update
      ;;
    install|*)
      print_header "Oracle Installation"
      check_dependencies || exit 1
      install_package || exit 2
      start_worker || exit 3
      validate_health || exit 4
      finalize_setup
      configure_otel_settings
      ;;
  esac

  log "[+] init-oracle.sh completed successfully"

  # If interactive, ask to continue
  if [ -z "$1" ]; then
    echo ""
    echo -ne "${CYAN}Press Enter to return to menu (or Ctrl+C to exit)...${NC}"
    read -r
    show_menu
  fi

  exit 0
}

main "$@"
