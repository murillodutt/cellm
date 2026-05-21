#!/usr/bin/env bun
/**
 * quality-router.ts — Auto-adaptive surface router for local quality gates.
 *
 * Reads staged paths (or full repo with --all), detects relevant surfaces
 * via glob matching, checks tool availability, and dispatches focused gates.
 * Reports PASS | SKIP <reason> | FAIL with structured output.
 *
 * Bundled by `cellm:bootstrap` skill. Adopters customize SURFACE_MAP for
 * their project layout. Globs use minimatch-lite syntax (* / ** / ? / {a,b}).
 *
 * Spec source: cellm Local Quality Recipe v1 (spec-8bccf5db).
 *
 * Usage:
 *   bun scripts/quality-router.ts --staged            (default; pre-commit)
 *   bun scripts/quality-router.ts --all               (whole repo)
 *   bun scripts/quality-router.ts --surface=markdown  (one surface)
 *   bun scripts/quality-router.ts --list              (show surface map)
 *   bun scripts/quality-router.ts --json              (machine-readable)
 *
 * Exit codes:
 *   0 — all required surfaces passed (or skipped with reason)
 *   1 — at least one required surface failed
 *   2 — invalid usage / unknown argument
 *
 * Contract:
 *   PASS  — gate ran, no errors
 *   SKIP  — tool absent OR optional surface with no detected files
 *   FAIL  — required gate ran and produced errors
 */

import { spawn, spawnSync } from 'node:child_process'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Gate {
  label: string
  cmd: string
  tool: string
  cwd?: string
  env?: Record<string, string>
}

interface Surface {
  id: string
  displayName: string
  globs: string[]
  gates: Gate[]
  required: boolean
}

interface GateResult {
  label: string
  status: 'pass' | 'skip' | 'fail'
  reason?: string
  durationMs: number
  exitCode?: number
}

interface SurfaceResult {
  id: string
  displayName: string
  status: 'pass' | 'skip' | 'fail'
  matchedFiles: number
  gateResults: GateResult[]
  durationMs: number
  required: boolean
}

interface RouterResult {
  mode: 'staged' | 'all' | 'surface'
  scope: { surfaceFilter?: string; fileCount: number }
  surfaces: SurfaceResult[]
  exitCode: 0 | 1 | 2
  durationMs: number
}

// ---------------------------------------------------------------------------
// Surface manifest — adopters customize this section for their project layout.
//
// Conventions:
//   - Each surface has at least one glob and one gate (invariant QC-3).
//   - `required: true` propagates failures to exit code 1.
//   - `required: false` reports failures but exits 0 (informational).
//   - Tool detection runs `command -v <tool>` before each gate.
// ---------------------------------------------------------------------------

const SURFACE_MAP: Surface[] = [
  {
    id: 'markdown',
    displayName: 'Markdown docs',
    globs: ['**/*.md'],
    gates: [
      {
        label: 'markdownlint',
        tool: 'markdownlint-cli2',
        cmd: 'bunx markdownlint-cli2 "**/*.md"',
      },
    ],
    required: false,
  },
  {
    id: 'json',
    displayName: 'JSON',
    globs: ['**/*.json'],
    gates: [
      {
        label: 'JSON parse check',
        tool: 'node',
        cmd: 'node -e "const f=require(\\"fs\\");const files=process.env.QR_FILES.split(\\"\\\\n\\").filter(Boolean);for(const p of files){try{JSON.parse(f.readFileSync(p,\\"utf8\\"))}catch(e){console.error(p+\\":\\\\n  \\"+e.message);process.exit(1)}}"',
      },
    ],
    required: true,
  },
  {
    id: 'yaml',
    displayName: 'YAML',
    globs: ['**/*.yml', '**/*.yaml'],
    gates: [
      {
        label: 'YAML parse check',
        tool: 'bun',
        cmd: 'bun -e "import {load} from \\"js-yaml\\";import {readFileSync} from \\"fs\\";const files=process.env.QR_FILES.split(\\"\\\\n\\").filter(Boolean);for(const p of files){try{load(readFileSync(p,\\"utf8\\"))}catch(e){console.error(p+\\": \\"+e.message);process.exit(1)}}"',
      },
    ],
    required: false,
  },
  {
    id: 'shell',
    displayName: 'Shell scripts',
    globs: ['**/*.sh'],
    gates: [
      {
        label: 'shellcheck',
        tool: 'shellcheck',
        cmd: 'shellcheck --severity=warning $(git diff --cached --name-only --diff-filter=ACMRT | grep "\\.sh$" || true)',
      },
    ],
    required: false,
  },
  {
    id: 'typescript',
    displayName: 'TypeScript',
    globs: ['**/*.ts', '**/*.tsx'],
    gates: [
      {
        label: 'tsc --noEmit',
        tool: 'tsc',
        cmd: 'bunx tsc --noEmit',
      },
    ],
    required: false,
  },
]

