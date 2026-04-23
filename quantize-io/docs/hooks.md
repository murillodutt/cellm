# Hooks

`@quantize-io/hooks` exposes three subcommands invoked by host plugin manifests.

| Subcommand | Host event | Role |
|------------|-----------|------|
| `activate` | `SessionStart` | Writes flag file, emits filtered rules. |
| `track` | `UserPromptSubmit` | Detects slash + NL triggers + deactivation. Emits `additionalContext` when a standard mode is active. |
| `statusline` | `statusLine` | Renders `[QT]` or `[QT:UPPER]` with ANSI 38;5;172. Empty when no flag or invalid. |

## Flag file

`~/.quantize/active-mode` holds one of the modes below. The file is written with
`O_NOFOLLOW + O_EXCL + 0600` via temp+rename and read with size cap 64 B + whitelist.

| Mode | Tone |
|------|------|
| `off` | disabled |
| `lite` / `full` / `ultra` | intensity levels |
| `wenyan-lite` / `wenyan` / `wenyan-full` / `wenyan-ultra` | bullet-first variants |
| `commit` / `review` / `compress` | task-specific personas |

## Slash commands

- `/qt` — apply `QT_DEFAULT_MODE` (defaults to `full`).
- `/qt <mode>` — set a specific mode.
- `/qt-commit`, `/qt-review`, `/qt-compress` — activate the task-specific personas.
- `/qt off` or phrases like `stop quantize-io`, `normal mode` — deactivate.
