// CELLM Oracle - MCP Tool: cellm_suggest_reuse
// Suggest existing patterns and components for reuse


import { z } from 'zod'
import { readFile, readdir } from 'node:fs/promises'
import { join, resolve, extname } from 'node:path'
import matter from 'gray-matter'

interface ReuseSuggestion {
  type: 'pattern' | 'component' | 'composable' | 'utility'
  name: string
  path: string
  description: string
  similarity: number
  usage: string
}

interface SuggestReuseResult {
  suggestions: ReuseSuggestion[]
  totalFound: number
  query: string
}

interface PatternInfo {
  id: string
  name: string
  description: string
  category: string
  path: string
}

interface ComponentInfo {
  name: string
  path: string
  description: string
}

async function findPatterns(projectPath: string): Promise<PatternInfo[]> {
  const patterns: PatternInfo[] = []
  const patternsDir = join(projectPath, '.claude', 'patterns')

  try {
    const categories = await readdir(patternsDir, { withFileTypes: true })
    for (const category of categories) {
      if (category.isDirectory()) {
        const categoryPath = join(patternsDir, category.name)
        const files = await readdir(categoryPath)
        for (const file of files) {
          if (file.endsWith('.md')) {
            const filePath = join(categoryPath, file)
            try {
              const content = await readFile(filePath, 'utf-8')
              const { data, content: body } = matter(content)

              // Extract description from first paragraph
              const descMatch = body.match(/^[^#\n]+/)
              const description = descMatch ? descMatch[0].trim() : data.description || ''

              patterns.push({
                id: data.id || file.replace('.md', ''),
                name: data.name || file.replace('.md', ''),
                description,
                category: category.name,
                path: filePath,
              })
            }
            catch {
              // Skip unreadable files
            }
          }
        }
      }
    }
  }
  catch {
    // Patterns directory may not exist
  }

  return patterns
}

async function findComponents(projectPath: string): Promise<ComponentInfo[]> {
  const components: ComponentInfo[] = []
  const searchDirs = [
    join(projectPath, 'components'),
    join(projectPath, 'app', 'components'),
  ]

  for (const dir of searchDirs) {
    try {
      const files = await scanDirectory(dir)
      for (const file of files) {
        const ext = extname(file)
        if (ext === '.vue' || ext === '.tsx') {
          const name = file.split('/').pop()?.replace(ext, '') || ''
          components.push({
            name,
            path: file,
            description: `Vue component: ${name}`,
          })
        }
      }
    }
    catch {
      // Directory may not exist
    }
  }

  return components
}

async function findComposables(projectPath: string): Promise<ComponentInfo[]> {
  const composables: ComponentInfo[] = []
  const searchDirs = [
    join(projectPath, 'composables'),
    join(projectPath, 'app', 'composables'),
  ]

  for (const dir of searchDirs) {
    try {
      const files = await scanDirectory(dir)
      for (const file of files) {
        const ext = extname(file)
        if (ext === '.ts' || ext === '.js') {
          const name = file.split('/').pop()?.replace(ext, '') || ''
          composables.push({
            name,
            path: file,
            description: `Composable: ${name}`,
          })
        }
      }
    }
    catch {
      // Directory may not exist
    }
  }

  return composables
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
      else {
        results.push(fullPath)
      }
    }
  }
  catch {
    // Directory may not exist
  }

  return results
}

function calculateSimilarity(text: string, query: string): number {
  const textLower = text.toLowerCase()
  const queryLower = query.toLowerCase()
  const queryWords = queryLower.split(/\s+/)

  let matches = 0
  for (const word of queryWords) {
    if (textLower.includes(word)) {
      matches++
    }
  }

  // Exact match bonus
  if (textLower.includes(queryLower)) {
    return Math.min(1, matches / queryWords.length + 0.3)
  }

  return matches / queryWords.length
}

async function suggestReuse(
  query: string,
  context: string,
  projectPath: string,
): Promise<SuggestReuseResult> {
  const suggestions: ReuseSuggestion[] = []
  const searchText = `${query} ${context}`.toLowerCase()

  // Find patterns
  const patterns = await findPatterns(projectPath)
  for (const pattern of patterns) {
    const similarity = calculateSimilarity(
      `${pattern.id} ${pattern.name} ${pattern.description} ${pattern.category}`,
      searchText,
    )
    if (similarity > 0.2) {
      suggestions.push({
        type: 'pattern',
        name: pattern.id,
        path: pattern.path,
        description: pattern.description,
        similarity,
        usage: `Apply pattern ${pattern.id} (${pattern.name})`,
      })
    }
  }

  // Find components
  const components = await findComponents(projectPath)
  for (const component of components) {
    const similarity = calculateSimilarity(
      `${component.name} ${component.description}`,
      searchText,
    )
    if (similarity > 0.2) {
      suggestions.push({
        type: 'component',
        name: component.name,
        path: component.path,
        description: component.description,
        similarity,
        usage: `<${component.name} />`,
      })
    }
  }

  // Find composables
  const composables = await findComposables(projectPath)
  for (const composable of composables) {
    const similarity = calculateSimilarity(
      `${composable.name} ${composable.description}`,
      searchText,
    )
    if (similarity > 0.2) {
      suggestions.push({
        type: 'composable',
        name: composable.name,
        path: composable.path,
        description: composable.description,
        similarity,
        usage: `const { ... } = ${composable.name}()`,
      })
    }
  }

  // Sort by similarity
  suggestions.sort((a, b) => b.similarity - a.similarity)

  // Limit results
  const limitedSuggestions = suggestions.slice(0, 10)

  return {
    suggestions: limitedSuggestions,
    totalFound: suggestions.length,
    query,
  }
}

export default defineMcpTool({
  name: 'cellm_suggest_reuse',
  description: 'Suggest existing patterns, components, and composables that could be reused for a given task',
  inputSchema: {
    query: z.string().describe('What you are trying to implement (e.g., "form validation", "user authentication")'),
    context: z.string().optional().describe('Additional context about the implementation').default(''),
    projectPath: z.string().optional().describe('Path to the project root'),
  },
  handler: async ({ query, context, projectPath }) => {
    const resolvedPath = projectPath ? resolve(projectPath) : process.cwd()
    const result = await suggestReuse(query, context || '', resolvedPath)

    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify({
          suggestions: result.suggestions,
          totalFound: result.totalFound,
          query: result.query,
        }, null, 2),
      }],
    }
  },
})
