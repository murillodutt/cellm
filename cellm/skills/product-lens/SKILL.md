---
description: Product thinking filter — every feature, skill, and API must work for external developers in any project, not just CELLM's own repository.
user-invocable: false
---

# Product Lens — Before Building

CELLM is a product installed via NPM in **other people's projects**. Before writing any feature, apply one filter:

> "Would this work in a random Node.js project that installed CELLM?"

| Correct | Wrong |
|---------|-------|
| "CELLM users will..." | "We will use this to..." |
| Generic Node.js/Bun support | Only works in cellm-private repo |
| Skills for any project | Skills for CELLM development |
| Data in `~/.cellm/` | Data in repo directories |

## NEVER

- **Hardcode paths** to cellm-private internals — use discovery and config
- **Assume project structure** — detect, don't require
- **Build for ourselves** — we are the first customer, not the only one
