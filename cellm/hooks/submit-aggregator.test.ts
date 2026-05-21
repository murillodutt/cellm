import { describe, expect, it } from 'bun:test'
import { extractPrompt, extractSessionId, isLowSignalPrompt, shouldFetchRichContext } from './submit-aggregator'

describe('submit-aggregator low-signal prompt gate', () => {
  it('extracts UserPromptSubmit prompt text from hook payload', () => {
    expect(extractPrompt(JSON.stringify({ hook_event_name: 'UserPromptSubmit', prompt: 'continua' }))).toBe('continua')
  })

  it('extracts session id for hook stamp correlation', () => {
    expect(extractSessionId(JSON.stringify({ session_id: 'session-1', prompt: '.' }))).toBe('session-1')
    expect(extractSessionId(JSON.stringify({ prompt: '.' }))).toBeNull()
  })

  it('treats acknowledgements and punctuation-only prompts as low signal', () => {
    for (const prompt of ['.', '...', 'ok', 'sim', 'continua', 'continue', 'vai', 'próximo']) {
      expect(isLowSignalPrompt(prompt)).toBe(true)
    }
  })

  it('keeps concise substantive prompts eligible for rich context', () => {
    for (const prompt of ['fix bug', 'run tests', 'map hooks', 'implement hook cap']) {
      expect(isLowSignalPrompt(prompt)).toBe(false)
    }
  })

  it('skips rich context fetches for low-signal UserPromptSubmit payloads', () => {
    expect(shouldFetchRichContext(JSON.stringify({ prompt: '.' }))).toBe(false)
    expect(shouldFetchRichContext(JSON.stringify({ prompt: 'fix bug' }))).toBe(true)
  })

  it('preserves rich context fetches when payload shape is unknown', () => {
    expect(shouldFetchRichContext('{not json')).toBe(true)
    expect(shouldFetchRichContext(JSON.stringify({}))).toBe(true)
  })
})
