// CELLM Oracle - MCP Tool: cellm_validate
// Validate CELLM project structure and configuration


import { z } from 'zod'
import { readFile, access, readdir } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import matter from 'gray-matter'
import Ajv from 'ajv'
import addFormats from 'ajv-formats'

interface ValidationResult {
  valid: boolean
  score: number
  checks: ValidationCheck[]
  summary: ValidationSummary
}

interface ValidationCheck {
  name: string
  status: 'pass' | 'fail' | 'warning'
  message: string
  details?: string[]
}

interface ValidationSummary {
  totalChecks: number
  passed: number
  failed: number
  warnings: number
  budgetUsed: number
  budgetTotal: number
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path)
    return true
  }
  catch {
    return false
  }
}

async function validateStructure(projectPath: string): Promise<ValidationCheck[]> {
  const checks: ValidationCheck[] = []
  const claudeDir = join(projectPath, '.claude')

  // Check CLAUDE.md
  const claudeMd = join(projectPath, 'CLAUDE.md')
  if (await fileExists(claudeMd)) {
    checks.push({
      name: 'CLAUDE.md exists',
      status: 'pass',
      message: 'Project has CLAUDE.md configuration file',
    })

    // Validate CLAUDE.md content
    try {
      const content = await readFile(claudeMd, 'utf-8')
      const hasProjectTag = content.includes('<project>')
      const hasContextTag = content.includes('<context>')
      const hasLoadingTag = content.includes('<loading>')

      if (hasProjectTag && hasContextTag && hasLoadingTag) {
        checks.push({
          name: 'CLAUDE.md structure',
          status: 'pass',
          message: 'CLAUDE.md has all required tags',
        })
      }
      else {
        const missing: string[] = []
        if (!hasProjectTag)
          missing.push('<project>')
        if (!hasContextTag)
          missing.push('<context>')
        if (!hasLoadingTag)
          missing.push('<loading>')

        checks.push({
          name: 'CLAUDE.md structure',
          status: 'fail',
          message: 'CLAUDE.md missing required tags',
          details: missing,
        })
      }
    }
    catch (err) {
      checks.push({
        name: 'CLAUDE.md structure',
        status: 'fail',
        message: `Could not parse CLAUDE.md: ${err}`,
      })
    }
  }
  else {
    checks.push({
      name: 'CLAUDE.md exists',
      status: 'fail',
      message: 'CLAUDE.md not found in project root',
    })
  }

  // Check .claude directory
  if (await fileExists(claudeDir)) {
    checks.push({
      name: '.claude directory exists',
      status: 'pass',
      message: 'Project has .claude/ directory',
    })
  }
  else {
    checks.push({
      name: '.claude directory exists',
      status: 'fail',
      message: '.claude/ directory not found',
    })
  }

  // Check required subdirectories
  const requiredDirs = ['rules', 'patterns', 'index.md']
  for (const dir of requiredDirs) {
    const path = join(claudeDir, dir)
    if (await fileExists(path)) {
      checks.push({
        name: `.claude/${dir} exists`,
        status: 'pass',
        message: `Required path ${dir} exists`,
      })
    }
    else {
      checks.push({
        name: `.claude/${dir} exists`,
        status: 'fail',
        message: `Required path ${dir} not found`,
      })
    }
  }

  return checks
}

async function validateFrontmatter(projectPath: string): Promise<ValidationCheck[]> {
  const checks: ValidationCheck[] = []
  const claudeDir = join(projectPath, '.claude')

  if (!await fileExists(claudeDir)) {
    return checks
  }

  const ajv = new Ajv({ allErrors: true, strict: false })
  addFormats(ajv)

  // Define basic schema for frontmatter
  const baseSchema = {
    type: 'object',
    required: ['id', 'version', 'status'],
    properties: {
      id: { type: 'string', minLength: 1 },
      version: { type: 'string', pattern: '^v?\\d+\\.\\d+\\.\\d+' },
      status: { type: 'string', enum: ['OK', 'DRAFT', 'DEPRECATED', 'REVISAR'] },
      budget: { type: 'string' },
    },
  }

  const validate = ajv.compile(baseSchema)

  // Scan all .md files in .claude
  const mdFiles = await scanForMdFiles(claudeDir)
  let validFiles = 0
  let invalidFiles = 0
  const errors: string[] = []

  for (const file of mdFiles) {
    // Skip index.md and templates
    if (file.includes('index.md') || file.includes('templates'))
      continue

    try {
      const content = await readFile(file, 'utf-8')
      const { data } = matter(content)

      if (Object.keys(data).length === 0) {
        // No frontmatter - might be intentional
        continue
      }

      if (validate(data)) {
        validFiles++
      }
      else {
        invalidFiles++
        const relativePath = file.replace(claudeDir, '.claude')
        errors.push(`${relativePath}: ${ajv.errorsText(validate.errors)}`)
      }
    }
    catch {
      // Skip unreadable files
    }
  }

  if (invalidFiles === 0) {
    checks.push({
      name: 'Frontmatter validation',
      status: 'pass',
      message: `All ${validFiles} files have valid frontmatter`,
    })
  }
  else {
    checks.push({
      name: 'Frontmatter validation',
      status: 'fail',
      message: `${invalidFiles} files have invalid frontmatter`,
      details: errors.slice(0, 5), // Limit to first 5 errors
    })
  }

  return checks
}

