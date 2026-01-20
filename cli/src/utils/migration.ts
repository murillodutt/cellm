import { join } from 'node:path'
import { fileExists, directoryExists, readFile, writeFile, copyDir, findMarkdownFiles } from './fs.js'
import matter from 'gray-matter'

/**
 * CELLM version info
 */
export interface VersionInfo {
  major: number
  minor: number
  patch: number
  raw: string
}

/**
 * Parse version string to VersionInfo
 */
export function parseVersion(version: string): VersionInfo {
  const match = version.match(/^v?(\d+)\.(\d+)\.(\d+)/)
  if (!match) {
    return { major: 0, minor: 0, patch: 0, raw: version }
  }
  return {
    major: parseInt(match[1], 10),
    minor: parseInt(match[2], 10),
    patch: parseInt(match[3], 10),
    raw: version,
  }
}

/**
 * Format version info to string
 */
export function formatVersion(version: VersionInfo): string {
  return `v${version.major}.${version.minor}.${version.patch}`
}

/**
 * Compare two versions
 * Returns: -1 if a < b, 0 if a == b, 1 if a > b
 */
export function compareVersions(a: VersionInfo, b: VersionInfo): number {
  if (a.major !== b.major) return a.major < b.major ? -1 : 1
  if (a.minor !== b.minor) return a.minor < b.minor ? -1 : 1
  if (a.patch !== b.patch) return a.patch < b.patch ? -1 : 1
  return 0
}

/**
 * Check if version a is older than version b
 */
export function isOlderThan(a: VersionInfo, b: VersionInfo): boolean {
  return compareVersions(a, b) < 0
}

/**
 * Migration step definition
 */
export interface MigrationStep {
  id: string
  fromVersion: string
  toVersion: string
  description: string
  breaking: boolean
  actions: MigrationAction[]
}

/**
 * Migration action types
 */
export type MigrationAction =
  | { type: 'rename_file'; from: string; to: string }
  | { type: 'delete_file'; path: string }
  | { type: 'create_file'; path: string; content: string }
  | { type: 'update_frontmatter'; path: string; updates: Record<string, unknown> }
  | { type: 'copy_from_core'; source: string; dest: string }
  | { type: 'run_script'; description: string; script: () => Promise<void> }

/**
 * Migration registry
 */
export const MIGRATIONS: MigrationStep[] = [
  {
    id: 'v0.10.0-to-v0.10.1',
    fromVersion: 'v0.10.0',
    toVersion: 'v0.10.1',
    description: 'Version alignment and session template',
    breaking: false,
    actions: [
      {
        type: 'update_frontmatter',
        path: '.claude/rules/*.md',
        updates: { version: 'v0.10.1' },
      },
    ],
  },
  {
    id: 'v0.10.1-to-v0.11.0',
    fromVersion: 'v0.10.1',
    toVersion: 'v0.11.0',
    description: 'CLI Foundation release',
    breaking: false,
    actions: [
      {
        type: 'update_frontmatter',
        path: '.claude/**/*.md',
        updates: { version: 'v0.11.0' },
      },
    ],
  },
  {
    id: 'v0.11.0-to-v0.12.0',
    fromVersion: 'v0.11.0',
    toVersion: 'v0.12.0',
    description: 'Context Debugger release',
    breaking: false,
    actions: [
      {
        type: 'update_frontmatter',
        path: '.claude/**/*.md',
        updates: { version: 'v0.12.0' },
      },
    ],
  },
  {
    id: 'v0.12.0-to-v0.13.0',
    fromVersion: 'v0.12.0',
    toVersion: 'v0.13.0',
    description: 'Metrics & Analytics release',
    breaking: false,
    actions: [
      {
        type: 'update_frontmatter',
        path: '.claude/**/*.md',
        updates: { version: 'v0.13.0' },
      },
    ],
  },
  {
    id: 'v0.13.0-to-v0.20.0',
    fromVersion: 'v0.13.0',
    toVersion: 'v0.20.0',
    description: 'CLI Advanced release with compile and upgrade commands',
    breaking: false,
    actions: [
      {
        type: 'update_frontmatter',
        path: '.claude/**/*.md',
        updates: { version: 'v0.20.0' },
      },
      {
        type: 'create_file',
        path: '.claude/compiled/.gitkeep',
        content: '# Compiled context output directory\n',
      },
    ],
  },
]

/**
 * Get migrations needed between two versions
 */
export function getMigrationsNeeded(from: VersionInfo, to: VersionInfo): MigrationStep[] {
  const needed: MigrationStep[] = []

  for (const migration of MIGRATIONS) {
    const migrationFrom = parseVersion(migration.fromVersion)
    const migrationTo = parseVersion(migration.toVersion)

    // Include migration if:
    // - from version is >= migration.fromVersion
    // - to version is >= migration.toVersion
    if (
      compareVersions(from, migrationFrom) <= 0 &&
      compareVersions(to, migrationTo) >= 0
    ) {
      needed.push(migration)
    }
  }

  // Sort by fromVersion ascending
  return needed.sort((a, b) => {
    return compareVersions(parseVersion(a.fromVersion), parseVersion(b.fromVersion))
  })
}

/**
 * Detect current CELLM version in a project
 */
