import { describe, it, expect } from 'vitest'
import { compileCommand } from '../../src/commands/compile.js'

describe('Compile Command', () => {
  describe('command structure', () => {
    it('should have correct name', () => {
      expect(compileCommand.name()).toBe('compile')
    })

    it('should have description', () => {
      expect(compileCommand.description()).toBeDefined()
      expect(compileCommand.description()).toContain('Compile')
    })

    it('should have --profile option', () => {
      const profileOption = compileCommand.options.find(
        (o) => o.long === '--profile'
      )
      expect(profileOption).toBeDefined()
      expect(profileOption?.defaultValue).toBe('nuxt-fullstack')
    })

    it('should have --output option', () => {
      const outputOption = compileCommand.options.find(
        (o) => o.long === '--output'
      )
      expect(outputOption).toBeDefined()
      expect(outputOption?.defaultValue).toBe('.')
    })

    it('should have --dry-run option', () => {
      const dryRunOption = compileCommand.options.find(
        (o) => o.long === '--dry-run'
      )
      expect(dryRunOption).toBeDefined()
    })

    it('should have --list option', () => {
      const listOption = compileCommand.options.find(
        (o) => o.long === '--list'
      )
      expect(listOption).toBeDefined()
    })
  })
})
