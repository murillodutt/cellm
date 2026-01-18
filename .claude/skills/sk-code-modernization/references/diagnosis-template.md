# Relatório de Diagnóstico Template

## Metadata

- **Projeto:** [Nome do projeto]
- **Data:** [YYYY-MM-DD]
- **Baseline (Stack Snapshot):** [link ou referência]
- **Fase:** Diagnóstico (Fase 1)

---

## Resumo Executivo

[2-3 parágrafos resumindo os principais achados, nível de urgência geral, e impacto na capacidade de entrega]

**Classificação Geral:** [Crítico | Alto | Médio | Baixo]

**Principais Riscos:**
1. [Risco P0 mais crítico]
2. [Risco P1 mais impactante]

---

## 1. Análise de Módulos e Dependências

### Mapa de Dependências

```
[Diagrama ou lista hierárquica mostrando fluxo de dependências]

Exemplo:
app/
├─> shared/ui
│   ├─> shared/utils
│   └─> legacy/icons [!] [camada obsoleta]
├─> shared/db
└─> legacy/services [!] [acoplamento forte]
```

### Dependências Circulares

| Módulo A | Módulo B | Tipo | Impacto | Prioridade |
|----------|----------|------|---------|------------|
| [ex: auth/service] | [ex: user/store] | [forte/fraco] | [descrição] | [P0/P1/P2] |

**Total detectado:** [N]

---

## 2. Camadas Obsoletas e Código Morto

### Camadas Legadas Identificadas

| Camada | Localização | Uso Atual | Substituição | Prioridade |
|--------|-------------|-----------|--------------|------------|
| [ex: legacy/] | legacy/ | [N] arquivos | [ex: shared/] | P1 |
| [ex: old-auth/] | src/old-auth/ | 0 refs | [ex: remover] | P0 |

### Arquivos/Funções Não Utilizados

| Item | Localização | Última Modificação | Ação |
|------|-------------|--------------------|------|
| [ex: utils/oldParser.ts] | src/utils/ | [2021-03-15] | Remover |
| [ex: formatDate()] | shared/date.ts | [2022-01-10] | Migrar p/ date-fns |

**Total de código morto:** [N linhas / N% do projeto]

**Impacto estimado:** [economia de bundle, redução de complexidade]

---

## 3. Duplicações e Redundâncias

### Duplicações Críticas (>50 linhas)

| Código | Localizações | Linhas | Similaridade | Recomendação |
|--------|--------------|--------|--------------|--------------|
| [ex: validation logic] | [file1, file2] | 127 | 92% | Extrair p/ shared/validators |
| [ex: API client setup] | [file3, file4, file5] | 85 | 78% | Criar factory em shared/api |

**Total de duplicações:** [N ocorrências | X% do código]

### Abstrações Redundantes

| Abstração | Funcionalidade | Uso | Problema | Solução |
|-----------|----------------|-----|----------|---------|
| [ex: UserService v1] | CRUD users | 12 refs | Sobreposta por v2 | Deprecar v1 |
| [ex: formatCurrency] | Format BRL | 8 refs | 3 implementações diferentes | Padronizar |

---

## 4. Acoplamentos Fortes

### Violações de Boundaries

| Camada Inferior | Camada Superior | Tipo de Acoplamento | Impacto |
|-----------------|-----------------|---------------------|---------|
| [ex: db/schema] | [ex: ui/components] | Import direto | Dificulta mudanças de DB |
| [ex: services/] | [ex: pages/] | Lógica misturada | Baixa testabilidade |

**Recomendações:**
- [ex: Introduzir camada de adapters entre DB e UI]
- [ex: Mover lógica de negócio para composables/]

### Cross-Cutting Concerns

| Concern | Implementação | Problema | Solução |
|---------|---------------|----------|---------|
| [ex: Logging] | console.log espalhado | Sem estrutura | Logger centralizado |
| [ex: Auth checks] | Duplicado em 15 rotas | Inconsistente | Middleware |

---

## 5. Hotspots de Código

### Top 10 Arquivos Críticos

| Arquivo | Complexidade | Churn (mudanças) | Linhas | Risco | Prioridade |
|---------|--------------|------------------|--------|-------|------------|
| [ex: user-service.ts] | Ciclomática: 42 | 87 commits | 1.850 | Alto | P0 |
| [ex: payment-flow.ts] | Ciclomática: 35 | 64 commits | 1.320 | Alto | P1 |

**Critérios de risco:**
- Complexidade > 20: Alto risco
- Churn > 50 commits: Instabilidade
- Linhas > 1000: Difícil manutenção

**Ações recomendadas:**
- [ex: Quebrar user-service.ts em módulos menores]
- [ex: Refatorar payment-flow.ts com strategy pattern]

---

## 6. Inconsistências de Padrões

### Padrões Arquiteturais Misturados

