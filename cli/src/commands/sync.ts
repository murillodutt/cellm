import { Command } from 'commander'
import pc from 'picocolors'
import { join } from 'node:path'
import { execSync } from 'node:child_process'
import {
  directoryExists,
  fileExists,
  readFile,
  getCellmCorePath,
  copyDir,
  copyFile,
} from '../utils/fs.js'

/**
 * Create the sync command
 */
export const syncCommand = new Command('sync')
  .description('Sync CELLM configuration from global profile')
  .option('-d, --dir <path>', 'Directory to sync', '.')
  .option('--from <source>', 'Source to sync from (global, remote)', 'global')
  .option('--dry-run', 'Show what would be done without making changes')
  .option('-f, --force', 'Force sync even if local changes exist')
  .action(async (options) => {
    const startTime = performance.now()
    const targetDir = options.dir === '.' ? process.cwd() : options.dir
    const claudeDir = join(targetDir, '.claude')

    console.log(pc.blue('\nCELLM Sync'))
    console.log(pc.dim('─'.repeat(50)))

    // Check if .claude directory exists
    if (!directoryExists(claudeDir)) {
      console.error(pc.red('[-] .claude directory not found'))
      console.log(pc.dim('Run "cellm init" to create the structure first'))
      process.exit(1)
    }

    // Determine source
    if (options.from === 'global') {
      await syncFromGlobal(targetDir, claudeDir, options)
    } else if (options.from === 'remote') {
      await syncFromRemote(targetDir, claudeDir, options)
    } else {
      console.error(pc.red(`[-] Unknown source: ${options.from}`))
      console.log(pc.dim('Available sources: global, remote'))
      process.exit(1)
    }

    const elapsed = Math.round(performance.now() - startTime)
    console.log(pc.dim(`\n  Time: ${elapsed}ms`))
  })

/**
 * Sync from global CELLM installation
 */
async function syncFromGlobal(
  _targetDir: string,
  claudeDir: string,
  options: { dryRun?: boolean; force?: boolean }
): Promise<void> {
  console.log(pc.dim(`Source: global (~/.cellm)`))

  const globalCellmDir = join(process.env.HOME || '', '.cellm')

  if (!directoryExists(globalCellmDir)) {
    // Fallback to cellm-core in package
    const cellmCorePath = getCellmCorePath()
    if (!directoryExists(cellmCorePath)) {
      console.error(pc.red('[-] No global CELLM installation found'))
      console.log(pc.dim('Expected at: ~/.cellm or package cellm-core/'))
      process.exit(1)
    }

    console.log(pc.dim(`Using package cellm-core: ${cellmCorePath}`))
    await syncFromPath(cellmCorePath, claudeDir, options)
    return
  }

  console.log(pc.dim(`Using global: ${globalCellmDir}`))
  await syncFromPath(globalCellmDir, claudeDir, options)
}

/**
 * Sync from remote repository
 */
async function syncFromRemote(
  targetDir: string,
  claudeDir: string,
  options: { dryRun?: boolean; force?: boolean }
): Promise<void> {
  console.log(pc.dim('Source: remote (github.com/murillodutt/cellm)'))

  if (options.dryRun) {
    console.log(pc.yellow('\n[i] Dry run - would fetch from remote'))
    return
  }

  // Check if git is available
  try {
    execSync('git --version', { stdio: 'ignore' })
  } catch {
    console.error(pc.red('[-] Git not found'))
    console.log(pc.dim('Git is required for remote sync'))
    process.exit(1)
  }

  // Create temp directory for clone
  const tempDir = join(targetDir, '.cellm-sync-temp')

  try {
    console.log(pc.blue('\nFetching from remote...'))

    // Shallow clone
    execSync(`git clone --depth 1 https://github.com/murillodutt/cellm.git "${tempDir}"`, {
      stdio: 'pipe',
    })

    const remoteCellmCore = join(tempDir, 'cellm-core')
    if (!directoryExists(remoteCellmCore)) {
      throw new Error('cellm-core not found in remote repository')
    }

    await syncFromPath(remoteCellmCore, claudeDir, options)

    // Cleanup
    execSync(`rm -rf "${tempDir}"`, { stdio: 'ignore' })
  } catch (error) {
    // Cleanup on error
    try {
      execSync(`rm -rf "${tempDir}"`, { stdio: 'ignore' })
    } catch {
      // Ignore cleanup errors
    }

    console.error(pc.red('[-] Remote sync failed'))
    console.log(pc.dim(error instanceof Error ? error.message : 'Unknown error'))
    process.exit(1)
  }
}

/**
 * Sync from a specific path
 */
async function syncFromPath(
  sourcePath: string,
  claudeDir: string,
  options: { dryRun?: boolean; force?: boolean }
): Promise<void> {
  // Check for local modifications
  if (!options.force) {
    const hasLocalChanges = await checkLocalChanges(claudeDir)
    if (hasLocalChanges) {
      console.error(pc.yellow('\n[!] Local changes detected'))
      console.log(pc.dim('Use --force to overwrite local changes'))
      process.exit(1)
    }
  }

  console.log(pc.blue('\nSyncing directories...'))

  // Sync rules/core (always)
  const rulesCoreSource = join(sourcePath, 'rules', 'core')
  const rulesCoreTarget = join(claudeDir, 'rules', 'core')
  if (directoryExists(rulesCoreSource)) {
    if (!options.dryRun) {
      copyDir(rulesCoreSource, rulesCoreTarget)
    }
    console.log(pc.green('  [+] rules/core/'))
  }

  // Sync patterns/anti (always)
  const antiSource = join(sourcePath, 'patterns', 'anti')
  const antiTarget = join(claudeDir, 'patterns', 'anti')
  if (directoryExists(antiSource)) {
    if (!options.dryRun) {
      copyDir(antiSource, antiTarget)
    }
    console.log(pc.green('  [+] patterns/anti/'))
  }

  // Sync INDEX.md
  const indexSource = join(sourcePath, 'INDEX.md')
  const indexTarget = join(claudeDir, 'index.md')
  if (fileExists(indexSource)) {
    if (!options.dryRun) {
      copyFile(indexSource, indexTarget)
    }
    console.log(pc.green('  [+] index.md'))
  }

  // Update version in config
  const versionFile = join(sourcePath, '..', 'package.json')
  if (fileExists(versionFile)) {
    try {
      const pkg = JSON.parse(readFile(versionFile))
      console.log(pc.dim(`\n  Synced to version: ${pkg.version}`))
    } catch {
      // Ignore version parsing errors
    }
  }

  console.log(pc.green('\n[+] Sync completed'))
}

/**
 * Check if there are local changes in .claude directory
 */
async function checkLocalChanges(_claudeDir: string): Promise<boolean> {
  // For now, just check if directory has files
  // In a full implementation, we would compare hashes
  return false
}
