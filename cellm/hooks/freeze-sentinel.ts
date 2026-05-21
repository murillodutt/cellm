#!/usr/bin/env bun
// CELLM - Freeze sentinel for Claude Code silent-stall signatures.
//
// Runs read-only on Stop and UserPromptSubmit. It never blocks the CLI and
// writes compact incident records to ~/.cellm/freeze-sentinel.jsonl.

import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, appendFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'

const STDIN_LIMIT = 256 * 1024
const STDIN_DEADLINE_MS = 1200
const HOOK_BUDGET_MS = 1800
const SUSPECT_GAP_MS = Number(process.env.CELLM_FREEZE_SENTINEL_GAP_MS ?? 60000)
const FAST_RESUME_MS = 10000
const LOG_PATH = process.env.CELLM_FREEZE_SENTINEL_LOG
  ?? join(homedir(), '.cellm', 'freeze-sentinel.jsonl')

interface HookInput {
  hook_event_name?: string
  session_id?: string
  transcript_path?: string
  cwd?: string
  stop_hook_active?: unknown
  prompt?: string
}

interface Event {
  type?: string
  timestamp?: string
  subtype?: string
  durationMs?: number
  messageCount?: number
  message?: {
    role?: string
    stop_reason?: string | null
    content?: unknown
  }
}

interface Detection {
  kind: 'stop_without_end_turn' | 'post_stop_nudge'
  sessionId: string
  transcriptPath: string
  previousAssistantAt: string | null
  previousAssistantStopReason: string | null
  previousToolName: string | null
  lastToolResultAt: string | null
  stopHookSummaryAt: string | null
  turnDurationAt: string | null
  turnDurationMs: number | null
  humanMarkerAt: string | null
  humanMarkerText: string | null
  nextAssistantAt: string | null
  silenceMs: number | null
  assistantAfterMarkerMs: number | null
}

async function readStdin(): Promise<string> {
  if (process.stdin.isTTY) return ''
  const text = await Promise.race([
    Bun.stdin.text(),
    new Promise<string>((resolve) => setTimeout(() => resolve(''), STDIN_DEADLINE_MS)),
  ])
  return Buffer.byteLength(text, 'utf8') > STDIN_LIMIT
    ? Buffer.from(text, 'utf8').subarray(0, STDIN_LIMIT).toString('utf8')
    : text
}

