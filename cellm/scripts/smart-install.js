#!/usr/bin/env node
/**
 * CELLM Plugin - Smart Install Script
 *
 * Ensures required directories exist for CELLM Oracle operation.
 * Runs during SessionStart hook to prepare the environment.
 *
 * Responsibilities:
 * - Create ~/.cellm/ if not exists
 * - Create ~/.cellm/logs/ for log files
 * - Verify Bun is available (optional, warn only)
 *
 * Note: Database initialization is handled by the Oracle Worker.
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const HOME = process.env.HOME || process.env.USERPROFILE
const CELLM_DIR = path.join(HOME, '.cellm')
const LOGS_DIR = path.join(CELLM_DIR, 'logs')

/**
 * Log with timestamp
 */
function log(level, message) {
  const ts = new Date().toISOString()
  const logFile = path.join(LOGS_DIR, `cellm-${new Date().toISOString().split('T')[0]}.log`)

  const logLine = `[${ts}] [smart-install] [${level}] ${message}`

  // Always output to stderr (stdout may be used by hooks)
  console.error(logLine)

  // Try to append to log file if logs dir exists
  try {
    if (fs.existsSync(LOGS_DIR)) {
      fs.appendFileSync(logFile, logLine + '\n')
    }
  } catch {
    // Ignore log write errors
  }
}

/**
 * Ensure directories exist
 */
function ensureDirectories() {
  const dirs = [CELLM_DIR, LOGS_DIR]

  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
      log('info', `Created directory: ${dir}`)
    }
  }
}

/**
 * Check if Bun is available
 */
function checkBun() {
  try {
    const version = execSync('bun --version', { encoding: 'utf-8', timeout: 5000 }).trim()
    log('info', `Bun version: ${version}`)
    return true
  } catch {
    log('warn', 'Bun not found in PATH. Some features may not work.')
    return false
  }
}

/**
 * Write basic settings if not exists
 */
function ensureSettings() {
  const settingsPath = path.join(CELLM_DIR, 'settings.json')

  if (!fs.existsSync(settingsPath)) {
    const defaultSettings = {
      version: '2.4.0',
      port: 31415,
      logLevel: 'info',
      createdAt: new Date().toISOString(),
    }

    fs.writeFileSync(settingsPath, JSON.stringify(defaultSettings, null, 2))
    log('info', `Created default settings: ${settingsPath}`)
  }
}

/**
 * Main
 */
function main() {
  try {
    // Ensure directories first (needed for logging)
    ensureDirectories()

    log('info', 'CELLM smart-install starting')
    log('info', `Data directory: ${CELLM_DIR}`)

    // Check Bun availability
    checkBun()

    // Ensure settings file
    ensureSettings()

    log('info', 'CELLM directories ready')

    // Success - exit 0
    process.exit(0)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    log('error', `Installation failed: ${message}`)

    // Don't fail the hook - exit 0 anyway
    process.exit(0)
  }
}

main()
