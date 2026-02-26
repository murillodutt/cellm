# JORNAL — Decisoes Arquiteturais do Plugin

Data: 2026-02-25
Escopo: Reestruturacao de cellm-plugin para arquitetura skills-only

---

## Contexto

O repositorio cellm-plugin e um marketplace que abriga multiplos plugins (cellm, docops, e futuros). Cada plugin tem sua propria `plugin.json` e registra capacidades via `skills/` e/ou `commands/`. O objetivo desta sessao foi eliminar a pasta `commands/` e consolidar tudo em skills, criando uma arquitetura uniforme para dezenas de skills por plugin.

---

## Decisao 1: Arquitetura Skills-Only

**Decisao:** Eliminar a pasta `commands/` de todos os plugins. Usar exclusivamente `skills/{name}/SKILL.md` como mecanismo de registro.

**Racional:** Os commands no docops eram wrappers de 3 linhas que delegavam para skills. A duplicacao gerava manutencao dobrada sem beneficio. Skills ja sao invocaveis como `/plugin:name` e suportam auto-load via `paths` no frontmatter.

**Impacto:**
- docops: removido `"commands": "./commands"` do plugin.json, deletada pasta `commands/` (11 arquivos)
- cellm: ja nao tinha pasta commands, confirmada a abordagem

---

## Decisao 2: Skills Faltantes no cellm

**Decisao:** Criar 5 skills que existiam apenas na documentacao mas nao tinham implementacao:

| Skill | Antes | Agora |
|-------|-------|-------|
| `write-spec` | Referenciado como `/write-spec` nos docs | `skills/write-spec/SKILL.md` → `/cellm:write-spec` |
| `create-tasks` | Referenciado como `/create-tasks` | `skills/create-tasks/SKILL.md` → `/cellm:create-tasks` |
| `orchestrate` | Referenciado como `/orchestrate-tasks` | `skills/orchestrate/SKILL.md` → `/cellm:orchestrate` |
| `implement` | Referenciado como `/implement` | `skills/implement/SKILL.md` → `/cellm:implement` |
| `verify` | Referenciado como `/verify` | `skills/verify/SKILL.md` → `/cellm:verify` |

**Racional:** A documentacao descrevia um workflow completo (plan → shape → write-spec → create-tasks → orchestrate → implement → verify) mas apenas plan, shape, e spec existiam como skills. Os demais eram "fantasmas" — documentados mas nao registrados.

**Renomeacao:** `/orchestrate-tasks` virou `/cellm:orchestrate` (mais curto, consistente com o namespace).

---

## Decisao 3: Padronizacao do Frontmatter

**Decisao:** Todo skill de workflow deve ter no minimo: `name`, `description`, `argument-hint`, `allowed-tools`. Skills de contexto (auto-load) devem ter: `name`, `description`, `paths`, `user-invocable: false`.

**Correcoes aplicadas:**

| Skill | Campo adicionado |
|-------|-----------------|
| `plan` | `argument-hint: "[product name]"` |
| `shape` | `argument-hint: "[feature description]"` |
| `discover` | `argument-hint: "[focus area]"` |
| `index` | `argument-hint: "[search query]"` |
| `status` | `argument-hint: "[verbose]"` |
| `dse-discover` | `allowed-tools: Bash(curl *), Read, Grep, Glob, AskUserQuestion` |

**Racional:** Frontmatter consistente permite que o Claude Code indexe e apresente cada skill de forma uniforme. `argument-hint` melhora a UX mostrando ao usuario o que o skill aceita. `allowed-tools` garante sandboxing correto.

---

## Decisao 4: Eliminacao da Redundancia docops

**Decisao:** Remover a pasta `docops/commands/` inteira e a chave `"commands"` do `docops/plugin.json`.

**Arquivos removidos (11):**
- `undeprecate.md`, `prune.md`, `restore.md`, `verify.md`, `init.md`
- `journal.md`, `redundancy.md`, `gc.md`, `deprecate.md`, `freshness.md`, `sync.md`

**Racional:** Cada command era um wrapper de 3 linhas no formato:
```markdown
---
description: ...
argument-hint: ...
---
Full instructions in the **{name}** skill.
Pass `$ARGUMENTS` as ...
```