function parseHookInput(raw: string): HookInput {
  try {
    const parsed = JSON.parse(raw) as HookInput
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function resolveHookEvent(input: HookInput): string {
  if (input.hook_event_name) return input.hook_event_name
  if ('stop_hook_active' in input) return 'Stop'
  return 'UserPromptSubmit'
}

function resolveTranscriptPath(input: HookInput): string | null {
  if (input.transcript_path && existsSync(input.transcript_path)) return input.transcript_path

  const sessionId = input.session_id
  if (!sessionId) return null

  const cwd = input.cwd ?? process.env.CLAUDE_PROJECT_DIR ?? process.cwd()
  for (const candidate of candidateProjectDirs(cwd)) {
    const slug = candidate.replace(/\//g, '-')
    const transcript = join(homedir(), '.claude', 'projects', slug, `${sessionId}.jsonl`)
    if (existsSync(transcript)) return transcript
  }

  const projectsRoot = join(homedir(), '.claude', 'projects')
  try {
    for (const entry of readdirSync(projectsRoot)) {
      const transcript = join(projectsRoot, entry, `${sessionId}.jsonl`)
      if (existsSync(transcript)) return transcript
    }
  } catch {
    return null
  }

  return null
}

function candidateProjectDirs(cwd: string): string[] {
  const dirs: string[] = []
  let current = cwd
  for (let i = 0; i < 8; i++) {
    if (!current || current === dirname(current)) break
    dirs.push(current)
    current = dirname(current)
  }
  return dirs
}

function readRecentEvents(path: string): Event[] {
  if (!existsSync(path) || !statSync(path).isFile()) return []
  const text = readFileSync(path, 'utf8')
  const lines = text.split('\n').filter(Boolean).slice(-600)
  const events: Event[] = []
  for (const line of lines) {
    try {
      events.push(JSON.parse(line) as Event)
    } catch {
      // Ignore malformed transcript lines; Claude Code appends atomically in normal operation.
    }
  }
  return events
}

function detect(events: Event[], sessionId: string, transcriptPath: string): Detection | null {
  const latestStopIndex = findLastIndex(events, e => e.type === 'system' && e.subtype === 'stop_hook_summary')
  if (latestStopIndex === -1) return null

  const previousAssistantIndex = findLastIndex(
    events.slice(0, latestStopIndex),
    e => e.type === 'assistant',
  )
  const previousAssistant = previousAssistantIndex === -1 ? null : events[previousAssistantIndex]
  const previousAssistantStopReason = assistantStopReason(previousAssistant)
  if (previousAssistantStopReason === 'end_turn') return null

  const lastToolResult = findLast(
    events.slice(0, latestStopIndex),
    e => isToolResult(e),
  )
  if (!lastToolResult) return null

  const latestStop = events[latestStopIndex]
  const turnDuration = events
    .slice(latestStopIndex + 1)
    .find(e => e.type === 'system' && e.subtype === 'turn_duration')
  const humanMarker = events
    .slice(latestStopIndex + 1)
    .find(e => isHumanText(e))
  const nextAssistant = humanMarker
    ? events.slice(events.indexOf(humanMarker) + 1).find(e => e.type === 'assistant')
    : null

  const silenceMs = diffMs(turnDuration?.timestamp ?? latestStop?.timestamp, humanMarker?.timestamp)
  const assistantAfterMarkerMs = diffMs(humanMarker?.timestamp, nextAssistant?.timestamp)
  const previousTool = firstToolUse(previousAssistant)

  if (humanMarker && silenceMs !== null && silenceMs >= SUSPECT_GAP_MS) {
    return {
      kind: 'post_stop_nudge',
      sessionId,
      transcriptPath,
      previousAssistantAt: previousAssistant?.timestamp ?? null,
      previousAssistantStopReason,
      previousToolName: previousTool?.name ?? null,
      lastToolResultAt: lastToolResult.timestamp ?? null,
      stopHookSummaryAt: latestStop?.timestamp ?? null,
      turnDurationAt: turnDuration?.timestamp ?? null,
      turnDurationMs: typeof turnDuration?.durationMs === 'number' ? turnDuration.durationMs : null,
      humanMarkerAt: humanMarker.timestamp ?? null,
      humanMarkerText: typeof humanMarker.message?.content === 'string' ? humanMarker.message.content : null,
      nextAssistantAt: nextAssistant?.timestamp ?? null,
      silenceMs,
      assistantAfterMarkerMs,
    }
  }

  return {
    kind: 'stop_without_end_turn',
    sessionId,
    transcriptPath,
    previousAssistantAt: previousAssistant?.timestamp ?? null,
    previousAssistantStopReason,
    previousToolName: previousTool?.name ?? null,
    lastToolResultAt: lastToolResult.timestamp ?? null,
    stopHookSummaryAt: latestStop?.timestamp ?? null,
    turnDurationAt: turnDuration?.timestamp ?? null,
    turnDurationMs: typeof turnDuration?.durationMs === 'number' ? turnDuration.durationMs : null,
    humanMarkerAt: null,
    humanMarkerText: null,
    nextAssistantAt: null,
    silenceMs: null,
    assistantAfterMarkerMs: null,
  }
}

function detectLiveStopFallback(events: Event[], sessionId: string, transcriptPath: string): Detection | null {
  const previousAssistant = findLast(events, e => e.type === 'assistant')
  const previousAssistantStopReason = assistantStopReason(previousAssistant)
  if (!previousAssistant || previousAssistantStopReason === 'end_turn') return null

  const lastToolResult = findLast(events, e => isToolResult(e))
  if (!lastToolResult) return null

  const previousTool = firstToolUse(previousAssistant)
  return {
    kind: 'stop_without_end_turn',
    sessionId,
    transcriptPath,
    previousAssistantAt: previousAssistant.timestamp ?? null,
    previousAssistantStopReason,
    previousToolName: previousTool?.name ?? null,
    lastToolResultAt: lastToolResult.timestamp ?? null,
    stopHookSummaryAt: null,
    turnDurationAt: null,
    turnDurationMs: null,
    humanMarkerAt: null,
    humanMarkerText: null,
    nextAssistantAt: null,
    silenceMs: null,
    assistantAfterMarkerMs: null,
  }
}

function writeDetection(detection: Detection, hookEvent: string): void {
  try {
    mkdirSync(dirname(LOG_PATH), { recursive: true })
    appendFileSync(LOG_PATH, JSON.stringify({
      recordedAt: new Date().toISOString(),
      hookEvent,
      ...detection,
    }) + '\n')
  } catch {
    // Fail silent: diagnostics must never become a hook-visible failure.
  }
}

function buildContext(detection: Detection): string | null {
  if (detection.kind !== 'post_stop_nudge') return null
  const fastResume = detection.assistantAfterMarkerMs !== null
    && detection.assistantAfterMarkerMs <= FAST_RESUME_MS
  const resume = detection.assistantAfterMarkerMs === null
    ? 'no assistant resume recorded yet'
    : `assistant resumed in ${(detection.assistantAfterMarkerMs / 1000).toFixed(1)}s`
  const silence = detection.silenceMs === null ? 'unknown silence' : `${(detection.silenceMs / 1000).toFixed(1)}s silence`
  const severity = fastResume ? 'suspected CLI stream stall' : 'suspected turn-closure anomaly'
  return `[FREEZE-SENTINEL] ${severity}: previous ${detection.previousToolName ?? 'tool'} turn fired Stop without assistant end_turn, then ${silence} before this prompt; ${resume}. Preserve evidence, continue only from confirmed tool_result state, and rotate session after closing the block.`
}

function printContext(context: string | null): void {
  if (!context) return
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'UserPromptSubmit',
      additionalContext: context,
    },
  }))
}

