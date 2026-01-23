---
description: Check CELLM Oracle Worker status and health
---

# Oracle Status

Check the status of the CELLM Oracle Worker daemon.

## Instructions

1. Check if Worker is running by reading `~/.cellm/worker.json`
2. If running, call the health endpoint to get status
3. Report version, uptime, and database status

## Execution

```bash
# Check worker.json
if [ -f ~/.cellm/worker.json ]; then
  PORT=$(grep -o '"port"[[:space:]]*:[[:space:]]*[0-9]*' ~/.cellm/worker.json | grep -o '[0-9]*')

  # Get health status
  HEALTH=$(curl -sf "http://127.0.0.1:${PORT}/health" 2>/dev/null)
  if [ $? -eq 0 ]; then
    echo "[+] Oracle Worker online at port ${PORT}"

    # Get detailed status
    curl -sf "http://127.0.0.1:${PORT}/api/status" | jq .
  else
    echo "[-] Oracle Worker offline (port ${PORT})"
    echo "    Start with: cd oracle && bun --bun worker/index.ts"
  fi
else
  echo "[-] Oracle Worker not configured"
  echo "    No ~/.cellm/worker.json found"
fi
```

## Output Format

Report the following information:

| Field | Description |
|-------|-------------|
| Status | online/offline |
| Port | Worker port (default: 31415) |
| Version | Current version |
| Uptime | Time since start |
| Database | DB path and vec version |
| Pipeline | Events received/processed |
