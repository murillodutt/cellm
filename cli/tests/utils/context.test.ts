import { describe, it, expect } from 'vitest'
import {
  getContextLayer,
  getLayerLabel,
  suggestModel,
  getModelDescription,
  getCommandsForModel,
  MODEL_MAP,
} from '../../src/utils/context.js'

describe('context utils', () => {
  describe('getContextLayer', () => {
    it('identifies core layer', () => {
      expect(getContextLayer('rules/core/conventions.md')).toBe('core')
      expect(getContextLayer('.claude/rules/core/limits.md')).toBe('core')
    })

    it('identifies domain layer', () => {
      expect(getContextLayer('rules/domain/frontend.md')).toBe('domain')
      expect(getContextLayer('.claude/rules/domain/backend.md')).toBe('domain')
    })

    it('identifies patterns layer', () => {
      expect(getContextLayer('patterns/vue.md')).toBe('patterns')
      expect(getContextLayer('.claude/patterns/anti/prohibited.md')).toBe('patterns')
    })

    it('identifies session layer', () => {
      expect(getContextLayer('session/current.md')).toBe('session')
      expect(getContextLayer('.claude/session/state.md')).toBe('session')
    })

    it('defaults to project layer', () => {
      expect(getContextLayer('workflows/implement.md')).toBe('project')
      expect(getContextLayer('.claude/agents/architect.md')).toBe('project')
    })
  })

  describe('getLayerLabel', () => {
    it('returns uppercase labels', () => {
      expect(getLayerLabel('core')).toBe('CORE')
      expect(getLayerLabel('domain')).toBe('DOMAIN')
      expect(getLayerLabel('patterns')).toBe('PATTERNS')
      expect(getLayerLabel('project')).toBe('PROJECT')
      expect(getLayerLabel('session')).toBe('SESSION')
    })
  })

  describe('suggestModel', () => {
    it('suggests haiku for simple commands', () => {
      expect(suggestModel('status')).toBe('haiku')
      expect(suggestModel('metrics')).toBe('haiku')
      expect(suggestModel('reuse-check')).toBe('haiku')
    })

    it('suggests sonnet for moderate commands', () => {
      expect(suggestModel('implement')).toBe('sonnet')
      expect(suggestModel('verify')).toBe('sonnet')
      expect(suggestModel('create-tasks')).toBe('sonnet')
      expect(suggestModel('orchestrate-tasks')).toBe('sonnet')
    })

    it('suggests opus for complex commands', () => {
      expect(suggestModel('plan-product')).toBe('opus')
      expect(suggestModel('write-spec')).toBe('opus')
      expect(suggestModel('shape-spec')).toBe('opus')
      expect(suggestModel('spec')).toBe('opus')
    })

    it('handles leading slash', () => {
      expect(suggestModel('/status')).toBe('haiku')
      expect(suggestModel('/implement')).toBe('sonnet')
      expect(suggestModel('/write-spec')).toBe('opus')
    })

    it('defaults to sonnet for unknown commands', () => {
      expect(suggestModel('unknown')).toBe('sonnet')
      expect(suggestModel('custom-command')).toBe('sonnet')
    })
  })

  describe('getModelDescription', () => {
    it('returns correct descriptions', () => {
      expect(getModelDescription('haiku')).toContain('cost-effective')
      expect(getModelDescription('sonnet')).toContain('Balanced')
      expect(getModelDescription('opus')).toContain('complex reasoning')
    })
  })

  describe('getCommandsForModel', () => {
    it('returns haiku commands', () => {
      const commands = getCommandsForModel('haiku')
      expect(commands).toContain('/status')
      expect(commands).toContain('/metrics')
      expect(commands).toContain('/reuse-check')
    })

    it('returns sonnet commands', () => {
      const commands = getCommandsForModel('sonnet')
      expect(commands).toContain('/implement')
      expect(commands).toContain('/verify')
      expect(commands).toContain('/create-tasks')
    })

    it('returns opus commands', () => {
      const commands = getCommandsForModel('opus')
      expect(commands).toContain('/plan-product')
      expect(commands).toContain('/write-spec')
      expect(commands).toContain('/spec')
    })
  })

  describe('MODEL_MAP', () => {
    it('has all expected commands', () => {
      const expectedCommands = [
        'status', 'metrics', 'reuse-check',
        'implement', 'verify', 'create-tasks', 'orchestrate-tasks',
        'plan-product', 'write-spec', 'shape-spec', 'spec',
      ]
      for (const cmd of expectedCommands) {
        expect(MODEL_MAP[cmd]).toBeDefined()
      }
    })

    it('has valid model values', () => {
      const validModels = ['haiku', 'sonnet', 'opus']
      for (const model of Object.values(MODEL_MAP)) {
        expect(validModels).toContain(model)
      }
    })
  })
})