// ---------------------------------------------------------------------------
// Glob matcher (inline, no deps)
// ---------------------------------------------------------------------------

function globToRegex(pattern: string): RegExp {
  const expanded = pattern.replace(/\{([^}]+)\}/g, (_, group: string) => {
    const opts = group.split(',').map(s => s.trim())
    return '(' + opts.join('|') + ')'
  })

  let regex = ''
  let i = 0
  while (i < expanded.length) {
    const ch = expanded[i]
    if (ch === '*') {
      if (expanded[i + 1] === '*') {
        regex += '.*'
        i += 2
        if (expanded[i] === '/') i += 1
      } else {
        regex += '[^/]*'
        i += 1
      }
    } else if (ch === '?') {
      regex += '[^/]'
      i += 1
    } else if (ch === '(' || ch === ')' || ch === '|') {
      regex += ch
      i += 1
    } else if (/[.+^${}\\]/.test(ch)) {
      regex += '\\' + ch
      i += 1
    } else {
      regex += ch
      i += 1
    }
  }
  return new RegExp('^' + regex + '$')
}

function matchesAnyGlob(filePath: string, globs: string[]): boolean {
  for (const g of globs) {
    if (globToRegex(g).test(filePath)) return true
  }
  return false
}

// ---------------------------------------------------------------------------
// Repo + git helpers
// ---------------------------------------------------------------------------

function resolveRepoRoot(): string {
  const r = spawnSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' })
  if (r.status === 0 && r.stdout) return r.stdout.trim()
  return resolve(dirname(fileURLToPath(import.meta.url)), '..')
}

const REPO_ROOT = resolveRepoRoot()

function getStagedFiles(): string[] {
  const r = spawnSync(
    'git',
    ['diff', '--cached', '--name-only', '--diff-filter=ACMRT'],
    { encoding: 'utf8', cwd: REPO_ROOT }
  )
  if (r.status !== 0) return []
  return r.stdout.split('\n').map(s => s.trim()).filter(Boolean)
}

function getAllTrackedFiles(): string[] {
  const r = spawnSync('git', ['ls-files'], { encoding: 'utf8', cwd: REPO_ROOT })
  if (r.status !== 0) return []
  return r.stdout.split('\n').map(s => s.trim()).filter(Boolean)
}

// ---------------------------------------------------------------------------
// Tool detection (cached per process)
// ---------------------------------------------------------------------------

const toolCache = new Map<string, boolean>()

function isToolAvailable(tool: string): boolean {
  if (toolCache.has(tool)) return toolCache.get(tool)!
  const r = spawnSync('sh', ['-c', `command -v ${tool}`], { stdio: 'ignore' })
  const ok = r.status === 0
  toolCache.set(tool, ok)
  return ok
}

// ---------------------------------------------------------------------------
// Logging helpers
// ---------------------------------------------------------------------------

function printError(msg: string): void { console.error(`[-] ${msg}`) }
function printInfo(msg: string): void { console.log(`[~] ${msg}`) }
function printPass(msg: string): void { console.log(`[+] ${msg}`) }
function printSkip(msg: string): void { console.log(`[=] ${msg}`) }
function printFail(msg: string): void { console.error(`[!] ${msg}`) }

// ---------------------------------------------------------------------------
// Surface dispatch
// ---------------------------------------------------------------------------

