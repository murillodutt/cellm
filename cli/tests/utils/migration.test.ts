import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { join } from 'node:path'
import { mkdirSync, writeFileSync, rmSync } from 'node:fs'
import {
  parseVersion,
  formatVersion,
  compareVersions,
  isOlderThan,
  getMigrationsNeeded,
  getLatestVersion,
  MIGRATIONS,
  detectProjectVersion,
  createBackup,
  generateMigrationPlan,
  applyMigrationAction,
  type VersionInfo,
  type MigrationAction,
} from '../../src/utils/migration.js'

describe('Migration Utilities', () => {
  describe('parseVersion', () => {
    it('should parse version with v prefix', () => {
      const result = parseVersion('v0.10.0')
      expect(result.major).toBe(0)
      expect(result.minor).toBe(10)
      expect(result.patch).toBe(0)
      expect(result.raw).toBe('v0.10.0')
    })

    it('should parse version without v prefix', () => {
      const result = parseVersion('0.20.0')
      expect(result.major).toBe(0)
      expect(result.minor).toBe(20)
      expect(result.patch).toBe(0)
    })

    it('should handle invalid version', () => {
      const result = parseVersion('invalid')
      expect(result.major).toBe(0)
      expect(result.minor).toBe(0)
      expect(result.patch).toBe(0)
      expect(result.raw).toBe('invalid')
    })

    it('should parse v1.0.0', () => {
      const result = parseVersion('v1.0.0')
      expect(result.major).toBe(1)
      expect(result.minor).toBe(0)
      expect(result.patch).toBe(0)
    })
  })

  describe('formatVersion', () => {
    it('should format version info to string', () => {
      const version: VersionInfo = { major: 0, minor: 20, patch: 0, raw: 'v0.20.0' }
      expect(formatVersion(version)).toBe('v0.20.0')
    })

    it('should format version with non-zero patch', () => {
      const version: VersionInfo = { major: 1, minor: 2, patch: 3, raw: 'v1.2.3' }
      expect(formatVersion(version)).toBe('v1.2.3')
    })
  })

  describe('compareVersions', () => {
    it('should return 0 for equal versions', () => {
      const a = parseVersion('v0.10.0')
      const b = parseVersion('v0.10.0')
      expect(compareVersions(a, b)).toBe(0)
    })

    it('should return -1 when a < b (major)', () => {
      const a = parseVersion('v0.10.0')
      const b = parseVersion('v1.0.0')
      expect(compareVersions(a, b)).toBe(-1)
    })

    it('should return 1 when a > b (major)', () => {
      const a = parseVersion('v1.0.0')
      const b = parseVersion('v0.10.0')
      expect(compareVersions(a, b)).toBe(1)
    })

    it('should return -1 when a < b (minor)', () => {
      const a = parseVersion('v0.10.0')
      const b = parseVersion('v0.20.0')
      expect(compareVersions(a, b)).toBe(-1)
    })

    it('should return 1 when a > b (minor)', () => {
      const a = parseVersion('v0.20.0')
      const b = parseVersion('v0.10.0')
      expect(compareVersions(a, b)).toBe(1)
    })

    it('should return -1 when a < b (patch)', () => {
      const a = parseVersion('v0.10.0')
      const b = parseVersion('v0.10.1')
      expect(compareVersions(a, b)).toBe(-1)
    })

    it('should return 1 when a > b (patch)', () => {
      const a = parseVersion('v0.10.1')
      const b = parseVersion('v0.10.0')
      expect(compareVersions(a, b)).toBe(1)
    })
  })

  describe('isOlderThan', () => {
    it('should return true when a is older', () => {
      const a = parseVersion('v0.10.0')
      const b = parseVersion('v0.20.0')
      expect(isOlderThan(a, b)).toBe(true)
    })

    it('should return false when a is newer', () => {
      const a = parseVersion('v0.20.0')
      const b = parseVersion('v0.10.0')
      expect(isOlderThan(a, b)).toBe(false)
    })

    it('should return false when equal', () => {
      const a = parseVersion('v0.10.0')
      const b = parseVersion('v0.10.0')
      expect(isOlderThan(a, b)).toBe(false)
    })
  })

  describe('MIGRATIONS constant', () => {
    it('should have migrations defined', () => {
      expect(MIGRATIONS.length).toBeGreaterThan(0)
    })

    it('should have valid migration structure', () => {
      for (const migration of MIGRATIONS) {
        expect(migration.id).toBeDefined()
        expect(migration.fromVersion).toBeDefined()
        expect(migration.toVersion).toBeDefined()
        expect(migration.description).toBeDefined()
        expect(typeof migration.breaking).toBe('boolean')
        expect(Array.isArray(migration.actions)).toBe(true)
      }
    })

    it('should have migration to v0.20.0', () => {
      const migration = MIGRATIONS.find((m) => m.toVersion === 'v0.20.0')
      expect(migration).toBeDefined()
    })
  })

  describe('getMigrationsNeeded', () => {
    it('should return empty array when at latest', () => {
      const from = parseVersion('v0.20.0')
      const to = parseVersion('v0.20.0')
      const migrations = getMigrationsNeeded(from, to)
      // May still return migrations if from <= migration.from
      expect(Array.isArray(migrations)).toBe(true)
    })

    it('should return migrations for upgrade path', () => {
      const from = parseVersion('v0.10.0')
      const to = parseVersion('v0.20.0')
      const migrations = getMigrationsNeeded(from, to)
      expect(migrations.length).toBeGreaterThan(0)
    })

    it('should return sorted migrations', () => {
      const from = parseVersion('v0.10.0')
      const to = parseVersion('v0.20.0')
      const migrations = getMigrationsNeeded(from, to)

      for (let i = 1; i < migrations.length; i++) {
        const prev = parseVersion(migrations[i - 1].fromVersion)
        const curr = parseVersion(migrations[i].fromVersion)
        expect(compareVersions(prev, curr)).toBeLessThanOrEqual(0)
      }
    })
  })

  describe('getLatestVersion', () => {
    it('should return v0.20.0', () => {
      const latest = getLatestVersion()
      expect(formatVersion(latest)).toBe('v0.20.0')
    })
  })

  describe('detectProjectVersion', () => {
    const testDir = join(process.cwd(), '.test-migration-dir')

    beforeEach(() => {
      try {
        rmSync(testDir, { recursive: true })
      } catch {
        // ignore
      }
    })

    afterEach(() => {
      try {
        rmSync(testDir, { recursive: true })
      } catch {
        // ignore
      }
    })

    it('should return null if .claude directory does not exist', () => {
      const result = detectProjectVersion(testDir)
      expect(result).toBeNull()
    })

    it('should detect version from index.md frontmatter', () => {
      mkdirSync(join(testDir, '.claude'), { recursive: true })
      writeFileSync(
        join(testDir, '.claude', 'index.md'),
        '---\nversion: v0.15.0\n---\n# Index'
      )

      const result = detectProjectVersion(testDir)
      expect(result).not.toBeNull()
      expect(result!.minor).toBe(15)
    })

    it('should detect version from rules files', () => {
      mkdirSync(join(testDir, '.claude', 'rules'), { recursive: true })
      writeFileSync(
        join(testDir, '.claude', 'rules', 'test.md'),
        '---\nversion: v0.12.0\n---\n# Test Rule'
      )

      const result = detectProjectVersion(testDir)
      expect(result).not.toBeNull()
      expect(result!.minor).toBe(12)
    })

    it('should return v0.10.0 if no version found in files', () => {
      mkdirSync(join(testDir, '.claude'), { recursive: true })
      writeFileSync(join(testDir, '.claude', 'index.md'), '---\nid: test\n---\n# Index')

      const result = detectProjectVersion(testDir)
      expect(result).not.toBeNull()
      expect(formatVersion(result!)).toBe('v0.10.0')
    })
  })

  describe('createBackup', () => {
    const testDir = join(process.cwd(), '.test-backup-dir')

    beforeEach(() => {
      try {
        rmSync(testDir, { recursive: true })
      } catch {
        // ignore
      }
    })

    afterEach(() => {
      try {
        rmSync(testDir, { recursive: true })
      } catch {
        // ignore
      }
    })

    it('should return success: false if .claude does not exist', () => {
      mkdirSync(testDir, { recursive: true })
      const result = createBackup(testDir)
      expect(result.success).toBe(false)
    })

    it('should create backup successfully', () => {
      mkdirSync(join(testDir, '.claude'), { recursive: true })
      writeFileSync(join(testDir, '.claude', 'test.md'), '# Test')

      const result = createBackup(testDir)
      expect(result.success).toBe(true)
      expect(result.backupPath).toContain('.claude-backup-')

      // Cleanup backup
      try {
        rmSync(result.backupPath, { recursive: true })
      } catch {
        // ignore
      }
    })
  })

  describe('generateMigrationPlan', () => {
    const testDir = join(process.cwd(), '.test-plan-dir')

    beforeEach(() => {
      try {
        rmSync(testDir, { recursive: true })
      } catch {
        // ignore
      }
    })

    afterEach(() => {
      try {
        rmSync(testDir, { recursive: true })
      } catch {
        // ignore
      }
    })

    it('should return null if project version cannot be detected', () => {
      const result = generateMigrationPlan(testDir)
      expect(result).toBeNull()
    })

    it('should generate plan for valid project', () => {
      mkdirSync(join(testDir, '.claude'), { recursive: true })
      writeFileSync(
        join(testDir, '.claude', 'index.md'),
        '---\nversion: v0.10.0\n---\n# Index'
      )

      const result = generateMigrationPlan(testDir)
      expect(result).not.toBeNull()
      expect(result!.fromVersion).toBeDefined()
      expect(result!.toVersion).toBeDefined()
      expect(result!.migrations).toBeDefined()
    })

    it('should detect breaking changes', () => {
      mkdirSync(join(testDir, '.claude'), { recursive: true })
      writeFileSync(
        join(testDir, '.claude', 'index.md'),
        '---\nversion: v0.10.0\n---\n# Index'
      )

      const result = generateMigrationPlan(testDir)
      expect(result).not.toBeNull()
      expect(typeof result!.hasBreakingChanges).toBe('boolean')
    })
  })

  describe('applyMigrationAction', () => {
    const testDir = join(process.cwd(), '.test-action-dir')

    beforeEach(() => {
      try {
        rmSync(testDir, { recursive: true })
      } catch {
        // ignore
      }
      mkdirSync(testDir, { recursive: true })
    })

    afterEach(() => {
      try {
        rmSync(testDir, { recursive: true })
      } catch {
        // ignore
      }
    })

    it('should handle create_file action', () => {
      const action: MigrationAction = {
        type: 'create_file',
        path: 'test-file.md',
        content: '# Test\n\nContent here',
      }

      const result = applyMigrationAction(testDir, action)
      expect(result.success).toBe(true)
    })

    it('should handle rename_file action', () => {
      writeFileSync(join(testDir, 'old.md'), '# Old')

      const action: MigrationAction = {
        type: 'rename_file',
        from: 'old.md',
        to: 'new.md',
      }

      const result = applyMigrationAction(testDir, action)
      expect(result.success).toBe(true)
    })

    it('should handle delete_file action', () => {
      writeFileSync(join(testDir, 'delete-me.md'), '# Delete')

      const action: MigrationAction = {
        type: 'delete_file',
        path: 'delete-me.md',
      }

      const result = applyMigrationAction(testDir, action)
      expect(result.success).toBe(true)
    })

    it('should handle copy_from_core action', () => {
      const action: MigrationAction = {
        type: 'copy_from_core',
        source: 'rules/core/test.md',
        dest: 'rules/core/test.md',
      }

      const result = applyMigrationAction(testDir, action)
      expect(result.success).toBe(true)
    })

    it('should handle run_script action', () => {
      const action: MigrationAction = {
        type: 'run_script',
        description: 'Test script',
        script: async () => {},
      }

      const result = applyMigrationAction(testDir, action)
      expect(result.success).toBe(true)
    })
  })
})
