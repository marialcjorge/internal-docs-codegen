# Arquitetura Completa do Sistema

## Visão Geral

O **CodeGen** é um sistema distribuído **Cliente-Servidor** com comunicação bidirecional que combina:

- 🎯 **Backend (Maestro):** Python/FastAPI - Orquestração inteligente e processamento LLM
- ⚡ **Executor (CLI):** TypeScript/Node.js - Execução local de ferramentas e interação com repositório
- 🔌 **Protocolo WebSocket:** Handshake + contract-based tools para comunicação assíncrona

:::info Paradigma Arquitetural
Diferente de sistemas monolíticos, o CodeGen separa **inteligência** (backend) de **execução** (cliente), permitindo que o LLM orquestre ações sem acesso direto ao sistema de arquivos do usuário.
:::

### 🔄 Quem Conecta em Quem?

**IMPORTANTE:** O **Executor (CLI)** **inicia** a conexão com o Backend, não o contrário:

1. 👨‍💻 Desenvolvedor digita no terminal: `codegen "crie um endpoint"`
2. ⚡ **Executor (local)** conecta no **Backend** via WebSocket
3. 🎯 **Backend** orquestra e **envia comandos** para o Executor
4. ⚡ **Executor** executa comandos **localmente** e retorna resultados
5. 🎯 **Backend** valida e decide próximos passos

**O Backend NUNCA acessa diretamente o sistema de arquivos do usuário.**

## 🎯 Arquitetura de Alto Nível

```ascii
┌─────────────────────────────────────────────────────────────┐
│                    DESENVOLVEDOR                             │
│                   (Terminal / CLI)                           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ $ codegen "crie um endpoint REST"
                     ▼
        ┌────────────────────────────┐
        │   EXECUTOR (Client LOCAL)   │  ◄── RODA NA MÁQUINA DO DEV
        │    TypeScript/Node.js       │
        ├─────────────────────────────┤
        │ • WebSocket Client          │
        │ • State Reducer (Redux)     │
        │ • Local Tools:              │
        │   - Edit, ReadFile, Shell   │
        │   - FindFiles, SearchText   │
        │   - WriteFile, WebFetch     │
        │ • Clipboard Handler         │
        │ • Version Check             │
        └────────────┬────────────────┘
                     │
                     │ ⬆️ EXECUTOR INICIA CONEXÃO
                     │ WebSocket (bidirectional)
                     │ ┌─ Handshake (tools disponíveis)
                     │ ├─ ToolCalls (comandos do LLM) ⬇️
                     │ ├─ ToolResults (resultados de execução) ⬆️
                     │ └─ Streaming (logs em tempo real) ⬇️
                     ▼
        ┌────────────────────────────┐
        │  BACKEND (Maestro REMOTO)   │  ◄── RODA EM SERVIDOR
        │     Python/FastAPI          │
        ├─────────────────────────────┤
        │ • API Controllers           │
        │ • Maestro (Orchestrator)    │  ◄── "CÉREBRO"
        │ • ExecutorCommunicator      │
        │ • Bootstrap Runner          │
        │ • Toolbelt Manager          │
        │ • Safeguards (Loop detect)  │
        │ • LLM Client (OpenAI)       │
        └────────────┬────────────────┘
                     │
                     │ Persistence & Streaming
                     ▼
        ┌────────────────────────────┐
        │    INFRAESTRUTURA           │
        ├─────────────────────────────┤
        │ • PostgreSQL (Tasks/Logs)   │
        │ • Redis (Sessions/Streams)  │
        └─────────────────────────────┘

LEGENDA:
⬆️ = Fluxo do Executor para Backend
⬇️ = Fluxo do Backend para Executor
```

### 🔑 Pontos-Chave:

1. **Executor** roda **localmente** na máquina do desenvolvedor
2. **Backend** roda em **servidor remoto** (stateless)
3. **Executor INICIA** a conexão WebSocket com o Backend
4. **Backend NÃO tem acesso** ao filesystem do desenvolvedor
5. **Backend ENVIA comandos**, Executor EXECUTA localmente

## Protocolo de Comunicação WebSocket

### Phase 1: Handshake 🤝

```typescript
// Executor → Backend
{
  "type": "handshake",
  "payload": {
    "client_type": "cli",
    "initial_prompt": "crie um endpoint REST",
    "known_tools": ["Shell", "ReadFile", "WriteFile", "Edit"],
    "custom_tools": [],
    "project_spec": {
      "content": "...", // conteúdo do CODEGEN.md
      "file_paths": ["src/", "package.json"]
    }
  }
}
```

### Phase 2: Bootstrap 🚀

```python
# Backend executa automaticamente:
bootstrap_commands = [
    ("GetWorkingDirectory", {}),
    ("ReadFolder", {"dir_path": "."}),
    ("ReadFile", {"file_path": ".codegen/plan.md"}),
    ("Shell", {"command": "git log --oneline -10"})
]
```

### Phase 3: Execution Loop 🔄

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

### Phase 4: Streaming 📡

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