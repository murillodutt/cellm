// CELLM Oracle - Budget API Endpoint
// Returns detailed budget breakdown by layer

import { readFile, access, readdir } from 'node:fs/promises'
import { join } from 'node:path'
import matter from 'gray-matter'
import type { BudgetData, BudgetLayer } from '~/types'

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path)
    return true
  }
  catch {
    return false
  }
}

async function scanDirectory(dir: string): Promise<string[]> {
  const results: string[] = []

  try {
    const entries = await readdir(dir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = join(dir, entry.name)
      if (entry.isDirectory()) {
        const subFiles = await scanDirectory(fullPath)
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

async function calculateLayerBudget(dir: string): Promise<number> {
  let tokens = 0

  if (!await fileExists(dir)) {
    return tokens
  }

  const files = await scanDirectory(dir)
  for (const file of files) {
    try {
      const content = await readFile(file, 'utf-8')
      const { data } = matter(content)

      if (data.budget) {
        const match = data.budget.match(/~?(\d+)/)
        if (match) {
          tokens += Number.parseInt(match[1], 10)
        }
      }
      else {
        // Estimate from content length
        tokens += Math.ceil(content.length / 4)
      }
    }
    catch {
      // Skip unreadable files
    }
  }

  return tokens
}

export default defineEventHandler(async (_event): Promise<BudgetData> => {
  const projectPath = process.cwd()
  const celllmDir = join(projectPath, '.claude')
  const budgetLimit = 2200

  const layers: BudgetLayer[] = []

  // Calculate tokens for each layer
  const layerConfig = [
    { name: 'Core', dir: join(celllmDir, 'rules', 'core'), color: '#16a34a' },
    { name: 'Domain', dir: join(celllmDir, 'rules', 'domain'), color: '#2563eb' },
    { name: 'Patterns', dir: join(celllmDir, 'patterns'), color: '#9333ea' },
    { name: 'Project', dir: join(celllmDir, 'project'), color: '#f59e0b' },
    { name: 'Session', dir: join(celllmDir, 'session'), color: '#06b6d4' },
  ]

  let totalTokens = 0

  for (const layer of layerConfig) {
    const tokens = await calculateLayerBudget(layer.dir)
    totalTokens += tokens

    layers.push({
      name: layer.name,
      tokens,
      percentage: 0, // Will calculate after total
      color: layer.color,
    })
  }

  // Calculate percentages
  for (const layer of layers) {
    layer.percentage = Math.round((layer.tokens / budgetLimit) * 100)
  }

  const totalPercentage = Math.round((totalTokens / budgetLimit) * 100)

  return {
    layers,
    total: totalTokens,
    limit: budgetLimit,
    percentage: totalPercentage,
  }
})
