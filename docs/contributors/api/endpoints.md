# API Reference

# Visão Geral

A **API REST do CodeGen** fornece endpoints para criar e gerenciar tasks de desenvolvimento, interagir com o Maestro via WebSocket, e monitorar execuções em tempo real.

- **Base URL:** `https://api.codegen.com/v1`
- **Versão:** `v1.0`
- **Autenticação:** Bearer Token (API Key)
- **Formato:** JSON (Content-Type: application/json)
- **WebSocket:** Para interação bidirecional em tempo real
- **SSE:** Para streaming de atualizações (apenas leitura)

:::info Arquitetura da API
A API segue padrões RESTful com extensões para **comunicação em tempo real**:

- **REST** para operações CRUD (Create, Read, Update, Delete)
- **WebSocket** para interação bidirecional com o Maestro
- **Server-Sent Events** para streaming de logs e atualizações
  :::

---

##  Autenticação

### API Keys

Todas as requisições devem incluir um **Bearer Token** no header `Authorization`:

```http
Authorization: Bearer cgn_1234567890abcdef
```

### Obter API Key

```bash
# Via CLI do CodeGen
codegen auth login

# Via Dashboard Web
https://dashboard.codegen.com/api-keys
```

### Headers Obrigatórios

```http
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY
User-Agent: CodeGen-Client/1.0
```

---

## Base URL e Versionamento

###  URLs de Ambiente

| Ambiente              | Base URL                               | Descrição               |
| --------------------- | -------------------------------------- | ------------------------- |
| **Production**  | `https://api.codegen.com/v1`         |  Produção estável    |
| **Staging**     | `https://staging-api.codegen.com/v1` |  Testes pré-produção |
| **Development** | `http://localhost:8000/v1`           | Desenvolvimento local  |

###  Versionamento

```http
# Versão via URL (recomendado)
GET https://api.codegen.com/v1/tasks

# Versão via Header (alternativo)
GET https://api.codegen.com/tasks
Accept: application/vnd.codegen.v1+json
```

---

## Resumo dos Endpoints

| Método    | Endpoint                         | Descrição                     | Autenticação  |
| ---------- | -------------------------------- | ----------------------------- | --------------- |
| `POST`   | `/tasks`                       |Cria nova tarefa de desenvolvimento |  Obrigatória |
| `GET`    | `/tasks/{task_id}`             | Recupera informações de uma tarefa | Obrigatória |
| `GET`    | `/tasks/{task_id}/logs`        | Recupera logs históricos da tarefa |  Obrigatória |
| `POST`   | `/tasks/{task_id}/actions`     | Envia ação manual para o Maestro |  Obrigatória |
| `DELETE` | `/tasks/{task_id}`             | Cancela tarefa em execução    |  Obrigatória |
| `WS`     | `/ws/tasks/{task_id}/stream`   | Canal bidirecional com Maestro |  Obrigatória |
| `GET`    | `/sse/tasks/{task_id}/updates` | Stream de atualizações (read-only) |  Obrigatória |
| `GET`    | `/healthz`                     | Health check (Liveness)       | Pública     |
| `GET`    | `/readiness`                   | Readiness check               |  Pública     |

---

## Endpoints Detalhados

### POST /tasks

Cria uma nova tarefa de desenvolvimento que será executada pelo Maestro.

#### Request

```http
POST /v1/tasks
Content-Type: application/json
Authorization: Bearer cgn_1234567890abcdef
```

**Body Schema:**

```typescript
interface TaskCreateRequest {
  prompt: string;                    // Descrição da tarefa (obrigatório)
  repo_url?: string;                 // URL do repositório (opcional)
  branch?: string;                   // Branch específica (default: main)
  working_directory?: string;        // Diretório de trabalho (default: .)
  auto_approve_tools?: boolean;      // Auto-aprovar ferramentas simples
  max_iterations?: number;           // Limite de iterações (default: 10)
  context_files?: string[];          // Arquivos de contexto iniciais
  preferences?: TaskPreferences;     // Preferências específicas
}

interface TaskPreferences {
  code_style?: "pep8" | "black" | "google";
  test_framework?: "pytest" | "unittest" | "nose";
  documentation?: "sphinx" | "mkdocs" | "none";
  ai_model?: "gpt-4" | "gpt-3.5-turbo" | "claude-3";
}
```

