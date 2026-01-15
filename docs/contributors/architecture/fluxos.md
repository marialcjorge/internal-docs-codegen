# Fluxos

### 1. Inicialização e Handshake

```ascii
+-----------------------+        +---------------------+        +---------------------+        +--------+
| Dev (Terminal)        |        | Executor (Local)    |        | Backend (Remoto)    |        | Redis  |
+-----------------------+        +---------------------+        +---------------------+        +--------+
          |                               |                               |                        |
          | $ codegen "crie endpoint"     |                               |                        |
          |------------------------------>|                               |                        |
          |                               |  (Executor INICIA conexão)    |                        |
          |                               |------------------------------>|  WS Connect            |
          |                               |                               |----------------------->|
          |                               |<------------------------------|  Accepted              |
          |                               |------------------------------>|  Handshake (tools+ctx) |
          |                               |                               |  Valida + Toolbelt     |
          |                               |                               |----------------------->|  Save handshake
          |                               |<------------------------------|  Handshake OK          |
          |                               |                               |                        |
          v                               v                               v                        v

```

**Nota:** O **Executor** (cliente) é quem **inicia** a conexão, não o Backend.

### 2. Bootstrap e Context Loading

```ascii
+---------------------+        +---------------------+        +-------------------------+
| Backend (Cérebro)   |        | Executor (Mãos)     |        | File System (Local)     |
+---------------------+        +---------------------+        +-------------------------+
          |                               |                               |
          | run_tool(GetWorkingDirectory) |                               |
          |------------------------------>|                               |
          |                               |  pwd                          |
          |                               |------------------------------>|
          |                               |<------------------------------|  /home/user/project
          | tool_result(success, path)    |                               |
          |<------------------------------|                               |
          |                               |                               |
          | run_tool(ReadFolder, ".")     |                               |
          |------------------------------>|                               |
          |                               |  ls -la                       |
          |                               |------------------------------>|
          |                               |<------------------------------|  [lista de arquivos]
          | tool_result(success, files)   |                               |
          |<------------------------------|                               |
          |                               |                               |
          | Constrói BootstrapContext     |                               |
          |------------------------------>|  bootstrap_finished           |
          |                               |                               |
          v                               v                               v


```

**Nota:** O Backend **nunca acessa** o filesystem diretamente. Ele **pede** ao Executor.

### 3. Task Execution Loop

```ascii
+---------------------+        +-------------+        +---------------------+        +--------+
| Backend (Maestro)   |        | LLM Client  |        | Executor (Local)    |        | Redis  |
+---------------------+        +-------------+        +---------------------+        +--------+
          |                          |                          |                       |
          | prompt + contexto        |                          |                       |
          |------------------------->|                          |                       |
          |<-------------------------|  "preciso ler main.py"   |                       |
          |                          |                          |                       |
          | run_tool(ReadFile,main)  |                          |                       |
          |---------------------------------------------------->|                       |
          |                          |    fs.readFileSync(...)  |                       |
          |                          |<-------------------------|  tool_result(success) |
          |<----------------------------------------------------|                       |
          |                          |                          |                       |
          | continua com contexto    |                          |                       |
          |------------------------->|                          |                       |
          |<-------------------------|  "vou criar endpoint..." |                       |
          |                          |                          |                       |
          | publish logs/progresso   |                          |                       |
          |--------------------------------------------------------------->|  Stream log
          | agent_message_delta      |                          |                       |
          |---------------------------------------------------->|                       |
          v                          v                          v                       v


```

**Nota:** O Backend é o **cérebro** (decide), o Executor são as **mãos** (executa).

### 4. Tool Call Flow

```ascii
+---------------------+        +-------------+        +---------------------+        +-------------------+
| Backend (Maestro)   |        | LLM Client  |        | Executor (Local)    |        | OS / Shell         |
+---------------------+        +-------------+        +---------------------+        +-------------------+
          |                          |                          |                          |
          | pergunta/continua        |                          |                          |
          |------------------------->|                          |                          |
          |<-------------------------|  "usar Shell npm test"   |                          |
          |                          |                          |                          |
          | run_tool(Shell, uuid-123, params)                   |                          |
          |---------------------------------------------------->|                          |
          |                          |                          |  exec: npm test          |
          |                          |                          |------------------------->|
          |                          |                          |<-------------------------|  stdout/stderr+code
          | tool_result(uuid-123, success|error, stdout, stderr)|                          |
          |<----------------------------------------------------|                          |
          | valida + decide próximos passos                     |                          |
          v                          v                          v                          v

```

**Fluxo:**

1. Backend **decide** qual tool usar (via LLM)
2. Backend **envia** comando para Executor
3. Executor **executa** localmente (Shell, ReadFile, etc.)
4. Executor **retorna** resultado para Backend
5. Backend **valida** e decide próximo passo

### 5. Error Handling Flow
**(A) Erro de WebSocket / reconexão**
```ascii
+---------------------+        +---------------------+        +------------------+
| Executor (Local)    |        | Backend (Remoto)    |        | State/Reducer     |
+---------------------+        +---------------------+        +------------------+
          |                               |                          |
          | websocket error               |                          |
          |------------------------------>|                          |
          | DISPATCH(CONNECTION_ERROR)    |                          |
          |--------------------------------------------------------->|
          | reconnectWithBackoff()        |                          |
          |--- try 1 -------------------->|  connect                 |
          |<------------------------------|  fail                    |
          |--- try 2 -------------------->|  connect                 |
          |<------------------------------|  accepted                |
          | DISPATCH(CONNECTION_RESTORED) |                          |
          |--------------------------------------------------------->|
          v                               v                          v
```

**(B) Erro de Tool (backend recebe tool_result error e decide fallback)**
```ascii
+---------------------+        +---------------------+        +-------------+
| Backend (Maestro)   |        | Executor (Local)    |        | LLM Client   |
+---------------------+        +---------------------+        +-------------+
          |                               |                          |
          | run_tool(tool_id=uuid-999)    |                          |
          |------------------------------>|                          |
          |                               | executa tool e falha     |
          |                               |--------------------------|
          | tool_result(status=error, err)|                          |
          |<------------------------------|                          |
          | anexa erro ao histórico       |                          |
          |------------------------------>|  (interno)               |
          | replanejar com erro no ctx    |                          |
          |--------------------------------------------------------->|
          |<---------------------------------------------------------|  "tentar alternativa / abortar"
          v                               v                          v

```
