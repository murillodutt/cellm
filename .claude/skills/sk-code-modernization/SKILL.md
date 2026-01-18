---
name: sk-code-modernization
description: "Análise e modernização incremental de repositórios de código. Use quando precisar: (1) Diagnosticar arquitetura e qualidade de código, (2) Identificar código legado, duplicações e acoplamentos, (3) Planejar refatorações seguras em fases, (4) Reduzir complexidade acidental sem reescrever do zero. Gatilhos típicos: modernizar código, refatorar repositório, reduzir dívida técnica, analisar arquitetura, remover código legado."
---

# Code Modernization

Conduz modernização e reestruturação incremental de código, reduzindo camadas obsoletas, redundâncias e complexidade acidental, sem reescrever do zero e preservando comportamento.

## Princípios fundamentais

- **Incremental**: Mudanças pequenas, reversíveis, commits bem delimitados
- **Preservar comportamento**: Não alterar regras de negócio sem justificativa explícita
- **Baseline primeiro**: Fortalecer testes antes de grandes refatorações
- **Gates obrigatórios**: Segurança e confiabilidade validadas em cada fase
- **Persistência**: Nunca abandonar uma fase incompleta; sempre concluir o que iniciou

## Regras de execução obrigatórias

### Uso de raciocínio estendido

- **Fase 0 (Reconhecimento)**: SEMPRE usar `ultrathink` ou `think` para análise profunda
- **Decisões arquiteturais**: Usar `think` antes de recomendar mudanças estruturais
- **Priorização de problemas**: Usar `think` para classificar P0/P1/P2

### Confirmação obrigatória ao final de cada fase

Ao concluir QUALQUER fase, SEMPRE perguntar em voz alta:

```
═══════════════════════════════════════════════════════════
[+] FASE [N] CONCLUÍDA

Antes de prosseguir, confirme:
1. Todos os processos foram confirmados?
2. Algo foi esquecido?
3. Há pendências que precisam ser resolvidas?

Aguardando confirmação para continuar...
═══════════════════════════════════════════════════════════
```

Não avançar para a próxima fase sem confirmação explícita do usuário.

### Persistência na execução

- Nunca interromper uma fase no meio
- Se encontrar bloqueios, documentar e propor alternativas
- Sempre gerar o relatório completo da fase, mesmo que parcial
- Retomar de onde parou se a sessão for interrompida

## Workflow

O processo segue 3 fases sequenciais. Cada fase produz um entregável antes de avançar.

```
Fase 0: Reconhecimento → Stack Snapshot        [usar ultrathink]
    ↓ (confirmação)
Fase 1: Diagnóstico → Relatório de Problemas   [usar think para priorização]
    ↓ (confirmação)
Fase 2: Plano de Reestruturação → Fases incrementais executáveis
    ↓ (confirmação a cada subfase)
```

## Fase 0 — Reconhecimento automático

**Objetivo**: Mapear stack, pipeline e estado atual do projeto.

**IMPORTANTE**: Executar esta fase com `ultrathink` para análise profunda e escolhas inteligentes.

**Identificar**:
1. Stack técnica: linguagens, frameworks, runtime, build tools, package managers
2. Estrutura: monorepo/multirepo, módulos, serviços, packages
3. Padrões arquiteturais: camadas, domínio, adapters
4. Execução e validação: build, test, lint, typecheck
5. CI/CD: pipeline existente, ambientes (dev/stage/prod)
6. Segurança: varredura de deps, SAST, secrets, auth

**Comandos de descoberta**:
```bash
# Estrutura geral
find . -maxdepth 3 -type f \( -name "package.json" -o -name "*.csproj" -o -name "pom.xml" -o -name "Cargo.toml" -o -name "go.mod" -o -name "requirements.txt" -o -name "pyproject.toml" -o -name "composer.json" \) 2>/dev/null

# CI/CD
ls -la .github/workflows/ .gitlab-ci.yml Jenkinsfile .circleci/ bitbucket-pipelines.yml 2>/dev/null

# Testes
find . -type d \( -name "test" -o -name "tests" -o -name "__tests__" -o -name "spec" \) -not -path "*/node_modules/*" 2>/dev/null | head -20
```

**Entregável**: Stack Snapshot — ver [references/stack-snapshot-template.md](references/stack-snapshot-template.md)

**Ao concluir a Fase 0**, gerar relatório formatado e perguntar:
```
═══════════════════════════════════════════════════════════
[+] FASE 0 (RECONHECIMENTO) CONCLUÍDA

Relatório: Stack Snapshot gerado
Arquivos analisados: [N]
Riscos identificados: [N]

Confirme antes de prosseguir para Fase 1 (Diagnóstico):
1. Todos os processos foram confirmados?
2. Algo foi esquecido?
3. Há pendências que precisam ser resolvidas?

Aguardando confirmação...
═══════════════════════════════════════════════════════════
```

## Fase 1 — Diagnóstico

**Objetivo**: Mapear problemas de arquitetura e qualidade.

**IMPORTANTE**: Usar `think` para priorização inteligente de problemas (P0/P1/P2).

**Analisar**:
1. Módulos/camadas e fluxo de dependências
2. Camadas antigas/obsoletas e código morto
3. Duplicações e abstrações redundantes
4. Acoplamentos fortes e violações de boundaries
5. Hotspots: arquivos críticos com alta mudança/complexidade
6. Inconsistências de padrões

**Ferramentas de análise por stack**: Ver [references/analysis-tools.md](references/analysis-tools.md)

**Priorização de problemas**:

| Prioridade | Critério | Ação |
|------------|----------|------|
| P0 | Bloqueia entregas ou causa incidentes | Resolver imediatamente |
| P1 | Impacta produtividade significativamente | Resolver na próxima fase |
| P2 | Dívida técnica aceitável | Planejar para futuro |

