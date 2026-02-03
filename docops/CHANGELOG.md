# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-02-03

### Added

- Initial release of DocOps plugin
- **Commands:**
  - `/docops-init` - Initialize documentation structure with LLM-first templates
  - `/docops-sync` - Update code evidence, gaps, and derived documentation
  - `/docops-verify` - Validate structure, links, and normative vocabulary
- **Skills:**
  - `docops-init` - Skill for documentation initialization
  - `docops-sync` - Skill for evidence synchronization
  - `docops-verify` - Skill for documentation validation
- **Agent:**
  - `docops-writer` - Documentation specialist for generating LLM-first docs
- **Templates (EN and PT-BR):**
  - `spec.md` - Specification template
  - `ref.md` - Reference documentation template
  - `howto.md` - How-to guide template
  - `runbook.md` - Operational runbook template
  - `adr.md` - Architecture Decision Record template
  - `index.md` - Documentation index template
  - `glossary.md` - Glossary template
  - `project-conveyor.md` - Source of truth template
  - `conveyor-gaps.md` - Drift tracking template
- **Hooks:**
  - Optional drift reminder on Stop and PreCompact events
- **Configuration:**
  - `.claude/docops.json` for project-specific settings
  - JSON Schema for configuration validation
- **Naming convention enforcement:**
  - `.spec.md`, `.ref.md`, `.howto.md`, `.runbook.md` suffixes
  - `ADR-YYYYMMDD-<slug>.md` pattern for decisions
