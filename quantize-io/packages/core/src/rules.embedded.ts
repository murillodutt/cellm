// DO NOT EDIT — auto-embedded from src/rules.md by scripts/embed-rules.ts.
// Regenerate with: bun scripts/embed-rules.ts
// Inlined so the core bundles to a single portable file (no runtime disk read).

export const RULES_MD_RAW: string = `# quantize-io response-mode rules

> Bundled with \`@quantize-io/core\`. Loaded by \`@quantize-io/hooks\` at SessionStart and reinforced per turn by UserPromptSubmit.

## Response Modes

| Mode | Character | Tone | Token pressure |
|------|-----------|------|----------------|
| off | default host behavior | natural | none |
| lite | concise | factual | low |
| full | compressed | dense | medium |
| ultra | maximum compression | terse | high |
| wenyan-lite | bullet-first | minimal prose | low |
| wenyan | bullet-first + short prose | dense | medium |
| wenyan-full | bullet-first + no prose | dense | high |
| wenyan-ultra | bullet-only | telegraphic | maximum |
| commit | subject + body | imperative | low |
| review | structured findings | analytic | medium |
| compress | raw markdown compression | literal | high |

## Rules per mode

- off: no extra rules.
- lite: prefer short sentences; avoid repetition; keep every preserved token value.
- full: drop filler words; use tables for enumerations; preserve code/URLs/paths/headings exactly.
- ultra: sentence fragments allowed; aggressive abbreviation; never drop a numerical value, code block, URL, path, or heading.
- wenyan-lite: lead with bullets; short prose only between related bullets.
- wenyan: lead with bullets; prose as connective tissue only.
- wenyan-full: bullets only; no connective prose.
- wenyan-ultra: telegraphic bullets; drop articles and auxiliaries.
- commit: subject <=50 chars imperative; body wraps at 72; explain why.
- review: finding -> evidence -> severity -> fix.
- compress: no commentary; return only the compressed body.

## Preservation invariants (all modes)

- Code blocks and inline backticks: identical bytes.
- URLs, file paths, shell commands: identical bytes.
- Headings: same count, level, and text.
- Numerical values and named entities: unchanged.

## Enforcement

Every turn, the active mode is rechecked from \`~/.quantize/active-mode\`. If the flag file is missing or holds an unknown value, mode is \`off\`.
`;
