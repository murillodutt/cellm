import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import {
  directoryExists,
  fileExists,
  ensureDir,
  readFile,
  writeFile,
  copyFile,
  listFiles,
  copyDir,
  findMarkdownFiles,
  relativePath,
} from '../../src/utils/fs.js'

describe('fs utils', () => {
  let tempDir: string

  beforeEach(() => {
    tempDir = join(tmpdir(), `cellm-test-${Date.now()}`)
    mkdirSync(tempDir, { recursive: true })
  })

  afterEach(() => {
    if (existsSync(tempDir)) {
      rmSync(tempDir, { recursive: true, force: true })
    }
  })

  describe('directoryExists', () => {
    it('returns true for existing directory', () => {
      expect(directoryExists(tempDir)).toBe(true)
    })

    it('returns false for non-existing directory', () => {
      expect(directoryExists(join(tempDir, 'nonexistent'))).toBe(false)
    })

    it('returns false for file', () => {
      const filePath = join(tempDir, 'file.txt')
      writeFileSync(filePath, 'test')
      expect(directoryExists(filePath)).toBe(false)
    })
  })

  describe('fileExists', () => {
    it('returns true for existing file', () => {
      const filePath = join(tempDir, 'file.txt')
      writeFileSync(filePath, 'test')
      expect(fileExists(filePath)).toBe(true)
    })

    it('returns false for non-existing file', () => {
      expect(fileExists(join(tempDir, 'nonexistent.txt'))).toBe(false)
    })

    it('returns false for directory', () => {
      expect(fileExists(tempDir)).toBe(false)
    })
  })

  describe('ensureDir', () => {
    it('creates directory if not exists', () => {
      const newDir = join(tempDir, 'new', 'nested', 'dir')
      ensureDir(newDir)
      expect(directoryExists(newDir)).toBe(true)
    })

    it('does nothing if directory exists', () => {
      ensureDir(tempDir)
      expect(directoryExists(tempDir)).toBe(true)
    })
  })

  describe('readFile', () => {
    it('reads file content', () => {
      const filePath = join(tempDir, 'file.txt')
      writeFileSync(filePath, 'hello world')
      expect(readFile(filePath)).toBe('hello world')
    })
  })

  describe('writeFile', () => {
    it('writes content to file', () => {
      const filePath = join(tempDir, 'file.txt')
      writeFile(filePath, 'hello')
      expect(readFile(filePath)).toBe('hello')
    })

    it('creates parent directories', () => {
      const filePath = join(tempDir, 'deep', 'nested', 'file.txt')
      writeFile(filePath, 'hello')
      expect(fileExists(filePath)).toBe(true)
    })
  })

  describe('copyFile', () => {
    it('copies file to destination', () => {
      const src = join(tempDir, 'src.txt')
      const dest = join(tempDir, 'dest.txt')
      writeFileSync(src, 'content')
      copyFile(src, dest)
      expect(readFile(dest)).toBe('content')
    })

    it('creates parent directories', () => {
      const src = join(tempDir, 'src.txt')
      const dest = join(tempDir, 'deep', 'dest.txt')
      writeFileSync(src, 'content')
      copyFile(src, dest)
      expect(fileExists(dest)).toBe(true)
    })
  })

  describe('listFiles', () => {
    it('lists files in directory', () => {
      writeFileSync(join(tempDir, 'a.txt'), '')
      writeFileSync(join(tempDir, 'b.txt'), '')
      const files = listFiles(tempDir)
      expect(files).toContain('a.txt')
      expect(files).toContain('b.txt')
    })

    it('returns empty array for non-existing directory', () => {
      expect(listFiles(join(tempDir, 'nonexistent'))).toEqual([])
    })
  })

  describe('copyDir', () => {
    it('copies directory recursively', () => {
      const srcDir = join(tempDir, 'src')
      const destDir = join(tempDir, 'dest')
      mkdirSync(srcDir)
      writeFileSync(join(srcDir, 'file.txt'), 'content')
      mkdirSync(join(srcDir, 'sub'))
      writeFileSync(join(srcDir, 'sub', 'nested.txt'), 'nested')

      copyDir(srcDir, destDir)

      expect(fileExists(join(destDir, 'file.txt'))).toBe(true)
      expect(fileExists(join(destDir, 'sub', 'nested.txt'))).toBe(true)
    })
  })

  describe('findMarkdownFiles', () => {
    it('finds markdown files recursively', () => {
      mkdirSync(join(tempDir, 'sub'))
      writeFileSync(join(tempDir, 'a.md'), '')
      writeFileSync(join(tempDir, 'b.txt'), '')
      writeFileSync(join(tempDir, 'sub', 'c.md'), '')

      const files = findMarkdownFiles(tempDir)
      expect(files.length).toBe(2)
      expect(files.some((f) => f.endsWith('a.md'))).toBe(true)
      expect(files.some((f) => f.endsWith('c.md'))).toBe(true)
    })

    it('returns empty array for non-existing directory', () => {
      expect(findMarkdownFiles(join(tempDir, 'nonexistent'))).toEqual([])
    })
  })

  describe('relativePath', () => {
    it('returns relative path', () => {
      expect(relativePath('/base/path', '/base/path/sub/file.txt')).toBe('sub/file.txt')
    })
  })
})