**Exemplo:**

```json
{
  "prompt": "Crie uma API REST para gerenciamento de usuários com endpoints CRUD, autenticação JWT e testes unitários",
  "repo_url": "https://github.com/myorg/user-api",
  "branch": "feature/user-management",
  "working_directory": "./backend",
  "auto_approve_tools": false,
  "max_iterations": 15,
  "context_files": ["CODEGEN.md", "requirements.txt"],
  "preferences": {
    "code_style": "black",
    "test_framework": "pytest",
    "documentation": "sphinx",
    "ai_model": "gpt-4"
  }
}
```

#### Response

**Status Codes:**

- `201 Created` - Tarefa criada com sucesso
- `400 Bad Request` - Parâmetros inválidos
- `401 Unauthorized` - Token inválido
- `429 Too Many Requests` - Rate limit excedido
- `500 Internal Server Error` - Erro interno

**Response Schema:**

```typescript
interface TaskCreateResponse {
  task: {
    id: string;                      // UUID da tarefa
    status: TaskStatus;              // Estado inicial (PENDING)
    prompt: string;                  // Prompt fornecido
    repo_url?: string;               // Repositório
    branch?: string;                 // Branch
    created_at: string;              // ISO timestamp
    estimated_duration_min?: number; // Estimativa de duração
    websocket_url: string;           // URL para conectar WebSocket
    sse_url: string;                 // URL para Server-Sent Events
  };
}

type TaskStatus = "PENDING" | "RUNNING" | "COMPLETED" | "FAILED" | "CANCELLED";
```

**Exemplo de Response:**

```json
{
  "task": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "PENDING",
    "prompt": "Crie uma API REST para gerenciamento de usuários...",
    "repo_url": "https://github.com/myorg/user-api",
    "branch": "feature/user-management",
    "created_at": "2024-01-15T10:30:00Z",
    "estimated_duration_min": 45,
    "websocket_url": "wss://api.codegen.com/v1/ws/tasks/550e8400-e29b-41d4-a716-446655440000/stream",
    "sse_url": "https://api.codegen.com/v1/sse/tasks/550e8400-e29b-41d4-a716-446655440000/updates"
  }
}
```

#### Outros exemplos

**cURL:**

```bash
curl -X POST https://api.codegen.com/v1/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer cgn_1234567890abcdef" \
  -d '{
    "prompt": "Adicione testes unitários para a classe UserService",
    "repo_url": "https://github.com/myorg/backend",
    "auto_approve_tools": true
  }'
```



### GET /tasks/

Recupera informações detalhadas de uma tarefa específica.

#### Request

```http
GET /v1/tasks/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer cgn_1234567890abcdef
```

####  Response

```json
{
  "task": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "RUNNING",
    "prompt": "Crie uma API REST para gerenciamento de usuários...",
    "repo_url": "https://github.com/myorg/user-api",
    "branch": "feature/user-management",
    "working_directory": "./backend",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:45:23Z",
    "started_at": "2024-01-15T10:32:15Z",
    "completed_at": null,
    "progress": {
      "current_step": 3,
      "total_steps": 8,
      "current_action": "Executando testes unitários...",
      "completion_percentage": 37.5
    },
    "metrics": {
      "tools_executed": 12,
      "files_modified": 5,
      "tests_run": 23,
      "iterations_count": 3,
      "ai_cost_usd": 0.45
    }
  }
}
```

---

### GET /tasks//logs

Recupera o histórico completo de logs de execução de uma tarefa.

#### Request

```http
GET /v1/tasks/550e8400-e29b-41d4-a716-446655440000/logs
Authorization: Bearer cgn_1234567890abcdef
```

**Query Parameters:**

| Parâmetro    | Tipo    | Descrição                                                         | Default  |
| ------------- | ------- | ------------------------------------------------------------------- | -------- |
| `level`     | string  | Filtro por nível de log (`debug`, `info`, `warn`, `error`) | `info` |
| `limit`     | integer | Número máximo de logs retornados                                  | `100`  |
| `offset`    | integer | Paginação - logs para pular                                       | `0`    |
| `tool_name` | string  | Filtrar por ferramenta específica                                  | -        |
| `since`     | string  | ISO timestamp - logs desde este momento                             | -        |
| `until`     | string  | ISO timestamp - logs até este momento                              | -        |

#### Response

