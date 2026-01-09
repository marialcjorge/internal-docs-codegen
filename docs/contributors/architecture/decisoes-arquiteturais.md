# Decisões Arquiteturais

### 🎯 Por que Client-Server?

- **Segurança**: LLM não tem acesso direto ao filesystem
- **Flexibilidade**: Múltiplos tipos de executor (CLI, IDE, Web)
- **Performance**: Backend pode rodar em servidores otimizados
- **Manutenibilidade**: Atualizações independentes de backend e executor

### 🔌 Por que WebSocket?

- **Real-time**: Logs e progresso em tempo real
- **Bidirectional**: Comandos e resultados fluem nos dois sentidos
- **Low Latency**: Conexão persistente evita overhead HTTP
- **Streaming**: Ideal para dados contínuos (logs, deltas)

### 📋 Por que Contract-Based Tools?

- **Type Safety**: Tools são validadas estaticamente
- **Extensibilidade**: Novas tools sem mudanças no backend
- **🛡Robustez**: Falhas isoladas por tool
- **Testabilidade**: Mocking de tools específicas

### 🚀 Por que Bootstrap Phase?

- **Contexto Rico**: LLM já inicia com informações do projeto
- **Eficiência**: Evita descoberta manual via comandos
- **Determinístico**: Sempre coleta as mesmas informações base
- **Reutilizável**: Context persiste durante a sessão

## 📈 Escalabilidade

### 🎯 Design Atual

- **Stateless Backend**: Sessões no Redis, não em memória
- **Async Nativo**: FastAPI + SQLAlchemy async
- **Connection Pooling**: PostgreSQL e Redis otimizados
- **Redis Streams**: Pub/sub escalável para logs

### 🚀 Roadmap (Múltiplos Executors)

- **Load Balancing**: Distribuição inteligente de tasks
- **Task Queues**: Filas assíncronas para execução
- **Horizontal Scaling**: Múltiplas instâncias do backend
- **Resource Management**: Limits per executor/task

### 📊 Métricas de Escalabilidade

| Métrica                        | Atual  | Meta  |
| ------------------------------- | ------ | ----- |
| **Concurrent Sessions**   | ~100   | ~1000 |
| **Tool Calls/min**        | ~500   | ~5000 |
| **WebSocket Connections** | ~100   | ~1000 |
| **Redis Memory**          | ~100MB | ~1GB  |

:::tip Próximos Conceitos
Para entender melhor os **conceitos fundamentais** (Task, Agent, Session), consulte [Conceitos Fundamentais](./concepts.md).
:::

:::warning Evolução Contínua
Esta arquitetura está em **desenvolvimento ativo**. O protocolo WebSocket e schemas podem evoluir. Consulte sempre o código fonte para a versão mais atualizada.
:::