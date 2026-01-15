# Relacionamentos entre Conceitos

```ascii
┌──────────────┐   1:1   ┌──────────────┐   1:*   ┌──────────────┐   1:*   ┌──────────────┐   1:1   ┌──────────────┐
│     Task     │────────▶│   Session    │────────▶│  Generation   │────────▶│   ToolCall    │────────▶│  ToolResult   │
│──────────────│  has     │──────────────│ produces│──────────────│ makes   │──────────────│ produces│──────────────│
│ id (PK)      │         │ id (PK)      │         │ id (PK)      │         │ id (PK)       │         │ id (PK)       │
│ prompt       │         │ task_id (FK) │         │ task_id (FK) │         │ name          │         │ tool_call_id  │
│ status       │         │ user_id      │         │ session_idFK │         │ arguments     │         │ success       │
│ repo_url     │         │ status       │         │ gen_index    │         │ generation_id │         │ result        │
│ created_at   │         │ ttl_seconds  │         │ model_name   │         │ created_at    │         │ error         │
└──────────────┘         └──────────────┘         └──────────────┘         └──────────────┘         └──────────────┘


                         1:* contains
                 ┌──────────────────────────────┐
                 │     ConversationMessage      │
                 │──────────────────────────────│
                 │ id (PK)                      │
                 │ role                         │
                 │ content                      │
                 │ timestamp                    │
                 │ metadata                     │
                 │ tool_calls / tool_results    │
                 └──────────────────────────────┘


1:* generates
┌──────────────┐                 0..1 references
│   TaskLog    │───────────────────────────────▶┌──────────────┐
│──────────────│                                │   ToolCall    │
│ id (PK)      │                                └──────────────┘
│ task_id (FK) │
│ action       │
│ tool_name    │
│ payload      │
│ success      │
└──────────────┘

```

:::tip Próximas Seções

-  **[API Reference](../api/endpoints.md)** - Documentação completa dos endpoints
-  **[Configuração](../ops/configuration.md)** - Variáveis de ambiente e setup
-  **[Observabilidade](../ops/observability.md)** - Logs, métricas e debugging
  :::

