# Auditoria de Segurança - Repositório Público CELLM

**Data**: 2026-01-27
**Repositório**: https://github.com/murillodutt/cellm
**Auditado por**: Claude Sonnet 4.5

---

## Sumário Executivo

### Status Geral: [!] AÇÃO NECESSÁRIA

| Categoria | Status | Prioridade |
|-----------|--------|------------|
| Branch Protection | [-] NÃO CONFIGURADA | CRÍTICA |
| CI/CD Pipeline | [-] FALHA APÓS MIGRAÇÃO | ALTA |
| Merge Settings | [!] REVISAR | MÉDIA |
| Security Policy | [+] CONFIGURADO | OK |
| Workflows | [!] ATUALIZAÇÃO NECESSÁRIA | ALTA |

---

## 1. Branch Protection (CRÍTICO)

### Problema Identificado

```
[-] CRÍTICO: Branch 'main' não está protegida
    Status: Sem proteção configurada
    Risco: Force push, deletion, commits diretos sem review
```

### Impacto

- **ALTO**: Qualquer colaborador pode fazer push direto para main
- **ALTO**: Possibilidade de force push destruir histórico
- **ALTO**: Branch pode ser deletada acidentalmente
- **MÉDIO**: Commits sem code review ou CI passando

### Ação Corretiva Necessária

Configure branch protection para `main` com as seguintes regras:

#### Configuração Recomendada

```yaml
Branch Protection Rules para 'main':

1. Require pull request reviews before merging
   - Required approving reviews: 1
   - Dismiss stale reviews when new commits are pushed: ✅
   - Require review from Code Owners: ❌ (não há CODEOWNERS)

2. Require status checks to pass before merging
   - Require branches to be up to date: ✅
   - Status checks required:
     * CI / validate
     * CI / marketplace
     * PR Check / pr-validation
     * PR Check / structure-check

3. Require conversation resolution before merging: ✅

4. Require signed commits: ❌ (opcional, mas recomendado para projetos críticos)

5. Require linear history: ✅
   - Prevent merge commits (force squash or rebase)

6. Include administrators: ✅
   - Apply rules to administrators também

7. Restrict who can push to matching branches
   - Restrict pushes: ❌ (você é o único mantenedor)

8. Allow force pushes: ❌ NUNCA
   - Force pushes can destroy history

9. Allow deletions: ❌ NUNCA
   - Prevent accidental branch deletion
```

#### Como Configurar (GitHub CLI)

```bash
cd /Users/murillo/Dev/cellm

# Configurar branch protection
gh api repos/murillodutt/cellm/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["CI / validate","CI / marketplace","PR Check / pr-validation","PR Check / structure-check"]}' \
  --field enforce_admins=true \
  --field required_pull_request_reviews='{"dismiss_stale_reviews":true,"require_code_owner_reviews":false,"required_approving_review_count":1}' \
  --field restrictions=null \
  --field required_linear_history=true \
  --field allow_force_pushes=false \
  --field allow_deletions=false \
  --field required_conversation_resolution=true
```

#### Como Configurar (GitHub Web UI)

1. Acesse: https://github.com/murillodutt/cellm/settings/branches
2. Click "Add branch protection rule"
3. Branch name pattern: `main`
4. Configure conforme tabela acima
5. Salve as mudanças

---

## 2. CI/CD Pipeline (CRÍTICO)

### Problema Identificado

```
[-] ALTA: Workflow ci.yml verifica scripts bundled que foram removidos
    Arquivo: .github/workflows/ci.yml (linhas 93-102)
    Status: CI vai FALHAR após merge da branch transfer/plugin-2.0.5
```

### Detalhes do Problema

O workflow `ci.yml` ainda verifica a existência dos scripts bundled antigos:

```yaml
# LINHAS 93-102 (OBSOLETAS)
- name: Check bundled scripts exist
  run: |
    REQUIRED_SCRIPTS="cellm/scripts/mcp-server.cjs cellm/scripts/oracle-worker.cjs cellm/scripts/context-generator.cjs cellm/scripts/smart-install.js"
    for script in $REQUIRED_SCRIPTS; do
      if [ ! -f "$script" ]; then
        echo "::error::Missing bundled script: $script"
        exit 1
      fi
      echo "[+] Found: $script"
    done
```

