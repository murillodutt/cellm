// CELLM Oracle - Status API Endpoint
// Returns project status using the MCP tool

import { readFile, access } from 'node:fs/promises'
import { join } from 'node:path'
import matter from 'gray-matter'
import type { ProjectStatus } from '~/types'

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path)
    return true
  }
  catch {
    return false
  }
}

export default defineEventHandler(async (_event): Promise<ProjectStatus> => {
  const projectPath = process.cwd()
  const celllmDir = join(projectPath, '.claude')
  const claudeMd = join(projectPath, 'CLAUDE.md')

  const errors: string[] = []
  const warnings: string[] = []

  // Check CLAUDE.md exists
  if (!await fileExists(claudeMd)) {
    errors.push('CLAUDE.md not found in project root')
  }

  // Check .claude directory exists
  if (!await fileExists(celllmDir)) {
    errors.push('.claude/ directory not found')
  }

  // Parse CLAUDE.md for project info
  let version = 'unknown'
  let profile = 'unknown'

  if (await fileExists(claudeMd)) {
    try {
      const content = await readFile(claudeMd, 'utf-8')

      // Extract project tag
      const projectMatch = content.match(/<project>([\s\S]*?)<\/project>/)
      if (projectMatch && projectMatch[1]) {
        const projectContent = projectMatch[1]
        const versionMatch = projectContent.match(/cellm:\s*(v?\d+\.\d+\.\d+)/)
        const profileMatch = projectContent.match(/profile:\s*(\S+)/)

        if (versionMatch && versionMatch[1])
          version = versionMatch[1]
        if (profileMatch && profileMatch[1])
          profile = profileMatch[1]
      }
    }
    catch (err) {
      warnings.push(`Could not parse CLAUDE.md: ${err}`)
    }
  }

  // Estimate budget usage
  let budgetUsed = 0
  const budgetTotal = 2200

  const dirsToCheck = [
    join(celllmDir, 'rules', 'core'),
    join(celllmDir, 'patterns', 'anti'),
    join(celllmDir, 'project', 'product'),
  ]

  for (const dir of dirsToCheck) {
    if (await fileExists(dir)) {
      try {
        const { glob } = await import('glob')
        const files = await glob('**/*.md', { cwd: dir })
        for (const file of files) {
          try {
            const content = await readFile(join(dir, file), 'utf-8')
            const { data } = matter(content)
            if (data.budget) {
              const tokenMatch = data.budget.match(/~?(\d+)/)
              if (tokenMatch) {
                budgetUsed += Number.parseInt(tokenMatch[1], 10)
              }
            }
          }
          catch {
            // Skip unreadable files
          }
        }
      }
      catch {
        // Skip inaccessible directories
      }
    }
  }

  // Check for budget warning
  const budgetPercentage = Math.round((budgetUsed / budgetTotal) * 100)
  if (budgetPercentage > 95) {
    errors.push(`Budget exceeded: ${budgetPercentage}%`)
  }
  else if (budgetPercentage > 90) {
    warnings.push(`Budget warning: ${budgetPercentage}%`)
  }

  return {
    valid: errors.length === 0,
    version,
    profile,
    budget: {
      used: budgetUsed,
      total: budgetTotal,
      percentage: budgetPercentage,
    },
    lastValidation: new Date().toISOString(),
    errors,
    warnings,
  }
})
