// CELLM Oracle - Patterns API Endpoint
// Returns pattern analytics data

import { readFile, access, readdir } from 'node:fs/promises'
import { join } from 'node:path'
import matter from 'gray-matter'
import type { PatternAnalytics, PatternUsage } from '~/types'

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path)
    return true
  }
  catch {
    return false
  }
}

async function scanPatterns(patternsDir: string): Promise<PatternUsage[]> {
  const patterns: PatternUsage[] = []

  if (!await fileExists(patternsDir)) {
    return patterns
  }

  try {
    const categories = await readdir(patternsDir, { withFileTypes: true })

    for (const category of categories) {
      if (!category.isDirectory())
        continue

      const categoryPath = join(patternsDir, category.name)
      const files = await readdir(categoryPath)

      for (const file of files) {
        if (!file.endsWith('.md'))
          continue

        const filePath = join(categoryPath, file)
        try {
          const content = await readFile(filePath, 'utf-8')
          const { data } = matter(content)

          if (data.id) {
            patterns.push({
              id: data.id,
              name: data.name || data.id,
              category: category.name,
              hits: Math.floor(Math.random() * 100) + 20, // Mock data
              lastUsed: new Date().toISOString(),
            })
          }
        }
        catch {
          // Skip unreadable files
        }
      }
    }
  }
  catch {
    // Directory may not exist
  }

  return patterns.sort((a, b) => b.hits - a.hits)
}

export default defineEventHandler(async (_event): Promise<PatternAnalytics> => {
  const config = useRuntimeConfig()
  const projectPath = config.celllmCorePath
    ? join(process.cwd(), config.celllmCorePath)
    : process.cwd()
  const patternsDir = join(projectPath, '.claude', 'patterns')

  const patterns = await scanPatterns(patternsDir)

  // Calculate coverage by type
  const coverageByType: Record<string, number> = {}
  for (const pattern of patterns) {
    const category = pattern.category
    coverageByType[category] = (coverageByType[category] ?? 0) + 1
  }

  // Convert to percentages
  const total = patterns.length || 1
  for (const key of Object.keys(coverageByType)) {
    const current = coverageByType[key] ?? 0
    coverageByType[key] = Math.round((current / total) * 100)
  }

  // Calculate total hits
  const totalHits = patterns.reduce((sum, p) => sum + p.hits, 0)

  return {
    patterns,
    totalPatterns: patterns.length,
    totalHits,
    preventionRate: 87, // Mock data
    coverageByType,
  }
})
