import { Command } from 'commander'
import pc from 'picocolors'
import { execSync } from 'node:child_process'
import { join } from 'node:path'
import { directoryExists, fileExists, readFile } from '../utils/fs.js'

interface CheckResult {
  name: string
  status: 'pass' | 'warn' | 'fail'
  message: string
  fix?: string
}

/**
 * Create the doctor command
 */
export const doctorCommand = new Command('doctor')
  .description('Diagnose CELLM configuration issues')
  .option('-d, --dir <path>', 'Directory to check', '.')
  .option('-v, --verbose', 'Show detailed output')
  .action(async (options) => {
    const startTime = performance.now()
    const targetDir = options.dir === '.' ? process.cwd() : options.dir

    console.log(pc.blue('\nCELLM Doctor'))
    console.log(pc.dim('─'.repeat(50)))

    const checks: CheckResult[] = []

    // Check 1: Node.js version
    console.log(pc.blue('\nEnvironment'))
    const nodeVersion = process.version
    const nodeMajor = parseInt(nodeVersion.slice(1).split('.')[0], 10)

    if (nodeMajor >= 20) {
      checks.push({
        name: 'Node.js version',
        status: 'pass',
        message: `${nodeVersion} (required: >=20)`,
      })
      console.log(pc.green(`  [+] Node.js: ${nodeVersion}`))
    } else {
      checks.push({
        name: 'Node.js version',
        status: 'fail',
        message: `${nodeVersion} (required: >=20)`,
        fix: 'Upgrade Node.js to version 20 or higher',
      })
      console.log(pc.red(`  [-] Node.js: ${nodeVersion} (requires >=20)`))
    }

    // Check 2: npm version
    try {
      const npmVersion = execSync('npm --version', { encoding: 'utf-8' }).trim()
      checks.push({
        name: 'npm version',
        status: 'pass',
        message: npmVersion,
      })
      console.log(pc.green(`  [+] npm: ${npmVersion}`))
    } catch {
      checks.push({
        name: 'npm version',
        status: 'fail',
        message: 'Not found',
        fix: 'Install npm',
      })
      console.log(pc.red('  [-] npm: not found'))
    }

    // Check 3: Git repository
    const isGitRepo = directoryExists(join(targetDir, '.git'))
    if (isGitRepo) {
      checks.push({
        name: 'Git repository',
        status: 'pass',
        message: 'Found',
      })
      console.log(pc.green('  [+] Git: repository found'))
    } else {
      checks.push({
        name: 'Git repository',
        status: 'warn',
        message: 'Not a git repository',
        fix: 'Run "git init" to initialize',
      })
      console.log(pc.yellow('  [!] Git: not a repository'))
    }

    // Check 4: CELLM structure
    console.log(pc.blue('\nCELLM Structure'))

    const claudeDir = join(targetDir, '.claude')
    if (directoryExists(claudeDir)) {
      checks.push({
        name: '.claude directory',
        status: 'pass',
        message: 'Found',
      })
      console.log(pc.green('  [+] .claude/ directory'))
    } else {
      checks.push({
        name: '.claude directory',
        status: 'fail',
        message: 'Not found',
        fix: 'Run "cellm init" to create structure',
      })
      console.log(pc.red('  [-] .claude/ directory not found'))
    }

    // Check 5: CLAUDE.md
    const claudeMdPath = join(targetDir, 'CLAUDE.md')
    if (fileExists(claudeMdPath)) {
      // Validate CLAUDE.md content
      const content = readFile(claudeMdPath)

      const hasProjectTag = content.includes('<project>')
      const hasContextTag = content.includes('<context>')
      const hasLoadingTag = content.includes('<loading>')

      if (hasProjectTag && hasContextTag && hasLoadingTag) {
        checks.push({
          name: 'CLAUDE.md',
          status: 'pass',
          message: 'Valid structure',
        })
        console.log(pc.green('  [+] CLAUDE.md: valid structure'))
      } else {
        const missing = []
        if (!hasProjectTag) missing.push('<project>')
        if (!hasContextTag) missing.push('<context>')
        if (!hasLoadingTag) missing.push('<loading>')

        checks.push({
          name: 'CLAUDE.md',
          status: 'warn',
          message: `Missing tags: ${missing.join(', ')}`,
          fix: 'Add missing tags to CLAUDE.md',
        })
        console.log(pc.yellow(`  [!] CLAUDE.md: missing ${missing.join(', ')}`))
      }
    } else {
      checks.push({
        name: 'CLAUDE.md',
        status: 'warn',
        message: 'Not found',
        fix: 'Run "cellm init" or create CLAUDE.md manually',
      })
      console.log(pc.yellow('  [!] CLAUDE.md: not found'))
    }

    // Check 6: index.md
    const indexPath = join(claudeDir, 'index.md')
    if (fileExists(indexPath)) {
      checks.push({
        name: 'index.md',
        status: 'pass',
        message: 'Found',
      })
      console.log(pc.green('  [+] index.md'))
    } else if (directoryExists(claudeDir)) {
      checks.push({
        name: 'index.md',
        status: 'warn',
        message: 'Not found',
        fix: 'Create .claude/index.md for context indexing',
      })
      console.log(pc.yellow('  [!] index.md: not found'))
    }

    // Check 7: Required directories
    console.log(pc.blue('\nRequired Directories'))

    const requiredDirs = [
      { name: 'rules', required: true },
      { name: 'rules/core', required: true },
      { name: 'patterns', required: true },
      { name: 'patterns/anti', required: true },
    ]

    for (const dir of requiredDirs) {
      const fullPath = join(claudeDir, dir.name)
      if (directoryExists(fullPath)) {
        checks.push({
          name: dir.name,
          status: 'pass',
          message: 'Found',
        })
        console.log(pc.green(`  [+] ${dir.name}/`))
      } else if (directoryExists(claudeDir)) {
        checks.push({
          name: dir.name,
          status: dir.required ? 'fail' : 'warn',
          message: 'Not found',
          fix: `Run "cellm init" to create ${dir.name}/`,
        })
        if (dir.required) {
          console.log(pc.red(`  [-] ${dir.name}/ (required)`))
        } else {
          console.log(pc.yellow(`  [!] ${dir.name}/ (recommended)`))
        }
      }
    }

    // Check 8: package.json
    console.log(pc.blue('\nProject Configuration'))

    const packageJsonPath = join(targetDir, 'package.json')
    if (fileExists(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(readFile(packageJsonPath))

        checks.push({
          name: 'package.json',
          status: 'pass',
          message: `${packageJson.name || 'unnamed'} v${packageJson.version || '0.0.0'}`,
        })
        console.log(pc.green(`  [+] package.json: ${packageJson.name || 'unnamed'}`))

        // Check for type: module
        if (packageJson.type === 'module') {
          console.log(pc.green('  [+] ESM: type: module'))
        } else if (options.verbose) {
          console.log(pc.dim('  [~] ESM: CommonJS (optional)'))
        }
      } catch {
        checks.push({
          name: 'package.json',
          status: 'warn',
          message: 'Invalid JSON',
          fix: 'Fix package.json syntax',
        })
        console.log(pc.yellow('  [!] package.json: invalid JSON'))
      }
    } else {
      checks.push({
        name: 'package.json',
        status: 'warn',
        message: 'Not found',
        fix: 'Run "npm init" to create package.json',
      })
      console.log(pc.yellow('  [!] package.json: not found'))
    }

    // Summary
    const elapsed = Math.round(performance.now() - startTime)
    const passed = checks.filter((c) => c.status === 'pass').length
    const warned = checks.filter((c) => c.status === 'warn').length
    const failed = checks.filter((c) => c.status === 'fail').length

    console.log(pc.dim('\n' + '─'.repeat(50)))

    if (failed === 0) {
      console.log(pc.green('[+] Health Check Passed'))
    } else {
      console.log(pc.red('[-] Health Check Failed'))
    }

    console.log(pc.dim(`\n  Passed: ${passed}`))
    console.log(pc.dim(`  Warnings: ${warned}`))
    console.log(pc.dim(`  Failed: ${failed}`))
    console.log(pc.dim(`  Time: ${elapsed}ms`))

    // Show fixes for issues
    const issues = checks.filter((c) => c.status !== 'pass' && c.fix)
    if (issues.length > 0) {
      console.log(pc.blue('\nSuggested Fixes:'))
      for (const issue of issues) {
        const prefix = issue.status === 'fail' ? pc.red('[-]') : pc.yellow('[!]')
        console.log(`  ${prefix} ${issue.name}: ${pc.dim(issue.fix)}`)
      }
    }

    // Exit with appropriate code
    if (failed > 0) {
      process.exit(1)
    }
  })
