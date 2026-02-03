# DocOps Plugin

Plugin opcional para manutencao de documentacao com foco em LLM-first, evidencia de codigo e controle de drift.

## Objetivo
- Padronizar estrutura de docs.
- Evitar degradacao e desatualizacao.
- Separar fonte de verdade, evidencia e operacao.

## Comandos
- `/docops-init`: cria estrutura e templates.
- `/docops-sync`: atualiza code-evidence, gaps e docs derivadas.
- `/docops-verify`: valida estrutura e links.

## Configuracao
Crie `.claude/docops.json` no projeto. Exemplo:

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

## Hooks (opcionais)
- Desabilitado por default.
- Ative com `"hooksEnabled": true`.
- Logs: `.claude/docops-hook.log`.

## Templates
Os templates ficam em `templates/`:
- `templates/en/`
- `templates/pt-BR/`

## Referencias
- Guia rapido: `docs/README.md`
