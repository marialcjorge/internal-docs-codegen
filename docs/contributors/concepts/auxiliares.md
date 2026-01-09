# Conceitos Auxiliares

### 📊 TaskLog (Auditoria)

```python
class TaskLogDTO(BaseModel):
    """
    Log de auditoria para todas as ações de uma task.
    """
    id: uuid.UUID
    task_id: uuid.UUID                   # Task relacionada
    action: TaskAction                   # Tipo de ação
    tool_name: str | None                # Tool executada (se aplicável)
    payload: Dict[str, Any]              # Dados da ação
    success: bool                        # Sucesso/falha
    error_message: str | None            # Mensagem de erro
    execution_time_ms: int               # Tempo de execução
    created_at: datetime

class TaskAction(str, Enum):
    TASK_STARTED = "task_started"
    TOOL_EXECUTED = "tool_executed"
    GENERATION_COMPLETED = "generation_completed" 
    ERROR_OCCURRED = "error_occurred"
    TASK_COMPLETED = "task_completed"
    TASK_FAILED = "task_failed"
    USER_INTERVENTION = "user_intervention"

# Exemplo de uso
task_log = TaskLogDTO(
    task_id=uuid.UUID("123e4567-e89b-12d3-a456-426614174000"),
    action=TaskAction.TOOL_EXECUTED,
    tool_name="Shell",
    payload={"command": "npm test", "working_dir": "/project"},
    success=True,
    execution_time_ms=2500,
    created_at=datetime.utcnow()
)
```

### 🔄 Generation (Rastreamento)

```python
class GenerationDTO(BaseModel):
    """
    Representa uma "geração" de resposta do LLM.
    Permite rastreamento granular de iterações.
    """
    id: uuid.UUID
    task_id: uuid.UUID
    session_id: uuid.UUID
    generation_index: int                # Posição na sequência (1, 2, 3...)
  
    # Input para o LLM  
    prompt_messages: List[LLMMessage]
    model_name: str                      # gpt-4, gpt-3.5-turbo, etc.
  
    # Output do LLM
    response_content: str | None
    tool_calls: List[ToolCall] = []
  
    # Métricas
    token_usage: TokenUsage
    latency_ms: int
    cost_usd: float
  
    # Estado
    status: GenerationStatus
    created_at: datetime
    completed_at: datetime | None

class GenerationStatus(str, Enum):
    PENDING = "pending"                  # Aguardando resposta do LLM
    COMPLETED = "completed"              # LLM respondeu com sucesso
    FAILED = "failed"                    # Erro na chamada LLM
    CANCELLED = "cancelled"              # Cancelada pelo sistema/usuário

# Rastreamento de custos por task
class TokenUsage(BaseModel):
    prompt_tokens: int
    completion_tokens: int
    total_tokens: int
  
    @property
    def cost_estimate(self) -> float:
        # Estimativa baseada em preços OpenAI GPT-4
        return (self.prompt_tokens * 0.00003) + (self.completion_tokens * 0.00006)
```

### 🔧 ToolCall/ToolResult

```python
class ToolCall(BaseModel):
    """
    Representa uma chamada de ferramenta pelo LLM.
    """
    id: str                              # ID único da chamada
    name: str                            # Nome da tool (Shell, ReadFile, etc.)
    arguments: Dict[str, Any]            # Parâmetros da tool
    generation_id: uuid.UUID             # Generation que originou a chamada
    created_at: datetime
  
class ToolResult(BaseModel):
    """
    Resultado da execução de uma ferramenta.
    """
    tool_call_id: str                    # Referência à ToolCall
    success: bool                        # Sucesso da execução
    result: Any                          # Resultado (pode ser str, dict, etc.)
    error: str | None                    # Mensagem de erro (se falhou)
    execution_time_ms: int               # Tempo de execução
    created_at: datetime

# Fluxo típico
tool_call = ToolCall(
    id="call_123",
    name="ReadFile", 
    arguments={"file_path": "src/main.py"},
    generation_id=uuid.uuid4()
)

# Executor processa e retorna
tool_result = ToolResult(
    tool_call_id="call_123",
    success=True,
    result="def main():\n    print('Hello World')\n",
    execution_time_ms=150
)
```