Os skills correspondentes ja existem em `docops/skills/` e cobrem toda a funcionalidade. Manter commands era custo de manutencao sem beneficio.

---

## Decisao 5: Documentacao Atualizada

**Decisao:** Reescrever `cellm/docs/commands.md` como `Skills Reference`, refletindo a arquitetura skills-only.

**Mudancas:**
- Titulo: "Commands Reference" → "Skills Reference"
- Organizacao por fase do workflow (Planning, Execution, Validation, Pattern Management, Setup)
- Separacao clara entre workflow skills e context skills
- Documentacao da estrutura do frontmatter para referencia futura
- Todos os skills agora aparecem com prefixo `/cellm:` consistente

---

## Decisao 6: Estrutura Flat para Skills

**Decisao:** Manter estrutura flat em `skills/` (sem subpastas de categoria). Assets auxiliares ficam dentro do diretorio do skill.

```
skills/
  arena/SKILL.md           # Skill principal
  arena-debug/SKILL.md     # Skill de delegacao
  nuxt/SKILL.md            # Context skill
  plan/SKILL.md            # Workflow skill
```

**Racional:** O Claude Code indexa skills pelo frontmatter do SKILL.md, nao pela hierarquia de diretorios. Criar subpastas como `skills/workflow/plan/` ou `skills/context/nuxt/` quebraria o registro. A categorizacao e feita semanticamente via `user-invocable` e `paths`.

---

## Inventario Final — cellm skills

### Workflow Skills (22)

| # | Skill | Novo? |
|---|-------|-------|
| 1 | init | - |
| 2 | plan | - |
| 3 | shape | - |
| 4 | write-spec | NOVO |
| 5 | create-tasks | NOVO |
| 6 | orchestrate | NOVO |
| 7 | implement | NOVO |
| 8 | verify | NOVO |
| 9 | spec | - |
| 10 | spec-treat | - |
| 11 | discover | - |
| 12 | inject | - |
| 13 | index | - |
| 14 | arena | - |
| 15 | arena-debug | - |
| 16 | oracle-search | - |
| 17 | status | - |
| 18 | dse-discover | - |

### Context Skills (7)

| # | Skill | Auto-trigger |
|---|-------|-------------|
| 1 | nuxt | nuxt.config.ts, app/, server/, pages/ |
| 2 | vue | *.vue, composables/ |
| 3 | typescript | *.ts, *.tsx, types/ |
| 4 | tailwind | *.vue, *.css, tailwind.config.ts |
| 5 | pinia | stores/, store/ |
| 6 | drizzle | db/, drizzle.config.ts, *schema*.ts |
| 7 | dse | *.vue |

---

## Decisao 7: Skills Faltantes no docops

**Decisao:** Criar skills `undeprecate` e `restore` para o docops, que tinham commands mas nao tinham skills correspondentes.

**Racional:** Ao remover a pasta `commands/`, 2 de 11 commands nao tinham skill dedicado: `undeprecate` e `restore`. O skill `lifecycle` cobria ambos como sub-acoes, mas para manter o padrao `/docops:{name}` invocavel diretamente, criamos skills dedicados que documentam o processo completo.

**Cobertura final docops:**

| # | Skill | Comando |
|---|-------|---------|
| 1 | init | `/docops:init` |
| 2 | verify | `/docops:verify` |
| 3 | deprecate | `/docops:deprecate` |
| 4 | undeprecate | `/docops:undeprecate` (NOVO) |
| 5 | restore | `/docops:restore` (NOVO) |
| 6 | prune | `/docops:prune` |
| 7 | gc | `/docops:gc` |
| 8 | freshness | `/docops:freshness` |
| 9 | redundancy | `/docops:redundancy` |
| 10 | sync | `/docops:sync` |
| 11 | journal | `/docops:journal` |
| 12 | lifecycle | `/docops:lifecycle` |

---

## Decisao 8: Novo Plugin dse (Design System Engine)

**Decisao:** Criar um terceiro plugin `dse` dedicado a skills de design visual para frontend.

**Motivacao:** A skill `frontend-design` original demonstrou que o melhor prompt engineering para Claude nao ensina codigo (ele ja sabe) nem lista componentes (ele ja conhece) — injeta um framework de pensamento antes de agir. Essa abordagem merecia um plugin dedicado.

