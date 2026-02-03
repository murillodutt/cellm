# DocOps - Guia rapido

## 1) Inicializacao

```text
/docops:init
```

Resultado:
- Estrutura minima criada
- Templates aplicados sem sobrescrever arquivos existentes

## 2) Sincronizacao

```text
/docops:sync
```

Resultado:
- `reference/code-evidence/*` atualizado primeiro
- `reference/conveyor-gaps.md` atualizado em seguida
- SPEC/REF/HOWTO/RUNBOOK alinhados

## 3) Verificacao

```text
/docops:verify
```

Resultado:
- Estrutura valida
- Links para conveyor e code-evidence presentes
- Uso correto de DEVE/NÃO DEVE/DEVERIA/PODE

## Configuracao

Arquivo: `.claude/docops.json`

```json
{
  "docRoot": "docs/technical",
  "conveyorFile": "project-conveyor.md",
  "language": "en",
  "hooksEnabled": false
}
```

Observacao:
- Defina `language` conforme a regra de idioma do projeto em `CLAUDE.md`.

## Regras-chave
- Uma verdade por lugar.
- Evidencia antes de derivar docs.
- Conflitos sempre em `conveyor-gaps.md`.
