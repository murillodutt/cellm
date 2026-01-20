import { join, relative, basename } from 'node:path'
import { fileExists, findMarkdownFiles, readFile } from './fs.js'
import { estimateTokens, parseBudget, BUDGET_LIMITS } from './token.js'
import matter from 'gray-matter'

/**
 * Loading trigger types
 */
export type LoadTrigger = 'always' | 'path' | 'command'

/**
 * Context file entry
 */
export interface ContextFile {
  path: string
  relativePath: string
  name: string
  trigger: LoadTrigger
  triggerPattern?: string
  tokens: number
  budget?: number
  layer: ContextLayer
  frontmatter?: Record<string, unknown>
}

/**
 * Context layer for budget tracking
 */
export type ContextLayer = 'core' | 'domain' | 'patterns' | 'project' | 'session'

/**
 * Layer budget allocation
 */
export interface LayerBudget {
  layer: ContextLayer
  label: string
  tokens: number
  percentage: number
  files: number
}

/**
 * Complete context analysis result
 */
export interface ContextAnalysis {
  files: ContextFile[]
  byTrigger: {
    always: ContextFile[]
    path: ContextFile[]
    command: ContextFile[]
  }
  byLayer: LayerBudget[]
  totalTokens: number
  totalBudget: number
  percentage: number
  status: 'ok' | 'warning' | 'critical' | 'exceeded'
}

/**
 * Index.md structure for context loading rules
 */
export interface IndexConfig {
  alwaysLoad: string[]
  byCommand: Map<string, string[]>
  byPath: Map<string, string[]>
}

/**
 * Parse INDEX.md to extract loading rules
 */
export function parseIndexFile(indexPath: string): IndexConfig {
  const config: IndexConfig = {
    alwaysLoad: [],
    byCommand: new Map(),
    byPath: new Map(),
  }

  if (!fileExists(indexPath)) {
    return config
  }

  const content = readFile(indexPath)
  const lines = content.split('\n')
  let section: 'none' | 'always' | 'command' | 'path' = 'none'

  for (const line of lines) {
    const trimmed = line.trim()

    // Detect sections
    if (trimmed.startsWith('## Always Load')) {
      section = 'always'
      continue
    }
    if (trimmed.startsWith('## By Command')) {
      section = 'command'
      continue
    }
    if (trimmed.startsWith('## By Path')) {
      section = 'path'
      continue
    }
    if (trimmed.startsWith('## ')) {
      section = 'none'
      continue
    }

    // Parse content based on section
    if (section === 'always') {
      const match = trimmed.match(/^-\s+(.+\.md)/)
      if (match) {
        config.alwaysLoad.push(match[1])
      }
    }

    if (section === 'command' && trimmed.startsWith('|') && !trimmed.includes('---')) {
      const cells = trimmed.split('|').map((c) => c.trim()).filter(Boolean)
      if (cells.length >= 3 && cells[0].startsWith('/')) {
        const command = cells[0].replace('/', '')
        const files = [cells[2]] // workflow file
        if (cells[1]) {
          files.push(`agents/${cells[1]}.md`)
        }
        config.byCommand.set(command, files)
      }
    }

    if (section === 'path' && trimmed.startsWith('|') && !trimmed.includes('---')) {
      const cells = trimmed.split('|').map((c) => c.trim()).filter(Boolean)
      if (cells.length >= 1 && cells[0].includes('*')) {
        const pattern = cells[0]
        const files: string[] = []
        // Extract rules/skills/patterns from cells
        if (cells[1]) files.push(`rules/${cells[1]}.md`)
        config.byPath.set(pattern, files)
      }
    }
  }

  return config
}

/**
 * Determine context layer based on file path
 */
export function getContextLayer(filePath: string): ContextLayer {
  const path = filePath.toLowerCase()

  if (path.includes('rules/core/')) return 'core'
  if (path.includes('rules/domain/')) return 'domain'
  if (path.includes('patterns/')) return 'patterns'
  if (path.includes('session/')) return 'session'

  return 'project'
}

/**
 * Get layer display label
 */
export function getLayerLabel(layer: ContextLayer): string {
  const labels: Record<ContextLayer, string> = {
    core: 'CORE',
    domain: 'DOMAIN',
    patterns: 'PATTERNS',
    project: 'PROJECT',
    session: 'SESSION',
  }
  return labels[layer]
}

