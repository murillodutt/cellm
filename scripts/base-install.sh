#!/bin/bash
# =============================================================================
# CELLM Base Installation Script
# Installs CELLM to ~/.cellm/
# 
# Website: https://cellm.ai
# Repository: https://github.com/murillodutt/cellm
# =============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
CELLM_DIR="$HOME/.cellm"
REPO_URL="https://github.com/murillodutt/cellm"
VERSION="0.10.0"
BACKUP_DIR="$HOME/.cellm.backup.$(date +%Y%m%d%H%M%S)"

# Functions
print_header() {
    echo -e "${BLUE}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║              CELLM Base Installation v${VERSION}                  ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

print_success() {
    echo -e "${GREEN}[+] $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}[!] $1${NC}"
}

print_error() {
    echo -e "${RED}[-] $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Check if CELLM is already installed
check_existing_installation() {
    if [ -d "$CELLM_DIR" ]; then
        echo ""
        print_warning "Existing Installation Detected"
        echo ""
        
        # Try to read existing version
        if [ -f "$CELLM_DIR/config.yaml" ]; then
            EXISTING_VERSION=$(grep "version:" "$CELLM_DIR/config.yaml" 2>/dev/null | head -1 | cut -d'"' -f2)
            echo "  Installed version: ${EXISTING_VERSION:-unknown}"
        else
            echo "  Installed version: unknown"
        fi
        echo "  Latest version: $VERSION"
        echo ""
        
        echo "What would you like to do?"
        echo ""
        echo "  1) Full update (recommended)"
        echo "     - Updates default profile, scripts, and version"
        echo "     - Preserves custom profiles and config settings"
        echo ""
        echo "  2) Update default profile only"
        echo "     - Updates profiles/default/*"
        echo "     - Everything else unchanged"
        echo ""
        echo "  3) Update scripts only"
        echo "     - Updates scripts/*"
        echo "     - Everything else unchanged"
        echo ""
        echo "  4) Update config.yaml only"
        echo "     - Updates version number"
        echo "     - Settings preserved"
        echo ""
        echo "  5) Delete & reinstall fresh"
        echo "     - Backup created, then full reinstall"
        echo ""
        echo "  6) Cancel"
        echo ""
        
        read -p "Enter your choice (1-6): " choice
        
        case $choice in
            1)
                update_full
                ;;
            2)
                update_profile_only
                ;;
            3)
                update_scripts_only
                ;;
            4)
                update_config_only
                ;;
            5)
                fresh_install
                ;;
            6)
                echo "Installation cancelled."
                exit 0
                ;;
            *)
                print_error "Invalid choice"
                exit 1
                ;;
        esac
    else
        fresh_install
    fi
}

# Backup existing installation
create_backup() {
    print_info "Creating backup at $BACKUP_DIR..."
    cp -r "$CELLM_DIR" "$BACKUP_DIR"
    print_success "Backup created"
}

# Fresh installation
fresh_install() {
    print_info "Starting fresh installation..."
    
    if [ -d "$CELLM_DIR" ]; then
        create_backup
        rm -rf "$CELLM_DIR"
    fi
    
    create_directory_structure
    copy_default_files
    create_config_file
    
    print_success "CELLM installed to $CELLM_DIR"
}

# Full update
update_full() {
    print_info "Performing full update..."
    create_backup
    
    # Update default profile
    rm -rf "$CELLM_DIR/profiles/default"
    copy_default_profile
    
    # Update scripts
    rm -rf "$CELLM_DIR/scripts"
    copy_scripts
    
    # Update version in config
    update_config_version
    
    print_success "Full update complete"
}

# Update profile only
update_profile_only() {
    print_info "Updating default profile..."
    create_backup
    
    rm -rf "$CELLM_DIR/profiles/default"
    copy_default_profile
    
    print_success "Default profile updated"
}

# Update scripts only
update_scripts_only() {
    print_info "Updating scripts..."
    create_backup
    
    rm -rf "$CELLM_DIR/scripts"
    copy_scripts
    
    print_success "Scripts updated"
}

# Update config only
update_config_only() {
    print_info "Updating config version..."
    update_config_version
    print_success "Config updated"
}

# Create directory structure
create_directory_structure() {
    print_info "Creating directory structure..."
    
    mkdir -p "$CELLM_DIR"/{profiles/default/{rules/{core,domain},patterns/{core,anti},commands,workflows,agents,skills,templates},scripts,schemas,logs,metrics}
    
    print_success "Directory structure created"
}

