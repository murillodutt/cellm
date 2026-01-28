# Getting Started

> [Home](../README.md) > [Docs](README.md) > **Getting Started**

Get CELLM running in 5 minutes.

---

## Step 1: Install (30 seconds)

```bash
/plugin marketplace add murillodutt/cellm
/plugin install cellm
```

---

## Step 2: Verify (30 seconds)

```bash
/oracle-status
```

You should see:

```
[+] Oracle Worker: Running
[+] MCP Server: Connected
[+] Database: Ready
[+] Embeddings: Loaded
```

---

## Step 3: Try It (2 minutes)

### Ask Claude Something

```bash
# In Claude Code session
"create a Vue 3 component with TypeScript"
```

**Notice:** Claude already knows:
- Use Composition API (`<script setup>`)
- Use TypeScript (`lang="ts"`)
- Follow your project patterns

### Try a Command

```bash
/plan-product "user authentication"
```

Claude will guide you through planning with:
- Mission definition
- Tech stack recommendations
- Roadmap suggestions

---

## Step 4: Explore (2 minutes)

### Check the Dashboard

Open in browser:
```
http://localhost:3000/compass
```

See your:
- Project stats
- Pattern usage
- Session history

### View Available Commands

| Command | What It Does |
|---------|-------------|
| `/plan-product` | Plan a new feature |
| `/shape-spec` | Define requirements |
| `/create-tasks` | Break into tasks |
| `/implement` | Generate code |
| `/verify` | Validate quality |

### Understand Skills

CELLM loads knowledge automatically:

| When You Work With | CELLM Knows |
|-------------------|-------------|
| `*.vue` files | Vue 3 + Nuxt 4 patterns |
| `*.ts` files | TypeScript best practices |
| `stores/**` | Pinia patterns |
| `db/**` | Drizzle ORM patterns |

---

## What Just Happened?

1. **Plugin Installed** - CELLM is now part of Claude Code
2. **Oracle Started** - Semantic memory is running
3. **Skills Loaded** - Framework knowledge is active
4. **Context Ready** - Claude knows your project

---

## Next Steps

### Learn More

- [Features Overview](features.md) - All capabilities
- [Commands Reference](commands.md) - Every command explained
- [Skills Guide](skills.md) - Framework knowledge details

### Common Workflows

**Build a Feature:**
```bash
/plan-product "my feature"
/shape-spec
/create-tasks
/implement
/verify
```

**Find Patterns:**
```bash
/discover-patterns
```

**Check Status:**
```bash
/oracle-status
```

---

## Troubleshooting

### Oracle Not Starting?

```bash
# Check Bun is installed
bun --version

# Should be 1.0+
```

### Commands Not Working?

```bash
# Verify plugin is installed
/plugin list

# Should show: cellm
```

### Need More Help?

- [Full Installation Guide](installation.md)
- [Troubleshooting Guide](troubleshooting.md)
- [GitHub Issues](https://github.com/murillodutt/cellm/issues)

---

## Quick Reference Card

| Action | Command |
|--------|---------|
| Install | `/plugin marketplace add murillodutt/cellm
/plugin install cellm` |
| Status | `/oracle-status` |
| Plan | `/plan-product "feature"` |
| Tasks | `/create-tasks` |
| Build | `/implement` |
| Verify | `/verify` |
| Dashboard | `http://localhost:3000/compass` |

---

[Back to Docs](README.md) | [Back to Home](../README.md)
