# Contributing to CELLM

Obrigado por considerar contribuir com o CELLM! Este documento explica como participar do projeto.

## Índice

- [Código de Conduta](#código-de-conduta)
- [Como Contribuir](#como-contribuir)
- [Processo de Desenvolvimento](#processo-de-desenvolvimento)
- [Padrões de Código](#padrões-de-código)
- [Commits e PRs](#commits-e-prs)
- [Tipos de Contribuição](#tipos-de-contribuição)

---

## Código de Conduta

Este projeto adota um código de conduta. Ao participar, você concorda em manter um ambiente respeitoso e construtivo. Veja [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

---

## Como Contribuir

### Reportar Bugs

1. Verifique se o bug já não foi reportado em [Issues](https://github.com/murillodutt/cellm/issues)
2. Use o template de Bug Report
3. Inclua:
   - Descrição clara do problema
   - Passos para reproduzir
   - Comportamento esperado vs atual
   - Versão do CELLM e ambiente

### Sugerir Features

1. Verifique se já não existe uma sugestão similar
2. Use o template de Feature Request
3. Descreva:
   - O problema que a feature resolve
   - Sua solução proposta
   - Alternativas consideradas

### Contribuir Código

1. Fork o repositório
2. Crie uma branch (`git checkout -b feat/minha-feature`)
3. Faça suas alterações
4. Execute validações (`./scripts/validate.sh`)
5. Commit seguindo convenções (`git commit -m 'feat: add X'`)
6. Push para sua branch (`git push origin feat/minha-feature`)
7. Abra um Pull Request

---

## Processo de Desenvolvimento

### Setup Local

```bash
# Clone o repositório
git clone https://github.com/murillodutt/cellm.git
cd cellm

# Instale dependências (se houver)
npm install

# Execute validações
./scripts/validate.sh
```

### Estrutura de Branches

```
main              # Produção, sempre estável
develop           # Integração de features
feat/<nome>       # Novas features
fix/<nome>        # Correções de bugs
docs/<nome>       # Atualizações de documentação
refactor/<nome>   # Refatorações
```

### Fluxo de Trabalho

1. **Sincronize** com a branch `develop`
2. **Crie** sua branch a partir de `develop`
3. **Desenvolva** suas alterações
4. **Teste** localmente
5. **Valide** com scripts de validação
6. **Commit** com mensagens descritivas
7. **Push** para seu fork
8. **Abra PR** para `develop`

---

## Padrões de Código

### Arquivos Markdown

- Use frontmatter YAML válido
- Inclua todos os campos obrigatórios
- Mantenha IDs únicos
- Siga o template da categoria

### Exemplo de Rule

```markdown
---
id: CONV-XXX
version: v0.10.0
status: DRAFT
budget: ~100 tokens
alwaysApply: true
---

# Título da Rule

Conteúdo da rule...
```

### Exemplo de Pattern

```markdown
---
id: TS-XXX
version: v0.10.0
status: DRAFT
technology: typescript
---

# Pattern Title

## Descrição
...

## Exemplo Correto
```typescript
// [+] Bom
```

## Exemplo Incorreto
```typescript
// [-] Ruim
```
```

### Exemplo de Skill

```markdown
---
name: skill-name
description: Descrição clara (max 1024 chars)
---

# Skill Name

Instruções para o Claude...
```

---

## Commits e PRs

### Convenção de Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**

| Type | Uso |
|------|-----|
| `feat` | Nova funcionalidade |
| `fix` | Correção de bug |
| `docs` | Documentação |
| `refactor` | Refatoração |
| `test` | Testes |
| `chore` | Manutenção |

**Scopes válidos:**
- `rules`, `patterns`, `commands`, `workflows`, `agents`, `skills`
- `docs`, `scripts`, `schemas`

**Exemplos:**

```bash
feat(rules): add mobile domain rule
fix(patterns): correct TS-003 example
docs: update installation guide
refactor(commands): simplify implement structure
```

### Pull Requests

- Use o template de PR
- Vincule issues relacionadas
- Descreva as mudanças claramente
- Inclua screenshots se relevante
- Aguarde review antes de merge

---

## Tipos de Contribuição

### Rules

1. Crie em `cellm-core/rules/<categoria>/`
2. Use ID único (ex: `CONV-007`, `LIM-003`)
3. Inclua frontmatter completo
4. Adicione ao INDEX.md se necessário

### Patterns

1. Crie em `cellm-core/patterns/<categoria>/`
2. Use ID único com prefixo de tecnologia
3. Inclua exemplos bons e ruins
4. Adicione métricas se aplicável

### Skills

1. Crie pasta em `cellm-core/skills/<nome>/`
2. Adicione SKILL.md com frontmatter
3. Siga o Agent Skills spec
4. Inclua scripts auxiliares se necessário

### Documentação

1. Atualize em `docs/`
2. Mantenha consistência com PRD
3. Inclua exemplos práticos
4. Revise links e referências

### Scripts

1. Desenvolva em `scripts/`
2. Adicione shebang e comentários
3. Trate erros adequadamente
4. Documente uso e parâmetros

---

## Validação

Antes de submeter, execute:

```bash
# Validar estrutura e schemas
./scripts/validate.sh

# Verificar frontmatter
./scripts/check-frontmatter.sh

# Rodar testes (se existirem)
npm test
```

---

## Dúvidas?

- Abra uma [Discussion](https://github.com/murillodutt/cellm/discussions)
- Consulte a [documentação](./docs/PRD-CELLM.md)
- Entre em contato com os maintainers

---

## Reconhecimento

Contribuidores são listados no README e nos releases. Agradecemos sua participação!
