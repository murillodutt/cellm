import { describe, expect, it } from 'bun:test'
import { enrichWithHookPrompt } from './freeze-sentinel'

type Detection = Parameters<typeof enrichWithHookPrompt>[0]

const baseDetection: Detection = {
  kind: 'stop_without_end_turn',
  sessionId: 'session-1',
  transcriptPath: '/tmp/session.jsonl',
  previousAssistantAt: '2026-05-21T20:00:19.597Z',
  previousAssistantStopReason: 'tool_use',
  previousToolName: 'Edit',
  lastToolResultAt: '2026-05-21T20:00:19.901Z',
  stopHookSummaryAt: '2026-05-21T20:00:23.005Z',
  turnDurationAt: '2026-05-21T20:00:23.007Z',
  turnDurationMs: 46242,
  humanMarkerAt: null,
  humanMarkerText: null,
  nextAssistantAt: null,
  silenceMs: null,
  assistantAfterMarkerMs: null,
}

describe('freeze-sentinel live UserPromptSubmit marker', () => {
  it('uses the hook prompt as a live dot marker when transcript has not caught up', () => {
    const detection = enrichWithHookPrompt(baseDetection, '.', '2026-05-21T20:00:40.999Z')

    expect(detection.kind).toBe('post_stop_nudge')
    expect(detection.humanMarkerAt).toBe('2026-05-21T20:00:40.999Z')
    expect(detection.humanMarkerText).toBe('.')
    expect(detection.hookPromptSeen).toBe(true)
    expect(detection.hookPromptBytes).toBe(1)
    expect(detection.hookPromptMarker).toBe('.')
    expect(detection.silenceMs).toBe(17992)
  })

  it('does not store non-dot prompt text from hook input', () => {
    const detection = enrichWithHookPrompt(baseDetection, 'continue with secret context', '2026-05-21T20:00:40.999Z')

    expect(detection.kind).toBe('stop_without_end_turn')
    expect(detection.humanMarkerText).toBeNull()
    expect(detection.hookPromptSeen).toBe(true)
    expect(detection.hookPromptBytes).toBe(28)
    expect(detection.hookPromptMarker).toBeNull()
  })
})
