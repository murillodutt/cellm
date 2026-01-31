# Technical Specifications

> [Home](../README.md) > **Technical Specs**

---

## Stack Support

| Layer | Technology | Status |
|-------|------------|--------|
| Runtime | Bun | Required |
| Framework | Nuxt 4 | Required |
| UI | Vue 3 | Required |
| Language | TypeScript | Required |
| Vector DB | SQLite + sqlite-vec | Required |

---

## Architecture References

| Area | Document |
|------|----------|
| Oracle Architecture | `oracle/docs/ARCHITECTURE.md` |
| Database Schema | `oracle/server/db/README.md` |

---

## Embeddings

| Item | Value |
|------|-------|
| Model | `Xenova/multilingual-e5-small` |
| Dimensions | 384 |
| Provider | transformers.js (local) |

---

## Notes

- The Oracle worker runs locally and exposes REST + MCP stdio.
- The Compass dashboard consumes Oracle APIs for analytics and memory.

