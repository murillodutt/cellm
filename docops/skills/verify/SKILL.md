---
name: verify
description: |
  Validate documentation structure, links, and normative vocabulary.
  Use when: checking doc quality, validating structure, pre-commit validation.
  Triggers: /docops:verify, verify docs, check documentation.
argument-hint: "[docRoot]"
allowed-tools: Read, Glob, Grep
model: inherit
paths:
  - "**/.claude/docops.json"
  - "**/docs/**"
  - "**/technical/**"
---

# DocOps Verify

## Purpose
Check structure, required sections, and drift control artifacts.

## Checks
- Required folders and files exist.
- Source of truth referenced by specs/refs.
- Evidence links present where applicable.
- Normative vocabulary usage.
- Gaps file updated.
