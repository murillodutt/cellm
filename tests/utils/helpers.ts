/**
 * Test utilities for CELLM validation
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'fs'
import { join, resolve } from 'path'
import matter from 'gray-matter'

// Paths
export const ROOT_DIR = resolve(__dirname, '../..')
export const CELLM_CORE_DIR = join(ROOT_DIR, 'cellm-core')
export const SCHEMAS_DIR = join(ROOT_DIR, 'schemas')

/**
 * Get all markdown files in a directory recursively
 */
export function getMarkdownFiles(dir: string): string[] {
  const files: string[] = []

  if (!existsSync(dir)) {
    return files
  }

  const entries = readdirSync(dir)

  for (const entry of entries) {
    const fullPath = join(dir, entry)
    const stat = statSync(fullPath)

    if (stat.isDirectory()) {
      files.push(...getMarkdownFiles(fullPath))
    } else if (entry.endsWith('.md')) {
      files.push(fullPath)
    }
  }

  return files
}

/**
 * Extract frontmatter from a markdown file
 */
export function extractFrontmatter(filePath: string): Record<string, unknown> | null {
  try {
    const content = readFileSync(filePath, 'utf-8')
    const { data } = matter(content)
    return data
  } catch {
    return null
  }
}

/**
 * Load a JSON schema
 */
export function loadSchema(schemaName: string): Record<string, unknown> | null {
  const schemaPath = join(SCHEMAS_DIR, `${schemaName}.schema.json`)

  if (!existsSync(schemaPath)) {
    return null
  }

  try {
    const content = readFileSync(schemaPath, 'utf-8')
    return JSON.parse(content)
  } catch {
    return null
  }
}

/**
 * Get files by type (rules, patterns, etc.)
 */
export function getFilesByType(type: string): string[] {
  const dir = join(CELLM_CORE_DIR, type)
  return getMarkdownFiles(dir)
}

/**
 * Validate ID pattern for rules
 */
export function isValidRuleId(id: string): boolean {
  return /^[A-Z][A-Z0-9-]*[0-9]{3}$/.test(id)
}

/**
 * Validate ID pattern for patterns
 */
export function isValidPatternId(id: string): boolean {
  return /^[A-Z][A-Z0-9]+-INDEX$/.test(id) || /^[A-Z][A-Z0-9]*-[0-9]{3}$/.test(id)
}

/**
 * Validate kebab-case
 */
export function isKebabCase(value: string): boolean {
  return /^[a-z]+(-[a-z]+)*$/.test(value)
}

/**
 * Valid agent names
 */
export const VALID_AGENTS = ['architect', 'implementer', 'reviewer', 'project-manager'] as const
export type AgentName = typeof VALID_AGENTS[number]

/**
 * Valid phases
 */
export const VALID_PHASES = ['planning', 'specification', 'implementation', 'verification'] as const
export type PhaseName = typeof VALID_PHASES[number]

/**
 * Valid severities
 */
export const VALID_SEVERITIES = ['critical', 'warning', 'info'] as const
export type SeverityName = typeof VALID_SEVERITIES[number]

/**
 * Check if value is a valid agent
 */
export function isValidAgent(value: string): value is AgentName {
  return VALID_AGENTS.includes(value as AgentName)
}

/**
 * Check if value is a valid phase
 */
export function isValidPhase(value: string): value is PhaseName {
  return VALID_PHASES.includes(value as PhaseName)
}

/**
 * Check if value is a valid severity
 */
export function isValidSeverity(value: string): value is SeverityName {
  return VALID_SEVERITIES.includes(value as SeverityName)
}

/**
 * Get relative path from CELLM_CORE_DIR
 */
export function getRelativePath(filePath: string): string {
  return filePath.replace(CELLM_CORE_DIR + '/', '')
}
