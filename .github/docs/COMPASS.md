# Compass Dashboard

> [Home](../README.md) > [Docs](README.md) > **Compass**

Guide to CELLM's visual dashboard interface.

---

## Overview

Compass is a real-time dashboard that provides visual insights into your development process. Built with Nuxt UI, it offers an intuitive interface for monitoring CELLM activity.

---

## Access

Compass auto-starts with the CELLM plugin:

```
http://localhost:3000/compass
```

Or if using custom port:

```
http://localhost:{ORACLE_PORT}/compass
```

---

## Dashboard Sections

### Overview

**Project summary and health status**

| Metric | Description |
|--------|-------------|
| Project Name | Current active project |
| Session Status | Active, completed, abandoned |
| Uptime | Time since Oracle started |
| Health | System status indicators |

### Patterns

**Active patterns and usage statistics**

- List of discovered patterns
- Usage count per pattern
- Last used timestamp
- Pattern categories

### Sessions

**Development session history**

| Field | Description |
|-------|-------------|
| Session ID | Unique identifier |
| Start Time | When session began |
| End Time | When session ended |
| Status | active / completed / abandoned |
| Commands | Commands executed |

### Agents

**Agent activity and task completion**

- Active agents
- Tasks completed per agent
- Agent execution history
- Performance metrics

### Intelligence Hub

**Rules, patterns, and observations**

- View loaded rules
- Browse pattern library
- Search observations
- Context inspection

### Orchestrator

**Real-time terminal with MCP request logs**

- Live MCP requests
- Response times
- Error tracking
- Debug output

### Action Center

**Approve or reject dangerous operations**

When a dangerous operation is detected:

1. Operation appears in Action Center
2. Shows command and context
3. Approve or Reject buttons
4. 5-minute timeout (auto-reject)

**Dangerous operations:**
- `rm -rf` commands
- `git push --force`
- Database drops
- Destructive file operations

---

## Features

### Real-Time Updates

Compass uses WebSocket for live updates:

- Instant status changes
- Live operation tracking
- No manual refresh needed

### Dark Mode

Supports system dark mode:

- Automatic detection
- Manual toggle available
- Consistent with Nuxt UI

### Responsive Design

Works on all screen sizes:

- Desktop optimized
- Tablet friendly
- Mobile accessible

---

## Configuration

### Port Configuration

Default port is 3000. To change:

```bash
# In .env file
COMPASS_PORT=31415
```

### Theme

Compass uses Nuxt UI semantic tokens:

| Token | Usage |
|-------|-------|
| `primary` | Main actions |
| `neutral` | Text and borders |
| `error` | Error states |
| `warning` | Warnings |
| `success` | Success states |

---

## Navigation

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `?` | Show help |
| `/` | Focus search |
| `Esc` | Close modal |
| `r` | Refresh data |

### Quick Actions

- **Status badge** - Click for details
- **Session row** - Click to expand
- **Pattern card** - Click for full view
- **Action button** - Approve/Reject

---

## Troubleshooting

### Dashboard Not Loading

```bash
# Check if Oracle is running
claude /oracle-status

# Check port availability
lsof -i :3000
```

### WebSocket Disconnected

```bash
# Restart Oracle worker
pkill -f oracle
bun scripts/spawn-worker.sh
```

### Slow Performance

- Check browser console for errors
- Clear browser cache
- Reduce observation history

---

## Related Documentation

- [Oracle Documentation](oracle.md) - Backend details
- [Installation Guide](installation.md) - Setup
- [Troubleshooting](troubleshooting.md) - More solutions

[Back to Docs](README.md) | [Back to Home](../README.md)
