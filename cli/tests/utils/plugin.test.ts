import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { join } from 'node:path'
import { mkdirSync, writeFileSync, rmSync } from 'node:fs'
import {
  generatePluginTemplate,
  getPluginStats,
  loadPluginMetadata,
  loadPlugins,
  getPlugin,
  getEnabledPlugins,
  validatePlugin,
  type Plugin,
  type PluginMetadata,
  type PluginRegistry,
} from '../../src/utils/plugin.js'

describe('Plugin Utilities', () => {
  describe('generatePluginTemplate', () => {
    it('should generate valid markdown template', () => {
      const template = generatePluginTemplate('my-plugin', 'My Plugin')

      expect(template).toContain('id: my-plugin')
      expect(template).toContain('name: My Plugin')
      expect(template).toContain('version: v0.1.0')
      expect(template).toContain('# My Plugin')
      expect(template).toContain('## Installation')
      expect(template).toContain('## Contents')
    })

    it('should include frontmatter fields', () => {
      const template = generatePluginTemplate('test-id', 'Test Name')

      expect(template).toContain('rules: []')
      expect(template).toContain('patterns: []')
      expect(template).toContain('skills: []')
      expect(template).toContain('commands: []')
    })

    it('should include plugin path reference', () => {
      const template = generatePluginTemplate('custom', 'Custom Plugin')

      expect(template).toContain('.claude/plugins/custom/')
    })
  })

  describe('getPluginStats', () => {
    it('should return zero stats for empty registry', () => {
      const registry: PluginRegistry = {
        plugins: [],
        byId: new Map(),
      }

      const stats = getPluginStats(registry)

      expect(stats.total).toBe(0)
      expect(stats.installed).toBe(0)
      expect(stats.enabled).toBe(0)
      expect(stats.disabled).toBe(0)
      expect(stats.withErrors).toBe(0)
      expect(stats.totalRules).toBe(0)
      expect(stats.totalPatterns).toBe(0)
      expect(stats.totalSkills).toBe(0)
    })

    it('should count plugins by state', () => {
      const createPlugin = (id: string, state: Plugin['state']): Plugin => ({
        metadata: {
          id,
          name: id,
          version: 'v1.0.0',
          description: 'Test',
          provides: { rules: [], patterns: [], skills: [] },
        },
        state,
        path: `/path/to/${id}`,
      })

      const registry: PluginRegistry = {
        plugins: [
          createPlugin('p1', 'installed'),
          createPlugin('p2', 'enabled'),
          createPlugin('p3', 'enabled'),
          createPlugin('p4', 'disabled'),
          createPlugin('p5', 'error'),
        ],
        byId: new Map(),
      }

      const stats = getPluginStats(registry)

      expect(stats.total).toBe(5)
      expect(stats.installed).toBe(1)
      expect(stats.enabled).toBe(2)
      expect(stats.disabled).toBe(1)
      expect(stats.withErrors).toBe(1)
    })

    it('should count provided items', () => {
      const plugin: Plugin = {
        metadata: {
          id: 'test',
          name: 'Test Plugin',
          version: 'v1.0.0',
          description: 'Test',
          provides: {
            rules: ['rule1', 'rule2'],
            patterns: ['pattern1', 'pattern2', 'pattern3'],
            skills: ['skill1'],
          },
        },
        state: 'enabled',
        path: '/path/to/test',
      }

      const registry: PluginRegistry = {
        plugins: [plugin],
        byId: new Map([['test', plugin]]),
      }

      const stats = getPluginStats(registry)

      expect(stats.totalRules).toBe(2)
      expect(stats.totalPatterns).toBe(3)
      expect(stats.totalSkills).toBe(1)
    })

    it('should aggregate counts across multiple plugins', () => {
      const plugin1: Plugin = {
        metadata: {
          id: 'p1',
          name: 'Plugin 1',
          version: 'v1.0.0',
          description: 'Test',
          provides: {
            rules: ['r1', 'r2'],
            patterns: ['pat1'],
            skills: ['s1'],
          },
        },
        state: 'enabled',
        path: '/path/to/p1',
      }

      const plugin2: Plugin = {
        metadata: {
          id: 'p2',
          name: 'Plugin 2',
          version: 'v1.0.0',
          description: 'Test',
          provides: {
            rules: ['r3'],
            patterns: ['pat2', 'pat3'],
            skills: ['s2', 's3'],
          },
        },
        state: 'enabled',
        path: '/path/to/p2',
      }

      const registry: PluginRegistry = {
        plugins: [plugin1, plugin2],
        byId: new Map([
          ['p1', plugin1],
          ['p2', plugin2],
        ]),
      }

      const stats = getPluginStats(registry)

      expect(stats.totalRules).toBe(3)
      expect(stats.totalPatterns).toBe(3)
      expect(stats.totalSkills).toBe(3)
    })

    it('should handle undefined provides arrays', () => {
      const plugin: Plugin = {
        metadata: {
          id: 'test',
          name: 'Test',
          version: 'v1.0.0',
          description: 'Test',
          provides: {},
        },
        state: 'installed',
        path: '/path',
      }

      const registry: PluginRegistry = {
        plugins: [plugin],
        byId: new Map([['test', plugin]]),
      }

      const stats = getPluginStats(registry)

      expect(stats.totalRules).toBe(0)
      expect(stats.totalPatterns).toBe(0)
      expect(stats.totalSkills).toBe(0)
    })
  })

  describe('loadPluginMetadata', () => {
    const testDir = join(process.cwd(), '.test-plugin-dir')

    beforeEach(() => {
      try {
        rmSync(testDir, { recursive: true })
      } catch {
        // ignore
      }
      mkdirSync(testDir, { recursive: true })
    })

    afterEach(() => {
      try {
        rmSync(testDir, { recursive: true })
      } catch {
        // ignore
      }
    })

    it('should return null if plugin.md does not exist', () => {
      const result = loadPluginMetadata(testDir)
      expect(result).toBeNull()
    })

    it('should load metadata from plugin.md', () => {
      writeFileSync(
        join(testDir, 'plugin.md'),
        `---
id: test-plugin
name: Test Plugin
version: v1.0.0
description: A test plugin
author: Test Author
homepage: https://example.com
rules:
  - rule1
  - rule2
patterns:
  - pattern1
skills:
  - skill1
---
# Test Plugin
`
      )

      const result = loadPluginMetadata(testDir)
      expect(result).not.toBeNull()
      expect(result!.id).toBe('test-plugin')
      expect(result!.name).toBe('Test Plugin')
      expect(result!.version).toBe('v1.0.0')
      expect(result!.description).toBe('A test plugin')
      expect(result!.author).toBe('Test Author')
      expect(result!.homepage).toBe('https://example.com')
      expect(result!.provides.rules).toEqual(['rule1', 'rule2'])
      expect(result!.provides.patterns).toEqual(['pattern1'])
      expect(result!.provides.skills).toEqual(['skill1'])
    })

    it('should handle minimal frontmatter', () => {
      writeFileSync(
        join(testDir, 'plugin.md'),
        `---
id: minimal
---
# Minimal
`
      )

      const result = loadPluginMetadata(testDir)
      expect(result).not.toBeNull()
      expect(result!.id).toBe('minimal')
      expect(result!.provides.rules).toEqual([])
    })
  })

  describe('loadPlugins', () => {
    const testDir = join(process.cwd(), '.test-plugins-dir')

    beforeEach(() => {
      try {
        rmSync(testDir, { recursive: true })
      } catch {
        // ignore
      }
    })

    afterEach(() => {
      try {
        rmSync(testDir, { recursive: true })
      } catch {
        // ignore
      }
    })

    it('should return empty registry if directory does not exist', () => {
      const result = loadPlugins(testDir)
      expect(result.plugins.length).toBe(0)
      expect(result.byId.size).toBe(0)
    })

    it('should load plugins from subdirectories', () => {
      mkdirSync(join(testDir, 'plugin-a'), { recursive: true })
      mkdirSync(join(testDir, 'plugin-b'), { recursive: true })

      writeFileSync(
        join(testDir, 'plugin-a', 'plugin.md'),
        '---\nid: plugin-a\nname: Plugin A\nversion: v1.0.0\ndescription: A\n---\n# A'
      )
      writeFileSync(
        join(testDir, 'plugin-b', 'plugin.md'),
        '---\nid: plugin-b\nname: Plugin B\nversion: v1.0.0\ndescription: B\n---\n# B'
      )

      const result = loadPlugins(testDir)
      expect(result.plugins.length).toBe(2)
      expect(result.byId.get('plugin-a')).toBeDefined()
      expect(result.byId.get('plugin-b')).toBeDefined()
    })

    it('should skip non-directories', () => {
      mkdirSync(testDir, { recursive: true })
      writeFileSync(join(testDir, 'not-a-plugin.txt'), 'text')

      const result = loadPlugins(testDir)
      expect(result.plugins.length).toBe(0)
    })
  })

  describe('getPlugin', () => {
    it('should return plugin by id', () => {
      const plugin: Plugin = {
        metadata: {
          id: 'test',
          name: 'Test',
          version: 'v1.0.0',
          description: 'Test',
          provides: {},
        },
        state: 'installed',
        path: '/path',
      }

      const registry: PluginRegistry = {
        plugins: [plugin],
        byId: new Map([['test', plugin]]),
      }

      const result = getPlugin(registry, 'test')
      expect(result).toBe(plugin)
    })

    it('should return undefined for unknown id', () => {
      const registry: PluginRegistry = {
        plugins: [],
        byId: new Map(),
      }

      const result = getPlugin(registry, 'unknown')
      expect(result).toBeUndefined()
    })
  })

  describe('getEnabledPlugins', () => {
    it('should return only enabled plugins', () => {
      const createPlugin = (id: string, state: Plugin['state']): Plugin => ({
        metadata: {
          id,
          name: id,
          version: 'v1.0.0',
          description: 'Test',
          provides: {},
        },
        state,
        path: `/path/${id}`,
      })

      const registry: PluginRegistry = {
        plugins: [
          createPlugin('a', 'enabled'),
          createPlugin('b', 'disabled'),
          createPlugin('c', 'enabled'),
          createPlugin('d', 'installed'),
        ],
        byId: new Map(),
      }

      const result = getEnabledPlugins(registry)
      expect(result.length).toBe(2)
      expect(result.map((p) => p.metadata.id)).toEqual(['a', 'c'])
    })
  })

  describe('validatePlugin', () => {
    const testDir = join(process.cwd(), '.test-validate-dir')

    beforeEach(() => {
      try {
        rmSync(testDir, { recursive: true })
      } catch {
        // ignore
      }
      mkdirSync(testDir, { recursive: true })
    })

    afterEach(() => {
      try {
        rmSync(testDir, { recursive: true })
      } catch {
        // ignore
      }
    })

    it('should return invalid if plugin.md is missing', () => {
      const result = validatePlugin(testDir)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Missing plugin.md manifest')
    })

    it('should return invalid if id is missing', () => {
      writeFileSync(
        join(testDir, 'plugin.md'),
        '---\nname: No ID\n---\n# No ID'
      )

      const result = validatePlugin(testDir)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Missing required field: id')
    })

    it('should warn about missing description', () => {
      writeFileSync(
        join(testDir, 'plugin.md'),
        '---\nid: test\nversion: v1.0.0\n---\n# Test'
      )

      const result = validatePlugin(testDir)
      // Still valid but has warnings about missing description
      expect(result.warnings).toContain('Missing recommended field: description')
    })

    it('should validate rules directory', () => {
      writeFileSync(
        join(testDir, 'plugin.md'),
        '---\nid: test\nversion: v1.0.0\ndescription: test\nrules:\n  - rule1\n---\n# Test'
      )

      const result = validatePlugin(testDir)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain(
        'Plugin declares rules but rules/ directory not found'
      )
    })

    it('should validate patterns directory', () => {
      writeFileSync(
        join(testDir, 'plugin.md'),
        '---\nid: test\nversion: v1.0.0\ndescription: test\npatterns:\n  - pat1\n---\n# Test'
      )

      const result = validatePlugin(testDir)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain(
        'Plugin declares patterns but patterns/ directory not found'
      )
    })

    it('should validate skills directory', () => {
      writeFileSync(
        join(testDir, 'plugin.md'),
        '---\nid: test\nversion: v1.0.0\ndescription: test\nskills:\n  - skill1\n---\n# Test'
      )

      const result = validatePlugin(testDir)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain(
        'Plugin declares skills but skills/ directory not found'
      )
    })

    it('should validate complete plugin', () => {
      mkdirSync(join(testDir, 'rules'), { recursive: true })
      mkdirSync(join(testDir, 'patterns'), { recursive: true })
      mkdirSync(join(testDir, 'skills'), { recursive: true })

      writeFileSync(
        join(testDir, 'plugin.md'),
        `---
id: complete-plugin
version: v1.0.0
description: Complete plugin
rules:
  - rule1
patterns:
  - pat1
skills:
  - skill1
---
# Complete Plugin
`
      )

      const result = validatePlugin(testDir)
      expect(result.valid).toBe(true)
      expect(result.errors.length).toBe(0)
    })
  })
})
