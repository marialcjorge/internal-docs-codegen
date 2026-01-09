# Session (Contexto de Execução)

### 🎯 O que é uma Session?

Uma **Session** é o **contexto persistente** de uma conversa com o CodeGen. Armazena histórico, estado e "memória de curto prazo" do Maestro.

```python
class SessionDTO(BaseModel):
    id: uuid.UUID                           # Identificador da sessão
    task_id: uuid.UUID                      # Task associada
    user_id: str                            # Usuário proprietário
    status: SessionStatus                   # Estado da sessão
    created_at: datetime
    last_activity: datetime
  
    # Contexto conversacional
    messages: List[ConversationMessage]     # Histórico de mensagens
    context_summary: str | None             # Resumo do contexto
  
    # Estado do projeto
    project_context: ProjectContext         # Contexto do repositório
    working_directory: str                  # Diretório de trabalho
  
    # Configurações
    preferences: SessionPreferences         # Preferências do usuário
    ttl_seconds: int = 3600                 # Time-to-live (1 hora)

class SessionStatus(str, Enum):
    ACTIVE = "active"                       # Sessão ativa
    IDLE = "idle"                           # Inativa há tempo
    EXPIRED = "expired"                     # TTL expirado
    TERMINATED = "terminated"               # Finalizada explicitamente
```

### 🗄️ Armazenamento no Redis

```python
class SessionService:
    """
    Gerencia sessões persistentes no Redis.
    """
  
    def __init__(self, redis_client: Redis):
        self.redis = redis_client
        self.default_ttl = 3600  # 1 hora
  
    async def create_session(
        self, 
        task_id: uuid.UUID, 
        user_id: str
    ) -> SessionDTO:
        """Cria nova sessão."""
        session = SessionDTO(
            id=uuid.uuid4(),
            task_id=task_id,
            user_id=user_id,
            status=SessionStatus.ACTIVE,
            created_at=datetime.utcnow(),
            last_activity=datetime.utcnow(),
            messages=[],
            ttl_seconds=self.default_ttl
        )
      
        # Armazenar no Redis com TTL
        await self.redis.setex(
            f"session:{session.id}",
            self.default_ttl,
            session.model_dump_json()
        )
      
        return session
  
    async def add_message(
        self, 
        session_id: uuid.UUID, 
        message: ConversationMessage
    ):
        """Adiciona mensagem ao histórico."""
        session = await self.get_session(session_id)
      
        if session:
            session.messages.append(message)
            session.last_activity = datetime.utcnow()
          
            # Atualizar Redis e renovar TTL
            await self.redis.setex(
                f"session:{session_id}",
                self.default_ttl,
                session.model_dump_json()
            )
  
    async def extend_ttl(self, session_id: uuid.UUID):
        """Renova TTL da sessão."""
        await self.redis.expire(f"session:{session_id}", self.default_ttl)
```

### 💬 Estrutura de Mensagens

```python
class ConversationMessage(BaseModel):
    id: uuid.UUID
    role: MessageRole                    # user, assistant, system, tool
    content: str                         # Conteúdo da mensagem
    timestamp: datetime
    metadata: Dict[str, Any] = {}        # Metadados específicos
  
    # Contexto específico para tools
    tool_calls: List[ToolCall] = []      # Tools chamadas
    tool_results: List[ToolResult] = []  # Resultados das tools

class MessageRole(str, Enum):
    USER = "user"                        # Mensagem do usuário
    ASSISTANT = "assistant"              # Resposta do Maestro
    SYSTEM = "system"                    # Mensagens do sistema
    TOOL = "tool"                        # Resultados de ferramentas

# Exemplo de conversa
conversation = [
    ConversationMessage(
        role=MessageRole.USER,
        content="Crie um endpoint POST /users para cadastrar usuários",
        timestamp=datetime.utcnow()
    ),
    ConversationMessage(
        role=MessageRole.ASSISTANT, 
        content="Vou analisar o projeto e criar o endpoint. Primeiro preciso entender a estrutura atual...",
        tool_calls=[
            ToolCall(name="ReadFolder", args={"dir_path": "."})
        ]
    ),
    ConversationMessage(
        role=MessageRole.TOOL,
        content="Estrutura do projeto encontrada: src/, tests/, requirements.txt...",
        tool_results=[
            ToolResult(
                tool_call_id="uuid-123",
                success=True,
                result="[lista de arquivos...]"
            )
        ]
    )
]
```

### ⏰ Gestão de TTL e Cleanup

```python
class SessionCleanupService:
    """
    Serviço para limpeza automática de sessões.
    """
  
    def __init__(self, redis_client: Redis):
        self.redis = redis_client
  
    async def cleanup_expired_sessions(self):
        """
        Remove sessões expiradas (executado via cron).
        """
        # Redis TTL remove automaticamente, mas podemos fazer cleanup proativo
        pattern = "session:*"
        keys = await self.redis.keys(pattern)
      
        expired_count = 0
        for key in keys:
            ttl = await self.redis.ttl(key)
          
            # TTL -2 = chave não existe, -1 = sem expiração
            if ttl == -2:
                expired_count += 1
      
        logger.info(f"Cleanup concluído: {expired_count} sessões expiradas")
      
    async def extend_active_sessions(self):
        """
        Estende TTL de sessões com atividade recente.
        """
        pattern = "session:*"
        keys = await self.redis.keys(pattern)
      
        for key in keys:
            session_data = await self.redis.get(key)
            if session_data:
                session = SessionDTO.model_validate_json(session_data)
              
                # Se atividade recente (< 10 min), estender TTL
                if self._is_recently_active(session):
                    await self.redis.expire(key, 3600)
```