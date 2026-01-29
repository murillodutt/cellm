---
name: cellm-init
description: Interactive Oracle setup with menus and guided troubleshooting
usage: /cellm-init [mode]
arguments:
  - name: mode
    description: Optional mode (install|status|update|doctor|restart|uninstall) - omit for interactive menu
    required: false
agent: none
budget: ~150
---

# CELLM Init

Interactive Oracle worker management with guided menus and automatic troubleshooting.

## Purpose

Initialize Oracle worker daemon for enhanced context features:
- Semantic search across project context
- Persistent memory between sessions
- Pattern discovery and suggestions
- Visual dashboard (Compass)

**Note**: CELLM works standalone without Oracle. This command is for optional enhancement features.

## Interactive Mode

Run without arguments to access the interactive menu:

```bash
/cellm-init
```

### Main Menu

```
╔══════════════════════════════════════════════════════════╗
║  CELLM Oracle Setup
╚══════════════════════════════════════════════════════════╝

What would you like to do?

  1. Install Oracle (first time setup)
  2. Check Status (view current state)
  3. Update (upgrade to latest version)
  4. Doctor (diagnose and fix issues)
  5. Restart Worker (if stuck or slow)
  6. Uninstall (remove Oracle completely)
  7. Advanced Options
  8. Exit

Choose option [1-8]:
```

### Advanced Options Menu

```
╔══════════════════════════════════════════════════════════╗
║  CELLM Oracle - Advanced Options
╚══════════════════════════════════════════════════════════╝

Advanced Configuration:

  1. Change Worker Port (current: 31415)
  2. Change Data Directory (current: ~/.cellm)
  3. View Logs
  4. Clear Cache
  5. Reset Configuration
  6. Back to Main Menu

Choose option [1-6]:
```

## Command-Line Mode

Use specific modes for automation or scripting:

```bash
# Install (first time)
/cellm-init install

# Check status
/cellm-init status

# Update to latest version
/cellm-init update

# Run diagnostics
/cellm-init doctor

# Restart worker
/cellm-init restart

# Uninstall completely
/cellm-init uninstall
```

## Installation Flow

When selecting "Install Oracle":

```
Step 1/5: Checking dependencies...
  [+] Bun 1.2.x found
  [+] bunx available

Step 2/5: Installing @cellm-ai/oracle...
  [~] Downloading from NPM...
  [+] Installed v1.0.0

Step 3/5: Starting worker daemon...
  [~] Spawning process on port 31415...
  [+] Worker started (PID: 12345)
  [+] Worker is responsive

Step 4/5: Validating health...
  [~] Testing /health endpoint...
  [+] Worker is healthy (response: 45ms)

Step 5/5: Finalizing setup...
  [+] Created marker file
  [!] MCP not activated yet

Activate MCP tools now? [Y/n]: y
  [+] MCP activated

[+] Setup complete!

  [i] Run '/oracle-status' to verify worker status
  [i] Logs available at: ~/.cellm/logs
```

## Status Display

Select "Check Status" to view current state:

```
╔══════════════════════════════════════════════════════════╗
║  Oracle Worker Status
╚══════════════════════════════════════════════════════════╝

  [+] Installed: YES (2026-01-27T19:30:00Z)
  [+] Running: YES
  [+] Healthy: YES
  [i] Version: 1.0.0

Database:
  [i] Location: ~/.cellm/compass/compass.db
  [i] Size: 2.4 MB

MCP Integration:
  [+] Activated: YES
```

## Doctor Mode

Select "Doctor" for guided diagnostics:

```
╔══════════════════════════════════════════════════════════╗
║  Oracle Doctor - Diagnostic Mode
╚══════════════════════════════════════════════════════════╝

Running diagnostics...

  [i] [1/6] Checking dependencies...
  [+] Dependencies OK

  [i] [2/6] Checking installation...
  [+] Oracle installed

  [i] [3/6] Checking worker status...
  [-] Worker not running
  Start worker? [Y/n]: y
  [+] Worker started

  [i] [4/6] Checking port availability...
  [+] Port 31415 in use (expected)

  [i] [5/6] Checking database...
  [+] Database exists

  [i] [6/6] Checking MCP configuration...
  [+] MCP configured

╔══════════════════════════════════════════════════════════╗
║  Diagnostic Summary
╚══════════════════════════════════════════════════════════╝
  Issues found: 1
  Fixes applied: 1

[+] Applied 1 fix(es)
```

## Advanced Features

### Change Worker Port

1. Select "Advanced Options" → "Change Worker Port"
2. Enter new port (1024-65535)
3. Restart worker to apply

### View Logs

Displays last 50 lines of logs:

```
  [i] Recent logs (last 50 lines):

[2026-01-27 19:30:00] [+] Worker started
[2026-01-27 19:30:02] [+] Health check passed
[2026-01-27 19:31:15] [i] MCP request received
...

Press Enter to continue...
```

### Clear Cache

Removes all cached data (observations preserved):

```
  [!] This will clear all cached data
Continue? [y/N]: y
  [+] Cache cleared
```

### Reset Configuration

Resets settings to defaults (database preserved):

```
  [!] This will reset all Oracle settings to defaults
  [!] Database and observations will NOT be deleted
Continue? [y/N]: y
  [+] Configuration reset
```

## Interactive Confirmations

The script asks for confirmation on critical operations:

- **MCP Activation**: "Activate MCP tools now? [Y/n]"
- **Worker Start**: "Start worker now? [Y/n]"
- **Update Apply**: "Restart worker to apply update? [Y/n]"
- **Uninstall**: "Continue with uninstall? [y/N]" (default: No)
- **Cache Clear**: "Continue? [y/N]" (default: No)

Default to "Yes" for convenience, "No" for destructive operations.

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | Dependencies missing |
| 2 | Installation failed |
| 3 | Worker spawn failed |
| 4 | Health check failed |

## Smart Features

### Auto-Detection
- Detects if Oracle is already installed
- Detects if worker is running
- Detects if MCP is configured
- Prefers Bun over Node when available

### Graceful Degradation
- Works without Bun (uses Node)
- Continues if optional steps fail
- Provides clear error messages

### Progress Feedback
- Color-coded output (green=success, red=error, yellow=warning)
- Step counters (1/5, 2/5, etc.)
- Estimated time for long operations

### Return to Menu
- After completing any operation in interactive mode
- Press Enter to return to menu
- Ctrl+C to exit at any time

## Related Commands

- `/oracle-status` - Quick health check (read-only)
- Check logs: `tail -f ~/.cellm/logs/init-oracle.log`
- Worker logs: `tail -f ~/.cellm/logs/oracle-worker.log`

## Troubleshooting

If installation fails, run Doctor mode:

```bash
/cellm-init doctor
```

Doctor will:
1. Check dependencies
2. Verify installation
3. Test worker status
4. Check port availability
5. Validate database
6. Verify MCP configuration

And offer to fix each issue automatically.

## Examples

### First Time Setup
```bash
# Interactive (recommended)
/cellm-init

# Or direct
/cellm-init install
```

### Check if Everything Works
```bash
/cellm-init status
```

### Fix Issues
```bash
/cellm-init doctor
```

### Update
```bash
/cellm-init update
```

### Performance Issues
```bash
# Restart worker
/cellm-init restart

# Or clear cache
/cellm-init
# → Select "Advanced Options" → "Clear Cache"
```

### Complete Removal
```bash
/cellm-init uninstall

# To also remove data
rm -rf ~/.cellm
```
