import { Command } from 'commander'
import pc from 'picocolors'
import { join } from 'node:path'
import {
  directoryExists,
  findMarkdownFiles,
  relativePath,
  fileExists,
} from '../utils/fs.js'
import {
  validateMarkdownFile,
  getSchemaTypeFromPath,
  ValidationError,
} from '../utils/schema.js'
import { estimateFileTokens, checkBudget, formatBudgetStatus, BUDGET_LIMITS } from '../utils/token.js'

interface ValidationSummary {
  totalFiles: number
  validFiles: number
  invalidFiles: number
  errors: ValidationError[]
  warnings: string[]
  budgetUsed: number
}

/**
 * Create the validate command
 */
export const validateCommand = new Command('validate')
  .description('Validate CELLM project structure and schemas')
  .option('-d, --dir <path>', 'Directory to validate', '.')
  .option('-v, --verbose', 'Show detailed output')
  .option('--fix', 'Attempt to fix simple issues (not implemented)')
  .action(async (options) => {
    const startTime = performance.now()
    const targetDir = options.dir === '.' ? process.cwd() : options.dir
    const claudeDir = join(targetDir, '.claude')

    console.log(pc.blue('\nCELLM Validate'))
    console.log(pc.dim('─'.repeat(50)))

    // Check if .claude directory exists
    if (!directoryExists(claudeDir)) {
      console.error(pc.red('[-] .claude directory not found'))
      console.log(pc.dim('Run "cellm init" to create the structure'))
      process.exit(1)
    }

    const summary: ValidationSummary = {
      totalFiles: 0,
      validFiles: 0,
      invalidFiles: 0,
      errors: [],
      warnings: [],
      budgetUsed: 0,
    }

    // Validate directory structure
    console.log(pc.blue('\nDirectory Structure'))
    const requiredDirs = ['rules', 'patterns']
    const optionalDirs = ['skills', 'project', 'session', 'workflows', 'agents']

    for (const dir of requiredDirs) {
      const fullPath = join(claudeDir, dir)
      if (directoryExists(fullPath)) {
        console.log(pc.green(`  [+] ${dir}/`))
      } else {
        console.log(pc.red(`  [-] ${dir}/ (missing)`))
        summary.errors.push({
          file: fullPath,
          field: '/',
          message: `Required directory missing: ${dir}/`,
        })
      }
    }

    for (const dir of optionalDirs) {
      const fullPath = join(claudeDir, dir)
      if (directoryExists(fullPath)) {
        console.log(pc.green(`  [+] ${dir}/`))
      } else if (options.verbose) {
        console.log(pc.dim(`  [~] ${dir}/ (optional)`))
      }
    }

    // Check for index.md
    const indexPath = join(claudeDir, 'index.md')
    if (fileExists(indexPath)) {
      console.log(pc.green('  [+] index.md'))
    } else {
      console.log(pc.yellow('  [!] index.md (recommended)'))
      summary.warnings.push('index.md not found - recommended for context loading')
    }

    // Check for CLAUDE.md
    const claudeMdPath = join(targetDir, 'CLAUDE.md')
    if (fileExists(claudeMdPath)) {
      console.log(pc.green('  [+] CLAUDE.md'))
    } else {
      console.log(pc.yellow('  [!] CLAUDE.md (recommended)'))
      summary.warnings.push('CLAUDE.md not found - recommended for project configuration')
    }

    // Validate frontmatter in all markdown files
    console.log(pc.blue('\nFrontmatter Validation'))

    const mdFiles = findMarkdownFiles(claudeDir)
    summary.totalFiles = mdFiles.length

    for (const file of mdFiles) {
      const relPath = relativePath(claudeDir, file)
      const schemaType = getSchemaTypeFromPath(file)

      // Skip files that don't need schema validation
      if (!schemaType) {
        if (options.verbose) {
          console.log(pc.dim(`  [~] ${relPath} (no schema)`))
        }
        summary.validFiles++
        continue
      }

      const result = validateMarkdownFile(file)

      if (result.valid) {
        console.log(pc.green(`  [+] ${relPath}`))
        summary.validFiles++
      } else {
        console.log(pc.red(`  [-] ${relPath}`))
        for (const error of result.errors) {
          console.log(pc.red(`      ${error.field}: ${error.message}`))
        }
        summary.invalidFiles++
        summary.errors.push(...result.errors)
      }

      // Calculate token usage
      summary.budgetUsed += estimateFileTokens(file)
    }

    // Budget check
    console.log(pc.blue('\nBudget Estimation'))
    const budgetStatus = checkBudget(summary.budgetUsed, BUDGET_LIMITS.CORE)

    const statusColor =
      budgetStatus.status === 'ok'
        ? pc.green
        : budgetStatus.status === 'warning'
          ? pc.yellow
          : pc.red

    console.log(statusColor(`  ${formatBudgetStatus(budgetStatus)}`))

    if (budgetStatus.status === 'warning') {
      summary.warnings.push(`Budget at ${Math.round(budgetStatus.percentage * 100)}% - consider optimizing`)
    } else if (budgetStatus.status === 'critical' || budgetStatus.status === 'exceeded') {
      summary.errors.push({
        file: claudeDir,
        field: 'budget',
        message: `Budget ${budgetStatus.status}: ${summary.budgetUsed}/${BUDGET_LIMITS.CORE} tokens`,
      })
    }

    // Summary
    const elapsed = Math.round(performance.now() - startTime)

    console.log(pc.dim('\n' + '─'.repeat(50)))

    if (summary.errors.length === 0) {
      console.log(pc.green('[+] Validation Passed'))
    } else {
      console.log(pc.red('[-] Validation Failed'))
    }

    console.log(pc.dim(`\n  Files: ${summary.totalFiles}`))
    console.log(pc.dim(`  Valid: ${summary.validFiles}`))
    console.log(pc.dim(`  Invalid: ${summary.invalidFiles}`))
    console.log(pc.dim(`  Warnings: ${summary.warnings.length}`))
    console.log(pc.dim(`  Errors: ${summary.errors.length}`))
    console.log(pc.dim(`  Time: ${elapsed}ms`))

    // Exit with appropriate code
    if (summary.errors.length > 0) {
      process.exit(1)
    }
  })
