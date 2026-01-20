import { join, relative } from 'node:path'
import { fileExists, directoryExists, readFile, findMarkdownFiles, copyFile, ensureDir, writeFile } from './fs.js'
import { estimateTokens, checkBudget, type BudgetStatus } from './token.js'
import matter from 'gray-matter'

/**
 * Profile definition
 */
export interface ProfileDefinition {
  name: string
  description: string
  extends?: string // Parent profile for inheritance
  rules: string[]
  patterns: string[]
  skills: string[]
}

/**
 * Built-in profiles with inheritance
 */
export const PROFILES: Record<string, ProfileDefinition> = {
  base: {
    name: 'base',
    description: 'Base profile with core rules only',
    rules: ['core/conventions', 'core/limits', 'core/protocols'],
    patterns: ['anti/prohibited-patterns', 'anti/prohibited-libs', 'anti/prohibited-code', 'anti/prohibited-nav'],
    skills: [],
  },
  typescript: {
    name: 'typescript',
    description: 'TypeScript project with core patterns',
    extends: 'base',
    rules: [],
    patterns: ['typescript'],
    skills: [],
  },
  web: {
    name: 'web',
    description: 'Web frontend with TypeScript',
    extends: 'typescript',
    rules: ['domain/frontend'],
    patterns: [],
    skills: ['tailwind'],
  },
  vue: {
    name: 'vue',
    description: 'Vue 3 application',
    extends: 'web',
    rules: [],
    patterns: ['vue'],
    skills: ['vue'],
  },
  nuxt: {
    name: 'nuxt',
    description: 'Nuxt 4 application',
    extends: 'vue',
    rules: ['domain/backend'],
    patterns: ['nuxt'],
    skills: ['nuxt', 'nuxt-ui'],
  },
  'nuxt-fullstack': {
    name: 'nuxt-fullstack',
    description: 'Nuxt 4 full-stack with Drizzle, Nuxt UI, Pinia',
    extends: 'nuxt',
    rules: [],
    patterns: ['drizzle', 'pinia'],
    skills: ['drizzle', 'pinia'],
  },
  'nuxt-saas': {
    name: 'nuxt-saas',
    description: 'Nuxt 4 SaaS with payment integration',
    extends: 'nuxt',
    rules: [],
    patterns: ['drizzle', 'stripe'],
    skills: ['drizzle', 'stripe'],
  },
  'vue-spa': {
    name: 'vue-spa',
    description: 'Vue 3 single-page application',
    extends: 'vue',
    rules: [],
    patterns: ['pinia'],
    skills: ['pinia'],
  },
  minimal: {
    name: 'minimal',
    description: 'Minimal setup with core rules only',
    extends: 'base',
    rules: [],
    patterns: ['typescript'],
    skills: [],
  },
}

/**
 * Resolve profile inheritance chain
 */
export function resolveInheritanceChain(profileName: string): string[] {
  const chain: string[] = []
  let current: string | undefined = profileName

  while (current && PROFILES[current]) {
    chain.unshift(current)
    current = PROFILES[current].extends
  }

  return chain
}

/**
 * Resolved profile with all inherited items
 */
export interface ResolvedProfile {
  name: string
  description: string
  inheritanceChain: string[]
  rules: string[]
  patterns: string[]
  skills: string[]
}

/**
 * Resolve a profile with all inherited items merged
 */
export function resolveProfile(profileName: string): ResolvedProfile | null {
  if (!PROFILES[profileName]) {
    return null
  }

  const chain = resolveInheritanceChain(profileName)
  const rules: string[] = []
  const patterns: string[] = []
  const skills: string[] = []

  // Merge from base to derived
  for (const name of chain) {
    const profile = PROFILES[name]
    rules.push(...profile.rules)
    patterns.push(...profile.patterns)
    skills.push(...profile.skills)
  }

  // Remove duplicates while preserving order
  const uniqueRules = [...new Set(rules)]
  const uniquePatterns = [...new Set(patterns)]
  const uniqueSkills = [...new Set(skills)]

  const targetProfile = PROFILES[profileName]
  return {
    name: profileName,
    description: targetProfile.description,
    inheritanceChain: chain,
    rules: uniqueRules,
    patterns: uniquePatterns,
    skills: uniqueSkills,
  }
}

