import { describe, it, expect } from 'vitest'
import { upgradeCommand } from '../../src/commands/upgrade.js'

describe('Upgrade Command', () => {
  describe('command structure', () => {
    it('should have correct name', () => {
      expect(upgradeCommand.name()).toBe('upgrade')
    })

    it('should have description', () => {
      expect(upgradeCommand.description()).toBeDefined()
      expect(upgradeCommand.description()).toContain('Upgrade')
    })

    it('should have --dry-run option', () => {
      const dryRunOption = upgradeCommand.options.find(
        (o) => o.long === '--dry-run'
      )
      expect(dryRunOption).toBeDefined()
    })

    it('should have --no-backup option', () => {
      const noBackupOption = upgradeCommand.options.find(
        (o) => o.long === '--no-backup'
      )
      expect(noBackupOption).toBeDefined()
    })

    it('should have --target option', () => {
      const targetOption = upgradeCommand.options.find(
        (o) => o.long === '--target'
      )
      expect(targetOption).toBeDefined()
    })

    it('should have --force option', () => {
      const forceOption = upgradeCommand.options.find(
        (o) => o.long === '--force'
      )
      expect(forceOption).toBeDefined()
    })
  })
})