# Copy default profile
copy_default_profile() {
    print_info "Copying default profile..."

    # Detect execution context
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    REPO_ROOT="$(dirname "$SCRIPT_DIR")"

    # Create directory structure
    mkdir -p "$CELLM_DIR/profiles/default"/{rules/{core,domain},patterns/{core,anti},commands,workflows,agents,skills,templates}

    if [ -d "$REPO_ROOT/cellm-core" ]; then
        # Local clone - copy from repo
        print_info "Detected local repository at $REPO_ROOT"

        # Copy rules
        if [ -d "$REPO_ROOT/cellm-core/rules" ]; then
            cp -r "$REPO_ROOT/cellm-core/rules/"* "$CELLM_DIR/profiles/default/rules/" 2>/dev/null || true
        fi

        # Copy patterns
        if [ -d "$REPO_ROOT/cellm-core/patterns" ]; then
            cp -r "$REPO_ROOT/cellm-core/patterns/"* "$CELLM_DIR/profiles/default/patterns/" 2>/dev/null || true
        fi

        # Copy commands
        if [ -d "$REPO_ROOT/cellm-core/commands" ]; then
            cp -r "$REPO_ROOT/cellm-core/commands/"* "$CELLM_DIR/profiles/default/commands/" 2>/dev/null || true
        fi

        # Copy workflows
        if [ -d "$REPO_ROOT/cellm-core/workflows" ]; then
            cp -r "$REPO_ROOT/cellm-core/workflows/"* "$CELLM_DIR/profiles/default/workflows/" 2>/dev/null || true
        fi

        # Copy agents
        if [ -d "$REPO_ROOT/cellm-core/agents" ]; then
            cp -r "$REPO_ROOT/cellm-core/agents/"* "$CELLM_DIR/profiles/default/agents/" 2>/dev/null || true
        fi

        # Copy skills
        if [ -d "$REPO_ROOT/cellm-core/skills" ]; then
            cp -r "$REPO_ROOT/cellm-core/skills/"* "$CELLM_DIR/profiles/default/skills/" 2>/dev/null || true
        fi

        # Copy templates
        if [ -d "$REPO_ROOT/cellm-core/templates" ]; then
            cp -r "$REPO_ROOT/cellm-core/templates/"* "$CELLM_DIR/profiles/default/templates/" 2>/dev/null || true
        fi

        # Copy INDEX.md
        if [ -f "$REPO_ROOT/cellm-core/INDEX.md" ]; then
            cp "$REPO_ROOT/cellm-core/INDEX.md" "$CELLM_DIR/profiles/default/"
        fi

        print_success "Default profile copied from local repository"
    else
        # Remote installation - download from release
        print_info "Downloading default profile from $REPO_URL..."

        if command -v curl &> /dev/null; then
            curl -sL "$REPO_URL/releases/latest/download/cellm-core.tar.gz" | \
                tar -xzf - -C "$CELLM_DIR/profiles/default/" 2>/dev/null || {
                print_warning "Could not download release, creating placeholder profile"
                create_placeholder_profile
            }
        else
            print_warning "curl not found, creating placeholder profile"
            create_placeholder_profile
        fi
    fi

    print_success "Default profile copied"
}

# Create placeholder profile when remote download fails
create_placeholder_profile() {
    cat > "$CELLM_DIR/profiles/default/README.md" << 'EOF'
# Default Profile

This is a placeholder CELLM profile. To get the full profile:

1. Clone the repository:
   git clone https://github.com/murillodutt/cellm.git

2. Run the install script from the repo:
   cd cellm && ./scripts/base-install.sh

## Structure

```
default/
├── rules/
│   ├── core/       # Always loaded
│   └── domain/     # Path-triggered
├── patterns/
│   ├── core/       # Technology patterns
│   └── anti/       # Anti-patterns (always loaded)
├── commands/       # Slash commands
├── workflows/      # Workflow definitions
├── agents/         # Agent definitions
├── skills/         # Claude Code skills
└── templates/      # Templates for specs, tasks, etc.
```
EOF
}

