---
id: overview
title: Visão Geral Técnica
sidebar_label: Visão Geral
description: Introdução ao CodeGen e seus objetivos
---

import Admonition from '@theme/Admonition';

# Visão Geral Técnica

O **CodeGen** é um assistente de geração de código avançado que opera via CLI. Ele atua como um agente orquestrador capaz de manipular diretamente o repositório de código, executar comandos de build e teste, e validar suas próprias alterações.

## O que o sistema faz

- **Geração** de código com contexto profundo.
- **Execução autônoma** de comandos.
- **Orquestração de tarefas complexas** via Agentes (Maestro).

## O que não faz

- Não é apenas um "autocomplete" de código
- Não substitui totalmente a revisão humana (possui guardrails)
- Não executa sem um contexto de sessão definido


## Tech Stack

| Componente | Tecnologia                                |
|------------|-------------------------------------------|
| Backend | Python (FastAPI)                          |
| Orquestração | Maestro - Engine proprietária de agentes. |
| Comunicação | WebSockets & Redis Streams - Para feedback em tempo real                        |
| Banco de Dados | PostgreSQL (SQLAlchemy) & Redis (Cache/Sessão).                               |

:::info Nota de Arquitetura
O sistema não é apenas um autocomplete, ele é um agente orquestrador completo.
:::