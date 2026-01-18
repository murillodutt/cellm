/**
 * Tests for JSON Schema files
 * Validates that all schema files exist and are valid JSON Schema
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { existsSync, readFileSync } from 'fs'
import { join } from 'path'
import Ajv2020 from 'ajv/dist/2020'
import addFormats from 'ajv-formats'
import { SCHEMAS_DIR, loadSchema } from '../utils/helpers'

// Create new AJV instance for each test to avoid schema caching issues
function createAjv() {
  const ajv = new Ajv2020({ allErrors: true, strict: false })
  addFormats(ajv)
  return ajv
}

const REQUIRED_SCHEMAS = [
  'base',
  'rule',
  'pattern',
  'workflow',
  'command',
  'agent',
  'skill',
  'config'
]

describe('Schema Files', () => {
  describe('Existence', () => {
    it.each(REQUIRED_SCHEMAS)('should have %s.schema.json', (schemaName) => {
      const schemaPath = join(SCHEMAS_DIR, `${schemaName}.schema.json`)
      expect(existsSync(schemaPath)).toBe(true)
    })
  })

  describe('Valid JSON', () => {
    it.each(REQUIRED_SCHEMAS)('%s.schema.json should be valid JSON', (schemaName) => {
      const schema = loadSchema(schemaName)
      expect(schema).not.toBeNull()
      expect(typeof schema).toBe('object')
    })
  })

  describe('Valid JSON Schema', () => {
    it.each(REQUIRED_SCHEMAS)('%s.schema.json should be a valid JSON Schema', (schemaName) => {
      const schema = loadSchema(schemaName)
      expect(schema).not.toBeNull()

      // Remove $schema to avoid validation issues, we just want to check it compiles
      const schemaWithoutMeta = { ...schema }
      delete (schemaWithoutMeta as Record<string, unknown>)['$schema']

      // Try to compile the schema
      const ajv = createAjv()
      const validate = ajv.compile(schemaWithoutMeta!)
      expect(typeof validate).toBe('function')
    })
  })

  describe('Schema Structure', () => {
    it('base.schema.json should have $defs', () => {
      const schema = loadSchema('base')
      expect(schema).toHaveProperty('$defs')
      expect(schema!.$defs).toHaveProperty('identifier')
      expect(schema!.$defs).toHaveProperty('version')
      expect(schema!.$defs).toHaveProperty('status')
    })

    it('rule.schema.json should require id field', () => {
      const schema = loadSchema('rule')
      expect(schema).toHaveProperty('required')
      expect(schema!.required).toContain('id')
    })

    it('pattern.schema.json should require id field', () => {
      const schema = loadSchema('pattern')
      expect(schema).toHaveProperty('required')
      expect(schema!.required).toContain('id')
    })

    it('workflow.schema.json should require workflow, phase, agent fields', () => {
      const schema = loadSchema('workflow')
      expect(schema).toHaveProperty('required')
      expect(schema!.required).toContain('workflow')
      expect(schema!.required).toContain('phase')
      expect(schema!.required).toContain('agent')
    })

    it('command.schema.json should require command, agent fields', () => {
      const schema = loadSchema('command')
      expect(schema).toHaveProperty('required')
      expect(schema!.required).toContain('command')
      expect(schema!.required).toContain('agent')
    })

    it('agent.schema.json should require agent, triggers fields', () => {
      const schema = loadSchema('agent')
      expect(schema).toHaveProperty('required')
      expect(schema!.required).toContain('agent')
      expect(schema!.required).toContain('triggers')
    })

    it('skill.schema.json should require skill, triggers fields', () => {
      const schema = loadSchema('skill')
      expect(schema).toHaveProperty('required')
      expect(schema!.required).toContain('skill')
      expect(schema!.required).toContain('triggers')
    })

    it('config.schema.json should require cellm, profile fields', () => {
      const schema = loadSchema('config')
      expect(schema).toHaveProperty('required')
      expect(schema!.required).toContain('cellm')
      expect(schema!.required).toContain('profile')
    })
  })

  describe('Schema Validation Examples', () => {
    it('rule.schema.json examples should be valid', () => {
      const schema = loadSchema('rule')
      expect(schema).toHaveProperty('examples')

      // Remove $schema and $id to avoid caching issues
      const schemaForValidation = { ...schema }
      delete (schemaForValidation as Record<string, unknown>)['$schema']
      delete (schemaForValidation as Record<string, unknown>)['$id']

      const ajv = createAjv()
      const validate = ajv.compile(schemaForValidation!)

      for (const example of schema!.examples as unknown[]) {
        const valid = validate(example)
        if (!valid) {
          console.log('Invalid example:', example, validate.errors)
        }
        expect(valid).toBe(true)
      }
    })

    it('workflow.schema.json examples should be valid', () => {
      const schema = loadSchema('workflow')
      expect(schema).toHaveProperty('examples')

      const schemaForValidation = { ...schema }
      delete (schemaForValidation as Record<string, unknown>)['$schema']
      delete (schemaForValidation as Record<string, unknown>)['$id']

      const ajv = createAjv()
      const validate = ajv.compile(schemaForValidation!)

      for (const example of schema!.examples as unknown[]) {
        const valid = validate(example)
        if (!valid) {
          console.log('Invalid example:', example, validate.errors)
        }
        expect(valid).toBe(true)
      }
    })

    it('agent.schema.json examples should be valid', () => {
      const schema = loadSchema('agent')
      expect(schema).toHaveProperty('examples')

      const schemaForValidation = { ...schema }
      delete (schemaForValidation as Record<string, unknown>)['$schema']
      delete (schemaForValidation as Record<string, unknown>)['$id']

      const ajv = createAjv()
      const validate = ajv.compile(schemaForValidation!)

      for (const example of schema!.examples as unknown[]) {
        const valid = validate(example)
        if (!valid) {
          console.log('Invalid example:', example, validate.errors)
        }
        expect(valid).toBe(true)
      }
    })
  })
})
