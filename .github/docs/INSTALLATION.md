# Installation Guide

> [Home](../README.md) > [Docs](README.md) > **Installation**

Complete guide to installing and configuring CELLM.

---

## Quick Install (60 seconds)

```bash
# Install the plugin
claude /install-plugin murillodutt/cellm

# Verify it's working
claude /oracle-status

# Start using
claude "create a new Nuxt component with Tailwind"
```

**That's it.** AI now knows your project.

---

## Prerequisites

Before installing CELLM, ensure you have:

### Required

| Tool | Minimum Version | Purpose |
|------|----------------|---------|
| **Bun** | 1.0+ | Runtime for MCP server |
| **Claude Code CLI** | Latest | Claude integration |
| **Git** | 2.30+ | Version control |

### Operating System

- macOS 12+ (recommended: macOS 14+)
- Linux (Ubuntu 22.04+ or equivalent)
- Windows 10+ (with WSL2 recommended)

### Installing Prerequisites

**Install Bun:**
```bash
curl -fsSL https://bun.sh/install | bash
```

**Install Claude Code CLI:**
```bash
# Follow instructions at https://claude.ai/download
```

---

## Installation Methods

### Method 1: Direct Install (Recommended)

```bash
claude /install-plugin murillodutt/cellm
```

This command:
1. Downloads the plugin from GitHub
2. Installs to `~/.claude/plugins/`
3. Configures hooks automatically
4. Oracle activation is optional (see below)

### Method 2: Via Marketplace

```bash
# Add to marketplace
claude /plugin marketplace add murillodutt/cellm

# Install
claude /plugin install cellm@murillodutt-cellm
```

### Method 3: Manual Install (Development)

```bash
# Clone repository
git clone https://github.com/murillodutt/cellm.git ~/.claude/plugins/cellm

# Navigate to plugin directory
cd ~/.claude/plugins/cellm

# Install dependencies (if developing)
bun install
```

---

## Oracle Setup (Optional)

Oracle provides semantic search and persistent memory. To activate:

```bash
# Interactive setup (recommended)
claude /cellm-init

# Or direct install
claude /cellm-init install
```

**Features:**
- Interactive menu with guided setup
- Doctor mode for diagnostics
- Advanced configuration options
- Update and maintenance tools

---

## Verification

### Check Plugin Status

```bash
# List installed plugins
claude /plugin list

# Check Oracle health (if installed)
claude /oracle-status
```

Expected output (with Oracle):
```
[+] Oracle Worker: Running
[+] MCP Server: Connected
[+] Database: Ready
[+] Embeddings: Loaded
```

### Test Basic Functionality

```bash
# Test semantic search
claude /discover-patterns

# Test skills
claude "show me Nuxt patterns"

# Test agents
claude /plan-product "test feature"
```

---

## Configuration

### Plugin Location

```
~/.claude/plugins/cellm/
├── .claude-plugin/
│   ├── plugin.json          # Plugin manifest
│   ├── hooks.json           # Event hooks
│   └── .mcp.json           # MCP server config
├── commands/                # Workflow commands
├── agents/                  # Specialized agents
├── skills/                  # Framework skills
├── scripts/                 # Shell scripts
└── oracle/                  # Oracle MCP server
```

### Environment Variables

Create `~/.claude/plugins/cellm/.env` (optional):

```bash
# Oracle Configuration
ORACLE_PORT=3001                    # MCP server port
ORACLE_LOG_LEVEL=info              # Logging level
ORACLE_DB_PATH=~/.cellm/oracle.db  # Database location

# Embedding Configuration
ORACLE_MODEL=xenova/multilingual-e5-base  # Embedding model
ORACLE_DIMENSIONS=768                      # Vector dimensions

# Performance Tuning
ORACLE_BATCH_SIZE=100              # Batch size for embeddings
ORACLE_CACHE_SIZE=1000             # Semantic cache size
```

### Custom Configuration

Edit `~/.claude/plugins/cellm/.claude-plugin/plugin.json`:

```json
{
  "name": "cellm",
  "version": "2.0.5",
  "settings": {
    "autoStart": true,
    "enableHooks": true,
    "oraclePort": 31415
  }
}
```

---

## Post-Installation

### First Run Checklist

- [ ] Plugin installed successfully
- [ ] Oracle worker started
- [ ] MCP server connected
- [ ] Test command executed
- [ ] Compass dashboard accessible

### Access Compass Dashboard

```bash
# Compass auto-starts with plugin
# Open in browser: http://localhost:3000/compass
```

### Update Plugin

```bash
# Update to latest version
claude /plugin update cellm

# Or reinstall
claude /install-plugin murillodutt/cellm --force
```

---

## Troubleshooting

### Plugin Not Found

**Problem:** `claude /install-plugin` fails

**Solutions:**
1. Check internet connection
2. Verify GitHub access
3. Try manual install method
4. Check Claude Code CLI version

### Oracle Worker Not Starting

**Problem:** `oracle-status` shows "Worker: Offline"

**Solutions:**
```bash
# Run interactive setup
claude /cellm-init

# Or use Doctor mode for diagnostics
claude /cellm-init doctor

# Check logs
tail -f ~/.cellm/logs/oracle-worker.log
```

### MCP Server Connection Failed

**Problem:** Cannot connect to MCP server

**Solutions:**
```bash
# Check port availability
lsof -i :31415

# Use Doctor mode to diagnose
claude /cellm-init doctor

# Or restart worker
claude /cellm-init restart

# Check firewall settings
# Ensure localhost:31415 is accessible
```

### Skills Not Loading

**Problem:** Framework skills not detected

**Solutions:**
1. Verify file patterns match triggers
2. Check `plugin.json` skills configuration
3. Restart Claude Code session
4. Clear plugin cache

### Database Errors

**Problem:** SQLite database issues

**Solutions:**
```bash
# Reset database
rm ~/.cellm/oracle.db

# Restart plugin
claude /plugin restart cellm

# Rebuild embeddings
claude /index-patterns --rebuild
```

---

## Uninstallation

### Remove Plugin

```bash
# Uninstall via CLI
claude /plugin uninstall cellm

# Or manual removal
rm -rf ~/.claude/plugins/cellm
```

### Clean Data

```bash
# Remove Oracle data (optional)
rm -rf ~/.cellm

# Remove logs
rm -rf ~/.cellm/logs
```

---

## Next Steps

After successful installation:

1. **Quick Start** - [Getting Started Guide](getting-started.md)
2. **Explore Features** - [Features Guide](features.md)
3. **Learn Commands** - [Commands Reference](commands.md)
4. **Check Compass** - Visit dashboard at `http://localhost:3000/compass`

---

## Related Documentation

- [Getting Started](getting-started.md) - Quick 5-minute setup
- [Features](features.md) - What's included
- [Commands](commands.md) - All commands reference
- [Troubleshooting](troubleshooting.md) - More solutions

[Back to Docs](README.md) | [Back to Home](../README.md)
