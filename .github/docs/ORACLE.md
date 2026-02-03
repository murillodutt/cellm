# Oracle Documentation

> [Home](../README.md) > [Docs](INDEX.md) > **Oracle**

Complete guide to the Oracle NPM package and MCP server.

---

## Overview

Oracle is CELLM's intelligent memory system. It provides:

- **Semantic Search** - Find code using natural language
- **Session Memory** - Context that persists across sessions
- **Pattern Tracking** - Know what patterns are used where
- **Local-First** - All data stays on your machine

---

## NPM Package

Oracle is available as a standalone NPM package:

```bash
npm install @cellm/oracle
```

**Package:** [@cellm/oracle](https://www.npmjs.com/package/@cellm/oracle)

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│              Oracle MCP Server                   │
│                                                  │
│  ┌────────────────────────────────────────────┐ │
│  │         Semantic Search Engine              │ │
│  │                                              │ │
│  │  • Natural language queries                 │ │
│  │  • Cosine similarity matching               │ │
│  │  • Hybrid search (semantic + metadata)      │ │
│  └────────────────────────────────────────────┘ │
│                                                  │
│  ┌────────────────────────────────────────────┐ │
│  │         Embedding Engine                    │ │
│  │                                              │ │
│  │  • Xenova/multilingual-e5-base model        │ │
│  │  • 768-dimensional vectors                  │ │
│  │  • Local inference (no API calls)           │ │
│  └────────────────────────────────────────────┘ │
│                                                  │
│  ┌────────────────────────────────────────────┐ │
│  │         SQLite + sqlite-vec                 │ │
│  │                                              │ │
│  │  • Observations (metadata)                  │ │
│  │  • Embeddings (vectors)                     │ │
│  │  • Sessions                                 │ │
│  └────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

---

## Database Schema

**Location:** `~/.cellm/oracle.db`

### Tables

**observations** - Project events and context
```sql
CREATE TABLE observations (
  id INTEGER PRIMARY KEY,
  type TEXT NOT NULL,           -- 'command', 'session', 'pattern'
  project TEXT,                 -- Project identifier
  content TEXT NOT NULL,        -- Full content
  metadata JSON,                -- Structured metadata
  timestamp INTEGER NOT NULL    -- Unix timestamp
);
```

**embeddings** - Vector representations
```sql
CREATE TABLE embeddings (
  id INTEGER PRIMARY KEY,
  observation_id INTEGER NOT NULL,
  embedding BLOB NOT NULL,      -- 768-dim float32 vector
  model TEXT NOT NULL,          -- 'xenova/multilingual-e5-base'
  FOREIGN KEY (observation_id) REFERENCES observations(id)
);
```

**sessions** - Development sessions
```sql
CREATE TABLE sessions (
  id INTEGER PRIMARY KEY,
  project TEXT NOT NULL,
  start_time INTEGER NOT NULL,
  end_time INTEGER,
  status TEXT NOT NULL          -- 'active', 'completed', 'abandoned'
);
```

---

## Embedding Model

| Property | Value |
|----------|-------|
| **Model** | Xenova/multilingual-e5-base |
| **Dimensions** | 768 |
| **Languages** | 100+ supported |
| **Provider** | Transformers.js |
| **Inference** | Local (no API calls) |
| **Speed** | ~100ms per text |

### Why This Model?

- Runs locally (privacy)
- Fast inference
- Multilingual support
- Good accuracy/speed balance

---

## Search Strategies

### 1. Hybrid Search (Default)

Combines semantic + metadata filtering:

```
Query: "authentication with JWT"
→ Semantic: Find similar concepts
→ Metadata: Filter by type='pattern'
→ Result: Ranked list of matches
```

Best for most use cases.

### 2. Semantic Search

Pure vector similarity:

```
Query: "login form validation"
→ Compute embedding
→ Cosine similarity search
→ Return top-K similar
```

Best for finding similar concepts.

### 3. Metadata Search

Structured filtering:

```
Filter: type='session', project='my-app'
→ Direct database query
→ Fast performance
```

Best for specific queries.

---

## Caching

### Semantic Cache

- **Threshold:** 95%+ similarity
- **Purpose:** Avoid duplicate embeddings
- **Benefit:** Significantly reduces computation

### Query Cache

- **TTL:** 5 minutes
- **Purpose:** Cache recent queries
- **Benefit:** Faster response times

---

## MCP Integration

Oracle exposes tools through MCP protocol:

### Tools

| Tool | Purpose |
|------|---------|
| `search(query, limit, filters)` | Semantic search |
| `timeline(anchor, depth)` | Context around results |
| `get_observations(ids)` | Fetch specific records |
| `get_context(session_id)` | Session context |

### Example Usage

```typescript
// Search for patterns
const results = await oracle.search({
  query: 'authentication flow',
  limit: 10,
  filters: { type: 'pattern' }
})

// Get timeline context
const context = await oracle.timeline({
  anchor: results[0].id,
  depth: 5
})
```

---

## REST API

### Health Check

```
GET /health
```

Response:
```json
{
  "status": "healthy",
  "uptime": "2h 34m",
  "version": "2.0.5"
}
```

### Status

```
GET /api/status
```

Response:
```json
{
  "worker": "online",
  "port": 31415,
  "database": {
    "path": "~/.cellm/oracle.db",
    "size": "12.4 MB"
  },
  "embeddings": {
    "model": "xenova/multilingual-e5-base",
    "loaded": true
  }
}
```

### Orchestrator Logs

```
GET /api/orchestrator/logs
```

Returns MCP request logs for debugging.

### Action Center

```
GET /api/actions/pending
POST /api/actions/:id/approve
POST /api/actions/:id/reject
```

For dangerous operation approval workflow.

### Pattern Lifecycle API

```
GET /api/patterns                 # List patterns with metrics
GET /api/patterns/export          # Export to Markdown
GET /api/patterns/relations       # Get duplicates/conflicts
GET /api/patterns/candidates      # Get promotion candidates
POST /api/patterns/promote        # Promote to pattern
POST /api/patterns/:id/feedback   # Record feedback
```

---

## WebSocket Events

**Endpoint:** `WS /_ws`

Real-time event streaming for:

| Event | Description |
|-------|-------------|
| `session.start` | Session started |
| `session.end` | Session ended |
| `observation.created` | New observation |
| `pattern.matched` | Pattern triggered |
| `action.pending` | Dangerous operation waiting |
| `action.resolved` | Operation approved/rejected |

---

## Performance

### Latency Targets

| Operation | Target | Typical |
|-----------|--------|---------|
| Search query | < 2s | ~800ms |
| Embedding generation | < 500ms | ~150ms |
| Health check | < 100ms | ~10ms |
| Cache hit | < 10ms | ~5ms |

### Resource Usage

| Resource | Idle | Active |
|----------|------|--------|
| RAM | ~50MB | ~200MB |
| CPU | < 1% | ~5-10% |
| Disk | ~100MB | ~500MB (with cache) |

### Scalability

- **Projects:** 1,000+ files tested
- **Observations:** 100,000+ records
- **Embeddings:** 50,000+ vectors
- **Sessions:** 10+ concurrent

---

## Configuration

### Environment Variables

```bash
# Oracle Configuration
ORACLE_PORT=31415                   # Server port (default)
ORACLE_LOG_LEVEL=info              # Logging level
ORACLE_DB_PATH=~/.cellm/oracle.db  # Database path

# Embedding Configuration
ORACLE_MODEL=xenova/multilingual-e5-base
ORACLE_DIMENSIONS=768

# Performance
ORACLE_BATCH_SIZE=100              # Batch size
ORACLE_CACHE_SIZE=1000             # Cache entries
```

### Worker Configuration

**File:** `~/.cellm/worker.json`

```json
{
  "port": 31415,
  "pid": 12345,
  "started": "2026-01-27T10:00:00Z"
}
```

---

## Action Center

Dangerous operations are automatically paused for approval:

### Detected Operations

- `rm -rf` commands
- `git push --force`
- Database drops
- Destructive file operations

### Workflow

1. Dangerous operation detected
2. Operation paused (5 minute timeout)
3. User approves or rejects via API
4. Operation executes or cancels

### API

```bash
# List pending actions
curl http://localhost:31415/api/actions/pending

# Approve action
curl -X POST http://localhost:31415/api/actions/{id}/approve

# Reject action
curl -X POST http://localhost:31415/api/actions/{id}/reject
```

---

## Troubleshooting

### Worker Not Starting

```bash
# Use interactive setup
claude /cellm-init

# Or use Doctor mode
claude /cellm-init doctor

# Check logs
tail -f ~/.cellm/logs/oracle-worker.log
```

### Database Errors

```bash
# Reset database
rm ~/.cellm/oracle.db

# Restart plugin
claude /plugin restart cellm
```

### Search Not Working

```bash
# Check worker status
claude /oracle-status

# Verify embeddings loaded
curl http://localhost:31415/api/status
```

---

## Related Documentation

- [Installation Guide](INSTALLATION.md) - Setup
- [Features Overview](FEATURES.md) - All features
- [Technical Specs](TECHNICAL-SPECS.md) - Architecture details
- [Compass Dashboard](COMPASS.md) - Visual interface

[Back to Docs](INDEX.md) | [Back to Home](../README.md)
