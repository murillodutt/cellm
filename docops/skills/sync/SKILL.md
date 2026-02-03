---
name: sync
description: |
  Refresh code evidence, gaps, and derived documentation.
  Use when: updating docs after code changes, syncing evidence, detecting drift.
  Triggers: /docops:sync, code changes, stale documentation.
argument-hint: "[docRoot]"
allowed-tools: Read, Edit, Write, Glob, Grep
model: inherit
paths:
  - "**/.claude/docops.json"
  - "**/docs/**"
  - "**/technical/**"
  - "**/reference/code-evidence/**"
---

# DocOps Sync

## Purpose
Keep docs aligned with code using evidence-first updates.

## Workflow
1) Update `reference/code-evidence/` first.
2) Update `reference/conveyor-gaps.md` with conflicts.
3) Update SPEC/REF/HOWTO/RUNBOOK from evidence.

## Rules
- Do NOT change source of truth silently.
- Always link to evidence and conveyor.