/**
 * Parse a markdown file and extract context info
 */
export function parseContextFile(filePath: string, basePath: string, trigger: LoadTrigger, triggerPattern?: string): ContextFile {
  const content = readFile(filePath)
  const { data: frontmatter } = matter(content)

  const tokens = estimateTokens(content)
  const budget = parseBudget(frontmatter.budget)

  return {
    path: filePath,
    relativePath: relative(basePath, filePath),
    name: basename(filePath),
    trigger,
    triggerPattern,
    tokens,
    budget: budget || undefined,
    layer: getContextLayer(filePath),
    frontmatter: Object.keys(frontmatter).length > 0 ? frontmatter : undefined,
  }
}

/**
 * Analyze complete context from .claude directory
 */
export function analyzeContext(projectPath: string): ContextAnalysis {
  const claudeDir = join(projectPath, '.claude')
  const files: ContextFile[] = []

  // Load index configuration
  const indexPath = join(claudeDir, 'index.md')
  const config = parseIndexFile(indexPath)

  // Process always-load files
  for (const relPath of config.alwaysLoad) {
    const fullPath = join(claudeDir, relPath)
    if (fileExists(fullPath)) {
      files.push(parseContextFile(fullPath, claudeDir, 'always'))
    }
  }

  // Process all remaining markdown files in .claude
  const allMdFiles = findMarkdownFiles(claudeDir)
  for (const mdFile of allMdFiles) {
    const relPath = relative(claudeDir, mdFile)

    // Skip if already added
    if (files.some((f) => f.relativePath === relPath)) continue

    // Skip index files
    if (basename(mdFile).toLowerCase() === 'index.md') continue

    // Check if path-triggered
    let trigger: LoadTrigger = 'path'
    let triggerPattern: string | undefined

    // Determine trigger based on location
    for (const [pattern, _paths] of config.byPath) {
      if (relPath.includes('patterns/') || relPath.includes('rules/domain/')) {
        triggerPattern = pattern
        break
      }
    }

    // Check if command-triggered
    for (const [_cmd, paths] of config.byCommand) {
      if (paths.some((p) => relPath.includes(p.replace('.md', '')))) {
        trigger = 'command'
        triggerPattern = _cmd
        break
      }
    }

    files.push(parseContextFile(mdFile, claudeDir, trigger, triggerPattern))
  }

  // Calculate by-layer budgets
  const layers: ContextLayer[] = ['core', 'domain', 'patterns', 'project', 'session']
  const byLayer: LayerBudget[] = layers.map((layer) => {
    const layerFiles = files.filter((f) => f.layer === layer)
    const tokens = layerFiles.reduce((sum, f) => sum + f.tokens, 0)
    return {
      layer,
      label: getLayerLabel(layer),
      tokens,
      percentage: 0, // Will calculate after total
      files: layerFiles.length,
    }
  })

  // Calculate totals
  const totalTokens = files.reduce((sum, f) => sum + f.tokens, 0)
  const totalBudget = BUDGET_LIMITS.CORE

  // Update percentages
  for (const lb of byLayer) {
    lb.percentage = totalBudget > 0 ? lb.tokens / totalBudget : 0
  }

  const percentage = totalBudget > 0 ? totalTokens / totalBudget : 0

  // Determine status
  let status: ContextAnalysis['status']
  if (percentage > 1) {
    status = 'exceeded'
  } else if (percentage >= BUDGET_LIMITS.CRITICAL_THRESHOLD) {
    status = 'critical'
  } else if (percentage >= BUDGET_LIMITS.WARNING_THRESHOLD) {
    status = 'warning'
  } else {
    status = 'ok'
  }

  return {
    files,
    byTrigger: {
      always: files.filter((f) => f.trigger === 'always'),
      path: files.filter((f) => f.trigger === 'path'),
      command: files.filter((f) => f.trigger === 'command'),
    },
    byLayer,
    totalTokens,
    totalBudget,
    percentage,
    status,
  }
}

/**
 * Trace why a specific rule was loaded
 */