**Estrutura:**
```
dse/
  .claude-plugin/plugin.json
  skills/
    frontend-ui/SKILL.md
```

**marketplace.json atualizado** com entrada para dse v0.1.0.

---

## Decisao 9: Reescrita Total de Todos os Skills

**Decisao:** Reescrever 100% dos skills de cellm (25) e docops (12) aplicando o principio: "Nao ensina codigo, nao lista componentes, injeta framework de pensamento."

**Principio guia:** O Claude ja sabe programar. Skills devem ser frameworks de decisao, nao tutoriais. Cada skill agora segue o padrao:
1. Instrucao direta em 1-2 linhas
2. Thinking Framework numerado (decisoes, nao passos de codigo)
3. Secao NEVER com anti-patterns criticos

**Metricas de reducao:**

| Plugin | Antes | Depois | Reducao |
|--------|-------|--------|---------|
| cellm (workflow) | 1729 linhas | 642 linhas | -63% |
| cellm (contexto) | 373 linhas | 168 linhas | -55% |
| docops | 457 linhas | 378 linhas | -17% |
| **Total** | **2559 linhas** | **1188 linhas** | **-53%** |

**Observacao sobre docops:** A reducao menor (-17%) se deve ao fato de que os skills do docops ja eram relativamente concisos. Ainda assim, todos foram reescritos para consistencia de padrao.

---

## Decisao 10: Skill dse-frontend-ui

**Decisao:** Refatorar a skill `frontend-design` original em `dse-frontend-ui`, aplicando os mesmos principios de concisao.

**Mudancas em relacao ao original:**
- Removido tom motivacional ("You are not here to build generic...")
- Condensada secao de estetica em tabela de eixos (Typography, Color, Motion, Composition, Atmosphere)
- Adicionada regra de stack (HTML para single-page, React/Vue para stateful)
- Adicionado Self-Check com 3 criterios de qualidade
- Secao NEVER com 5 anti-patterns incluindo "purple gradients on white" (assinatura universal de AI slop)

**Resultado:** 42 linhas de puro sinal, zero filler.

---

## Inventario Final Atualizado

### cellm — 25 skills (18 workflow + 7 contexto)

**Workflow (18):**
init, plan, shape, write-spec, create-tasks, orchestrate, implement, verify, spec, spec-treat, discover, inject, index, arena, arena-debug, oracle-search, status, dse-discover

**Contexto (7):**
nuxt, vue, typescript, tailwind, pinia, drizzle, dse

### docops — 12 skills

init, verify, deprecate, undeprecate, restore, prune, gc, freshness, redundancy, sync, journal, lifecycle

### dse — 1 skill

frontend-ui

### Total: 38 skills em 3 plugins

---

## Decisao 11: Refatoracao Completa da Documentacao

**Decisao:** Reescrever todos os READMEs e docs publicos para refletir a arquitetura skills-only com 3 plugins.

**Problema:** Todos os READMEs e docs publicos estavam desatualizados:
- README.md raiz dizia "Two plugins" (agora 3)
- cellm/README.md dizia "18 skills" (agora 25)
- docops/README.md dizia "10 skills, 11 commands" (agora 12 skills, 0 commands)
- .github/README.md (publico) referenciava "10 Workflow Commands", "7 Framework Skills", versao 2.0.5
- .github/docs/COMMANDS.md usava nomes antigos (/plan-product, /shape-spec, etc.)
- dse/ nao tinha README

**Arquivos modificados (14):**