function assistantStopReason(event: Event | null | undefined): string | null {
  const reason = event?.message?.stop_reason
  return typeof reason === 'string' && reason.length > 0 ? reason : null
}

function firstToolUse(event: Event | null | undefined): { id: string | null; name: string } | null {
  const content = event?.message?.content
  if (!Array.isArray(content)) return null
  for (const block of content) {
    if (!isRecord(block) || block.type !== 'tool_use') continue
    return {
      id: typeof block.id === 'string' ? block.id : null,
      name: typeof block.name === 'string' ? block.name : 'unknown',
    }
  }
  return null
}

function isToolResult(event: Event): boolean {
  if (event.type !== 'user') return false
  const content = event.message?.content
  return Array.isArray(content) && content.some(block => isRecord(block) && block.type === 'tool_result')
}

function isHumanText(event: Event): boolean {
  return event.type === 'user'
    && typeof event.message?.content === 'string'
    && event.message.content.trim().length > 0
}

function findLastIndex<T>(items: T[], predicate: (item: T) => boolean): number {
  for (let i = items.length - 1; i >= 0; i--) {
    if (predicate(items[i]!)) return i
  }
  return -1
}

function findLast<T>(items: T[], predicate: (item: T) => boolean): T | null {
  const index = findLastIndex(items, predicate)
  return index === -1 ? null : items[index]!
}

function diffMs(start: string | null | undefined, end: string | null | undefined): number | null {
  if (!start || !end) return null
  const startMs = Date.parse(start)
  const endMs = Date.parse(end)
  if (!Number.isFinite(startMs) || !Number.isFinite(endMs)) return null
  return endMs - startMs
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export function runFreezeSentinel(raw: string, forcedHookEvent?: string): string | null {
  const input = parseHookInput(raw)
  const hookEvent = forcedHookEvent ?? resolveHookEvent(input)
  const sessionId = input.session_id
  if (!sessionId) return null

  const transcriptPath = resolveTranscriptPath(input)
  if (!transcriptPath) return null

  const events = readRecentEvents(transcriptPath)
  const detection = detect(events, sessionId, transcriptPath)
    ?? (hookEvent === 'Stop' ? detectLiveStopFallback(events, sessionId, transcriptPath) : null)
  if (!detection) return null

  writeDetection(detection, hookEvent)
  return hookEvent === 'UserPromptSubmit' ? buildContext(detection) : null
}

async function main(): Promise<void> {
  const timer = setTimeout(() => process.exit(0), HOOK_BUDGET_MS)
  try {
    const raw = await readStdin()
    printContext(runFreezeSentinel(raw))
  } finally {
    clearTimeout(timer)
  }
}

if (import.meta.main) {
  await main()
}
