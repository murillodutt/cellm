import { describe, it, expect } from 'vitest'
import {
  PROFILES,
  resolveInheritanceChain,
  resolveProfile,
  getAvailableProfiles,
  getProfileInfo,
  generateContextSummary,
  type ResolvedProfile,
  type CompilationResult,
} from '../../src/utils/profile.js'
import type { BudgetStatus } from '../../src/utils/token.js'

describe('Profile Utilities', () => {
  describe('PROFILES constant', () => {
    it('should have base profile as root', () => {
      expect(PROFILES.base).toBeDefined()
      expect(PROFILES.base.extends).toBeUndefined()
    })

    it('should have all expected profiles', () => {
      const expectedProfiles = [
        'base',
        'typescript',
        'web',
        'vue',
        'nuxt',
        'nuxt-fullstack',
        'nuxt-saas',
        'vue-spa',
        'minimal',
      ]
      for (const name of expectedProfiles) {
        expect(PROFILES[name]).toBeDefined()
      }
    })

    it('should have valid inheritance references', () => {
      for (const [name, profile] of Object.entries(PROFILES)) {
        if (profile.extends) {
          expect(PROFILES[profile.extends]).toBeDefined()
        }
      }
    })
  })

  describe('resolveInheritanceChain', () => {
    it('should return single item for base profile', () => {
      const chain = resolveInheritanceChain('base')
      expect(chain).toEqual(['base'])
    })

    it('should return full chain for derived profile', () => {
      const chain = resolveInheritanceChain('nuxt-fullstack')
      expect(chain).toEqual(['base', 'typescript', 'web', 'vue', 'nuxt', 'nuxt-fullstack'])
    })

    it('should return full chain for vue-spa', () => {
      const chain = resolveInheritanceChain('vue-spa')
      expect(chain).toEqual(['base', 'typescript', 'web', 'vue', 'vue-spa'])
    })

    it('should return full chain for minimal', () => {
      const chain = resolveInheritanceChain('minimal')
      expect(chain).toEqual(['base', 'minimal'])
    })

    it('should return empty array for unknown profile', () => {
      const chain = resolveInheritanceChain('unknown-profile')
      expect(chain).toEqual([])
    })
  })

  describe('resolveProfile', () => {
    it('should return null for unknown profile', () => {
      const result = resolveProfile('unknown-profile')
      expect(result).toBeNull()
    })

    it('should resolve base profile correctly', () => {
      const result = resolveProfile('base')
      expect(result).not.toBeNull()
      expect(result!.name).toBe('base')
      expect(result!.rules).toContain('core/conventions')
      expect(result!.rules).toContain('core/limits')
      expect(result!.rules).toContain('core/protocols')
    })

    it('should merge rules from inheritance chain', () => {
      const result = resolveProfile('nuxt')
      expect(result).not.toBeNull()
      // From base
      expect(result!.rules).toContain('core/conventions')
      // From web
      expect(result!.rules).toContain('domain/frontend')
      // From nuxt
      expect(result!.rules).toContain('domain/backend')
    })

    it('should merge patterns from inheritance chain', () => {
      const result = resolveProfile('nuxt-fullstack')
      expect(result).not.toBeNull()
      // From base
      expect(result!.patterns).toContain('anti/prohibited-patterns')
      // From typescript
      expect(result!.patterns).toContain('typescript')
      // From vue
      expect(result!.patterns).toContain('vue')
      // From nuxt
      expect(result!.patterns).toContain('nuxt')
      // From nuxt-fullstack
      expect(result!.patterns).toContain('drizzle')
      expect(result!.patterns).toContain('pinia')
    })

    it('should merge skills from inheritance chain', () => {
      const result = resolveProfile('nuxt-fullstack')
      expect(result).not.toBeNull()
      // From web
      expect(result!.skills).toContain('tailwind')
      // From vue
      expect(result!.skills).toContain('vue')
      // From nuxt
      expect(result!.skills).toContain('nuxt')
      expect(result!.skills).toContain('nuxt-ui')
      // From nuxt-fullstack
      expect(result!.skills).toContain('drizzle')
      expect(result!.skills).toContain('pinia')
    })

    it('should not have duplicates', () => {
      const result = resolveProfile('nuxt-fullstack')
      expect(result).not.toBeNull()
      const uniqueRules = new Set(result!.rules)
      const uniquePatterns = new Set(result!.patterns)
      const uniqueSkills = new Set(result!.skills)
      expect(result!.rules.length).toBe(uniqueRules.size)
      expect(result!.patterns.length).toBe(uniquePatterns.size)
      expect(result!.skills.length).toBe(uniqueSkills.size)
    })
  })

  describe('getAvailableProfiles', () => {
    it('should return all profile names', () => {
      const profiles = getAvailableProfiles()
      expect(profiles.length).toBeGreaterThan(0)
      expect(profiles).toContain('base')
      expect(profiles).toContain('nuxt-fullstack')
    })
  })

  describe('getProfileInfo', () => {
    it('should return exists: false for unknown profile', () => {
      const info = getProfileInfo('unknown')
      expect(info.exists).toBe(false)
    })

    it('should return info for valid profile', () => {
      const info = getProfileInfo('nuxt-fullstack')
      expect(info.exists).toBe(true)
      expect(info.description).toBeDefined()
      expect(info.inherits).toBe('nuxt')
    })

    it('should return no inherits for base profile', () => {
      const info = getProfileInfo('base')
      expect(info.exists).toBe(true)
      expect(info.inherits).toBeUndefined()
    })
  })

  describe('generateContextSummary', () => {
    it('should generate valid markdown', () => {
      const profile: ResolvedProfile = {
        name: 'test-profile',
        description: 'Test profile',
        inheritanceChain: ['base', 'test-profile'],
        rules: ['core/conventions'],
        patterns: ['typescript'],
        skills: ['vue'],
      }

      const budget: BudgetStatus = {
        used: 1000,
        total: 2200,
        percentage: 0.45,
        status: 'ok',
      }

      const result: CompilationResult = {
        profile,
        files: [
          { source: '/path/to/rule.md', relativePath: 'rules/core/conventions.md', category: 'rules', tokens: 100 },
          { source: '/path/to/pattern.md', relativePath: 'patterns/typescript.md', category: 'patterns', tokens: 200 },
        ],
        totalTokens: 300,
        budget,
      }

      const summary = generateContextSummary(result)

      expect(summary).toContain('# Compiled Context')
      expect(summary).toContain('test-profile')
      expect(summary).toContain('base -> test-profile')
      expect(summary).toContain('## Budget Summary')
      expect(summary).toContain('## Rules')
      expect(summary).toContain('## Patterns')
    })
  })
})
