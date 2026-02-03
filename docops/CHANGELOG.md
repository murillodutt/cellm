# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.0] - 2026-02-03

### Added

- **Commands:**
  - `/docops-deprecate` - Mark docs for deprecation with grace period
  - `/docops-undeprecate` - Restore deprecated docs to active status
  - `/docops-restore` - Restore archived docs back to active use
- **Skills:**
  - `docops-deprecate` - Skill for deprecation workflow with banners
  - `docops-lifecycle` - Skill for complete doc lifecycle management
- **Templates:**
  - `archive-index.md` template (EN and PT-BR) for archive directory
- **Configuration:**
  - `deprecationConfig` settings (defaultGracePeriod, gracePeriodByType, notifyOnDeprecation, updateReferences, requireReplacement, protectedTypes)
  - `archiveConfig` settings (retentionDays, organizationByDate, maintainIndex, preserveHistory)

### Changed

- Updated `docops-writer` agent to include deprecate and lifecycle skills
- Organized README commands into categories (Basic, Maintenance, Lifecycle)
- Deprecation now supports configurable grace periods by document type
- ADRs are protected from deprecation by default (historical record)

## [0.3.0] - 2026-02-03

### Added

- **Commands:**
  - `/docops-freshness` - Check and update evidence freshness status
  - `/docops-redundancy` - Detect redundant and duplicate content
- **Skills:**
  - `docops-freshness` - Skill for evidence freshness validation
  - `docops-redundancy` - Skill for redundancy detection with Jaccard similarity
- **Templates:**
  - `code-evidence.md` template (EN and PT-BR) with versioning fields
- **Configuration:**
  - `freshnessConfig` settings (freshDays, staleDays, autoCreateGaps, blockOnExpired)
  - `redundancyConfig` settings (similarityThreshold, minHeadings, ignorePaths, compareAcrossTypes)

### Changed

- Updated `docops-writer` agent to include freshness and redundancy skills
- Evidence files now support `last_verified`, `verified_by`, and change history

## [0.2.0] - 2026-02-03

### Added

- **Commands:**
  - `/docops-prune` - Archive or remove deprecated docs and broken references
  - `/docops-gc` - Garbage collection for resolved gaps and stale evidence
- **Skills:**
  - `docops-prune` - Skill for documentation cleanup and archival
  - `docops-gc` - Skill for garbage collection and maintenance
- **Configuration:**
  - `pruneConfig` settings in docops.json (mode, archivePath, retentionDays, autoRemoveOrphans)
  - `gcConfig` settings in docops.json (resolvedGapsToKeep, evidenceFreshnessDays, redundancyThreshold)
- **Templates:**
  - Added "Resolved (Archive)" section to conveyor-gaps.md templates (EN and PT-BR)

### Changed

- Updated `docops-writer` agent to include new skills (docops-prune, docops-gc)
- Updated JSON schema with new configuration options

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
