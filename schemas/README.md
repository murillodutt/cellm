# CELLM JSON Schemas

Este diretório contém os JSON Schemas para validação dos artefatos CELLM.

## Schemas Disponíveis

| Schema | Propósito | Path Validado |
|--------|-----------|---------------|
| `base.schema.json` | Definições comuns reutilizáveis | N/A (referência) |
| `rule.schema.json` | Validação de rules | `cellm-core/rules/**/*.md` |
| `pattern.schema.json` | Validação de patterns | `cellm-core/patterns/**/*.md` |
| `workflow.schema.json` | Validação de workflows | `cellm-core/workflows/*.md` |
| `command.schema.json` | Validação de commands | `cellm-core/commands/*.md` |
| `agent.schema.json` | Validação de agents | `cellm-core/agents/*.md` |
| `skill.schema.json` | Validação de skills | `cellm-core/skills/*.md` |
| `config.schema.json` | Validação de config.yaml | `.claude/config.yaml` |

## Estrutura dos Frontmatters

### Rules

```yaml
---
id: CONV-001              # Obrigatório: padrão CÓDIGO-NNN
alwaysApply: true         # Para rules core (sempre carregadas)
paths: ["app/**"]         # Para rules domain (ativadas por path)
version: v0.10.0           # Opcional
status: OK                # Opcional: OK, DRAFT, REVISAR, OBSOLETO
budget: ~150 tokens       # Opcional
tags: [tag1, tag2]        # Opcional
---
```

### Patterns

```yaml
---
id: TS-INDEX              # Obrigatório: padrão CÓDIGO-INDEX ou CÓDIGO-NNN
alwaysApply: true         # Para patterns sempre carregados
severity: critical        # Opcional: critical, warning, info
tags: [typescript, types] # Opcional
paths: ["**/*.ts"]        # Opcional: ativação por path
---
```

### Workflows

```yaml
---
workflow: implement       # Obrigatório: kebab-case
phase: implementation     # Obrigatório: planning, specification, implementation, verification
agent: implementer        # Obrigatório: architect, implementer, reviewer, project-manager
version: v0.10.0           # Opcional
---
```

### Commands

```yaml
---
command: implement        # Obrigatório: kebab-case
agent: implementer        # Obrigatório: architect, implementer, reviewer, project-manager
workflow: implement       # Opcional: workflow associado
version: v0.10.0           # Opcional
---
```

### Agents

```yaml
---
agent: architect          # Obrigatório: architect, implementer, reviewer, project-manager
triggers: [/plan-product, /shape-spec]  # Obrigatório: commands que ativam
model: default            # Opcional: default, opus, sonnet, haiku
version: v0.10.0           # Opcional
---
```

### Skills

```yaml
---
skill: vue                # Obrigatório: kebab-case
triggers: ["app/**/*.vue"]  # Obrigatório: paths que ativam
technology: Vue 3         # Opcional
dependencies: [nuxt]      # Opcional: outras skills
relatedPatterns: [VU-*]   # Opcional
---
```

### Config

```yaml
cellm: v0.10.0             # Obrigatório: versão do CELLM
profile: default          # Obrigatório: profile ativo
project:                  # Opcional
  name: My Project
  description: ...
loading:                  # Opcional
  maxTokens: 2000
  warnThreshold: 1500
```

## Validação

### Via Script

```bash
./scripts/validate.sh
```

### Via Node.js (com ajv)

```bash
npm install ajv ajv-formats
```

```javascript
const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

const schema = require('./schemas/rule.schema.json');
const validate = ajv.compile(schema);

const frontmatter = { id: 'CONV-001', alwaysApply: true };
const valid = validate(frontmatter);

if (!valid) {
  console.log(validate.errors);
}
```

## Padrões de ID

| Tipo | Padrão | Exemplos |
|------|--------|----------|
| Rule Core | `CÓDIGO-NNN` | `CONV-001`, `LIM-001`, `PROTO-001` |
| Rule Domain | `DOM-XX-NNN` | `DOM-FE-001`, `DOM-BE-001` |
| Pattern Index | `CÓDIGO-INDEX` | `TS-INDEX`, `PATTERNS-INDEX` |
| Pattern Item | `CÓDIGO-NNN` | `TS-001`, `VU-002`, `ANTI-003` |

## Arquivos Homônimos

Alguns arquivos têm o mesmo nome em diretórios diferentes. Isso é **intencional** - cada diretório representa um tipo diferente de artefato com propósito distinto.

| Arquivo | Diretório | Propósito |
|---------|-----------|-----------|
| `implement.md` | `commands/` | Interface do comando `/implement` |
| `implement.md` | `workflows/` | Fluxo de execução do workflow |
| `vue.md` | `patterns/core/` | Patterns rápidos (VU-001, VU-002...) |
| `vue.md` | `skills/` | Guia detalhado da tecnologia |
| `spec.md` | `commands/` | Comando `/spec` |
| `spec.md` | `templates/` | Template para especificações |

**Por que não é duplicação?**

- **Commands** definem a interface do usuário (como invocar, parâmetros)
- **Workflows** definem o processo interno (etapas, validações)
- **Patterns** são referência rápida (anti-patterns, boas práticas)
- **Skills** são guias detalhados por tecnologia

O schema de cada tipo valida campos diferentes, garantindo que cada arquivo serve seu propósito específico.

## Extensão

Para adicionar novos campos:

1. Edite o schema apropriado em `schemas/`
2. Adicione a propriedade em `properties`
3. Se obrigatório, adicione em `required`
4. Adicione exemplo em `examples`
5. Atualize `scripts/validate.sh` se necessário