/**
 * Get list of available profile names
 */
export function getAvailableProfiles(): string[] {
  return Object.keys(PROFILES)
}

/**
 * Compiled file entry
 */
export interface CompiledFile {
  source: string
  relativePath: string
  category: 'rules' | 'patterns' | 'skills'
  tokens: number
  frontmatter?: Record<string, unknown>
}

/**
 * Compilation result
 */
export interface CompilationResult {
  profile: ResolvedProfile
  files: CompiledFile[]
  totalTokens: number
  budget: BudgetStatus
  outputPath?: string
}

/**
 * Compile a profile from cellm-core
 */
export function compileProfile(profileName: string, cellmCorePath: string): CompilationResult | null {
  const profile = resolveProfile(profileName)
  if (!profile) {
    return null
  }

  const files: CompiledFile[] = []

  // Compile rules
  for (const rule of profile.rules) {
    const rulePath = join(cellmCorePath, 'rules', `${rule}.md`)
    if (fileExists(rulePath)) {
      const content = readFile(rulePath)
      const { data: frontmatter } = matter(content)
      files.push({
        source: rulePath,
        relativePath: `rules/${rule}.md`,
        category: 'rules',
        tokens: estimateTokens(content),
        frontmatter: Object.keys(frontmatter).length > 0 ? frontmatter : undefined,
      })
    }
  }

  // Compile patterns
  for (const pattern of profile.patterns) {
    // Handle anti-patterns directory
    if (pattern.startsWith('anti/')) {
      const patternPath = join(cellmCorePath, 'patterns', `${pattern}.md`)
      if (fileExists(patternPath)) {
        const content = readFile(patternPath)
        const { data: frontmatter } = matter(content)
        files.push({
          source: patternPath,
          relativePath: `patterns/${pattern}.md`,
          category: 'patterns',
          tokens: estimateTokens(content),
          frontmatter: Object.keys(frontmatter).length > 0 ? frontmatter : undefined,
        })
      }
    } else {
      // Check for single file pattern (e.g., typescript.md)
      const singlePath = join(cellmCorePath, 'patterns', `${pattern}.md`)
      if (fileExists(singlePath)) {
        const content = readFile(singlePath)
        const { data: frontmatter } = matter(content)
        files.push({
          source: singlePath,
          relativePath: `patterns/${pattern}.md`,
          category: 'patterns',
          tokens: estimateTokens(content),
          frontmatter: Object.keys(frontmatter).length > 0 ? frontmatter : undefined,
        })
      }
      // Also check for directory of patterns (e.g., typescript/*.md)
      const dirPath = join(cellmCorePath, 'patterns', pattern)
      if (directoryExists(dirPath)) {
        const patternFiles = findMarkdownFiles(dirPath)
        for (const pf of patternFiles) {
          const content = readFile(pf)
          const { data: frontmatter } = matter(content)
          const relPath = relative(cellmCorePath, pf).replace(/^patterns\//, '')
          files.push({
            source: pf,
            relativePath: `patterns/${relPath}`,
            category: 'patterns',
            tokens: estimateTokens(content),
            frontmatter: Object.keys(frontmatter).length > 0 ? frontmatter : undefined,
          })
        }
      }
    }
  }

  // Compile skills
  for (const skill of profile.skills) {
    const skillPath = join(cellmCorePath, 'skills', `${skill}.md`)
    if (fileExists(skillPath)) {
      const content = readFile(skillPath)
      const { data: frontmatter } = matter(content)
      files.push({
        source: skillPath,
        relativePath: `skills/${skill}.md`,
        category: 'skills',
        tokens: estimateTokens(content),
        frontmatter: Object.keys(frontmatter).length > 0 ? frontmatter : undefined,
      })
    }
  }

  const totalTokens = files.reduce((sum, f) => sum + f.tokens, 0)
  const budget = checkBudget(totalTokens)

  return {
    profile,
    files,
    totalTokens,
    budget,
  }
}

/**
 * Write compiled profile to destination
 */
export function writeCompiledProfile(
  result: CompilationResult,
  destPath: string
): string {
  const claudeDir = join(destPath, '.claude')
  const compiledDir = join(claudeDir, 'compiled')
  ensureDir(compiledDir)

  // Copy files to destination
  for (const file of result.files) {
    const destFile = join(claudeDir, file.relativePath)
    copyFile(file.source, destFile)
  }

  // Generate compiled context summary
  const contextContent = generateContextSummary(result)
  const contextPath = join(compiledDir, 'context.md')

  // Write context summary
  writeFile(contextPath, contextContent)

  return contextPath
}

/**
 * Generate context summary markdown
 */
export function generateContextSummary(result: CompilationResult): string {
  const lines: string[] = []
  const { profile, files, totalTokens, budget } = result

  lines.push('---')
  lines.push('id: COMPILED-CONTEXT')
  lines.push(`version: v0.20.0`)
  lines.push(`profile: ${profile.name}`)
  lines.push(`generated: ${new Date().toISOString()}`)
  lines.push('status: OK')
  lines.push(`budget: ~${totalTokens} tokens`)
  lines.push('---')
  lines.push('')
  lines.push('# Compiled Context')
  lines.push('')
  lines.push(`> Generated from profile: **${profile.name}**`)
  lines.push('')

  // Inheritance chain
  if (profile.inheritanceChain.length > 1) {
    lines.push('## Inheritance')
    lines.push('')
    lines.push('```')
    lines.push(profile.inheritanceChain.join(' -> '))
    lines.push('```')
    lines.push('')
  }

  // Budget summary
  lines.push('## Budget Summary')
  lines.push('')
  const percentage = Math.round(budget.percentage * 100)
  lines.push(`| Metric | Value |`)
  lines.push(`|--------|-------|`)
  lines.push(`| Total Tokens | ${totalTokens} |`)
  lines.push(`| Budget | ${budget.total} |`)
  lines.push(`| Usage | ${percentage}% |`)
  lines.push(`| Status | ${budget.status.toUpperCase()} |`)
  lines.push('')

  // Files by category
  const rules = files.filter(f => f.category === 'rules')
  const patterns = files.filter(f => f.category === 'patterns')
  const skills = files.filter(f => f.category === 'skills')

  if (rules.length > 0) {
    lines.push('## Rules')
    lines.push('')
    lines.push(`| File | Tokens |`)
    lines.push(`|------|--------|`)
    for (const f of rules) {
      lines.push(`| ${f.relativePath} | ${f.tokens} |`)
    }
    lines.push('')
  }

  if (patterns.length > 0) {
    lines.push('## Patterns')
    lines.push('')
    lines.push(`| File | Tokens |`)
    lines.push(`|------|--------|`)
    for (const f of patterns) {
      lines.push(`| ${f.relativePath} | ${f.tokens} |`)
    }
    lines.push('')
  }

  if (skills.length > 0) {
    lines.push('## Skills')
    lines.push('')
    lines.push(`| File | Tokens |`)
    lines.push(`|------|--------|`)
    for (const f of skills) {
      lines.push(`| ${f.relativePath} | ${f.tokens} |`)
    }
    lines.push('')
  }

  lines.push('---')
  lines.push('')
  lines.push('*Generated by CELLM CLI v0.20.0*')
  lines.push('')

  return lines.join('\n')
}

/**
 * Get profile description for display
 */
export function getProfileInfo(profileName: string): { exists: boolean; description?: string; inherits?: string } {
  const profile = PROFILES[profileName]
  if (!profile) {
    return { exists: false }
  }
  return {
    exists: true,
    description: profile.description,
    inherits: profile.extends,
  }
}
