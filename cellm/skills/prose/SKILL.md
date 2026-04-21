---
description: "cellm:prose — override temporario de superficie para prosa normal, com TTL e retorno deterministico para quantization."
cellm_scope: universal
user-invocable: true
argument-hint: "[on|off|level <off|minimal|full>|status]"
---

# cellm:prose

Habilita override cross-skill de prosa (ADR-004), sem quebrar o default de
quantization.

## Contrato

- Flag ativa: `~/.cellm/prose/.active`
- Config: `~/.cellm/prose/config.json`
- TTL suportado: `turn | block | session | explicit`
- Niveis:
  - `off`: sem override (volta para quantization padrao)
  - `minimal`: baixa pressao (equivale banda `safe`)
  - `full`: prosa normal (equivale banda `off`)

## Operacoes

- `/cellm:prose` -> ativa com defaults de config
- `/cellm:prose on` -> ativa override
- `/cellm:prose off` -> remove override
- `/cellm:prose level <off|minimal|full>` -> troca nivel sem perder TTL
- `/cellm:prose status` -> mostra estado sanitizado

## Runtime Check (quantization-aware)

Antes de comprimir entrada/saida:

1. Ler `~/.cellm/prose/.active`.
2. Se ausente/expirado -> seguir policy de settings (`band + intensity`).
3. Se `level=minimal` -> forcar banda efetiva `safe`.
4. Se `level=full` -> forcar banda efetiva `off` (pass-through).
5. Se `level=off` -> sem override.