**Esses arquivos não existem mais!** Foram substituídos por 10 shell scripts (.sh).

### Impacto

- **BLOQUEANTE**: CI vai FALHAR em todos os PRs após merge
- **BLOQUEANTE**: Impossível fazer merge de PRs futuros
- **ALTO**: Branch protection (quando configurada) vai bloquear merges

### Ação Corretiva Necessária

**Atualizar `.github/workflows/ci.yml`** para verificar shell scripts (.sh) ao invés de bundled (.cjs):

```yaml
# SUBSTITUIR linhas 93-102 por:
- name: Check shell scripts exist
  run: |
    REQUIRED_SCRIPTS="cellm/scripts/spawn-worker.sh cellm/scripts/health-check.sh cellm/scripts/configure-otel.sh cellm/scripts/capture-prompt.sh cellm/scripts/capture-context.sh cellm/scripts/inject-context.sh cellm/scripts/track-tool-use.sh cellm/scripts/auto-recovery.sh cellm/scripts/log-rotate.sh cellm/scripts/check-dependencies.sh"
    for script in $REQUIRED_SCRIPTS; do
      if [ ! -f "$script" ]; then
        echo "::error::Missing shell script: $script"
        exit 1
      fi
      if [ ! -x "$script" ]; then
        echo "::error::Script not executable: $script"
        exit 1
      fi
      echo "[+] Found and executable: $script"
    done
```

**TAMBÉM atualizar linha 113** (contagem de scripts):

```yaml
# ANTES (linha 113):
echo "| Scripts | $(ls cellm/scripts/*.{js,cjs} 2>/dev/null | wc -l | tr -d ' ') |" >> $GITHUB_STEP_SUMMARY

# DEPOIS:
echo "| Scripts | $(ls cellm/scripts/*.sh 2>/dev/null | wc -l | tr -d ' ') |" >> $GITHUB_STEP_SUMMARY
```

---

## 3. Merge Settings (ATENÇÃO)

### Situação Atual

```yaml
Merge Settings:
  - Merge commits: ✅ PERMITIDO
  - Squash merging: ✅ PERMITIDO
  - Rebase merging: ✅ PERMITIDO
  - Delete branch on merge: ❌ NÃO
```

### Recomendações

#### Problema: Múltiplas estratégias de merge

Ter 3 estratégias de merge habilitadas cria **inconsistência no histórico**:

- Merge commits: Cria commits de merge (histórico não linear)
- Squash: Condensa PR em 1 commit (perde granularidade)
- Rebase: Mantém commits individuais (histórico linear)

#### Recomendação: Escolher UMA estratégia

**Opção A: Squash + Delete branch (RECOMENDADO para público)**
```
PRO: Histórico limpo, 1 commit por feature
PRO: Fácil de reverter features completas
PRO: Branches automáticamente deletadas
CON: Perde commits intermediários
```

**Opção B: Rebase only (RECOMENDADO para privado)**
```
PRO: Histórico linear e detalhado
PRO: Mantém todos os commits
CON: Histórico mais volumoso
```

#### Como Configurar

```bash
# Opção A: Squash only
gh api repos/murillodutt/cellm \
  --method PATCH \
  --field squash_merge_allowed=true \
  --field merge_commit_allowed=false \
  --field rebase_merge_allowed=false \
  --field delete_branch_on_merge=true

# Opção B: Rebase only
gh api repos/murillodutt/cellm \
  --method PATCH \
  --field squash_merge_allowed=false \
  --field merge_commit_allowed=false \
  --field rebase_merge_allowed=true \
  --field delete_branch_on_merge=true
```

---

## 4. Security Policy (OK)

### Status

```
[+] SECURITY.md existe e está configurado
    Localização: .github/SECURITY.md
    Status: isSecurityPolicyEnabled=true
```