**Cada problema deve ter**:
- Evidência: arquivos/pastas específicos
- Impacto: manutenção/performance/segurança
- Risco de mudança: baixo/médio/alto
- Recomendação objetiva

**Entregável**: Relatório de Diagnóstico — ver [references/diagnosis-template.md](references/diagnosis-template.md)

**Ao concluir a Fase 1**, gerar relatório formatado e perguntar:
```
═══════════════════════════════════════════════════════════
[+] FASE 1 (DIAGNÓSTICO) CONCLUÍDA

Problemas encontrados:
  P0 (Críticos):    [N]
  P1 (Importantes): [N]
  P2 (Dívida):      [N]

Hotspots identificados: [N]
Duplicações: [N] ocorrências

Confirme antes de prosseguir para Fase 2 (Plano):
1. Todos os processos foram confirmados?
2. Algo foi esquecido?
3. Há pendências que precisam ser resolvidas?

Aguardando confirmação...
═══════════════════════════════════════════════════════════
```

## Fase 2 — Plano de reestruturação

**Objetivo**: Criar plano incremental com fases seguras.

**Estrutura de cada fase**:
```
Fase 2.X: [Nome descritivo]
├── Objetivo claro e escopo pequeno
├── Pré-requisitos
├── Checklist de validação
├── Estratégia de rollback
└── Risco estimado + mitigação
```

**Fase Baseline** (se necessário):
- Criar/ajustar suite mínima de testes
- Padronizar lint/typecheck
- Configurar verificações automáticas no CI

**Gates obrigatórios em cada fase**:
1. Testes passam (unit/integration/e2e)
2. Lint/build/typecheck passam
3. Auditoria de dependências sem vulnerabilidades críticas
4. Detecção de secrets sem exposições
5. Documentação atualizada (se arquitetura mudou)

**Entregável**: Plano de Fases — ver [references/restructuring-plan-template.md](references/restructuring-plan-template.md)

**Ao concluir a Fase 2**, gerar relatório formatado e perguntar:
```
═══════════════════════════════════════════════════════════
[+] FASE 2 (PLANEJAMENTO) CONCLUÍDA

Plano gerado com [N] subfases:
  Fase 2.0: Baseline - [status]
  Fase 2.1: [nome] - [duração estimada]
  Fase 2.2: [nome] - [duração estimada]
  ...

Duração total estimada: [X semanas]

Confirme antes de iniciar execução:
1. Todos os processos foram confirmados?
2. Algo foi esquecido?
3. Há pendências que precisam ser resolvidas?

Aguardando confirmação...
═══════════════════════════════════════════════════════════
```

## Execução das subfases

Executar fase a fase, com confirmação obrigatória entre cada uma.

**Ao concluir CADA subfase (2.X)**, gerar relatório:
```
═══════════════════════════════════════════════════════════
[+] FASE 2.[X] ([NOME]) CONCLUÍDA

O que mudou:
  - [mudança 1]
  - [mudança 2]

Validações executadas:
  [[+]] Testes passam
  [[+]] Lint/build/typecheck passam
  [[+]] Auditoria de deps OK
  [ ] [pendência, se houver]

Arquivos modificados: [N]
Linhas alteradas: +[N] / -[N]

Como reverter (se necessário):
  git revert [commit-hash]

═══════════════════════════════════════════════════════════
Antes de prosseguir para Fase 2.[X+1]:
1. Todos os processos foram confirmados?
2. Algo foi esquecido?
3. Há pendências que precisam ser resolvidas?

Aguardando confirmação...
═══════════════════════════════════════════════════════════
```

## Formato de commit

```
refactor(scope): descrição concisa

- O que foi alterado
- Por que foi alterado
- Como validar

BREAKING CHANGE: (se aplicável)
```

## Relatório final de modernização

Ao concluir TODAS as fases, gerar relatório consolidado:

```
╔═══════════════════════════════════════════════════════════╗
║         MODERNIZAÇÃO CONCLUÍDA COM SUCESSO                ║
╚═══════════════════════════════════════════════════════════╝

Projeto: [nome]
Período: [data início] → [data fim]

RESUMO EXECUTIVO
────────────────────────────────────────────────────────────
[2-3 parágrafos sobre o que foi alcançado]

MÉTRICAS COMPARATIVAS
────────────────────────────────────────────────────────────
| Métrica              | Antes    | Depois   | Variação   |
|----------------------|----------|----------|------------|
| Duplicação           | X%       | Y%       | -Z%        |
| Complexidade média   | X        | Y        | -Z         |
| Cobertura de testes  | X%       | Y%       | +Z%        |
| Deps vulneráveis     | N        | 0        | -N         |
| Código morto         | N linhas | 0        | -N linhas  |

FASES EXECUTADAS
────────────────────────────────────────────────────────────
[[+]] Fase 0: Reconhecimento
[[+]] Fase 1: Diagnóstico  
[[+]] Fase 2.0: Baseline
[[+]] Fase 2.1: [nome]
[[+]] Fase 2.N: [nome]

ARQUIVOS IMPACTADOS
────────────────────────────────────────────────────────────
Total modificados: [N]
Total removidos: [N]
Total criados: [N]

PRÓXIMOS PASSOS RECOMENDADOS
────────────────────────────────────────────────────────────
1. [recomendação]
2. [recomendação]
3. [recomendação]
```

## Critérios de sucesso

- [ ] Redução mensurável de duplicação nas áreas-alvo
- [ ] Redução de complexidade ciclomática em hotspots
- [ ] Legado removido ou isolado com depreciação documentada
- [ ] Boundaries mais explícitos e consistentes
- [ ] Pipeline de validação (tests + qualidade + segurança) funcionando