export interface LoadTraceResult {
  file: ContextFile | null
  found: boolean
  reason: string
  trigger: LoadTrigger | null
  pattern?: string
  chain: string[]
}

export function traceRuleLoading(projectPath: string, ruleName: string): LoadTraceResult {
  const claudeDir = join(projectPath, '.claude')
  const indexPath = join(claudeDir, 'index.md')
  const config = parseIndexFile(indexPath)

  // Normalize rule name (remove .md if present, handle various formats)
  const normalizedName = ruleName.replace(/\.md$/, '').toLowerCase()

  // Search for the file
  const allFiles = findMarkdownFiles(claudeDir)
  const matchingFile = allFiles.find((f) => {
    const relPath = relative(claudeDir, f).toLowerCase()
    const name = basename(f, '.md').toLowerCase()
    return (
      relPath === `${normalizedName}.md` ||
      relPath.endsWith(`/${normalizedName}.md`) ||
      name === normalizedName ||
      relPath.includes(normalizedName)
    )
  })

  if (!matchingFile) {
    return {
      file: null,
      found: false,
      reason: `File "${ruleName}" not found in .claude/`,
      trigger: null,
      chain: [],
    }
  }

  const relPath = relative(claudeDir, matchingFile)

  // Check if always-load
  if (config.alwaysLoad.includes(relPath)) {
    return {
      file: parseContextFile(matchingFile, claudeDir, 'always'),
      found: true,
      reason: 'Listed in INDEX.md "Always Load" section',
      trigger: 'always',
      chain: ['INDEX.md (always)', `-> ${relPath}`],
    }
  }

  // Check if command-triggered
  for (const [cmd, paths] of config.byCommand) {
    if (paths.some((p) => relPath.includes(p.replace('.md', '')))) {
      return {
        file: parseContextFile(matchingFile, claudeDir, 'command', cmd),
        found: true,
        reason: `Loaded when /${cmd} command is executed`,
        trigger: 'command',
        pattern: cmd,
        chain: ['INDEX.md (by command)', `-> /${cmd}`, `-> ${relPath}`],
      }
    }
  }

  // Check if path-triggered
  for (const [pattern] of config.byPath) {
    if (relPath.includes('patterns/') || relPath.includes('rules/domain/')) {
      return {
        file: parseContextFile(matchingFile, claudeDir, 'path', pattern),
        found: true,
        reason: `Loaded when working with files matching: ${pattern}`,
        trigger: 'path',
        pattern,
        chain: ['INDEX.md (by path)', `-> Pattern: ${pattern}`, `-> ${relPath}`],
      }
    }
  }

  // Default: project-level
  return {
    file: parseContextFile(matchingFile, claudeDir, 'path'),
    found: true,
    reason: 'Available as project-level context',
    trigger: 'path',
    chain: ['.claude/ directory', `-> ${relPath}`],
  }
}

/**
 * Model selection matrix based on ADR-003
 */
export type ModelTier = 'haiku' | 'sonnet' | 'opus'

export const MODEL_MAP: Record<string, ModelTier> = {
  'status': 'haiku',
  'metrics': 'haiku',
  'reuse-check': 'haiku',
  'implement': 'sonnet',
  'verify': 'sonnet',
  'create-tasks': 'sonnet',
  'orchestrate-tasks': 'sonnet',
  'plan-product': 'opus',
  'write-spec': 'opus',
  'shape-spec': 'opus',
  'spec': 'opus',
} as const

/**
 * Get suggested model for a command
 */
export function suggestModel(command: string): ModelTier {
  const normalized = command.replace(/^\//, '').toLowerCase()
  return MODEL_MAP[normalized] ?? 'sonnet'
}

/**
 * Get model description
 */
export function getModelDescription(model: ModelTier): string {
  const descriptions: Record<ModelTier, string> = {
    haiku: 'Fast, cost-effective for simple tasks',
    sonnet: 'Balanced performance and quality',
    opus: 'Maximum capability for complex reasoning',
  }
  return descriptions[model]
}

/**
 * Get all commands for a model tier
 */
export function getCommandsForModel(model: ModelTier): string[] {
  return Object.entries(MODEL_MAP)
    .filter(([_, m]) => m === model)
    .map(([cmd]) => `/${cmd}`)
}
