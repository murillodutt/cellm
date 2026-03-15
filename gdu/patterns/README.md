# Block Patterns

Distributable structural specifications for UI blocks. Each pattern captures the architectural essence of a premium component without including licensed implementation code.

## Purpose

Block patterns enable the GDU agent to generate high-quality components from structural specifications instead of building from scratch. The pattern provides props interfaces, semantic layout trees, token mappings, and avoid-rules — enough for any frontend agent to produce a complete implementation in their target framework.

## YAML Schema

Each `.pattern.yaml` file contains:

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique pattern identifier |
| `name` | string | Human-readable name |
| `version` | string | Pattern version (SemVer) |
| `catalogRef` | string | Reference to source catalog entry |
| `category` | string | Category: monitoring, kpi, visualization, data, navigation, form, ai, auth |
| `tags` | string[] | Searchable tags |
| `archetype` | string | Pattern type: chart-heavy, layout-heavy, form-heavy |
| `description` | string | What the block does |
| `requires` | object | Components, charts, composables needed |
| `props.interface` | string | TypeScript interface for component props |
| `emits.interface` | string | TypeScript interface for component events |
| `layout.structure` | string | Conceptual/semantic layout tree (NOT Vue markup) |
| `layout.responsive` | object | Breakpoint behavior descriptions |
| `slots` | object | Named slots with descriptions |
| `tokens` | object | Semantic token mappings (DSE-compatible) |
| `chartConfig` | object | Chart-specific configuration (if applicable) |
| `atomicHint` | object | Atomic Design decomposition hint |
| `examples` | array | Usage context examples |
| `composesWith` | string[] | Related DSE compositions/patterns |
| `derivation` | object | Legal provenance: source, method, what-was-kept/removed |
| `avoid` | string[] | Anti-patterns and hard constraints |

## Derivation Model

Each pattern includes a `derivation` block that documents:
- **source**: Original block reference
- **method**: Always `structural-abstraction`
- **what-was-kept**: Conceptual elements retained (layout concepts, interaction patterns, props shape)
- **what-was-removed**: Implementation details stripped (markup, CSS, hardcoded data, DOM structure)
- **transformative-value**: Why the pattern is a new creative work, not a copy

## Directory Structure

```
patterns/blocks/
  INDEX.yaml          # Manifest for agent discovery
  README.md           # This file
  monitoring/         # System monitoring blocks
  kpi/                # KPI and metric cards
  visualization/      # Charts and graphs
  data/               # Data display blocks
  navigation/         # Navbars, steppers
  form/               # Forms, inputs, wizards
  ai/                 # AI/chat interfaces
  auth/               # Authentication forms
```

## How GDU Uses Patterns

1. **Step 0** (SKILL.md): `knowledge_search` finds catalog atom pointing to block
2. **Pattern lookup**: Check `INDEX.yaml` for matching pattern file
3. **Architect**: Load pattern, use `props.interface` as data contract, `layout.structure` as skeleton
4. **DSE cascade**: Apply project tokens over pattern `tokens` defaults
5. **Implementation**: Generate Vue SFC respecting `avoid` constraints
6. **Attribution**: Reference pattern ID in output spec

## Creating New Patterns

1. Read the source block (licensed, private)
2. Extract conceptual structure — layout tree, props shape, interaction patterns
3. Strip all implementation details — no markup, no CSS, no hardcoded values
4. Map colors to semantic tokens (never raw hex/RGB)
5. Write derivation block proving transformative abstraction
6. Add entry to `INDEX.yaml`
7. Validate with `yaml.safe_load`
