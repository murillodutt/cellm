# DSE Ingest Examples

## Conversation → Decision Extraction

### Color Decision
**User says:** "Our brand uses indigo as the main color, green for success states"
**Extracted:**
- Token `primary`: `decisions: ["Use indigo (alias) — matches Figma brand kit"]`
- Token `success`: `decisions: ["Use green (alias) — consistent across all status indicators"]`

### Component Decision
**User says:** "All our badges should use the soft variant, never outline"
**Extracted:**
- Component `badge`: `decisions: ["Always soft variant, never outline or solid"]`

### Pattern Decision
**User says:** "We never use modals for forms, always inline or slide-over panels"
**Extracted:**
- Pattern `form-layout`: `decisions: ["No modal forms — use inline or slide-over panels"]`

### Composition Decision
**User says:** "The dashboard has a sidebar nav, main content area with KPI cards on top"
**Extracted:**
- Composition `dashboard-layout`: `decisions: ["Sidebar nav + main area, KPI cards row at top"]`
  `screens: ["dashboard", "analytics"]`

## Patch Format

```json
{
  "project": "my-project",
  "patch": {
    "components": {
      "badge": {
        "decisions": ["Always soft variant, never outline or solid"]
      }
    }
  }
}
```
