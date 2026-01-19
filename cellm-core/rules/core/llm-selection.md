---
id: ARCH-002
version: v0.10.0
status: OK
budget: ~500 tokens
---

# Estrategia de Selecao Dinamica de LLM

O CELLM CLI deve orientar o desenvolvedor na escolha do modelo ideal para cada tarefa, visando o equilibrio entre precisao analitica e economia de tokens.

## Matriz de Decisao

| Complexidade | Modelo Recomendado | Casos de Uso | Justificativa |
| :--- | :--- | :--- | :--- |
| **Baixa** | `claude-haiku` | `/status`, `/metrics`, validacoes simples de syntax, logs. | Rapidez e custo minimo para tarefas deterministicas. |
| **Media** | `claude-sonnet` | `/implement`, `/verify`, refatoracao de codigo, analise de patterns. | Melhor equilibrio entre inteligencia e velocidade. |
| **Alta** | `claude-opus` | `/plan-product`, `/write-spec`, resolucao de conflitos arquiteturais complexos. | Maximo raciocinio para decisoes estruturais criticas. |

## Criterios de Escalonamento

1. **Volume de Contexto**: Se o contexto carregado exceder 1500 tokens em uma tarefa de media complexidade, considerar `Sonnet` em vez de `Haiku` para manter a coerencia.
2. **Severidade do Erro**: Em casos de falha persistente em `/verify`, o sistema deve sugerir o escalonamento para `Opus` para uma analise de causa raiz.
3. **Custo-Beneficio**: Tarefas repetitivas de boilerplate devem ser forcadas para `Haiku`.

## Implementacao

A selecao de modelo e feita NO INICIO da sessao, antes de executar o comando:

```
1. Desenvolvedor digita: /implement
2. CELLM CLI detecta o comando
3. CELLM CLI consulta esta regra (ARCH-002)
4. CELLM CLI exibe: "Comando /implement requer Sonnet. Continuar? [Y/n]"
5. Desenvolvedor confirma
6. Claude Code inicia sessao com Sonnet
```

**Nota:** O modelo NAO pode ser trocado durante a sessao.
