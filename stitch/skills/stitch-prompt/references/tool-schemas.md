# Stitch Tool Schemas

Reference for all `mcp__stitch__*` tools — parameters, required fields, and usage examples.

## Project Management

### `mcp__stitch__list_projects`

No parameters required.

```json
{}
```

### `mcp__stitch__get_project`

Requires the full resource `name` path.

```json
{
  "name": "projects/12345678"
}
```

### `mcp__stitch__create_project`

Optional `title`. Omitting title generates a default name.

```json
{
  "title": "My New Project"
}
```

---

## Screen Management

### `mcp__stitch__list_screens`

Requires `projectId` as a numeric string — do NOT include the "projects/" prefix.

```json
{
  "projectId": "12345678"
}
```

### `mcp__stitch__get_screen`

Requires all three fields. `name` must be the full resource path; `projectId` and `screenId` are numeric only.

```json
{
  "name": "projects/12345678/screens/98765432",
  "projectId": "12345678",
  "screenId": "98765432"
}
```

Returns `htmlCode.downloadUrl` and `screenshot.downloadUrl` for asset download.

---

## Design Generation

### `mcp__stitch__generate_screen_from_text`

Requires `projectId` and `prompt`. Optional `deviceType` and `modelId`.

```json
{
  "projectId": "12345678",
  "prompt": "A minimal dashboard with a sidebar, KPI cards at the top, and a line chart below.",
  "deviceType": "DESKTOP",
  "modelId": "GEMINI_3_1_PRO"
}
```

`deviceType` values: `MOBILE` | `DESKTOP` | `TABLET` | `AGNOSTIC`

`modelId` values: `GEMINI_3_FLASH` | `GEMINI_3_1_PRO`

### `mcp__stitch__edit_screens`

Requires `projectId`, `selectedScreenIds` (array), and `prompt`. Optional `deviceType` and `modelId`.

```json
{
  "projectId": "12345678",
  "selectedScreenIds": ["98765432"],
  "prompt": "Change the navigation to a dark background with white text. Keep all other elements.",
  "deviceType": "DESKTOP",
  "modelId": "GEMINI_3_FLASH"
}
```

### `mcp__stitch__generate_variants`

Requires `projectId`, `selectedScreenIds` (array), `prompt`, and `variantOptions`.

```json
{
  "projectId": "12345678",
  "selectedScreenIds": ["98765432"],
  "prompt": "Generate 3 color scheme variants: light, dark, and high-contrast.",
  "variantOptions": {
    "count": 3
  }
}
```

---

## Design Systems

### `mcp__stitch__list_design_systems`

Optional `projectId`. Without it, lists all design systems.

```json
{
  "projectId": "12345678"
}
```

### `mcp__stitch__create_design_system`

Requires `designSystem` with a full theme object.

```json
{
  "designSystem": {
    "theme": {
      "colorMode": "LIGHT",
      "headlineFont": "Montserrat",
      "bodyFont": "Inter",
      "roundness": "ROUNDED",
      "customColor": "#1a365d"
    }
  }
}
```

`colorMode` values: `LIGHT` | `DARK`

`roundness` values: `SHARP` | `ROUNDED` | `PILL`

### `mcp__stitch__update_design_system`

Requires `name` (full path), `projectId` (numeric), and updated `designSystem`.

```json
{
  "name": "projects/12345678/designSystems/11223344",
  "projectId": "12345678",
  "designSystem": {
    "theme": {
      "colorMode": "DARK",
      "headlineFont": "Playfair Display",
      "bodyFont": "Inter",
      "roundness": "SHARP",
      "customColor": "#0f172a"
    }
  }
}
```

### `mcp__stitch__apply_design_system`

Requires `projectId`, `selectedScreenInstances` (array), and `assetId`.

```json
{
  "projectId": "12345678",
  "selectedScreenInstances": ["98765432", "98765433"],
  "assetId": "11223344"
}
```

---

## Tips

### projectId format

Always use the numeric ID only — never include the "projects/" prefix.

```
[+] Correct:  "projectId": "12345678"
[-] Wrong:    "projectId": "projects/12345678"
```

### get_screen name format

The `name` field in `get_screen` requires the FULL resource path.

```
[+] Correct:  "name": "projects/12345678/screens/98765432"
[-] Wrong:    "name": "98765432"
```

### Screenshot resolution

The `screenshot.downloadUrl` from `get_screen` returns a low-res thumbnail by default (Google CDN). Append `=w{width}` to get full resolution.

```
https://lh3.googleusercontent.com/example=w1920
```

### Generation timing

Screen generation takes 1-2 minutes. Do NOT retry or call the tool again while waiting — duplicate calls create duplicate screens.

### Downloading assets

`get_screen` returns two download URLs:

| Field | Content |
|-------|---------|
| `htmlCode.downloadUrl` | HTML/CSS source code |
| `screenshot.downloadUrl` | PNG screenshot (append `=w{width}` for full-res) |