### Verificação

- [+] Arquivo existe
- [+] GitHub reconhece a política
- [i] Revisar conteúdo periodicamente

---

## 5. Workflows - Status Geral

### Workflows Existentes

| Workflow | Status | Ação Necessária |
|----------|--------|-----------------|
| ci.yml | [-] FALHA IMINENTE | Atualizar verificação de scripts |
| pr-check.yml | [+] OK | Nenhuma |
| release.yml | [?] NÃO VERIFICADO | Revisar compatibilidade com shell scripts |
| claude.yml | [+] OK | Nenhuma |

### Problema: ci.yml

Já detalhado na seção 2.

### Recomendação: release.yml

Verificar se o workflow de release lida corretamente com shell scripts ao invés de bundled. Se o release empacota ou distribui scripts, precisa ser atualizado.

---

## 6. Recomendações Adicionais

### 6.1 CODEOWNERS (Opcional)

Criar `.github/CODEOWNERS` para revisar automaticamente mudanças críticas:

```
# CODEOWNERS
# Require review from owner for critical files

# Plugin core
/cellm/.claude-plugin/ @murillodutt
/cellm/hooks/ @murillodutt
/cellm/scripts/ @murillodutt

# Security
/.github/workflows/ @murillodutt
/SECURITY.md @murillodutt
```

### 6.2 Dependabot (Recomendado)

Habilitar Dependabot para atualizar actions automaticamente:

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
```

### 6.3 ShellCheck Integration (Recomendado)

Adicionar validação de shell scripts no CI:

```yaml
# Adicionar ao ci.yml
- name: ShellCheck validation
  uses: ludeeus/action-shellcheck@master
  with:
    scandir: './cellm/scripts'
```

---

## Checklist de Ação Imediata

### ANTES de fazer merge da branch transfer/plugin-2.0.5

- [ ] **CRÍTICO**: Atualizar `.github/workflows/ci.yml` (linhas 93-102 e 113)
- [ ] **CRÍTICO**: Testar CI localmente ou em PR draft
- [ ] **ALTA**: Configurar branch protection para main
- [ ] **MÉDIA**: Decidir estratégia de merge (squash vs rebase)
- [ ] **MÉDIA**: Habilitar delete_branch_on_merge
- [ ] **BAIXA**: Revisar release.yml

### DEPOIS do merge

- [ ] Verificar CI passa com sucesso
- [ ] Testar novos comandos funcionam
- [ ] Atualizar CHANGELOG.md público com breaking change
- [ ] Criar release v2.0.5 no GitHub
- [ ] Adicionar ShellCheck ao CI (opcional)
- [ ] Criar CODEOWNERS (opcional)

---

## Resumo de Riscos

| Risco | Severidade | Probabilidade | Mitigação |
|-------|-----------|---------------|-----------|
| Push direto para main sem review | ALTA | ALTA | Branch protection |
| CI falhar após merge | ALTA | CERTA | Atualizar ci.yml ANTES do merge |
| Force push destruir histórico | ALTA | BAIXA | Branch protection (allow_force_pushes=false) |
| Branch main deletada | MÉDIA | MUITO BAIXA | Branch protection (allow_deletions=false) |
| Histórico inconsistente | BAIXA | MÉDIA | Escolher 1 estratégia de merge |

---

## Conclusão

O repositório público CELLM possui **2 problemas críticos** que precisam ser resolvidos **ANTES** do merge da branch `transfer/plugin-2.0.5`:

1. **Branch protection não configurada** - permite commits diretos, force push, deletion
2. **CI desatualizado** - vai FALHAR porque verifica scripts que não existem mais

**Ação Imediata Necessária**:
1. Atualizar `.github/workflows/ci.yml` na branch `transfer/plugin-2.0.5`
2. Configurar branch protection para `main`
3. Merge com segurança

**Estimativa de Tempo**: 15-20 minutos para resolver ambos os problemas.

---

**Auditoria Completa**: 2026-01-27 11:39 AM
**Próxima Revisão**: Após merge para main