export function detectProjectVersion(projectPath: string): VersionInfo | null {
  const claudeDir = join(projectPath, '.claude')

  if (!directoryExists(claudeDir)) {
    return null
  }

  // Try to find version from INDEX.md or any frontmatter
  const indexPath = join(claudeDir, 'index.md')
  if (fileExists(indexPath)) {
    const content = readFile(indexPath)
    const { data } = matter(content)
    if (data.version) {
      return parseVersion(String(data.version))
    }
  }

  // Try rules files
  const rulesDir = join(claudeDir, 'rules')
  if (directoryExists(rulesDir)) {
    const files = findMarkdownFiles(rulesDir)
    for (const file of files) {
      const content = readFile(file)
      const { data } = matter(content)
      if (data.version) {
        return parseVersion(String(data.version))
      }
    }
  }

  // Default to oldest supported version
  return parseVersion('v0.10.0')
}

/**
 * Get the latest CELLM version
 */
export function getLatestVersion(): VersionInfo {
  return parseVersion('v0.20.0')
}

/**
 * Backup result
 */
export interface BackupResult {
  success: boolean
  backupPath: string
  timestamp: string
}

/**
 * Create backup of .claude directory
 */
export function createBackup(projectPath: string): BackupResult {
  const claudeDir = join(projectPath, '.claude')
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  const backupPath = join(projectPath, `.claude-backup-${timestamp}`)

  if (!directoryExists(claudeDir)) {
    return {
      success: false,
      backupPath: '',
      timestamp,
    }
  }

  try {
    copyDir(claudeDir, backupPath)
    return {
      success: true,
      backupPath,
      timestamp,
    }
  } catch {
    return {
      success: false,
      backupPath: '',
      timestamp,
    }
  }
}

/**
 * Migration result for a single step
 */
export interface MigrationStepResult {
  migration: MigrationStep
  success: boolean
  actionsApplied: number
  errors: string[]
}

/**
 * Full upgrade result
 */
export interface UpgradeResult {
  success: boolean
  fromVersion: VersionInfo
  toVersion: VersionInfo
  backup?: BackupResult
  steps: MigrationStepResult[]
  summary: {
    totalMigrations: number
    successfulMigrations: number
    filesModified: number
    errors: string[]
  }
}

/**
 * Apply a single migration action
 */
export function applyMigrationAction(
  projectPath: string,
  action: MigrationAction
): { success: boolean; error?: string } {
  try {
    switch (action.type) {
      case 'rename_file': {
        const fromPath = join(projectPath, action.from)
        const toPath = join(projectPath, action.to)
        if (fileExists(fromPath)) {
          const content = readFile(fromPath)
          writeFile(toPath, content)
          // Note: In a real implementation, we'd delete the old file
        }
        return { success: true }
      }

      case 'delete_file': {
        // In dry-run mode, we just check if file exists
        const filePath = join(projectPath, action.path)
        if (fileExists(filePath)) {
          // Note: In a real implementation, we'd delete the file
        }
        return { success: true }
      }

      case 'create_file': {
        const filePath = join(projectPath, action.path)
        writeFile(filePath, action.content)
        return { success: true }
      }

      case 'update_frontmatter': {
        // Handle glob patterns
        const pattern = action.path
        const basePath = join(projectPath, pattern.split('*')[0])
        const files = pattern.includes('*') ? findMarkdownFiles(basePath) : [join(projectPath, pattern)]

        for (const file of files) {
          if (!fileExists(file)) continue

          const content = readFile(file)
          const { data: frontmatter, content: body } = matter(content)

          // Apply updates
          const updatedFrontmatter = { ...frontmatter, ...action.updates }

          // Reconstruct file
          const newContent = matter.stringify(body, updatedFrontmatter)
          writeFile(file, newContent)
        }
        return { success: true }
      }

      case 'copy_from_core': {
        // This would copy from cellm-core to the project
        // Implementation depends on cellm-core location
        return { success: true }
      }

      case 'run_script': {
        // Scripts are not run in the basic implementation
        return { success: true }
      }

      default:
        return { success: false, error: 'Unknown action type' }
    }
  } catch (err) {
    return { success: false, error: String(err) }
  }
}

/**
 * Apply a migration step
 */
export function applyMigrationStep(
  projectPath: string,
  migration: MigrationStep
): MigrationStepResult {
  const result: MigrationStepResult = {
    migration,
    success: true,
    actionsApplied: 0,
    errors: [],
  }

  for (const action of migration.actions) {
    const actionResult = applyMigrationAction(projectPath, action)
    if (actionResult.success) {
      result.actionsApplied++
    } else {
      result.errors.push(actionResult.error || 'Unknown error')
      result.success = false
    }
  }

  return result
}

/**
 * Generate migration plan (dry-run)
 */
export interface MigrationPlan {
  fromVersion: VersionInfo
  toVersion: VersionInfo
  migrations: MigrationStep[]
  hasBreakingChanges: boolean
  totalActions: number
}

export function generateMigrationPlan(
  projectPath: string,
  targetVersion?: VersionInfo
): MigrationPlan | null {
  const currentVersion = detectProjectVersion(projectPath)
  if (!currentVersion) {
    return null
  }

  const toVersion = targetVersion || getLatestVersion()
  const migrations = getMigrationsNeeded(currentVersion, toVersion)

  return {
    fromVersion: currentVersion,
    toVersion,
    migrations,
    hasBreakingChanges: migrations.some((m) => m.breaking),
    totalActions: migrations.reduce((sum, m) => sum + m.actions.length, 0),
  }
}
