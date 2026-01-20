import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync, copyFileSync, statSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * Get the CLI package root directory
 */
export function getCliRoot(): string {
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = dirname(__filename)
  // From dist/utils/fs.js -> cli/
  return resolve(__dirname, '..', '..')
}

/**
 * Get the cellm-core directory path
 */
export function getCellmCorePath(): string {
  const cliRoot = getCliRoot()
  // From cli/ -> cellm-core/
  return resolve(cliRoot, '..', 'cellm-core')
}

/**
 * Check if a directory exists
 */
export function directoryExists(path: string): boolean {
  return existsSync(path) && statSync(path).isDirectory()
}

/**
 * Check if a file exists
 */
export function fileExists(path: string): boolean {
  return existsSync(path) && statSync(path).isFile()
}

/**
 * Ensure a directory exists, creating it if necessary
 */
export function ensureDir(path: string): void {
  if (!existsSync(path)) {
    mkdirSync(path, { recursive: true })
  }
}

/**
 * Read a file as UTF-8 string
 */
export function readFile(path: string): string {
  return readFileSync(path, 'utf-8')
}

/**
 * Write content to a file
 */
export function writeFile(path: string, content: string): void {
  ensureDir(dirname(path))
  writeFileSync(path, content, 'utf-8')
}

/**
 * Copy a file from source to destination
 */
export function copyFile(src: string, dest: string): void {
  ensureDir(dirname(dest))
  copyFileSync(src, dest)
}

/**
 * List files in a directory (non-recursive)
 */
export function listFiles(dir: string): string[] {
  if (!directoryExists(dir)) return []
  return readdirSync(dir)
}

/**
 * Recursively copy a directory
 */
export function copyDir(src: string, dest: string): void {
  ensureDir(dest)
  const entries = readdirSync(src, { withFileTypes: true })

  for (const entry of entries) {
    const srcPath = join(src, entry.name)
    const destPath = join(dest, entry.name)

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath)
    } else {
      copyFile(srcPath, destPath)
    }
  }
}

/**
 * Find all markdown files in a directory recursively
 */
export function findMarkdownFiles(dir: string): string[] {
  const files: string[] = []

  if (!directoryExists(dir)) return files

  const entries = readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = join(dir, entry.name)

    if (entry.isDirectory()) {
      files.push(...findMarkdownFiles(fullPath))
    } else if (entry.name.endsWith('.md')) {
      files.push(fullPath)
    }
  }

  return files
}

/**
 * Get relative path from base
 */
export function relativePath(from: string, to: string): string {
  return to.replace(from, '').replace(/^[/\\]/, '')
}
