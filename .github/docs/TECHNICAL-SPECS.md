# Technical Specifications

> [Home](../README.md) > **Technical Specs**

Deep dive into CELLM's architecture and technical details.

---

## Stack Support

### Supported Technologies

CELLM is optimized exclusively for this modern stack:

| Layer | Technology | Version | Status |
|-------|-----------|---------|--------|
| **Runtime** | Bun | 1.0+ | Required |
| **Framework** | Nuxt | 4.3+ | Exclusive |
| **UI Library** | Vue | 3.5+ | Exclusive |
| **UI Components** | Nuxt UI | 4.4+ | Exclusive |
| **Language** | TypeScript | 5.6+ | Exclusive |
| **Styling** | Tailwind CSS | v4 | Exclusive |
| **State** | Pinia | 3.0+ | Exclusive |
| **Database** | Drizzle ORM | 0.38+ | Exclusive |
| **Vector DB** | SQLite + sqlite-vec | Latest | Required |

### Why Exclusive?

**Depth over breadth.** Better to be an expert in one stack than mediocre in twenty.

- 50+ validated patterns for this specific stack
- Framework-specific skills deeply integrated
- No generic advice that doesn't apply
- Predictable, consistent behavior

---

## Architecture Overview

### Component Diagram

```
┌─────────────────────────────────────────────────┐
│              Claude Code CLI                     │
│                                                  │
│  ┌──────────────────────────────────────────┐   │
│  │         CELLM Plugin                     │   │
│  │                                          │   │
│  │  ┌────────┐  ┌────────┐  ┌───────────┐  │   │
│  │  │Commands│  │ Agents │  │  Skills   │  │   │
│  │  └────────┘  └────────┘  └───────────┘  │   │
│  │                                          │   │
│  │  ┌────────────────────────────────────┐  │   │
│  │  │         Hook System                │  │   │
│  │  │  • SessionStart                    │  │   │
│  │  │  • UserPromptSubmit                │  │   │
│  │  │  • PostToolUse                     │  │   │
│  │  │  • Stop                            │  │   │
│  │  │  • PreCompact                      │  │   │
│  │  └────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────┘   │
│                       ▲                          │
│                       │ MCP Protocol             │
│                       ▼                          │
│  ┌──────────────────────────────────────────┐   │
│  │         Oracle MCP Server (Bun)          │   │
│  │                                          │   │
│  │  • Semantic Search                       │   │
│  │  • Context Generation                    │   │
│  │  • Session Memory                        │   │
│  │  • Pattern Tracking                      │   │
│  │                                          │   │
│  │  ┌────────────────────────────────────┐  │   │
│  │  │  SQLite + sqlite-vec               │  │   │
│  │  │  • Observations (metadata)         │  │   │
│  │  │  • Embeddings (vectors, 768d)      │  │   │
│  │  │  • Sessions                        │  │   │
│  │  └────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────┘   │
│                       ▲                          │
│                       │ HTTP                     │
│                       ▼                          │
│  ┌──────────────────────────────────────────┐   │
│  │      Compass Dashboard (Nuxt 4)          │   │
│  │      http://localhost:3000/compass       │   │
│  └──────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

---

## Oracle Architecture

### MCP Server (Bun Runtime)

**Location:** `~/.claude/plugins/cellm/oracle/`

**Purpose:** Persistent worker daemon providing semantic search and memory

### Database Schema

**File:** `~/.cellm/oracle.db` (SQLite)

```sql
-- Observations (project events and context)
CREATE TABLE observations (
  id INTEGER PRIMARY KEY,
  type TEXT NOT NULL,              -- 'command', 'session', 'pattern'
  project TEXT,                    -- Project identifier
  content TEXT NOT NULL,           -- Full content
  metadata JSON,                   -- Structured metadata
  timestamp INTEGER NOT NULL       -- Unix timestamp
);

-- Embeddings (vector representations, 768 dimensions)
CREATE TABLE embeddings (
  id INTEGER PRIMARY KEY,
  observation_id INTEGER NOT NULL,
  embedding BLOB NOT NULL,         -- 768-dim float32 vector
  model TEXT NOT NULL,             -- 'xenova/multilingual-e5-base'
  FOREIGN KEY (observation_id) REFERENCES observations(id)
);

-- Sessions (development sessions)
CREATE TABLE sessions (
  id INTEGER PRIMARY KEY,
  project TEXT NOT NULL,
  start_time INTEGER NOT NULL,
  end_time INTEGER,
  status TEXT NOT NULL             -- 'active', 'completed', 'abandoned'
);