async function scanForMdFiles(dir: string): Promise<string[]> {
  const results: string[] = []

  try {
    const entries = await readdir(dir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = join(dir, entry.name)
      if (entry.isDirectory()) {
        const subFiles = await scanForMdFiles(fullPath)
        results.push(...subFiles)
      }
      else if (entry.name.endsWith('.md')) {
        results.push(fullPath)
      }
    }
  }
  catch {
    // Directory may not exist
  }

  return results
}

async function validateBudget(projectPath: string): Promise<ValidationCheck[]> {
  const checks: ValidationCheck[] = []
  const claudeDir = join(projectPath, '.claude')

  if (!await fileExists(claudeDir)) {
    return checks
  }

  let totalBudget = 0
  const budgetLimit = 2200

  // Scan always-loaded files
  const alwaysLoadedDirs = [
    join(claudeDir, 'rules', 'core'),
    join(claudeDir, 'patterns', 'anti'),
  ]

  for (const dir of alwaysLoadedDirs) {
    if (await fileExists(dir)) {
      const files = await scanForMdFiles(dir)
      for (const file of files) {
        try {
          const content = await readFile(file, 'utf-8')
          const { data } = matter(content)
          if (data.budget) {
            const match = data.budget.match(/~?(\d+)/)
            if (match) {
              totalBudget += Number.parseInt(match[1], 10)
            }
          }
          else {
            // Estimate tokens from content length
            totalBudget += Math.ceil(content.length / 4)
          }
        }
        catch {
          // Skip unreadable files
        }
      }
    }
  }

  const budgetPercentage = Math.round((totalBudget / budgetLimit) * 100)

  if (budgetPercentage > 95) {
    checks.push({
      name: 'Budget check',
      status: 'fail',
      message: `Budget exceeded: ${totalBudget}/${budgetLimit} tokens (${budgetPercentage}%)`,
    })
  }
  else if (budgetPercentage > 90) {
    checks.push({
      name: 'Budget check',
      status: 'warning',
      message: `Budget warning: ${totalBudget}/${budgetLimit} tokens (${budgetPercentage}%)`,
    })
  }
  else {
    checks.push({
      name: 'Budget check',
      status: 'pass',
      message: `Budget OK: ${totalBudget}/${budgetLimit} tokens (${budgetPercentage}%)`,
    })
  }

  return checks
}

async function validateProject(projectPath: string): Promise<ValidationResult> {
  const allChecks: ValidationCheck[] = []

  // Run all validation checks
  const structureChecks = await validateStructure(projectPath)
  const frontmatterChecks = await validateFrontmatter(projectPath)
  const budgetChecks = await validateBudget(projectPath)

  allChecks.push(...structureChecks)
  allChecks.push(...frontmatterChecks)
  allChecks.push(...budgetChecks)

  // Calculate summary
  const passed = allChecks.filter(c => c.status === 'pass').length
  const failed = allChecks.filter(c => c.status === 'fail').length
  const warnings = allChecks.filter(c => c.status === 'warning').length

  // Calculate score (0-100)
  const score = Math.round((passed / allChecks.length) * 100)

  // Extract budget info
  const budgetCheck = budgetChecks[0]
  let budgetUsed = 0
  if (budgetCheck) {
    const match = budgetCheck.message.match(/(\d+)\/(\d+)/)
    if (match && match[1]) {
      budgetUsed = Number.parseInt(match[1], 10)
    }
  }

  return {
    valid: failed === 0,
    score,
    checks: allChecks,
    summary: {
      totalChecks: allChecks.length,
      passed,
      failed,
      warnings,
      budgetUsed,
      budgetTotal: 2200,
    },
  }
}

export default defineMcpTool({
  name: 'cellm_validate',
  description: 'Validate CELLM project structure, configuration, and compliance',
  inputSchema: {
    projectPath: z.string().optional().describe('Path to the project root'),
    verbose: z.boolean().optional().describe('Include detailed information').default(false),
  },
  handler: async ({ projectPath, verbose }) => {
    const resolvedPath = projectPath ? resolve(projectPath) : process.cwd()
    const result = await validateProject(resolvedPath)

    const output = verbose
      ? result
      : {
          valid: result.valid,
          score: result.score,
          summary: result.summary,
          issues: result.checks
            .filter(c => c.status !== 'pass')
            .map(c => ({
              name: c.name,
              status: c.status,
              message: c.message,
            })),
        }

    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify(output, null, 2),
      }],
    }
  },
})
