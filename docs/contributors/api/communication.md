# WebSocket Protocol

### Conexão WebSocket

A comunicação em tempo real com o Maestro acontece via WebSocket bidirecional:

```javascript
const ws = new WebSocket(
  "wss://api.codegen.com/v1/ws/tasks/550e8400-e29b-41d4-a716-446655440000/stream",
  [], // subprotocols
  {
    headers: {
      "Authorization": "Bearer cgn_1234567890abcdef"
    }
  }
);
```

### Mensagens do Protocolo

#### Mensagens do Cliente → Servidor

**1. Handshake (Inicial):**

```json
{
  "type": "handshake",
  "payload": {
    "client_type": "web" | "cli" | "ide",
    "client_version": "1.0.0",
    "capabilities": ["interactive_approval", "file_preview"]
  }
}
```

**2. Tool Approval:**

```json
{
  "type": "tool_approval",
  "payload": {
    "tool_call_id": "call-123",
    "approved": true,
    "modifications": {
      "command": "npm install --save-dev pytest"  // Modificação do comando
    }
  }
}
```

**3. User Input:**

```json
{
  "type": "user_input",
  "payload": {
    "input_request_id": "input-456",
    "response": "Prefiro usar FastAPI em vez de Flask"
  }
}
```

#### Mensagens do Servidor → Cliente

**1. Handshake Acknowledgment:**

```json
{
  "type": "handshake_ack",
  "payload": {
    "session_id": "session-789",
    "capabilities_accepted": ["interactive_approval"],
    "server_version": "1.0.0"
  }
}
```

**2. Agent Message (Streaming):**

```json
{
  "type": "agent_message",
  "payload": {
    "content": "Analisando a estrutura do projeto...",
    "message_type": "thinking" | "planning" | "executing" | "observing",
    "is_partial": true  // true para streaming, false para mensagem completa
  }
}
```

**3. Tool Call Request:**

```json
{
  "type": "tool_call_request",
  "payload": {
    "tool_call_id": "call-123",
    "tool_name": "Shell",
    "arguments": {
      "command": "rm -rf node_modules",
      "working_directory": "."
    },
    "risk_level": "high",  // low, medium, high
    "requires_approval": true,
    "preview": "Este comando irá remover a pasta node_modules"
  }
}
```

**4. Tool Result:**

```json
{
  "type": "tool_result",
  "payload": {
    "tool_call_id": "call-123",
    "success": true,
    "result": "Pasta node_modules removida com sucesso",
    "execution_time_ms": 1500,
    "files_affected": ["node_modules/"]
  }
}
```

**5. Input Request:**

```json
{
  "type": "input_request",
  "payload": {
    "input_request_id": "input-456",
    "question": "Qual framework web você prefere: Flask ou FastAPI?",
    "input_type": "choice",
    "options": ["Flask", "FastAPI"],
    "timeout_seconds": 300
  }
}
```

**6. Status Update:**

```json
{
  "type": "status_update",
  "payload": {
    "status": "RUNNING",
    "progress": {
      "current_step": 4,
      "total_steps": 10,
      "completion_percentage": 40.0
    },
    "current_action": "Executando testes unitários..."
  }
}
```

**7. Task Completed:**

```json
{
  "type": "task_completed",
  "payload": {
    "task_id": "550e8400-e29b-41d4-a716-446655440000",
    "final_status": "COMPLETED",
    "summary": "API REST criada com sucesso. 5 arquivos modificados, 23 testes adicionados.",
    "files_changed": [
      "app/models/user.py",
      "app/controllers/user_controller.py",
      "tests/test_user_api.py"
    ],
    "execution_time_seconds": 1800,
    "total_cost_usd": 2.45
  }
}
```
