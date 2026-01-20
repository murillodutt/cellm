import Ajv, { type ErrorObject } from 'ajv'
import addFormats from 'ajv-formats'
import matter from 'gray-matter'
import { readFile, fileExists, getCellmCorePath } from './fs.js'
import { join } from 'node:path'

// Schema cache
const schemaCache = new Map<string, object>()

// Create AJV instance
const ajv = new Ajv.default({
  allErrors: true,
  verbose: true,
  strict: false,
})
;(addFormats.default || addFormats)(ajv)

/**
 * Schema types available in CELLM
 */
export type SchemaType = 'rule' | 'pattern' | 'workflow' | 'command' | 'agent' | 'skill' | 'config'

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
}

/**
 * Validation error details
 */
export interface ValidationError {
  file: string
  field: string
  message: string
  value?: unknown
}

/**
 * Load a schema from the schemas directory
 */
export function loadSchema(type: SchemaType): object {
  if (schemaCache.has(type)) {
    return schemaCache.get(type)!
  }

  const schemaPath = join(getCellmCorePath(), '..', 'schemas', `${type}.schema.json`)

  if (!fileExists(schemaPath)) {
    throw new Error(`Schema not found: ${type}.schema.json`)
  }

  const schema = JSON.parse(readFile(schemaPath))
  schemaCache.set(type, schema)

  return schema
}

/**
 * Load base schema (required for refs)
 */
export function loadBaseSchema(): object {
  const basePath = join(getCellmCorePath(), '..', 'schemas', 'base.schema.json')

  if (!fileExists(basePath)) {
    throw new Error('Base schema not found: base.schema.json')
  }

  return JSON.parse(readFile(basePath))
}

/**
 * Determine schema type from file path
 */
export function getSchemaTypeFromPath(filePath: string): SchemaType | null {
  if (filePath.includes('/rules/')) return 'rule'
  if (filePath.includes('/patterns/')) return 'pattern'
  if (filePath.includes('/workflows/')) return 'workflow'
  if (filePath.includes('/commands/')) return 'command'
  if (filePath.includes('/agents/')) return 'agent'
  if (filePath.includes('/skills/')) return 'skill'
  return null
}

/**
 * Parse frontmatter from a markdown file
 */
export function parseFrontmatter(content: string): { data: Record<string, unknown>; content: string } {
  const { data, content: body } = matter(content)
  return { data: data as Record<string, unknown>, content: body }
}

/**
 * Validate frontmatter against schema
 */
export function validateFrontmatter(
  frontmatter: Record<string, unknown>,
  schemaType: SchemaType,
  filePath: string
): ValidationResult {
  try {
    // Load base schema for refs
    const baseSchema = loadBaseSchema()
    if (!ajv.getSchema('base')) {
      ajv.addSchema(baseSchema, 'base')
    }

    const schema = loadSchema(schemaType)
    const validate = ajv.compile(schema)
    const valid = validate(frontmatter)

    if (valid) {
      return { valid: true, errors: [] }
    }

    const errors: ValidationError[] = (validate.errors || []).map((err: ErrorObject) => ({
      file: filePath,
      field: err.instancePath || '/',
      message: err.message || 'Unknown validation error',
      value: err.data,
    }))

    return { valid: false, errors }
  } catch (error) {
    return {
      valid: false,
      errors: [
        {
          file: filePath,
          field: '/',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      ],
    }
  }
}

/**
 * Validate a markdown file
 */
export function validateMarkdownFile(filePath: string): ValidationResult {
  if (!fileExists(filePath)) {
    return {
      valid: false,
      errors: [{ file: filePath, field: '/', message: 'File not found' }],
    }
  }

  const content = readFile(filePath)

  // Check for frontmatter
  if (!content.startsWith('---')) {
    return {
      valid: false,
      errors: [{ file: filePath, field: '/', message: 'Missing frontmatter' }],
    }
  }

  const { data: frontmatter } = parseFrontmatter(content)

  // Determine schema type
  const schemaType = getSchemaTypeFromPath(filePath)
  if (!schemaType) {
    // Skip files that don't match any schema type
    return { valid: true, errors: [] }
  }

  return validateFrontmatter(frontmatter, schemaType, filePath)
}

/**
 * Get required frontmatter fields for a schema type
 */
export function getRequiredFields(schemaType: SchemaType): string[] {
  const baseFields = ['id', 'version', 'status', 'budget']

  const typeFields: Record<SchemaType, string[]> = {
    rule: [...baseFields, 'scope', 'priority'],
    pattern: [...baseFields, 'category', 'tags'],
    workflow: [...baseFields, 'trigger', 'steps'],
    command: [...baseFields, 'alias', 'workflow'],
    agent: [...baseFields, 'role', 'capabilities'],
    skill: [...baseFields, 'domain', 'triggers'],
    config: ['profile', 'version'],
  }

  return typeFields[schemaType] || baseFields
}
