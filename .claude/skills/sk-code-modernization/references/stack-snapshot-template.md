# Stack Snapshot Template

## Metadata

- **Projeto:** [Nome do projeto]
- **Data de análise:** [YYYY-MM-DD]
- **Analisado por:** [Nome/Tool]
- **Repositório:** [URL ou caminho]

---

## 1. Stack Técnica

### Linguagens

| Linguagem | Versão | Uso Principal |
|-----------|--------|---------------|
| [ex: TypeScript] | [ex: 5.3] | [ex: Backend + Frontend] |
| [ex: Python] | [ex: 3.11] | [ex: Scripts de automação] |

### Frameworks e Runtime

| Framework | Versão | Camada |
|-----------|--------|--------|
| [ex: Nuxt] | [ex: 4.0] | [ex: Frontend] |
| [ex: Node.js] | [ex: 20.x] | [ex: Runtime] |

### Package Managers

| Manager | Arquivos Detectados | Lock Files |
|---------|---------------------|------------|
| [ex: pnpm] | package.json (root) | pnpm-lock.yaml |
| [ex: pip] | requirements.txt | - |

---

## 2. Estrutura do Projeto

### Organização

```
Tipo: [monorepo | multirepo | single]
Estrutura detectada:
```

### Módulos/Packages

| Módulo | Localização | Tipo | Dependências |
|--------|-------------|------|--------------|
| [ex: @app/web] | apps/web/ | Frontend | [@shared/ui] |
| [ex: @app/api] | apps/api/ | Backend | [@shared/db] |

### Camadas Arquiteturais

- **Apresentação:** [ex: app/components/, app/pages/]
- **Lógica de Negócio:** [ex: app/composables/, server/services/]
- **Dados:** [ex: server/db/]
- **Infraestrutura:** [ex: server/utils/]

---

## 3. Build e Validação

### Build Tools

| Tool | Config File | Status |
|------|-------------|--------|
| [ex: Vite] | vite.config.ts | [+] Presente |
| [ex: TSC] | tsconfig.json | [+] Presente |

### Scripts Disponíveis

```json
{
  "dev": "comando...",
  "build": "comando...",
  "test": "comando...",
  "lint": "comando...",
  "typecheck": "comando..."
}
```

### Linters e Formatters

| Tool | Config | Status |
|------|--------|--------|
| ESLint | .eslintrc.js | [[+] OK | [!] Desatualizado | [-] Ausente] |
| Prettier | .prettierrc | [status] |
| Stylelint | - | [status] |

### Testes

| Framework | Config | Cobertura Estimada |
|-----------|--------|-------------------|
| [ex: Vitest] | vitest.config.ts | [ex: ~45%] |
| [ex: Playwright] | playwright.config.ts | [ex: E2E básico] |

**Diretórios de teste encontrados:**
- [ ] Unit tests: [localização]
- [ ] Integration tests: [localização]
- [ ] E2E tests: [localização]

---

## 4. CI/CD

### Pipeline Detectado

**Plataforma:** [GitHub Actions | GitLab CI | Jenkins | CircleCI | Bitbucket | Nenhum]

**Arquivos de configuração:**
- [ex: .github/workflows/ci.yml]
- [ex: .gitlab-ci.yml]

### Stages Identificados

| Stage | Ações | Status |
|-------|-------|--------|
| Build | [descrição] | [ativo/inativo] |
| Test | [descrição] | [ativo/inativo] |
| Lint | [descrição] | [ativo/inativo] |
| Deploy | [descrição] | [ativo/inativo] |

### Ambientes

- [ ] Development
- [ ] Staging
- [ ] Production

---

## 5. Segurança

### Auditoria de Dependências

**Comando usado:** [ex: `npm audit`, `pip check`]

| Severidade | Quantidade |
|------------|------------|
| Critical | [N] |
| High | [N] |
| Moderate | [N] |
| Low | [N] |

### Análise Estática (SAST)

**Tools detectados:**
- [ ] SonarQube
- [ ] CodeQL
- [ ] Snyk
- [ ] ESLint security plugins
- [ ] Nenhum

### Secrets e Credenciais

**Verificação realizada:**
- [ ] .env files (deve estar em .gitignore)
- [ ] Hardcoded credentials
- [ ] API keys expostas

**Riscos encontrados:** [lista ou "Nenhum"]

### Autenticação

**Estratégia detectada:** [ex: JWT, Session-based, OAuth, Nenhuma]
**Implementação:** [descrição breve]

---

## 6. Dependências

### Total de Dependências

| Tipo | Quantidade |
|------|------------|
| Production | [N] |
| Development | [N] |
| Total | [N] |

### Dependências Principais (Top 10)

| Package | Versão | Última Atualização | Uso |
|---------|--------|-------------------|-----|
| [nome] | [ver] | [data] | [descrição] |

### Dependências Obsoletas

| Package | Versão Atual | Última Disponível | Status |
|---------|--------------|-------------------|--------|
| [nome] | [ver] | [ver] | [[!] deprecated / [!] major behind] |

---

## 7. Observações e Riscos

### Riscos Identificados

**Alta Prioridade:**
- [risco 1]

**Média Prioridade:**
- [risco 2]

**Baixa Prioridade:**
- [risco 3]

### Pontos Positivos

- [ponto 1]
- [ponto 2]

### Recomendações Imediatas

1. [recomendação prioritária]
2. [recomendação secundária]

---

## 8. Resumo Executivo

[2-3 parágrafos resumindo o estado geral do projeto: maturidade da stack, principais riscos, pontos fortes, e próximos passos recomendados]