| Arquivo | Acao |
|---------|------|
| `README.md` | Reescrito: 3 plugins, context skills com empilhamento, arquitetura |
| `cellm/README.md` | Reescrito: 25 skills, distinção context vs workflow |
| `docops/README.md` | Reescrito: 12 skills, removido "11 commands" |
| `dse/README.md` | Criado do zero |
| `cellm/docs/README.md` | Links corrigidos, versao 3.3.0 |
| `.github/README.md` | Reescrito: tom comercial mantido, numeros atualizados |
| `.github/docs/COMMANDS.md` | Reescrito como "Skills Reference" com namespace /cellm: |
| `.github/docs/FEATURES.md` | Atualizado: 25 skills, 3 plugins |
| `.github/docs/SKILLS.md` | Reescrito: context + workflow, sem code examples |
| `.github/docs/INDEX.md` | Versao 3.3.0 |
| `.github/ROADMAP.md` | Versao 3.3.0, inventario atualizado |
| `.github/ABOUT.md` | Skills-only architecture |
| `cellm/docs/features.md` | Headers corrigidos |
| `.gitignore` | Limpeza: removidos paths ~/ invalidos, adicionado JORNAL.md e .claude/ |

**Decisao sobre CHANGELOGs:** Nao alterados. Referencias a `sk-nuxt`, `/plan-product` etc. sao registros historicos validos da versao em que foram escritos. Reescrever historico seria falsificar.

---

## Decisao 12: Ajustes no .gitignore

**Decisao:** Limpar o .gitignore de entradas invalidas e adicionar novas.

**Mudancas:**
- Removido: `~/.cellm/logs/`, `~/.cellm/metrics/`, `~/.cellm/profiles/*.backup.*` (paths com `~` nao funcionam em .gitignore — sao relativos ao repo)
- Removido: `.claude` sem barra (poderia ignorar arquivos, nao diretorios)
- Adicionado: `.claude/` (com barra, ignora o diretorio corretamente)
- Adicionado: `JORNAL.md` (decisoes arquiteturais locais, nao devem ir pro publico)

---

## Decisao 13: Remocao de marketplace.json Redundantes

**Decisao:** Remover `cellm/marketplace.json` e `docops/marketplace.json`. Manter apenas `.claude-plugin/marketplace.json` na raiz.

**Racional:** Os marketplaces individuais existiam para instalacao standalone de cada plugin. Como o CELLM e distribuido como pacote NPM unico, o ponto de entrada e sempre o marketplace raiz. Manter cópias dentro de cada plugin criava duplicacao e risco de dessincronizacao (cellm listava v3.2.2, docops listava v0.4.0 — ambos desatualizados).

**Arquivos removidos:**
- `cellm/marketplace.json`
- `docops/marketplace.json`

---

## Decisao 14: Correcao dos CI Workflows

**Decisao:** Reescrever os 4 workflows do GitHub Actions para refletir a arquitetura skills-only com 3 plugins.

**Problemas encontrados:**

| Workflow | Problema |
|----------|----------|
| `ci.yml` | Validava apenas cellm. Ignorava docops e dse. |
| `pr-check.yml` | Detectava `cellm/commands/` nos diffs. Label `commands` no auto-labeler. Scope `commands` no PR title. |
| `release.yml` | Referenciava `cellm-core/rules`, `cellm-core/commands`, `schemas/` (estrutura v1.x). Usava `actions/checkout@v6` e `actions/setup-node@v6` (nao existem). Rodava `npm ci`, `npm test`, `./scripts/validate.sh` (nao existem no repo). |
| `claude.yml` | Usava `actions/checkout@v6` (nao existe, v4 e a mais recente). |

**Correcoes aplicadas:**

| Workflow | Mudanca |
|----------|---------|
| `ci.yml` | Valida 3 plugins, marketplace.json, frontmatter de todos SKILL.md, verifica ausencia de commands/ |
| `pr-check.yml` | Removida deteccao de commands/. Patterns atualizados para cellm/docops/dse. Labels: skills, agents, hooks, scripts, docops, dse. |
| `release.yml` | Removida referencia a cellm-core/. Conta skills por plugin. Usa checkout@v4. Removido npm ci/test (nao aplicavel). |
| `claude.yml` | Corrigido para checkout@v4. |

**Validacao:** CI simulado localmente — todos os checks passam. 38 skills validados, 3 plugins, 0 commands/.

---

## Proximos Passos

1. Bump de versao no cellm plugin.json (3.2.2 → 3.3.0)
2. Considerar criar agents para `write-spec` (architect) e `verify` (reviewer) se nao existirem
3. Expandir plugin dse com novos skills de design (paletas, acessibilidade, design tokens)
4. Documentar o principio "framework de pensamento, nao tutorial" como padrao para futuros skills