async function runGate(gate: Gate, files: string[], jsonMode: boolean): Promise<GateResult> {
  const start = Date.now()

  if (!isToolAvailable(gate.tool)) {
    return {
      label: gate.label,
      status: 'skip',
      reason: `tool not found: ${gate.tool}`,
      durationMs: Date.now() - start,
    }
  }

  const cwd = gate.cwd ? resolve(REPO_ROOT, gate.cwd) : REPO_ROOT
  const env = { ...process.env, ...(gate.env ?? {}), QR_FILES: files.join('\n') }
  const stdio: 'inherit' | ['ignore', 'pipe', 'pipe'] = jsonMode ? ['ignore', 'pipe', 'pipe'] : 'inherit'

  return new Promise(res => {
    const child = spawn('sh', ['-c', gate.cmd], { cwd, env, stdio })
    if (jsonMode) {
      child.stdout?.on('data', c => process.stderr.write(c))
      child.stderr?.on('data', c => process.stderr.write(c))
    }
    child.on('exit', code => {
      const exitCode = code ?? 1
      res({
        label: gate.label,
        status: exitCode === 0 ? 'pass' : 'fail',
        durationMs: Date.now() - start,
        exitCode,
      })
    })
    child.on('error', err => {
      res({
        label: gate.label,
        status: 'fail',
        reason: `spawn error: ${err.message}`,
        durationMs: Date.now() - start,
        exitCode: 1,
      })
    })
  })
}

