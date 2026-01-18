#!/bin/bash
# =============================================================================
# CELLM Project Installation Script
# Compiles CELLM into a project directory
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
NC='\033[0m'

# Configuration
CELLM_BASE="$HOME/.cellm"
PROJECT_DIR="$(pwd)"
CELLM_PROJECT_DIR="$PROJECT_DIR/.claude"
VERSION="0.10.0"

# Default options
PROFILE="default"
ENABLE_COMMANDS=true
ENABLE_SUBAGENTS=true
ENABLE_SKILLS=true

# Functions
print_header() {
    echo -e "${BLUE}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║           CELLM Project Installation v${VERSION}                  ║"
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

# Parse arguments
parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --profile)
                PROFILE="$2"
                shift 2
                ;;
            --no-commands)
                ENABLE_COMMANDS=false
                shift
                ;;
            --no-subagents)
                ENABLE_SUBAGENTS=false
                shift
                ;;
            --no-skills)
                ENABLE_SKILLS=false
                shift
                ;;
            --help)
                show_help
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
}

# Show help
show_help() {
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  --profile <name>    Use specific profile (default: default)"
    echo "  --no-commands       Don't install slash commands"
    echo "  --no-subagents      Don't install subagent definitions"
    echo "  --no-skills         Don't convert standards to skills"
    echo "  --help              Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                           # Use default profile"
    echo "  $0 --profile nuxt-saas       # Use nuxt-saas profile"
    echo "  $0 --no-skills               # Skip skills conversion"
}

# Check prerequisites
check_prerequisites() {
    print_info "Checking prerequisites..."
    
    # Check if base installation exists
    if [ ! -d "$CELLM_BASE" ]; then
        print_error "CELLM base installation not found at $CELLM_BASE"
        echo "Run the base installation first:"
        echo "  curl -sSL https://raw.githubusercontent.com/murillodutt/cellm/main/scripts/base-install.sh | bash"
        exit 1
    fi
    
    # Check if profile exists
    PROFILE_DIR="$CELLM_BASE/profiles/$PROFILE"
    if [ ! -d "$PROFILE_DIR" ]; then
        print_error "Profile '$PROFILE' not found at $PROFILE_DIR"
        echo "Available profiles:"
        ls -1 "$CELLM_BASE/profiles/"
        exit 1
    fi
    
    print_success "Prerequisites OK"
}

# Check existing installation
check_existing() {
    if [ -d "$CELLM_PROJECT_DIR" ]; then
        echo ""
        print_warning "Existing CELLM installation found in this project"
        echo ""
        echo "What would you like to do?"
        echo ""
        echo "  1) Update (preserve project/ and specs/)"
        echo "  2) Fresh install (backup then reinstall)"
        echo "  3) Cancel"
        echo ""
        
        read -p "Enter your choice (1-3): " choice
        
        case $choice in
            1)
                update_installation
                ;;
            2)
                fresh_installation
                ;;
            3)
                echo "Installation cancelled."
                exit 0
                ;;
            *)
                print_error "Invalid choice"
                exit 1
                ;;
        esac
    else
        fresh_installation
    fi
}

# Create project structure
create_structure() {
    print_info "Creating project structure..."
    
    mkdir -p "$CELLM_PROJECT_DIR"/{commands/agent-os,agents,skills,project/{product,specs}}
    
    print_success "Structure created"
}

# Copy commands
copy_commands() {
    if [ "$ENABLE_COMMANDS" = true ]; then
        print_info "Copying commands..."
        
        if [ -d "$PROFILE_DIR/commands" ]; then
            cp -r "$PROFILE_DIR/commands/"* "$CELLM_PROJECT_DIR/commands/agent-os/" 2>/dev/null || true
        fi
        
        print_success "Commands copied"
    else
        print_info "Skipping commands (disabled)"
    fi
}

# Copy agents
copy_agents() {
    if [ "$ENABLE_SUBAGENTS" = true ]; then
        print_info "Copying agents..."
        
        if [ -d "$PROFILE_DIR/agents" ]; then
            cp -r "$PROFILE_DIR/agents/"* "$CELLM_PROJECT_DIR/agents/" 2>/dev/null || true
        fi
        
        print_success "Agents copied"
    else
        print_info "Skipping agents (disabled)"
    fi
}

# Copy and convert skills
copy_skills() {
    if [ "$ENABLE_SKILLS" = true ]; then
        print_info "Copying skills..."
        
        if [ -d "$PROFILE_DIR/skills" ]; then
            cp -r "$PROFILE_DIR/skills/"* "$CELLM_PROJECT_DIR/skills/" 2>/dev/null || true
        fi
        
        # Convert standards to skills if present
        if [ -d "$PROFILE_DIR/standards" ]; then
            print_info "Converting standards to skills..."
            convert_standards_to_skills
        fi
        
        print_success "Skills copied"
    else
        print_info "Skipping skills (disabled)"
    fi
}

