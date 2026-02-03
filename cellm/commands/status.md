---
id: CMD-ORACLE-STATUS
version: v1.2.0
status: OK
name: status
agent: project-manager
budget: ~150 tokens
---

# Oracle Status

Check CELLM Oracle Worker daemon status.

## Process

1. Read `~/.cellm/worker.json` for port config
2. Call health endpoint if worker file exists
3. Report status in table format

## Execution

```bash
if [ -f ~/.cellm/worker.json ]; then
  PORT=$(grep -o '"port"[[:space:]]*:[[:space:]]*[0-9]*' ~/.cellm/worker.json | grep -o '[0-9]*')
  curl -sf "http://127.0.0.1:${PORT}/health" && \
    curl -sf "http://127.0.0.1:${PORT}/api/status" | jq . || \
    echo "[-] Worker offline at port ${PORT}"
else
  echo "[-] No ~/.cellm/worker.json found"
fi
```

## Output

| Field | Description |
|-------|-------------|
| Status | online/offline |
| Port | Worker port (31415) |
| Uptime | Time since start |
| Database | DB path and version |
