import { join } from 'node:path'
import { readdirSync } from 'node:fs'
import { fileExists, readFile, directoryExists } from './fs.js'
import matter from 'gray-matter'

/**
 * Plugin metadata from frontmatter
 */
export interface PluginMetadata {
  id: string
  name: string
  version: string
  description: string
  author?: string
  homepage?: string
  provides: PluginProvides
}

/**
 * What a plugin provides
 */
export interface PluginProvides {
  rules?: string[]
  patterns?: string[]
  skills?: string[]
  commands?: string[]
}

/**
 * Plugin state
 */
export type PluginState = 'installed' | 'enabled' | 'disabled' | 'error'

/**
 * Plugin entry
 */
export interface Plugin {
  metadata: PluginMetadata
  state: PluginState
  path: string
  error?: string
}

/**
 * Plugin registry
 */
export interface PluginRegistry {
  plugins: Plugin[]
  byId: Map<string, Plugin>
}

/**
 * Load plugin metadata from a directory
 */
export function loadPluginMetadata(pluginPath: string): PluginMetadata | null {
  const manifestPath = join(pluginPath, 'plugin.md')

  if (!fileExists(manifestPath)) {
    return null
  }

  try {
    const content = readFile(manifestPath)
    const { data } = matter(content)

    return {
      id: String(data.id || ''),
      name: String(data.name || data.id || 'Unknown'),
      version: String(data.version || 'v0.0.0'),
      description: String(data.description || ''),
      author: data.author ? String(data.author) : undefined,
      homepage: data.homepage ? String(data.homepage) : undefined,
      provides: {
        rules: Array.isArray(data.rules) ? data.rules : [],
        patterns: Array.isArray(data.patterns) ? data.patterns : [],
        skills: Array.isArray(data.skills) ? data.skills : [],
        commands: Array.isArray(data.commands) ? data.commands : [],
      },
    }
  } catch {
    return null
  }
}

/**
 * Load all plugins from a directory
 */
export function loadPlugins(pluginsDir: string): PluginRegistry {
  const registry: PluginRegistry = {
    plugins: [],
    byId: new Map(),
  }

  if (!directoryExists(pluginsDir)) {
    return registry
  }

  // Each subdirectory is a potential plugin
  const entries = readdirSync(pluginsDir, { withFileTypes: true })

  for (const entry of entries) {
    if (!entry.isDirectory()) continue

    const pluginPath = join(pluginsDir, entry.name)
    const metadata = loadPluginMetadata(pluginPath)

    if (metadata) {
      const plugin: Plugin = {
        metadata,
        state: 'installed',
        path: pluginPath,
      }

      registry.plugins.push(plugin)
      registry.byId.set(metadata.id, plugin)
    }
  }

  return registry
}

/**
 * Get plugin by ID
 */
export function getPlugin(registry: PluginRegistry, id: string): Plugin | undefined {
  return registry.byId.get(id)
}

/**
 * Get all enabled plugins
 */
export function getEnabledPlugins(registry: PluginRegistry): Plugin[] {
  return registry.plugins.filter((p) => p.state === 'enabled')
}

/**
 * Validate plugin structure
 */
export interface PluginValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

export function validatePlugin(pluginPath: string): PluginValidationResult {
  const result: PluginValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
  }

  // Check plugin.md exists
  const manifestPath = join(pluginPath, 'plugin.md')
  if (!fileExists(manifestPath)) {
    result.valid = false
    result.errors.push('Missing plugin.md manifest')
    return result
  }

  // Load and validate metadata
  const metadata = loadPluginMetadata(pluginPath)
  if (!metadata) {
    result.valid = false
    result.errors.push('Could not parse plugin.md')
    return result
  }

  // Validate required fields
  if (!metadata.id) {
    result.valid = false
    result.errors.push('Missing required field: id')
  }

  if (!metadata.version) {
    result.warnings.push('Missing recommended field: version')
  }

  if (!metadata.description) {
    result.warnings.push('Missing recommended field: description')
  }

  // Validate provided files exist
  const provides = metadata.provides

  if (provides.rules && provides.rules.length > 0) {
    const rulesDir = join(pluginPath, 'rules')
    if (!directoryExists(rulesDir)) {
      result.errors.push('Plugin declares rules but rules/ directory not found')
      result.valid = false
    }
  }

  if (provides.patterns && provides.patterns.length > 0) {
    const patternsDir = join(pluginPath, 'patterns')
    if (!directoryExists(patternsDir)) {
      result.errors.push('Plugin declares patterns but patterns/ directory not found')
      result.valid = false
    }
  }

  if (provides.skills && provides.skills.length > 0) {
    const skillsDir = join(pluginPath, 'skills')
    if (!directoryExists(skillsDir)) {
      result.errors.push('Plugin declares skills but skills/ directory not found')
      result.valid = false
    }
  }

  return result
}

/**
 * Plugin template for creating new plugins
 */
export function generatePluginTemplate(id: string, name: string): string {
  return `---
id: ${id}
name: ${name}
version: v0.1.0
description: Custom CELLM plugin
author: Your Name
rules: []
patterns: []
skills: []
commands: []
---

# ${name}

Custom plugin for CELLM.

## Installation

1. Copy this directory to \`.claude/plugins/${id}/\`
2. Run \`cellm validate\` to verify the plugin

## Contents

### Rules

Add custom rules in \`rules/\` directory.

### Patterns

Add custom patterns in \`patterns/\` directory.

### Skills

Add custom skills in \`skills/\` directory.

---

**Plugin Version:** v0.1.0
`
}

/**
 * Get plugin count by category
 */
export interface PluginStats {
  total: number
  installed: number
  enabled: number
  disabled: number
  withErrors: number
  totalRules: number
  totalPatterns: number
  totalSkills: number
}

export function getPluginStats(registry: PluginRegistry): PluginStats {
  const stats: PluginStats = {
    total: registry.plugins.length,
    installed: 0,
    enabled: 0,
    disabled: 0,
    withErrors: 0,
    totalRules: 0,
    totalPatterns: 0,
    totalSkills: 0,
  }

  for (const plugin of registry.plugins) {
    switch (plugin.state) {
      case 'installed':
        stats.installed++
        break
      case 'enabled':
        stats.enabled++
        break
      case 'disabled':
        stats.disabled++
        break
      case 'error':
        stats.withErrors++
        break
    }

    stats.totalRules += plugin.metadata.provides.rules?.length || 0
    stats.totalPatterns += plugin.metadata.provides.patterns?.length || 0
    stats.totalSkills += plugin.metadata.provides.skills?.length || 0
  }

  return stats
}