# Convert standards to skills
convert_standards_to_skills() {
    STANDARDS_DIR="$PROFILE_DIR/standards"
    SKILLS_DIR="$CELLM_PROJECT_DIR/skills"
    
    # Process each standard file
    find "$STANDARDS_DIR" -name "*.md" | while read -r file; do
        filename=$(basename "$file" .md)
        skill_dir="$SKILLS_DIR/$filename"
        
        mkdir -p "$skill_dir"
        
        # Create SKILL.md with frontmatter
        cat > "$skill_dir/SKILL.md" << EOF
---
name: $filename
description: Standard for $filename - automatically converted from CELLM standards
---

$(cat "$file")
EOF
    done
}

# Create project config
create_project_config() {
    print_info "Creating project config..."
    
    cat > "$CELLM_PROJECT_DIR/config.yaml" << EOF
# CELLM Project Configuration
# Generated: $(date +%Y-%m-%d)

project:
  name: "$(basename "$PROJECT_DIR")"
  profile: "$PROFILE"
  version: "$VERSION"
  
cellm:
  commands: $ENABLE_COMMANDS
  subagents: $ENABLE_SUBAGENTS
  skills: $ENABLE_SKILLS
  
# Active spec (set by /spec switch)
# active_spec: "2026-01-17-feature-name"
EOF
    
    print_success "Project config created"
}

# Create CLAUDE.md
create_claude_md() {
    print_info "Creating CLAUDE.md..."
    
    if [ ! -f "$PROJECT_DIR/CLAUDE.md" ]; then
        cat > "$PROJECT_DIR/CLAUDE.md" << EOF
# CLAUDE.md - Contexto do Projeto

> Este arquivo foi gerado pelo CELLM. Customize conforme necessário.

## Projeto

Nome: $(basename "$PROJECT_DIR")
Profile: $PROFILE

## Contexto

<context>
local: .claude/
index: .claude/index.md
</context>

## Referências

- Rules: .claude/rules/
- Patterns: .claude/patterns/
- Commands: .claude/commands/
- Skills: .claude/skills/

## Workflow

Use os comandos CELLM para desenvolvimento:

1. /plan-product - Definir missão e roadmap
2. /shape-spec - Pesquisar e definir requisitos
3. /write-spec - Escrever especificação
4. /create-tasks - Criar lista de tarefas
5. /implement - Implementar código
6. /verify - Verificar qualidade
EOF
        print_success "CLAUDE.md created"
    else
        print_info "CLAUDE.md already exists, skipping"
    fi
}

# Update installation
update_installation() {
    print_info "Updating installation..."
    
    # Backup project and specs
    BACKUP_DIR="$CELLM_PROJECT_DIR.backup.$(date +%Y%m%d%H%M%S)"
    
    if [ -d "$CELLM_PROJECT_DIR/project" ]; then
        mkdir -p "$BACKUP_DIR"
        cp -r "$CELLM_PROJECT_DIR/project" "$BACKUP_DIR/"
    fi
    
    # Remove non-project files
    rm -rf "$CELLM_PROJECT_DIR/commands"
    rm -rf "$CELLM_PROJECT_DIR/agents"
    rm -rf "$CELLM_PROJECT_DIR/skills"
    
    # Reinstall
    copy_commands
    copy_agents
    copy_skills
    create_project_config
    
    # Restore project files
    if [ -d "$BACKUP_DIR/project" ]; then
        cp -r "$BACKUP_DIR/project/"* "$CELLM_PROJECT_DIR/project/" 2>/dev/null || true
        rm -rf "$BACKUP_DIR"
    fi
    
    print_success "Update complete"
}

# Fresh installation
fresh_installation() {
    if [ -d "$CELLM_PROJECT_DIR" ]; then
        BACKUP_DIR="$CELLM_PROJECT_DIR.backup.$(date +%Y%m%d%H%M%S)"
        print_info "Backing up to $BACKUP_DIR..."
        mv "$CELLM_PROJECT_DIR" "$BACKUP_DIR"
    fi
    
    create_structure
    copy_commands
    copy_agents
    copy_skills
    create_project_config
    create_claude_md
    
    print_success "Installation complete"
}

# Show summary
show_summary() {
    echo ""
    echo -e "${GREEN}CELLM Project Installation Complete!${NC}"
    echo ""
    echo "Configuration:"
    echo "  Profile: $PROFILE"
    echo "  Commands: $ENABLE_COMMANDS"
    echo "  Subagents: $ENABLE_SUBAGENTS"
    echo "  Skills: $ENABLE_SKILLS"
    echo ""
    echo "Installed to: $CELLM_PROJECT_DIR"
    echo ""
    echo "Next steps:"
    echo "  1. Review CLAUDE.md in project root"
    echo "  2. Customize .claude/project/product/mission.md"
    echo "  3. Start with /plan-product or /shape-spec"
    echo ""
}

# Main
main() {
    print_header
    parse_args "$@"
    check_prerequisites
    check_existing
    show_summary
}

main "$@"
