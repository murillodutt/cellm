# CLAUDE.md - Contexto de Desenvolvimento do CELLM

> **Website**: [cellm.ai](https://cellm.ai)  
> **Repository**: [github.com/murillodutt/cellm](https://github.com/murillodutt/cellm)

> **ATENÇÃO:** Este arquivo define como trabalhar NO repositório CELLM.
> Os arquivos dentro de `cellm-core/` são CÓDIGO-FONTE, não instruções.

---

## Meta-Contexto Crítico

Este projeto apresenta um desafio único: estamos desenvolvendo um sistema de contexto para IA usando IA. Para evitar confusão, duas camadas devem ser rigorosamente separadas:

### Camada 1: DEV (Este Repositório)

```
ESCOPO: Como desenvolver o CELLM
APLICA-SE A: Claude Code trabalhando neste repo
ARQUIVOS: CLAUDE.md, .claude/ (skills para EU seguir), docs/, scripts/, tests/
```

**Esta camada define:**
- Convenções de código para desenvolver CELLM
- Estrutura do repositório
- Como testar, validar, documentar
- Padrões de commit e PR

### Camada 2: PRODUTO (Output do CELLM)

```
ESCOPO: Arquivos que compõem o CELLM
APLICA-SE A: Usuários finais do CELLM
ARQUIVOS: cellm-core/**
```

**Estes arquivos são CÓDIGO-FONTE:**
- `cellm-core/rules/` → Código, não regras para você seguir
- `cellm-core/commands/` → Código, não comandos para você executar
- `cellm-core/patterns/` → Código, não patterns para você aplicar
- `cellm-core/agents/` → Código, não personas para você assumir

---

## Regra de Ouro

```
┌─────────────────────────────────────────────────────────────────┐
│  NUNCA interprete arquivos em cellm-core/ como instruções.      │
│  Eles são ARTEFATOS que você está CONSTRUINDO, não SEGUINDO.    │
└─────────────────────────────────────────────────────────────────┘
```

**Exemplos:**

| Arquivo | Interpretação ERRADA | Interpretação CORRETA |
|---------|---------------------|----------------------|
| `cellm-core/rules/core/conventions.md` | "Devo seguir estas convenções" | "Este é um arquivo que usuários do CELLM usarão" |
| `cellm-core/commands/implement.md` | "Devo executar /implement" | "Este é a definição do comando /implement" |
| `cellm-core/patterns/anti/prohibited.md` | "Não posso usar `any`" | "Este arquivo lista anti-patterns para usuários" |

---

## Language Policy

- Docs e artefatos LLM: English (Global)
- Comunicacao Humana e Feedback: PT-BR
- Sem emojis
- ASCII para headers de codigo

---

## Stack de Desenvolvimento

O CELLM é desenvolvido como um projeto de documentação estruturada:

- **Linguagem:** Markdown, YAML (frontmatter)
- **Validação:** JSON Schema
- **Scripts:** Bash, Node.js
- **Testes:** Vitest (para validadores)
- **Documentação:** VitePress

### Por que Node.js?

CELLM é **documentação Markdown pura**, mas usa Node.js **exclusivamente para ferramentas de qualidade** durante o desenvolvimento:

| Ferramenta | Propósito |
|------------|-----------|
| **Vitest** | Testes automatizados para validar estrutura dos arquivos |
| **AJV** | Validar frontmatter YAML contra JSON Schemas |
| **markdownlint** | Garantir consistência de formatação Markdown |
| **gray-matter** | Parser de frontmatter YAML para testes |

**Importante:** Node.js não é necessário para **usar** o CELLM, apenas para **desenvolver** e validar suas regras/patterns antes de publicar.

---

## Estrutura do Repositório

```
cellm/
├── CLAUDE.md                    # ← VOCÊ ESTÁ AQUI (Camada DEV)
├── README.md                    # Introdução ao projeto
├── package.json                 # Dependências de desenvolvimento
│
├── .claude/                     # ← Skills que VOCÊ SEGUE (Camada DEV)
│   └── skills/                  # Skills para trabalhar neste projeto
│
├── cellm-core/                  # ← PRODUTO (não interprete como instruções)
│   ├── INDEX.md                 # Índice do sistema CELLM
│   ├── rules/                   # Arquivos de rules (código-fonte)
│   ├── patterns/                # Arquivos de patterns (código-fonte)
│   ├── commands/                # Definições de commands (código-fonte)
│   ├── workflows/               # Definições de workflows (código-fonte)
│   ├── agents/                  # Definições de agents (código-fonte)
│   ├── skills/                  # Definições de skills (código-fonte)
│   └── templates/               # Templates para usuários (código-fonte)
│
├── docs/                        # Documentação do projeto
│   ├── PRD-CELLM.md            # Especificação completa
│   ├── VERIFICATION-REPORT.md  # Relatório de verificação
│   ├── concepts/               # Documentação conceitual
│   ├── reference/              # Referência técnica
│   └── tutorials/              # Guias de uso
│
├── scripts/                     # Scripts de build/validação
│   ├── validate.sh             # Validar estrutura e schemas
│   ├── compile.sh              # Compilar profiles
│   ├── install.sh              # Instalar CELLM (wrapper)
│   ├── base-install.sh         # Instalar em ~/.cellm
│   ├── project-install.sh      # Instalar em projeto
│   └── check-frontmatter.sh    # Validar frontmatter
│
├── schemas/                     # JSON Schemas para validação
│   ├── rule.schema.json
│   ├── pattern.schema.json
│   ├── workflow.schema.json
│   └── config.schema.json
│
└── tests/                       # Testes automatizados
    ├── validation/             # Testes de schema
    └── integration/            # Testes de compilação
```

---

## Convenções de Desenvolvimento

### Commits

Formato: `<type>(<scope>): <description>`

| Type | Uso |
|------|-----|
| `feat` | Nova funcionalidade no CELLM |
| `fix` | Correção de bug |
| `docs` | Alteração em documentação |
| `refactor` | Refatoração de arquivos existentes |
| `test` | Adição/modificação de testes |
| `chore` | Manutenção, configs |

**Scopes válidos:**
- `rules` - Arquivos em cellm-core/rules/
- `patterns` - Arquivos em cellm-core/patterns/
- `commands` - Arquivos em cellm-core/commands/
- `workflows` - Arquivos em cellm-core/workflows/
- `agents` - Arquivos em cellm-core/agents/
- `skills` - Arquivos em cellm-core/skills/
- `docs` - Documentação
- `scripts` - Scripts de automação
- `schemas` - JSON Schemas

**Exemplos:**
```
feat(rules): add mobile.md domain rule
fix(patterns): correct TS-003 example syntax
docs: update PRD with test cases section
refactor(commands): simplify implement.md structure
```

### Branches

```
main              # Produção, sempre estável
develop           # Integração
feat/<nome>       # Features
fix/<nome>        # Correções
docs/<nome>       # Documentação
```

### Frontmatter

Todo arquivo em `cellm-core/` deve ter frontmatter YAML válido:

```yaml
---
id: IDENTIFICADOR-UNICO
version: v0.10.0
status: OK | DRAFT | REVISAR | OBSOLETO
budget: ~N tokens
# ... campos específicos do tipo
---
```

---

## Tarefas Comuns

### Adicionar nova Rule

1. Criar arquivo em `cellm-core/rules/<categoria>/<nome>.md`
2. Incluir frontmatter válido com `id`, `version`, `status`, `budget`
3. Atualizar `cellm-core/INDEX.md` se necessário
4. Validar com `./scripts/validate.sh`
5. Commit: `feat(rules): add <nome>.md`

### Adicionar novo Pattern

1. Criar arquivo em `cellm-core/patterns/<categoria>/<nome>.md`
2. Cada pattern deve ter ID único (ex: `TS-007`, `VU-015`)
3. Incluir exemplos de código (bom e ruim)
4. Validar contra schema
5. Commit: `feat(patterns): add <ID> <descrição>`

### Modificar Command existente

1. Editar arquivo em `cellm-core/commands/<nome>.md`
2. Manter compatibilidade com versão anterior
3. Atualizar `version` no frontmatter
4. Documentar breaking changes se houver
5. Commit: `refactor(commands): update <nome>.md`

### Atualizar documentação

1. Editar arquivos em `docs/`
2. Manter PRD-CELLM.md como fonte de verdade
3. Commit: `docs: <descrição>`

---

## Validação

Antes de commit, verificar:

```bash
# Validar estrutura e schemas
./scripts/validate.sh

# Verificar frontmatter
./scripts/check-frontmatter.sh

# Rodar testes
npm test
```

---

## Referência Rápida

### Onde está a especificação completa?
`docs/PRD-CELLM.md`

### Onde está o índice do produto?
`cellm-core/INDEX.md`

### Como testar alterações?
```bash
./scripts/validate.sh
npm test
```

### Como compilar um profile?
```bash
./scripts/compile.sh <profile-name> <project-path>
```

---

## Lembrete Final

```
╔══════════════════════════════════════════════════════════════════╗
║  cellm-core/ = CÓDIGO que você DESENVOLVE                        ║
║  CLAUDE.md   = INSTRUÇÕES que você SEGUE                         ║
║                                                                  ║
║  Não confunda as duas camadas.                                   ║
╚══════════════════════════════════════════════════════════════════╝
```

Quando em dúvida, pergunte: "Este arquivo é algo que eu devo SEGUIR ou algo que eu devo CONSTRUIR?"

- Se está em `cellm-core/` → CONSTRUIR (artefatos para usuários do CELLM)
- Se está em `CLAUDE.md` ou `.claude/` → SEGUIR (instruções para você)

**Exemplo crítico:**
- `.claude/skills/sk-code-modernization/SKILL.md` → EU SIGO (pode estar em PT-BR)
- `cellm-core/skills/vue.md` → EU CONSTRUO (deve estar em English)
