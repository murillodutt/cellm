import { describe, it, expect } from 'vitest'
import { Command } from 'commander'
import { initCommand } from '../../src/commands/init.js'
import { validateCommand } from '../../src/commands/validate.js'
import { doctorCommand } from '../../src/commands/doctor.js'
import { syncCommand } from '../../src/commands/sync.js'

describe('CLI commands', () => {
  describe('init command', () => {
    it('is a valid Command instance', () => {
      expect(initCommand).toBeInstanceOf(Command)
    })

    it('has correct name', () => {
      expect(initCommand.name()).toBe('init')
    })

    it('has description', () => {
      expect(initCommand.description()).toBeTruthy()
    })

    it('has profile option', () => {
      const options = initCommand.options
      const profileOption = options.find((o) => o.long === '--profile')
      expect(profileOption).toBeDefined()
    })

    it('has force option', () => {
      const options = initCommand.options
      const forceOption = options.find((o) => o.long === '--force')
      expect(forceOption).toBeDefined()
    })

    it('has dry-run option', () => {
      const options = initCommand.options
      const dryRunOption = options.find((o) => o.long === '--dry-run')
      expect(dryRunOption).toBeDefined()
    })
  })

  describe('validate command', () => {
    it('is a valid Command instance', () => {
      expect(validateCommand).toBeInstanceOf(Command)
    })

    it('has correct name', () => {
      expect(validateCommand.name()).toBe('validate')
    })

    it('has description', () => {
      expect(validateCommand.description()).toBeTruthy()
    })

    it('has dir option', () => {
      const options = validateCommand.options
      const dirOption = options.find((o) => o.long === '--dir')
      expect(dirOption).toBeDefined()
    })

    it('has verbose option', () => {
      const options = validateCommand.options
      const verboseOption = options.find((o) => o.long === '--verbose')
      expect(verboseOption).toBeDefined()
    })
  })

  describe('doctor command', () => {
    it('is a valid Command instance', () => {
      expect(doctorCommand).toBeInstanceOf(Command)
    })

    it('has correct name', () => {
      expect(doctorCommand.name()).toBe('doctor')
    })

    it('has description', () => {
      expect(doctorCommand.description()).toBeTruthy()
    })

    it('has dir option', () => {
      const options = doctorCommand.options
      const dirOption = options.find((o) => o.long === '--dir')
      expect(dirOption).toBeDefined()
    })

    it('has verbose option', () => {
      const options = doctorCommand.options
      const verboseOption = options.find((o) => o.long === '--verbose')
      expect(verboseOption).toBeDefined()
    })
  })

  describe('sync command', () => {
    it('is a valid Command instance', () => {
      expect(syncCommand).toBeInstanceOf(Command)
    })

    it('has correct name', () => {
      expect(syncCommand.name()).toBe('sync')
    })

    it('has description', () => {
      expect(syncCommand.description()).toBeTruthy()
    })

    it('has dir option', () => {
      const options = syncCommand.options
      const dirOption = options.find((o) => o.long === '--dir')
      expect(dirOption).toBeDefined()
    })

    it('has from option', () => {
      const options = syncCommand.options
      const fromOption = options.find((o) => o.long === '--from')
      expect(fromOption).toBeDefined()
    })

    it('has dry-run option', () => {
      const options = syncCommand.options
      const dryRunOption = options.find((o) => o.long === '--dry-run')
      expect(dryRunOption).toBeDefined()
    })

    it('has force option', () => {
      const options = syncCommand.options
      const forceOption = options.find((o) => o.long === '--force')
      expect(forceOption).toBeDefined()
    })
  })
})