# Copy scripts
copy_scripts() {
    print_info "Copying scripts..."

    # Detect execution context
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    REPO_ROOT="$(dirname "$SCRIPT_DIR")"

    mkdir -p "$CELLM_DIR/scripts"

    if [ -d "$REPO_ROOT/scripts" ]; then
        # Local clone - copy actual scripts
        print_info "Copying scripts from local repository"

        # Copy base-install.sh
        if [ -f "$REPO_ROOT/scripts/base-install.sh" ]; then
            cp "$REPO_ROOT/scripts/base-install.sh" "$CELLM_DIR/scripts/"
            chmod +x "$CELLM_DIR/scripts/base-install.sh"
        fi

        # Copy project-install.sh
        if [ -f "$REPO_ROOT/scripts/project-install.sh" ]; then
            cp "$REPO_ROOT/scripts/project-install.sh" "$CELLM_DIR/scripts/"
            chmod +x "$CELLM_DIR/scripts/project-install.sh"
        fi

        # Copy validate.sh
        if [ -f "$REPO_ROOT/scripts/validate.sh" ]; then
            cp "$REPO_ROOT/scripts/validate.sh" "$CELLM_DIR/scripts/"
            chmod +x "$CELLM_DIR/scripts/validate.sh"
        fi

        # Copy compile.sh
        if [ -f "$REPO_ROOT/scripts/compile.sh" ]; then
            cp "$REPO_ROOT/scripts/compile.sh" "$CELLM_DIR/scripts/"
            chmod +x "$CELLM_DIR/scripts/compile.sh"
        fi

        print_success "Scripts copied from local repository"
    else
        # Remote or fallback - copy this script and create placeholders
        cp "$0" "$CELLM_DIR/scripts/base-install.sh" 2>/dev/null || true
        chmod +x "$CELLM_DIR/scripts/base-install.sh" 2>/dev/null || true

        # Create project-install placeholder
        cat > "$CELLM_DIR/scripts/project-install.sh" << 'EOF'
#!/bin/bash
# CELLM Project Installation Script
# Run this in your project directory to compile CELLM

echo "CELLM Project Installation"
echo "Usage: $HOME/.cellm/scripts/project-install.sh [options]"
echo ""
echo "Options:"
echo "  --profile <name>     Use specific profile (default: default)"
echo "  --skip-skills        Don't convert standards to skills"
echo ""
echo "Note: This is a placeholder. Install from the repository for full functionality."
EOF
        chmod +x "$CELLM_DIR/scripts/project-install.sh"

        # Create validate script placeholder
        cat > "$CELLM_DIR/scripts/validate.sh" << 'EOF'
#!/bin/bash
# CELLM Validation Script
# Validates CELLM structure and files

echo "CELLM Validation"
echo "Checking structure..."
echo "Note: This is a placeholder. Install from the repository for full functionality."
echo "Validation complete"
EOF
        chmod +x "$CELLM_DIR/scripts/validate.sh"
    fi

    print_success "Scripts copied"
}

# Copy default files
copy_default_files() {
    copy_default_profile
    copy_scripts
}

# Create config file
create_config_file() {
    print_info "Creating config.yaml..."
    
    cat > "$CELLM_DIR/config.yaml" << EOF
# CELLM Configuration
# Generated: $(date +%Y-%m-%d)

cellm:
  version: "$VERSION"
  
defaults:
  profile: default
  language: PT-BR
  
claude_code:
  commands: true
  subagents: true
  skills: true
  
budget:
  max_tokens: 2000
  warn_at: 1500
  
validation:
  strict: true
  on_load: true
  
# Custom profiles
# profiles:
#   nuxt-saas:
#     path: ~/.cellm/profiles/nuxt-saas
#   rails:
#     path: ~/.cellm/profiles/rails
EOF
    
    print_success "Config created"
}

# Update config version
update_config_version() {
    if [ -f "$CELLM_DIR/config.yaml" ]; then
        # Update version using sed
        sed -i.bak "s/version: .*/version: \"$VERSION\"/" "$CELLM_DIR/config.yaml"
        rm -f "$CELLM_DIR/config.yaml.bak"
        print_success "Version updated to $VERSION"
    else
        create_config_file
    fi
}

# Show next steps
show_next_steps() {
    echo ""
    echo -e "${GREEN}Installation Complete!${NC}"
    echo ""
    echo "Next steps:"
    echo ""
    echo "  1. Customize your standards:"
    echo "     Edit files in $CELLM_DIR/profiles/default/"
    echo ""
    echo "  2. Install CELLM in a project:"
    echo "     cd /path/to/your/project"
    echo "     $CELLM_DIR/scripts/project-install.sh"
    echo ""
    echo "  3. Start using commands:"
    echo "     /plan-product, /shape-spec, /write-spec, etc."
    echo ""
    echo "Documentation: https://cellm.ai"
    echo "Repository: https://github.com/murillodutt/cellm"
    echo ""
}

# Main
main() {
    print_header
    check_existing_installation
    show_next_steps
}

main "$@"
