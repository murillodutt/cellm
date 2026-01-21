// CELLM Oracle - MCP Tool: cellm_check_pattern
// Check if code follows CELLM patterns


import { z } from 'zod'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import matter from 'gray-matter'
import { glob } from 'glob'

interface PatternCheckResult {
  matches: boolean
  patternId: string
  patternName: string
  violations: PatternViolation[]
  suggestions: string[]
}

interface PatternViolation {
  line?: number
  message: string
  severity: 'error' | 'warning' | 'info'
}

interface PatternRule {
  id: string
  name: string
  description: string
  goodPatterns: RegExp[]
  badPatterns: RegExp[]
  suggestions: string[]
}

// Built-in pattern rules
const PATTERN_RULES: Record<string, PatternRule> = {
  'TS-001': {
    id: 'TS-001',
    name: 'Explicit Return Types',
    description: 'Functions should have explicit return types',
    goodPatterns: [
      /function\s+\w+\([^)]*\)\s*:\s*\w+/,
      /const\s+\w+\s*=\s*\([^)]*\)\s*:\s*\w+\s*=>/,
      /const\s+\w+\s*=\s*async\s*\([^)]*\)\s*:\s*Promise<\w+>/,
    ],
    badPatterns: [
      /function\s+\w+\([^)]*\)\s*\{/,
      /const\s+\w+\s*=\s*\([^)]*\)\s*=>\s*\{/,
    ],
    suggestions: [
      'Add explicit return type annotation',
      'Use : ReturnType after parameter list',
    ],
  },
  'TS-002': {
    id: 'TS-002',
    name: 'Avoid any Type',
    description: 'Avoid using any type',
    goodPatterns: [
      /:\s*unknown/,
      /:\s*Record<string,\s*\w+>/,
    ],
    badPatterns: [
      /:\s*any\b/,
      /as\s+any\b/,
    ],
    suggestions: [
      'Use unknown instead of any',
      'Define specific type or interface',
      'Use generics for flexible typing',
    ],
  },
  'VU-001': {
    id: 'VU-001',
    name: 'Script Setup',
    description: 'Use script setup syntax in Vue components',
    goodPatterns: [
      /<script\s+setup/,
      /<script\s+lang="ts"\s+setup/,
    ],
    badPatterns: [
      /<script>\s*export\s+default\s*\{/,
      /defineComponent\s*\(/,
    ],
    suggestions: [
      'Use <script setup lang="ts">',
      'Remove defineComponent wrapper',
    ],
  },
  'VU-002': {
    id: 'VU-002',
    name: 'Typed Refs',
    description: 'Refs should have explicit type annotations',
    goodPatterns: [
      /ref<\w+>\(/,
      /const\s+\w+\s*=\s*ref<\w+>/,
    ],
    badPatterns: [
      /const\s+\w+\s*=\s*ref\([^)]*\)(?!.*<)/,
    ],
    suggestions: [
      'Use ref<Type>(initialValue)',
      'Add generic type parameter to ref',
    ],
  },
  'NX-001': {
    id: 'NX-001',
    name: 'Use $fetch',
    description: 'Use $fetch instead of axios or fetch',
    goodPatterns: [
      /\$fetch\(/,
      /useFetch\(/,
      /useAsyncData\(/,
    ],
    badPatterns: [
      /axios\./,
      /axios\(/,
      /import.*from\s+['"]axios['"]/,
      /fetch\(/,
    ],
    suggestions: [
      'Use $fetch for API calls',
      'Use useFetch for component data fetching',
      'Use useAsyncData for complex async operations',
    ],
  },
  'NX-002': {
    id: 'NX-002',
    name: 'Auto Imports',
    description: 'Use Nuxt auto imports',
    goodPatterns: [
      /const\s+\w+\s*=\s*useState/,
      /const\s+\w+\s*=\s*useRoute/,
      /const\s+\w+\s*=\s*useRouter/,
    ],
    badPatterns: [
      /import\s*\{\s*ref\s*\}\s*from\s+['"]vue['"]/,
      /import\s*\{\s*computed\s*\}\s*from\s+['"]vue['"]/,
      /import\s*\{\s*useState\s*\}\s*from\s+['"]#app['"]/,
    ],
    suggestions: [
      'Remove explicit Vue imports',
      'Nuxt auto-imports Vue composables',
      'Check nuxt.config for auto-import settings',
    ],
  },
}

async function loadCustomPatterns(projectPath: string): Promise<Record<string, PatternRule>> {
  const patternsDir = join(projectPath, '.claude', 'patterns')
  const customPatterns: Record<string, PatternRule> = {}

  try {
    const files = await glob('**/*.md', { cwd: patternsDir })
    for (const file of files) {
      try {
        const content = await readFile(join(patternsDir, file), 'utf-8')
        const { data } = matter(content)
        if (data.id) {
          // Create basic pattern rule from frontmatter
          customPatterns[data.id] = {
            id: data.id,
            name: data.name || data.id,
            description: data.description || '',
            goodPatterns: [],
            badPatterns: [],
            suggestions: data.suggestions || [],
          }
        }
      }
      catch {
        // Skip unreadable files
      }
    }
  }
  catch {
    // Patterns directory may not exist
  }

  return customPatterns
}

async function checkPattern(
  code: string,
  patternId: string,
  projectPath: string,
): Promise<PatternCheckResult> {
  // Load built-in and custom patterns
  const customPatterns = await loadCustomPatterns(projectPath)
  const allPatterns = { ...PATTERN_RULES, ...customPatterns }

  const pattern = allPatterns[patternId]
  if (!pattern) {
    return {
      matches: false,
      patternId,
      patternName: 'Unknown Pattern',
      violations: [{
        message: `Pattern ${patternId} not found`,
        severity: 'error',
      }],
      suggestions: ['Check pattern ID is correct', 'Available patterns: ' + Object.keys(allPatterns).join(', ')],
    }
  }

  const violations: PatternViolation[] = []
  const lines = code.split('\n')

  // Check for bad patterns
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? ''
    for (const badPattern of pattern.badPatterns) {
      if (badPattern.test(line)) {
        violations.push({
          line: i + 1,
          message: `Violates ${pattern.name}: ${badPattern.source}`,
          severity: 'error',
        })
      }
    }
  }

  // Check if good patterns are present
  let hasGoodPattern = pattern.goodPatterns.length === 0
  for (const goodPattern of pattern.goodPatterns) {
    if (goodPattern.test(code)) {
      hasGoodPattern = true
      break
    }
  }

  if (!hasGoodPattern && pattern.goodPatterns.length > 0) {
    violations.push({
      message: `Expected pattern ${pattern.name} not found`,
      severity: 'warning',
    })
  }

  return {
    matches: violations.length === 0,
    patternId: pattern.id,
    patternName: pattern.name,
    violations,
    suggestions: violations.length > 0 ? pattern.suggestions : [],
  }
}

export default defineMcpTool({
  name: 'cellm_check_pattern',
  description: 'Check if code follows a specific CELLM pattern',
  inputSchema: {
    code: z.string().describe('The code to check'),
    patternId: z.string().describe('Pattern ID to check against (e.g., TS-001, VU-002)'),
    projectPath: z.string().optional().describe('Path to the project root'),
  },
  handler: async ({ code, patternId, projectPath }) => {
    const config = useRuntimeConfig()
    const defaultPath = config.celllmCorePath
      ? join(process.cwd(), config.celllmCorePath)
      : process.cwd()
    const resolvedPath = projectPath || defaultPath
    const result = await checkPattern(code, patternId, resolvedPath)

    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify({
          matches: result.matches,
          patternId: result.patternId,
          patternName: result.patternName,
          violations: result.violations,
          suggestions: result.suggestions,
        }, null, 2),
      }],
    }
  },
})
