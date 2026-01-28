# Troubleshooting Guide

> [Home](../README.md) > [Docs](README.md) > **Troubleshooting**

Solutions to common CELLM issues.

---

## Quick Diagnostics

Run these commands first:

```bash
# Check plugin status
/plugin list

# Check Oracle health
/oracle-status

# Check Bun version
bun --version
```

---

## Installation Issues

### Plugin Not Found

**Symptom:** `/plugin marketplace add` or `/plugin install` fails

**Solutions:**

1. **Check internet connection**
   ```bash
   ping github.com
   ```

2. **Verify GitHub access**
   ```bash
   curl -I https://github.com/murillodutt/cellm
   ```

3. **Try manual install**
   ```bash
   git clone https://github.com/murillodutt/cellm.git ~/.claude/plugins/cellm
   ```

4. **Update Claude Code CLI**
   ```bash
   # Follow update instructions at claude.ai/download
   ```

---

### Bun Not Found

**Symptom:** "bun: command not found"

**Solutions:**

1. **Install Bun**
   ```bash
   curl -fsSL https://bun.sh/install | bash
   ```

2. **Reload shell**
   ```bash
   source ~/.bashrc  # or ~/.zshrc
   ```

3. **Verify installation**
   ```bash
   bun --version
   # Should be 1.0+
   ```

---

### Plugin Already Exists

**Symptom:** "Plugin cellm already installed"

**Solutions:**

1. **Remove and reinstall**
   ```bash
   /plugin uninstall cellm
   /plugin install cellm
   ```

2. **Or manual removal**
   ```bash
   rm -rf ~/.claude/plugins/cellm
   /plugin marketplace add murillodutt/cellm
   /plugin install cellm
   ```

---

## Oracle Issues

### Worker Not Starting

**Symptom:** `/oracle-status` shows "Worker: Offline"

**Solutions:**

1. **Check Bun**
   ```bash
   bun --version
   ```

2. **Start manually**
   ```bash
   cd ~/.claude/plugins/cellm
   bun scripts/spawn-worker.sh
   ```

3. **Check logs**
   ```bash
   tail -f ~/.cellm/logs/oracle-worker.log
   ```

4. **Check for port conflict**
   ```bash
   lsof -i :31415
   ```

---

### MCP Server Connection Failed

**Symptom:** Cannot connect to MCP server

**Solutions:**

1. **Check port**
   ```bash
   lsof -i :3001
   ```

2. **Restart server**
   ```bash
   pkill -f oracle-mcp
   bun scripts/spawn-worker.sh
   ```

3. **Check firewall**
   - Ensure localhost:3001 is accessible
   - Check if VPN is blocking

4. **Reset configuration**
   ```bash
   rm ~/.cellm/worker.json
   /plugin restart cellm
   ```

---

### Database Errors

**Symptom:** SQLite errors, database locked, corruption

**Solutions:**

1. **Reset database**
   ```bash
   rm ~/.cellm/oracle.db
   /plugin restart cellm
   ```

2. **Rebuild embeddings**
   ```bash
   /index-patterns --rebuild
   ```

3. **Check disk space**
   ```bash
   df -h ~/.cellm
   ```

---

### Search Not Working

**Symptom:** No results, slow searches, timeout

**Solutions:**

1. **Check Oracle status**
   ```bash
   /oracle-status
   ```

2. **Verify embeddings**
   ```bash
   curl http://localhost:31415/api/status
   ```

3. **Rebuild index**
   ```bash
   /index-patterns --rebuild
   ```

4. **Check memory**
   - Embeddings require ~200MB RAM
   - Close other applications if needed

---

## Skills Issues

### Skills Not Loading

**Symptom:** Framework skills not detected

**Solutions:**

1. **Verify file patterns**
   - Skills trigger on specific file types
   - Ensure files match patterns (e.g., `*.vue`)

2. **Check plugin.json**
   ```bash
   cat ~/.claude/plugins/cellm/.claude-plugin/plugin.json
   ```

3. **Restart session**
   - Close and reopen Claude Code

4. **Clear cache**
   ```bash
   rm -rf ~/.claude/cache/cellm
   ```

---

### Wrong Skill Activated

**Symptom:** Incorrect framework guidance

**Solutions:**

1. **Check file extension**
   - `.vue` files trigger Vue skill
   - `.ts` files trigger TypeScript skill

2. **Verify project structure**
   - `stores/` triggers Pinia
   - `db/` triggers Drizzle

3. **Report issue**
   - If skill triggers incorrectly
   - Open GitHub issue with details

---

## Command Issues

### Command Not Found

**Symptom:** `/command` not recognized

**Solutions:**

1. **Verify plugin installed**
   ```bash
   /plugin list
   ```

2. **Check command exists**
   ```bash
   ls ~/.claude/plugins/cellm/commands/
   ```

3. **Restart Claude Code**
   - Close and reopen

---

### Command Fails

**Symptom:** Command errors, unexpected behavior

**Solutions:**

1. **Check prerequisites**
   - Some commands require plan mode
   - Some require spec files

2. **Read error message**
   - Often explains what's wrong
   - Follow suggested fix

3. **Check logs**
   ```bash
   tail -f ~/.cellm/logs/commands.log
   ```

---

## Dashboard Issues

### Compass Not Loading

**Symptom:** Dashboard blank or error

**Solutions:**

1. **Check Oracle running**
   ```bash
   /oracle-status
   ```

2. **Check port**
   ```bash
   lsof -i :3000
   ```

3. **Clear browser cache**
   - Hard refresh (Cmd+Shift+R)

4. **Try different browser**
   - Rule out browser issues

---

### WebSocket Disconnected

**Symptom:** "Connection lost" in dashboard

**Solutions:**

1. **Check network**
   - Ensure stable connection

2. **Restart Oracle**
   ```bash
   pkill -f oracle
   bun scripts/spawn-worker.sh
   ```

3. **Refresh page**
   - WebSocket auto-reconnects

---

## Performance Issues

### Slow Responses

**Symptom:** Commands take too long

**Solutions:**

1. **Check system resources**
   ```bash
   top -o cpu
   ```

2. **Reduce history**
   - Large observation history slows queries

3. **Clear cache**
   ```bash
   rm -rf ~/.cellm/cache
   ```

4. **Rebuild database**
   ```bash
   rm ~/.cellm/oracle.db
   claude /plugin restart cellm
   ```

---

### High Memory Usage

**Symptom:** Oracle using too much RAM

**Solutions:**

1. **Check usage**
   ```bash
   ps aux | grep oracle
   ```

2. **Reduce cache size**
   ```bash
   # In .env
   ORACLE_CACHE_SIZE=500
   ```

3. **Restart worker**
   ```bash
   pkill -f oracle
   bun scripts/spawn-worker.sh
   ```

---

## Getting More Help

### Collect Debug Info

Before reporting issues, collect:

```bash
# System info
uname -a
bun --version

# Plugin status
/plugin list
/oracle-status

# Logs
tail -100 ~/.cellm/logs/oracle-worker.log
```

### Report Issue

1. Go to [GitHub Issues](https://github.com/murillodutt/cellm/issues)
2. Use issue template
3. Include debug info
4. Describe steps to reproduce

### Ask for Help

- [GitHub Discussions](https://github.com/murillodutt/cellm/discussions)
- Q&A category for questions

---

## Related Documentation

- [Installation Guide](installation.md) - Setup steps
- [Oracle Documentation](oracle.md) - Backend details
- [FAQ](faq.md) - Frequently asked questions

[Back to Docs](README.md) | [Back to Home](../README.md)