```json
{
  "logs": [
    {
      "id": "log-001",
      "timestamp": "2024-01-15T10:32:15Z",
      "level": "info",
      "action": "task_started",
      "message": "Iniciando execução da tarefa",
      "tool_name": null,
      "payload": {
        "task_id": "550e8400-e29b-41d4-a716-446655440000",
        "initial_prompt": "Crie uma API REST..."
      },
      "execution_time_ms": null
    },
    {
      "id": "log-002",
      "timestamp": "2024-01-15T10:32:18Z",
      "level": "info",
      "action": "tool_executed",
      "message": "Lendo estrutura do projeto",
      "tool_name": "ReadFolder",
      "payload": {
        "tool_args": {"dir_path": "."},
        "result_summary": "Encontrados 23 arquivos Python"
      },
      "execution_time_ms": 1250
    },
    {
      "id": "log-003",
      "timestamp": "2024-01-15T10:33:45Z",
      "level": "warn",
      "action": "tool_executed",
      "message": "Comando falhou, tentando alternativa",
      "tool_name": "Shell",
      "payload": {
        "tool_args": {"command": "pytest --version"},
        "exit_code": 1,
        "stderr": "pytest: command not found"
      },
      "execution_time_ms": 500
    }
  ],
  "pagination": {
    "total_count": 156,
    "limit": 100,
    "offset": 0,
    "has_more": true
  }
}
```

#### Exemplo com Filtros

```bash
# Filtrar apenas erros das últimas 2 horas
curl "https://api.codegen.com/v1/tasks/550e8400-e29b-41d4-a716-446655440000/logs?level=error&since=2024-01-15T08:30:00Z" \
  -H "Authorization: Bearer cgn_1234567890abcdef"
```

---

### POST /tasks//actions

Envia uma ação manual para o Maestro durante a execução de uma tarefa.

#### Request

```http
POST /v1/tasks/550e8400-e29b-41d4-a716-446655440000/actions
Content-Type: application/json
Authorization: Bearer cgn_1234567890abcdef
```

**Body Schema:**

```typescript
interface TaskActionRequest {
  action: TaskActionType;
  payload?: Record<string, any>;
  message?: string;
}

type TaskActionType = 
  | "approve"           // Aprovar ação pendente
  | "reject"            // Rejeitar ação pendente
  | "pause"             // Pausar execução
  | "resume"            // Retomar execução
  | "cancel"            // Cancelar tarefa
  | "provide_input"     // Fornecer input adicional
  | "override_tool";    // Sobrescrever resultado de ferramenta

interface ApprovalPayload {
  tool_call_id: string;
  approved: boolean;
  modifications?: Record<string, any>;
}

interface InputPayload {
  question_id: string;
  response: string;
}
```

**Exemplos de Payloads:**

```json
// Aprovar execução de comando
{
  "action": "approve",
  "payload": {
    "tool_call_id": "call-shell-001",
    "approved": true
  },
  "message": "Pode executar o comando npm install"
}

// Fornecer input adicional
{
  "action": "provide_input",
  "payload": {
    "question_id": "q-001",
    "response": "Use SQLAlchemy como ORM para o banco de dados"
  }
}

// Pausar execução
{
  "action": "pause",
  "message": "Pausando para revisar as mudanças"
}
```

#### Response

```json
{
  "action_id": "action-12345",
  "status": "accepted",
  "message": "Ação processada com sucesso",
  "timestamp": "2024-01-15T10:45:30Z"
}
```

---

### DELETE /tasks/

Cancela uma tarefa em execução.

#### Request

```http
DELETE /v1/tasks/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer cgn_1234567890abcdef
```

**Query Parameters:**

| Parâmetro | Tipo    | Descrição                                   |
| ---------- | ------- | --------------------------------------------- |
| `force`  | boolean | Força cancelamento imediato (default: false) |
| `reason` | string  | Motivo do cancelamento                        |

#### Response

```json
{
  "task_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "CANCELLED",
  "cancelled_at": "2024-01-15T11:00:00Z",
  "reason": "Cancelamento solicitado pelo usuário",
  "cleanup_completed": true
}
```

---

### GET /healthz

Health check básico do sistema.

#### Request

```http
GET /v1/healthz
```

#### Response

```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T11:00:00Z",
  "version": "1.0.0",
  "uptime_seconds": 86400
}
```