-- Vector index (sqlite-vec extension)
CREATE VIRTUAL TABLE vec_index USING vec0(
  embedding FLOAT[768]
);
```

### Embedding Model

**Model:** Xenova/multilingual-e5-base
**Dimensions:** 768
**Languages:** 100+ supported
**Provider:** Transformers.js (local inference)

**Characteristics:**
- Runs locally (no API calls)
- Fast inference (~100ms per text)
- Multilingual support
- Good balance of speed and accuracy

### Search Strategies

**1. Hybrid Search** (Default)
- Combines semantic + metadata filtering
- Best for most use cases
- Returns ranked results

**2. Semantic Search** (Pure vector)
- Pure cosine similarity
- Best for finding similar concepts
- Language-agnostic

**3. Metadata Search** (Structured)
- Filter by type, project, timestamp
- Best for specific queries
- Fast performance

### Caching Layer

**Semantic Cache:**
- 95%+ similarity threshold
- Avoids duplicate embeddings
- Significantly reduces computation

**Query Cache:**
- Recent queries cached
- 5-minute TTL
- Improves response time

---

## Shell Scripts Architecture

### Modular Design

CELLM uses 10 audited shell scripts instead of bundled code:

```
scripts/
├── spawn-worker.sh          # Start Oracle MCP server
├── health-check.sh          # Monitor worker health
├── capture-prompt.sh        # Capture user prompts
├── log-rotate.sh            # Rotate log files
├── inject-context.sh        # Inject context into sessions
├── configure-otel.sh        # OpenTelemetry setup
├── secret-redaction.sh      # Redact sensitive data
├── validate-json.sh         # JSON validation
├── cleanup-resources.sh     # Resource cleanup
└── export-metrics.sh        # Export telemetry
```

### Security Features

**Every script includes:**
```bash
#!/usr/bin/env bash
set -euo pipefail           # Fail fast, no unset vars

# Cleanup trap
trap cleanup EXIT INT TERM

# Input validation
validate_inputs() { ... }

# Error handling
handle_error() { ... }
```

---

## Performance Characteristics

### Latency Targets

| Operation | Target | Typical |
|-----------|--------|---------|
| Plugin load | < 500ms | ~200ms |
| Skill trigger | < 100ms | ~50ms |
| Oracle search | < 2s | ~800ms |
| Embedding generation | < 500ms | ~150ms |
| MCP call | < 1s | ~300ms |

### Resource Usage

| Resource | Idle | Active |
|----------|------|--------|
| RAM | ~50MB | ~200MB |
| CPU | < 1% | ~5-10% |
| Disk | ~100MB | ~500MB (with cache) |

### Scalability

- **Projects:** Tested with 1,000+ files
- **Observations:** Handles 100,000+ records
- **Embeddings:** Optimized for 50,000+ vectors
- **Concurrent Sessions:** Supports 10+ simultaneous

---

## Security Model

### Threat Model

**In Scope:**
- Command injection attacks
- Path traversal exploits
- Secret exposure in logs
- Buffer overflow risks
- Race conditions

**Out of Scope:**
- Physical access threats
- OS-level vulnerabilities
- Third-party library CVEs (monitored)

### Mitigations

**Input Validation:**
```bash
# Example from validate-json.sh
validate_json() {
  local input="$1"

  # Check size limit
  if [[ ${#input} -gt 1048576 ]]; then
    die "JSON exceeds 1MB limit"
  fi

  # Validate with jq
  if ! echo "$input" | jq empty 2>/dev/null; then
    die "Invalid JSON structure"
  fi
}
```

**Secret Redaction:**
```bash
# Example from secret-redaction.sh
PATTERNS=(
  's/sk-[a-zA-Z0-9]{48}/[REDACTED_ANTHROPIC_KEY]/g'
  's/sk-[a-zA-Z0-9]{32}/[REDACTED_OPENAI_KEY]/g'
  's/pk_live_[a-zA-Z0-9]{24}/[REDACTED_STRIPE_KEY]/g'
  's/ghp_[a-zA-Z0-9]{36}/[REDACTED_GITHUB_TOKEN]/g'
  # ... 12+ providers covered
)
```

---

## Integration Points

### Claude Code Hooks

**SessionStart:**
- Loads project context
- Initializes Oracle connection
- Starts MCP server if needed

**UserPromptSubmit:**
- Captures prompt for memory
- Injects relevant context
- Triggers skill matching

**PostToolUse:**
- Records tool usage
- Updates pattern tracking
- Generates embeddings

**Stop:**
- Saves session data
- Flushes buffers
- Graceful shutdown

**PreCompact:**
- Archives context
- Optimizes storage
- Maintains continuity

### MCP Protocol

**Tools Exposed:**
- `search(query, limit, filters)` - Semantic search
- `timeline(anchor, depth)` - Context around results
- `get_observations(ids)` - Fetch specific records
- `get_context(session_id)` - Session context
- 4 additional internal tools

**Resources:**
- Session data
- Pattern catalog
- Observation history

---

## Development Requirements

### For Plugin Users

**Minimum:**
- Bun 1.0+
- Claude Code CLI
- Git 2.30+
- 1GB free disk space

**Recommended:**
- Bun latest
- 4GB RAM
- SSD storage

### For Plugin Developers

**Additional:**
- Node.js 20+ (for tooling)
- TypeScript 5.6+
- Vitest (testing)
- markdownlint (linting)

---

## Compatibility Matrix

| Platform | Bun | Claude CLI | Status |
|----------|-----|------------|--------|
| macOS 14 (M1/M2) | ✅ | ✅ | Fully Supported |
| macOS 13 (Intel) | ✅ | ✅ | Fully Supported |
| macOS 12 | ⚠️ | ✅ | Limited Testing |
| Ubuntu 22.04+ | ✅ | ✅ | Fully Supported |
| Debian 11+ | ✅ | ✅ | Community Tested |
| Windows 11 (WSL2) | ✅ | ✅ | Community Tested |
| Windows 10 (WSL2) | ⚠️ | ⚠️ | Experimental |

**Legend:**
- ✅ Fully Supported - Tested and maintained
- ⚠️ Limited - Works but not officially tested
- ❌ Unsupported

---

## Related Documentation

- [Features](./FEATURES.md) - What's included
- [Installation](./INSTALLATION.md) - Setup guide
- [Community](./COMMUNITY.md) - Get help

[← Back to Home](../README.md)