async function runSurface(surface: Surface, matchedFiles: string[], jsonMode: boolean): Promise<SurfaceResult> {
  const start = Date.now()
  if (!jsonMode) printInfo(`▶ ${surface.displayName} [${surface.id}] (${matchedFiles.length} file(s))`)

  const gateResults: GateResult[] = []
  let aggregate: 'pass' | 'skip' | 'fail' = 'pass'
  let allSkipped = true

  for (const gate of surface.gates) {
    const result = await runGate(gate, matchedFiles, jsonMode)
    gateResults.push(result)
    if (result.status === 'fail') {
      aggregate = 'fail'
      allSkipped = false
    } else if (result.status === 'pass') {
      allSkipped = false
    }
  }

  if (allSkipped) aggregate = 'skip'

  const durationMs = Date.now() - start
  if (!jsonMode) {
    if (aggregate === 'pass') {
      printPass(`${surface.displayName}: PASS (${gateResults.length} gate(s), ${durationMs}ms)`)
    } else if (aggregate === 'skip') {
      const reasons = gateResults.filter(g => g.reason).map(g => g.reason).join('; ')
      printSkip(`${surface.displayName}: SKIP (${reasons || 'no gates ran'})`)
    } else {
      const failed = gateResults.find(g => g.status === 'fail')
      printFail(`${surface.displayName}: FAIL${failed ? ` (${failed.label})` : ''}`)
    }
  }

  return {
    id: surface.id,
    displayName: surface.displayName,
    status: aggregate,
    matchedFiles: matchedFiles.length,
    gateResults,
    durationMs,
    required: surface.required,
  }
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

interface CliArgs {
  mode: 'staged' | 'all' | 'surface'
  surface: string | null
  json: boolean
  list: boolean
  help: boolean
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = { mode: 'staged', surface: null, json: false, list: false, help: false }
  for (const arg of argv) {
    if (arg === '--staged') args.mode = 'staged'
    else if (arg === '--all') args.mode = 'all'
    else if (arg.startsWith('--surface=')) {
      args.mode = 'surface'
      args.surface = arg.slice('--surface='.length)
    } else if (arg === '--json') args.json = true
    else if (arg === '--list') args.list = true
    else if (arg === '--help' || arg === '-h') args.help = true
    else {
      printError(`Unknown argument: ${arg}`)
      process.exit(2)
    }
  }
  return args
}

function printHelp(): void {
  const lines = [
    'Usage: bun scripts/quality-router.ts [options]',
    '',
    'Options:',
    '  --staged             Run gates against staged files (default; pre-commit)',
    '  --all                Run gates against all tracked files',
    '  --surface=<id>       Run gates only for the named surface',
    '  --list               List surface manifest',
    '  --json               Emit machine-readable JSON envelope',
    '  -h, --help           Show this help',
    '',
    'Surface IDs: ' + SURFACE_MAP.map(s => s.id).join(', '),
    '',
    'Exit codes: 0 success, 1 required surface failed, 2 invalid usage.',
  ]
  console.log(lines.join('\n'))
}

function emitList(jsonMode: boolean): void {
  if (jsonMode) {
    console.log(JSON.stringify({
      surfaces: SURFACE_MAP.map(s => ({
        id: s.id,
        displayName: s.displayName,
        globs: s.globs,
        gates: s.gates.map(g => ({ label: g.label, tool: g.tool, cmd: g.cmd })),
        required: s.required,
      })),
    }, null, 2))
    return
  }
  console.log('\nSurface manifest:\n')
  console.log('  ID                    Required  Globs                              Gates')
  console.log('  ' + '-'.repeat(110))
  for (const s of SURFACE_MAP) {
    const id = s.id.padEnd(22)
    const req = (s.required ? 'yes' : 'no').padEnd(10)
    const globs = s.globs.join(', ').slice(0, 35).padEnd(36)
    const gates = s.gates.map(g => g.label).join(', ')
    console.log(`  ${id}${req}${globs}${gates}`)
  }
  console.log('')
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2))

  if (args.help) { printHelp(); process.exit(0) }
  if (args.list) { emitList(args.json); process.exit(0) }

  const start = Date.now()

  let files: string[]
  if (args.mode === 'all') files = getAllTrackedFiles()
  else files = getStagedFiles()

  let surfacesToEvaluate: Surface[]
  if (args.mode === 'surface') {
    const found = SURFACE_MAP.find(s => s.id === args.surface)
    if (!found) {
      printError(`Unknown surface: ${args.surface}. Use --list.`)
      process.exit(2)
    }
    surfacesToEvaluate = [found]
  } else {
    surfacesToEvaluate = SURFACE_MAP
  }

  const detected: Array<{ surface: Surface; files: string[] }> = []
  for (const surface of surfacesToEvaluate) {
    const matched = args.mode === 'surface'
      ? files.length === 0
        ? getAllTrackedFiles().filter(f => matchesAnyGlob(f, surface.globs))
        : files.filter(f => matchesAnyGlob(f, surface.globs))
      : files.filter(f => matchesAnyGlob(f, surface.globs))

    if (args.mode === 'surface' || matched.length > 0) {
      detected.push({ surface, files: matched })
    }
  }

  if (detected.length === 0) {
    if (args.json) {
      const result: RouterResult = {
        mode: args.mode,
        scope: { surfaceFilter: args.surface ?? undefined, fileCount: files.length },
        surfaces: [],
        exitCode: 0,
        durationMs: Date.now() - start,
      }
      console.log(JSON.stringify(result, null, 2))
    } else {
      printPass(`quality-router: no surfaces detected (${files.length} file(s) scoped)`)
    }
    process.exit(0)
  }

  const surfaceResults: SurfaceResult[] = []
  for (const { surface, files: matched } of detected) {
    const result = await runSurface(surface, matched, args.json)
    surfaceResults.push(result)
  }

  const requiredFailed = surfaceResults.some(r => r.required && r.status === 'fail')
  const exitCode: 0 | 1 = requiredFailed ? 1 : 0

  if (args.json) {
    const result: RouterResult = {
      mode: args.mode,
      scope: { surfaceFilter: args.surface ?? undefined, fileCount: files.length },
      surfaces: surfaceResults,
      exitCode,
      durationMs: Date.now() - start,
    }
    console.log(JSON.stringify(result, null, 2))
  } else {
    const passed = surfaceResults.filter(r => r.status === 'pass').length
    const skipped = surfaceResults.filter(r => r.status === 'skip').length
    const failed = surfaceResults.filter(r => r.status === 'fail').length
    if (exitCode === 0) {
      printPass(`quality-router: ${passed} pass, ${skipped} skip, ${failed} fail (${Date.now() - start}ms)`)
    } else {
      printFail(`quality-router: ${passed} pass, ${skipped} skip, ${failed} fail (${Date.now() - start}ms)`)
    }
  }

  process.exit(exitCode)
}

main().catch(err => {
  printError(`Unhandled error: ${err instanceof Error ? err.message : String(err)}`)
  process.exit(1)
})
