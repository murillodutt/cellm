import { Command } from 'commander'
import pc from 'picocolors'
import { getCellmCorePath } from '../utils/fs.js'
import {
  compileProfile,
  writeCompiledProfile,
  resolveProfile,
  resolveInheritanceChain,
  getAvailableProfiles,
  PROFILES,
  type CompilationResult,
} from '../utils/profile.js'
import { createProgressBar } from '../utils/token.js'

/**
 * Create the compile command
 */
export const compileCommand = new Command('compile')
  .description('Compile a CELLM profile into optimized context')
  .option('-p, --profile <name>', 'Profile to compile', 'nuxt-fullstack')
  .option('-o, --output <path>', 'Output directory', '.')
  .option('--dry-run', 'Show what would be compiled without writing files')
  .option('--list', 'List available profiles')
  .action(async (options) => {
    // List profiles if requested
    if (options.list) {
      listProfiles()
      return
    }

    const { profile: profileName, output: outputPath, dryRun } = options
    const cellmCorePath = getCellmCorePath()

    console.log('')
    console.log(pc.bold('CELLM Compile'))
    console.log(pc.dim('─'.repeat(50)))
    console.log('')

    // Validate profile
    const resolvedProfile = resolveProfile(profileName)
    if (!resolvedProfile) {
      console.log(pc.red(`[-] Unknown profile: ${profileName}`))
      console.log('')
      console.log('Available profiles:')
      for (const name of getAvailableProfiles()) {
        console.log(`  - ${name}`)
      }
      process.exit(1)
    }

    console.log(pc.cyan(`Compiling profile: ${pc.bold(profileName)}`))
    console.log(pc.dim(`Description: ${resolvedProfile.description}`))
    console.log('')

    // Show inheritance chain
    const chain = resolveInheritanceChain(profileName)
    if (chain.length > 1) {
      console.log(pc.yellow('Resolving inheritance:'))
      console.log(`  ${chain.join(' -> ')}`)
      console.log('')
    }

    // Compile the profile
    const result = compileProfile(profileName, cellmCorePath)
    if (!result) {
      console.log(pc.red('[-] Failed to compile profile'))
      process.exit(1)
    }

    // Display compilation results
    displayCompilationResult(result)

    // Write files unless dry-run
    if (!dryRun) {
      console.log('')
      console.log(pc.yellow('Writing files...'))
      const contextPath = writeCompiledProfile(result, outputPath)
      console.log(pc.green(`[+] Compiled context written to: ${contextPath}`))
      console.log(pc.green(`[+] ${result.files.length} files copied to .claude/`))
    } else {
      console.log('')
      console.log(pc.yellow('[i] Dry run - no files written'))
    }

    console.log('')
  })

/**
 * Display compilation result
 */
function displayCompilationResult(result: CompilationResult): void {
  const { files, totalTokens, budget } = result

  // Group files by category
  const rules = files.filter((f) => f.category === 'rules')
  const patterns = files.filter((f) => f.category === 'patterns')
  const skills = files.filter((f) => f.category === 'skills')

  // Display rules
  if (rules.length > 0) {
    console.log(pc.yellow('Merging rules:'))
    for (const f of rules) {
      console.log(`  ${pc.green('[+]')} ${f.relativePath}`)
    }
    console.log('')
  }

  // Display patterns
  if (patterns.length > 0) {
    console.log(pc.yellow('Merging patterns:'))
    for (const f of patterns) {
      console.log(`  ${pc.green('[+]')} ${f.relativePath}`)
    }
    console.log('')
  }

  // Display skills
  if (skills.length > 0) {
    console.log(pc.yellow('Merging skills:'))
    for (const f of skills) {
      console.log(`  ${pc.green('[+]')} ${f.relativePath}`)
    }
    console.log('')
  }

  // Budget summary
  const percentage = Math.round(budget.percentage * 100)
  const bar = createProgressBar(budget.percentage, 30)

  let statusColor: (s: string) => string
  let statusIcon: string
  switch (budget.status) {
    case 'ok':
      statusColor = pc.green
      statusIcon = '[+]'
      break
    case 'warning':
      statusColor = pc.yellow
      statusIcon = '[!]'
      break
    case 'critical':
      statusColor = pc.red
      statusIcon = '[!]'
      break
    case 'exceeded':
      statusColor = pc.red
      statusIcon = '[-]'
      break
  }

  console.log(pc.cyan('Budget:'))
  console.log(`  ${totalTokens}/${budget.total} tokens (${percentage}%)`)
  console.log(`  ${bar}`)
  console.log(`  Status: ${statusColor(`${statusIcon} ${budget.status.toUpperCase()}`)}`)
}

/**
 * List available profiles
 */
function listProfiles(): void {
  console.log('')
  console.log(pc.bold('Available Profiles'))
  console.log(pc.dim('─'.repeat(50)))
  console.log('')

  const profiles = getAvailableProfiles()

  // Group by inheritance level
  const baseProfiles = profiles.filter((p) => !PROFILES[p].extends)
  const derivedProfiles = profiles.filter((p) => PROFILES[p].extends)

  console.log(pc.yellow('Base profiles:'))
  for (const name of baseProfiles) {
    const profile = PROFILES[name]
    console.log(`  ${pc.green(name)}`)
    console.log(`    ${pc.dim(profile.description)}`)
  }
  console.log('')

  console.log(pc.yellow('Derived profiles:'))
  for (const name of derivedProfiles) {
    const profile = PROFILES[name]
    const chain = resolveInheritanceChain(name)
    console.log(`  ${pc.green(name)} ${pc.dim(`(extends: ${profile.extends})`)}`)
    console.log(`    ${pc.dim(profile.description)}`)
    console.log(`    ${pc.dim('Chain: ' + chain.join(' -> '))}`)
  }
  console.log('')

  console.log(pc.dim('Use: cellm compile --profile <name>'))
  console.log('')
}
