import { Command } from 'commander'
import pc from 'picocolors'
import { directoryExists } from '../utils/fs.js'
import {
  detectProjectVersion,
  getLatestVersion,
  formatVersion,
  generateMigrationPlan,
  createBackup,
  applyMigrationStep,
  parseVersion,
  isOlderThan,
  type MigrationPlan,
  type UpgradeResult,
} from '../utils/migration.js'

/**
 * Create the upgrade command
 */
export const upgradeCommand = new Command('upgrade')
  .description('Upgrade project to the latest CELLM version')
  .option('--dry-run', 'Show what would be upgraded without making changes')
  .option('--no-backup', 'Skip creating backup before upgrade')
  .option('--target <version>', 'Target version (default: latest)')
  .option('--force', 'Force upgrade even if already at target version')
  .action(async (options) => {
    const projectPath = process.cwd()
    const claudeDir = `${projectPath}/.claude`

    console.log('')
    console.log(pc.bold('CELLM Upgrade'))
    console.log(pc.dim('─'.repeat(50)))
    console.log('')

    // Check if .claude directory exists
    if (!directoryExists(claudeDir)) {
      console.log(pc.red('[-] No .claude directory found'))
      console.log(pc.dim('    Run "cellm init" first to initialize a project'))
      process.exit(1)
    }

    // Detect current version
    const currentVersion = detectProjectVersion(projectPath)
    if (!currentVersion) {
      console.log(pc.red('[-] Could not detect current CELLM version'))
      console.log(pc.dim('    Project may be corrupted or using incompatible format'))
      process.exit(1)
    }

    // Get target version
    const targetVersion = options.target ? parseVersion(options.target) : getLatestVersion()

    console.log(pc.cyan('Current version:'), formatVersion(currentVersion))
    console.log(pc.cyan('Target version: '), formatVersion(targetVersion))
    console.log('')

    // Check if already at target
    if (!isOlderThan(currentVersion, targetVersion) && !options.force) {
      console.log(pc.green('[+] Already at target version'))
      console.log(pc.dim('    Use --force to re-run migrations'))
      process.exit(0)
    }

    // Generate migration plan
    const plan = generateMigrationPlan(projectPath, targetVersion)
    if (!plan) {
      console.log(pc.red('[-] Failed to generate migration plan'))
      process.exit(1)
    }

    // Display migration plan
    displayMigrationPlan(plan)

    // If dry-run, stop here
    if (options.dryRun) {
      console.log('')
      console.log(pc.yellow('[i] Dry run - no changes made'))
      console.log(pc.dim('    Remove --dry-run to apply changes'))
      process.exit(0)
    }

    // Create backup unless disabled
    if (options.backup !== false) {
      console.log('')
      console.log(pc.yellow('Creating backup...'))
      const backup = createBackup(projectPath)
      if (backup.success) {
        console.log(pc.green(`[+] Backup created: ${backup.backupPath}`))
      } else {
        console.log(pc.red('[-] Failed to create backup'))
        console.log(pc.dim('    Use --no-backup to skip (not recommended)'))
        process.exit(1)
      }
    }

    // Apply migrations
    console.log('')
    console.log(pc.yellow('Applying migrations...'))
    console.log('')

    const result = executeUpgrade(projectPath, plan, options.backup !== false)

    // Display results
    displayUpgradeResult(result)
  })

/**
 * Display migration plan
 */
function displayMigrationPlan(plan: MigrationPlan): void {
  const { migrations, hasBreakingChanges, totalActions } = plan

  if (migrations.length === 0) {
    console.log(pc.green('[+] No migrations needed'))
    return
  }

  console.log(pc.yellow('Migration plan:'))
  console.log('')

  for (const migration of migrations) {
    const breakingTag = migration.breaking ? pc.red(' [BREAKING]') : ''
    console.log(`  ${pc.cyan(migration.id)}${breakingTag}`)
    console.log(`    ${pc.dim(migration.description)}`)
    console.log(`    ${pc.dim(`${migration.actions.length} action(s)`)}`)
    console.log('')
  }

  console.log(pc.dim('─'.repeat(50)))
  console.log(`  Total migrations: ${migrations.length}`)
  console.log(`  Total actions:    ${totalActions}`)
  if (hasBreakingChanges) {
    console.log(pc.red(`  [!] Contains breaking changes`))
  }
}

/**
 * Execute the upgrade
 */
function executeUpgrade(
  projectPath: string,
  plan: MigrationPlan,
  _hasBackup: boolean
): UpgradeResult {
  const result: UpgradeResult = {
    success: true,
    fromVersion: plan.fromVersion,
    toVersion: plan.toVersion,
    steps: [],
    summary: {
      totalMigrations: plan.migrations.length,
      successfulMigrations: 0,
      filesModified: 0,
      errors: [],
    },
  }

  for (const migration of plan.migrations) {
    console.log(`  ${pc.cyan(`Applying: ${migration.id}`)}`)

    const stepResult = applyMigrationStep(projectPath, migration)
    result.steps.push(stepResult)

    if (stepResult.success) {
      result.summary.successfulMigrations++
      result.summary.filesModified += stepResult.actionsApplied
      console.log(pc.green(`    [+] Success (${stepResult.actionsApplied} actions)`))
    } else {
      result.success = false
      result.summary.errors.push(...stepResult.errors)
      console.log(pc.red(`    [-] Failed`))
      for (const error of stepResult.errors) {
        console.log(pc.dim(`        ${error}`))
      }
    }
  }

  return result
}

/**
 * Display upgrade result
 */
function displayUpgradeResult(result: UpgradeResult): void {
  console.log('')
  console.log(pc.dim('─'.repeat(50)))
  console.log('')

  if (result.success) {
    console.log(pc.green('[+] Upgrade completed successfully'))
    console.log('')
    console.log(`    From: ${formatVersion(result.fromVersion)}`)
    console.log(`    To:   ${formatVersion(result.toVersion)}`)
    console.log('')
    console.log(`    Migrations applied: ${result.summary.successfulMigrations}/${result.summary.totalMigrations}`)
    console.log(`    Files modified:     ${result.summary.filesModified}`)
  } else {
    console.log(pc.red('[-] Upgrade completed with errors'))
    console.log('')
    console.log(`    Migrations applied: ${result.summary.successfulMigrations}/${result.summary.totalMigrations}`)
    console.log('')
    console.log(pc.yellow('Errors:'))
    for (const error of result.summary.errors) {
      console.log(`    - ${error}`)
    }
    console.log('')
    console.log(pc.dim('    Consider restoring from backup if issues persist'))
  }

  console.log('')
}
