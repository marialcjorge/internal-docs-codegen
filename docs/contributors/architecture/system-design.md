# Arquitetura Completa do Sistema

## Visão Geral

O **CodeGen** é um sistema distribuído **Cliente-Servidor** com comunicação bidirecional que combina:

- **Backend (Maestro):** Python/FastAPI - Orquestração inteligente e processamento LLM
- **Executor (CLI):** TypeScript/Node.js - Execução local de ferramentas e interação com repositório
- **Protocolo WebSocket:** Handshake + contract-based tools para comunicação assíncrona

:::info Paradigma Arquitetural
Diferente de sistemas monolíticos, o CodeGen separa **inteligência** (backend) de **execução** (cliente), permitindo que o LLM orquestre ações sem acesso direto ao sistema de arquivos do usuário.
:::

### Quem Conecta em Quem?

**IMPORTANTE:** O **Executor (CLI)** **inicia** a conexão com o Backend, não o contrário:

1. Desenvolvedor digita um prompt no terminal
2. **Executor (local)** conecta no **Backend** via WebSocket
3. **Backend** orquestra e **envia comandos** para o Executor
4. **Executor** executa comandos **localmente** e retorna resultados
5. **Backend** valida e decide próximos passos

**O Backend NUNCA acessa diretamente o sistema de arquivos do usuário.**

## Arquitetura 

```ascii
┌──────────────────────────────┐
│          DESENVOLVEDOR        │
│        (Terminal / CLI)       │
│                              │
│  $ codegen "crie endpoint"    │
└───────────────┬──────────────┘
                │ (1) comando
                ▼
┌──────────────────────────────┐          (3) CONTROLE / ORQUESTRAÇÃO
│     EXECUTOR LOCAL (CLI)      │◀────────────────────────────────────┐
│     Node.js / TypeScript      │                                     │
│     Roda na máquina do dev    │                                     │
│                              │                                     │
│  EXECUTA AÇÕES REAIS          │                                     │
│  - Read/Edit/Write files     │                                     │
│  - Shell / Build / Tests     │                                     │
│  - WebFetch / Clipboard      │                                     │
│                              │                                     │
│  🔴 Não decide estratégia     │                                     │
│  🔴 Não planeja               │                                     │
└───────────────┬──────────────┘                                     │
                │ (2) abertura WS                                    │
                ▼                                                     │
══════════════════════════════════════════════════════════════════════
        CANAL WEBSOCKET BIDIRECIONAL (TEMPO REAL)
══════════════════════════════════════════════════════════════════════
                ▲                                                     │
                │ (5) RESULTADOS / EVENTOS                            │
                │     ToolResults / stdout / status                   │
                │                                                     │
┌───────────────┴──────────────┐                                     │
│    BACKEND REMOTO (SERVIDOR)  │─────────────────────────────────────┘
│    Python / FastAPI           │
│    Roda no servidor           │
│                              │
│  ORQUESTRA / DECIDE           │
│  - Interpreta pedido          │
│  - Cria sessão/run            │
│  - Planeja passos             │
│  - Decide ações               │
│  - Coordena executores        │
│                              │
│  COMPONENTES:                 │
│  - Maestro (CÉREBRO)          │
│  - Toolbelt Manager           │
│  - ExecutorCommunicator       │
│  - Safeguards                 │
│  - LLM Client (OpenAI)        │
└───────────────┬──────────────┘
                │ (6) persistência
                ▼
┌──────────────────────────────┐
│        INFRAESTRUTURA         │
│  Postgres (tasks/logs)        │
│  Redis (sessions/streams)    │
└──────────────────────────────┘

```

### Pontos-Chave:

1. **Executor** roda **localmente** na máquina do desenvolvedor
2. **Backend** roda em **servidor remoto** (stateless)
3. **Executor INICIA** a conexão WebSocket com o Backend
4. **Backend NÃO tem acesso** ao filesystem do desenvolvedor
5. **Backend ENVIA comandos**, Executor EXECUTA localmente

## Protocolo de Comunicação WebSocket

Este protocolo define o CONTRATO FORMAL de comunicação entre Backend e Executor.
Qualquer implementação de Executor (CLI, VM, sandbox, etc.) DEVE respeitar este formato.

### Phase 1: Handshake 
**Objetivo:**
Estabelecer conexão, identificar o cliente e informar ao Backend quais ferramentas o Executor suporta.

**Estado após a fase:**
O Backend cria a sessão e conhece as capacidades do Executor.

**Estrutura da mensagem (Executor → Backend)**

```typescript
{
  "type": "handshake",
  "payload": {
    "client_type": "string",
    "initial_prompt": "string",
    "known_tools": ["string"],
    "custom_tools": [],
    "project_spec": {
      "content": "string",
      "file_paths": ["string"]
    }
  }
}
```
**Exemplo**

```typescript
{
  "type": "handshake",
  "payload": {
    "client_type": "cli",
    "initial_prompt": "crie um endpoint REST",
    "known_tools": ["Shell", "ReadFile", "WriteFile", "Edit"],
    "custom_tools": [],
    "project_spec": {
      "content": "...", 
      "file_paths": ["src/", "package.json"]
    }
  }
}
```

### Phase 2: Bootstrap 

**Objetivo:**
Coletar contexto inicial obrigatório antes de iniciar o ciclo de decisão.

**Estado após a fase:**
O Backend possui contexto suficiente para planejar a execução.

```python
# Backend executa automaticamente:
bootstrap_commands = [
    ("GetWorkingDirectory", {}),
    ("ReadFolder", {"dir_path": "."}),
    ("ReadFile", {"file_path": ".codegen/plan.md"}),
    ("Shell", {"command": "git log --oneline -10"})
]
```

### Phase 3: Execution Loop 

**Objetivo:**
Executar o ciclo decidir → executar → observar até conclusão.
Este loop se repete até o Backend decidir encerrar a run por:
- sucesso,
- erro,
- interrupção externa.

**Estrutura da mensagem (Backend → Executor)**
```typescript
{
  "type": "run_tool",
  "payload": {
    "tool_name": "string",
    "tool_id": "string",
    "generation_id": "string",
    "parameters": {}
  }
}
```

**Exemplo**

```typescript
// Backend → Executor (tool call)
{
  "type": "run_tool",
  "payload": {
    "tool_name": "ReadFile",
    "tool_id": "uuid-123",
    "generation_id": "gen-456", 
    "parameters": {"file_path": "src/main.py"}
  }
}

// Executor → Backend (tool result)
{
  "type": "tool_result", 
  "payload": {
    "tool_id": "uuid-123",
    "status": "success",
    "result": "conteúdo do arquivo...",
    "generation_id": "gen-456"
  }
}
```

### Phase 4: Streaming 
**Objetivo:**
Enviar atualizações incrementais de estado e mensagens ao usuário em tempo real.

**Estado após a fase:**
A UI/CLI reflete o progresso da execução conforme ela acontece.

```typescript
// Backend → Frontend (via Redis Stream)
{
  "type": "agent_message_delta",
  "payload": {
    "generation_id": "gen-456",
    "content": "Vou criar o endpoint..."
  }
}
```