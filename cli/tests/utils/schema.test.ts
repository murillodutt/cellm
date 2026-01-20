import { describe, it, expect } from 'vitest'
import {
  getSchemaTypeFromPath,
  parseFrontmatter,
  getRequiredFields,
} from '../../src/utils/schema.js'

describe('schema utils', () => {
  describe('getSchemaTypeFromPath', () => {
    it('detects rule schema', () => {
      expect(getSchemaTypeFromPath('/project/.claude/rules/core/conventions.md')).toBe('rule')
    })

    it('detects pattern schema', () => {
      expect(getSchemaTypeFromPath('/project/.claude/patterns/typescript.md')).toBe('pattern')
    })

    it('detects workflow schema', () => {
      expect(getSchemaTypeFromPath('/project/.claude/workflows/implement.md')).toBe('workflow')
    })

    it('detects command schema', () => {
      expect(getSchemaTypeFromPath('/project/.claude/commands/status.md')).toBe('command')
    })

    it('detects agent schema', () => {
      expect(getSchemaTypeFromPath('/project/.claude/agents/reviewer.md')).toBe('agent')
    })

    it('detects skill schema', () => {
      expect(getSchemaTypeFromPath('/project/.claude/skills/nuxt.md')).toBe('skill')
    })

    it('returns null for unknown path', () => {
      expect(getSchemaTypeFromPath('/project/readme.md')).toBe(null)
    })

    it('returns null for root path', () => {
      expect(getSchemaTypeFromPath('/project/.claude/index.md')).toBe(null)
    })
  })

  describe('parseFrontmatter', () => {
    it('parses valid frontmatter', () => {
      const content = `---
id: TEST-001
version: v0.10.0
status: OK
---

# Content`

      const result = parseFrontmatter(content)
      expect(result.data.id).toBe('TEST-001')
      expect(result.data.version).toBe('v0.10.0')
      expect(result.data.status).toBe('OK')
      expect(result.content).toContain('# Content')
    })

    it('handles empty frontmatter', () => {
      const content = `---
---

# Content`

      const result = parseFrontmatter(content)
      expect(Object.keys(result.data).length).toBe(0)
    })

    it('handles content without frontmatter', () => {
      const content = '# Just Content'

      const result = parseFrontmatter(content)
      expect(Object.keys(result.data).length).toBe(0)
      expect(result.content).toBe('# Just Content')
    })

    it('handles complex YAML values', () => {
      const content = `---
id: TEST-001
tags:
  - typescript
  - patterns
budget: ~500 tokens
---`

      const result = parseFrontmatter(content)
      expect(result.data.tags).toEqual(['typescript', 'patterns'])
      expect(result.data.budget).toBe('~500 tokens')
    })
  })

  describe('getRequiredFields', () => {
    it('returns base fields for rule', () => {
      const fields = getRequiredFields('rule')
      expect(fields).toContain('id')
      expect(fields).toContain('version')
      expect(fields).toContain('status')
      expect(fields).toContain('budget')
      expect(fields).toContain('scope')
      expect(fields).toContain('priority')
    })

    it('returns base fields for pattern', () => {
      const fields = getRequiredFields('pattern')
      expect(fields).toContain('id')
      expect(fields).toContain('category')
      expect(fields).toContain('tags')
    })

    it('returns base fields for workflow', () => {
      const fields = getRequiredFields('workflow')
      expect(fields).toContain('trigger')
      expect(fields).toContain('steps')
    })

    it('returns base fields for command', () => {
      const fields = getRequiredFields('command')
      expect(fields).toContain('alias')
      expect(fields).toContain('workflow')
    })

    it('returns base fields for agent', () => {
      const fields = getRequiredFields('agent')
      expect(fields).toContain('role')
      expect(fields).toContain('capabilities')
    })

    it('returns base fields for skill', () => {
      const fields = getRequiredFields('skill')
      expect(fields).toContain('domain')
      expect(fields).toContain('triggers')
    })

    it('returns config fields', () => {
      const fields = getRequiredFields('config')
      expect(fields).toContain('profile')
      expect(fields).toContain('version')
    })
  })
})