| Padrão | Uso | Localização | Problema |
|--------|-----|-------------|----------|
| [ex: Options API] | 15 componentes | app/legacy/ | Incompatível com Composition API |
| [ex: Class-based services] | 8 arquivos | server/old/ | Incompatível com funções puras |

### Convenções de Nomenclatura

| Tipo | Inconsistências Detectadas | Exemplo | Padrão Recomendado |
|------|---------------------------|---------|-------------------|
| [ex: Componentes] | PascalCase vs kebab-case | UserCard vs user-list | PascalCase |
| [ex: Funções] | camelCase vs snake_case | fetchUser vs fetch_data | camelCase |

### Estrutura de Arquivos

| Problema | Exemplo | Recomendação |
|----------|---------|--------------|
| [ex: Mistura de concerns] | components/UserCard.ts tem lógica de API | Separar em composables/ |
| [ex: Profundidade excessiva] | src/app/features/user/components/forms/inputs/... | Max 3 níveis |

---

## 7. Performance e Escalabilidade

### Gargalos Identificados

| Problema | Localização | Impacto | Métrica | Solução |
|----------|-------------|---------|---------|---------|
| [ex: N+1 queries] | user-list.ts | Alto | 150ms → 15ms | Batch loading |
| [ex: Bundle excessivo] | app/main.js | Médio | 2.3MB | Code splitting |

### Problemas de Escalabilidade

- [ex: Estado global não paginado (cresce indefinidamente)]
- [ex: Cache sem estratégia de invalidação]

---

## 8. Segurança

### Vulnerabilidades em Dependências

| Package | Severidade | CVE | Versão Atual | Versão Segura |
|---------|------------|-----|--------------|---------------|
| [ex: lodash] | High | CVE-2021-23337 | 4.17.15 | 4.17.21 |

**Total:** [N críticas | N altas | N médias]

### Práticas Inseguras no Código

| Problema | Localização | Risco | Solução |
|----------|-------------|-------|---------|
| [ex: Hardcoded API key] | config.ts:12 | Crítico | Usar env vars |
| [ex: SQL injection risk] | db/raw-query.ts | Alto | Usar ORM prepared statements |

---

## 9. Testes e Qualidade

### Cobertura de Testes

| Tipo | Cobertura Atual | Meta | Gap |
|------|----------------|------|-----|
| Unit | 45% | 80% | -35% |
| Integration | 12% | 60% | -48% |
| E2E | 5% | 30% | -25% |

### Áreas Sem Cobertura (Críticas)

- [ex: payment-service.ts - 0% coverage]
- [ex: auth/middleware.ts - 15% coverage]

### Problemas de Testabilidade

- [ex: 12 arquivos com dependências hardcoded (não mockáveis)]
- [ex: 8 componentes acoplados ao DOM (difícil testar)]

---

## 10. Documentação

### Estado Atual

- [ ] README atualizado
- [ ] Documentação de arquitetura
- [ ] Guia de contribuição
- [ ] ADRs (Architecture Decision Records)

### Gaps Críticos

- [ex: Falta documentação de fluxo de autenticação]
- [ex: Schemas de API não documentados]

---

## Priorização de Problemas (Consolidated)

### P0 - Críticos (Resolver Imediatamente)

| # | Problema | Impacto | Esforço | Risco |
|---|----------|---------|---------|-------|
| P0-1 | [descrição] | [descrição] | [S/M/L] | [descrição] |
| P0-2 | [descrição] | [descrição] | [S/M/L] | [descrição] |

### P1 - Importantes (Próxima Fase)

| # | Problema | Impacto | Esforço | Risco |
|---|----------|---------|---------|-------|
| P1-1 | [descrição] | [descrição] | [S/M/L] | [descrição] |
| P1-2 | [descrição] | [descrição] | [S/M/L] | [descrição] |

### P2 - Dívida Técnica (Planejar p/ Futuro)

| # | Problema | Impacto | Esforço | Risco |
|---|----------|---------|---------|-------|
| P2-1 | [descrição] | [descrição] | [S/M/L] | [descrição] |
| P2-2 | [descrição] | [descrição] | [S/M/L] | [descrição] |

---

## Evidências

### Comandos Executados

```bash
# Lista de comandos usados para análise
npx madge --circular ./src
npx jscpd ./src --min-lines 5
git log --all --numstat | head -50
```

### Screenshots/Gráficos

[Inserir ou referenciar gráficos de complexidade, dependências, etc.]

---

## Próximos Passos

1. **Validar achados com equipe** - [data]
2. **Priorizar P0s para resolução imediata** - [prazo]
3. **Avançar para Fase 2 (Plano de Reestruturação)** - [data]

---

## Anexos

- [Link para relatórios detalhados (JSON, XML)]
- [Link para Stack Snapshot]
- [Link para scripts de análise]
