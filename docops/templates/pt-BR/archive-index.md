# Indice do Arquivo

Este diretorio contem documentacao arquivada que foi deprecada e removida do uso ativo.

## Metadados
- Ultima atualizacao: YYYY-MM-DD
- Total arquivado: N arquivos
- Politica de retencao: minimo 90 dias

## Como Restaurar

Para restaurar um documento arquivado:
```
/docops:restore <caminho-arquivo>
```

Exemplo:
```
/docops:restore 2026-02/auth.spec.md
```

## Conteudo do Arquivo

### YYYY-MM

| Arquivo | Local Original | Arquivado Em | Motivo | Substituto |
|---------|----------------|--------------|--------|------------|
| exemplo.spec.md | specs/exemplo.spec.md | YYYY-MM-DD | Motivo | [substituto](caminho) |

## Politica de Retencao

- **Retencao minima:** 90 dias
- **Exclusao definitiva:** Somente via `/docops:prune --delete-archived`
- **ADRs:** Nunca arquivados (registro permanente)

## Notas

- Arquivos arquivados mantem frontmatter original mais metadados de arquivo
- Referencias para arquivos arquivados sao marcadas com `[ARQUIVADO]`
- Restauracao sempre possivel enquanto arquivo existir no archive
