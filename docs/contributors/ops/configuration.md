# Configuração e Ambiente

## Visão Geral

O **CodeGen** utiliza um sistema robusto de configuração baseado em **variáveis de ambiente**, gerenciado pelo módulo `app.config`. Esta abordagem garante:

-  **Segurança** - Separação entre código e credenciais
- **Flexibilidade** - Configurações específicas por ambiente
- **Portabilidade** - Deploy consistente em qualquer infraestrutura
- **Manutenibilidade** - Configuração centralizada e validada

:::info Filosofia de Configuração
Seguimos os princípios do **12-Factor App**: configurações no ambiente, nunca no código. Cada ambiente (dev/staging/prod) possui suas próprias configurações, mas mantém a mesma interface.
:::

---

## 🔑 Variáveis de Ambiente Obrigatórias

Essas variáveis **DEVEM** estar definidas para o sistema funcionar:

| Variável                    | Tipo   | Descrição                          | Exemplo                                                   |
| ---------------------------- | ------ | ------------------------------------ | --------------------------------------------------------- |
| **`DATABASE_URL`**   | String | Connection string PostgreSQL (Async) | `postgresql+asyncpg://user:pass@localhost:5432/codegen` |
| **`REDIS_URL`**      | String | Connection string Redis              | `redis://localhost:6379/0`                              |
| **`OPENAI_API_KEY`** | String | Chave de API OpenAI/LLM              | `sk-proj-abc123...`                                     |
| **`ENVIRONMENT`**    | String | Ambiente atual                       | `development`, `staging`, `production`              |
| **`SECRET_KEY`**     | String | Chave secreta JWT/sessions           | `your-super-secret-key-256-bits`                        |

:::danger Variáveis Críticas
**Nunca** commite essas variáveis no código. Use arquivos `.env` (não versionados) ou serviços de secrets (AWS Secrets Manager, Kubernetes Secrets, etc.).
:::

### Detalhamento das Variáveis Obrigatórias

#### **DATABASE_URL**

Connection string para PostgreSQL com driver assíncrono:

```bash
# Formato
postgresql+asyncpg://[user[:password]@][host[:port]][/database][?param1=value1&...]

# Exemplos por ambiente
DATABASE_URL=postgresql+asyncpg://codegen:dev123@localhost:5432/codegen_dev
DATABASE_URL=postgresql+asyncpg://codegen:staging456@db-staging:5432/codegen_staging
DATABASE_URL=postgresql+asyncpg://codegen:prod789@rds-prod.amazonaws.com:5432/codegen_prod
```

**Impactos:**

- ❌ **URL inválida**: Sistema não inicia
- ⚠️ **Credenciais erradas**: Falha na autenticação
- 🐌 **Host lento**: Degradação de performance

#### **REDIS_URL**

Connection string para Redis (cache, sessões, pub/sub):

```bash
# Formato
redis://[password@]host[:port][/database]

# Exemplos
REDIS_URL=redis://localhost:6379/0
REDIS_URL=redis://password123@redis-staging:6379/1
REDIS_URL=redis://password456@elasticache-prod.amazonaws.com:6379/0
```

**Impactos:**

- ❌ **Redis offline**: Falha na inicialização, sessões perdidas
- 🔒 **Auth falhou**: Não consegue conectar
- 📊 **DB errado**: Conflito com outros serviços

#### **OPENAI_API_KEY**

Chave para acesso aos modelos LLM:

```bash
# OpenAI
OPENAI_API_KEY=sk-proj-abc123def456...

# Azure OpenAI
OPENAI_API_KEY=your-azure-key
OPENAI_API_BASE=https://your-resource.openai.azure.com/

# Anthropic Claude (alternativo)
ANTHROPIC_API_KEY=sk-ant-api123...
```

**Impactos:**

- ❌ **Chave inválida**: LLM não funciona, tasks falham
- 💰 **Limites atingidos**: Rate limiting, custos altos
- 🔒 **Chave vazada**: Uso não autorizado, cobrança indevida

---

## Variáveis de Ambiente Opcionais

Configurações com valores padrão que podem ser customizadas:

### Performance e Limites

| Variável                            | Default   | Descrição                                  |
| ------------------------------------ | --------- | -------------------------------------------- |
| **`VM_CREATION_TIMEOUT`**    | `300`   | Timeout em segundos para criar/alocar runner |
| **`REDIS_TASK_STREAM_TTL`**  | `86400` | TTL dos streams de logs (24h)                |
| **`MAX_CONCURRENT_TASKS`**   | `10`    | Máximo de tasks simultâneas                |
| **`MAX_TASK_DURATION`**      | `3600`  | Timeout máximo por task (1h)                |
| **`LLM_REQUEST_TIMEOUT`**    | `60`    | Timeout para requests LLM                    |
| **`TOOL_EXECUTION_TIMEOUT`** | `300`   | Timeout para execução de tools             |

### Configurações de Sistema

| Variável                       | Default  | Descrição                                                 |
| ------------------------------- | -------- | ----------------------------------------------------------- |
| **`LOG_LEVEL`**         | `INFO` | Nível de log (`DEBUG`, `INFO`, `WARNING`, `ERROR`) |
| **`CORS_ORIGINS`**      | `*`    | Origins permitidas para CORS                                |
| **`API_PREFIX`**        | `/v1`  | Prefixo da API REST                                         |
| **`WEBSOCKET_TIMEOUT`** | `300`  | Timeout conexões WebSocket (5min)                          |
| **`SESSION_TTL`**       | `3600` | TTL das sessões Redis (1h)                                 |

### Configurações de Custo

| Variável                           | Default    | Descrição                     |
| ----------------------------------- | ---------- | ------------------------------- |
| **`MAX_COST_PER_TASK`**     | `5.00`   | Custo máximo em USD por task   |
| **`DAILY_COST_LIMIT`**      | `100.00` | Limite diário de custo         |
| **`COST_TRACKING_ENABLED`** | `true`   | Habilita rastreamento de custos |

### 🛡Segurança e Auditoria

| Variável                         | Default  | Descrição                       |
| --------------------------------- | -------- | --------------------------------- |
| **`AUDIT_LOGS_ENABLED`**  | `true` | Habilita logs de auditoria        |
| **`SAFEGUARDS_ENABLED`**  | `true` | Habilita proteções automáticas |
| **`MAX_RETRIES`**         | `3`    | Tentativas máximas em falhas     |
| **`RATE_LIMIT_REQUESTS`** | `100`  | Requests por minuto por IP        |

---

## 🌍 Configuração por Ambiente

### 🚀 Development (.env.development)

```bash
# ==============================================
# CodeGen - Configuration: DEVELOPMENT
# ==============================================

# Ambiente
ENVIRONMENT=development
DEBUG=true
LOG_LEVEL=DEBUG

# Database (Local PostgreSQL)
DATABASE_URL=postgresql+asyncpg://codegen:dev123@localhost:5432/codegen_dev
DATABASE_POOL_SIZE=5
DATABASE_MAX_OVERFLOW=10

# Redis (Local)
REDIS_URL=redis://localhost:6379/0
REDIS_TASK_STREAM_TTL=3600  # 1 hora (desenvolvimento)

# LLM API
OPENAI_API_KEY=sk-proj-your-dev-key
LLM_MODEL=gpt-3.5-turbo  # Modelo mais barato para dev
MAX_COST_PER_TASK=1.00   # Limite menor
DAILY_COST_LIMIT=10.00

# Performance (valores relaxados)
VM_CREATION_TIMEOUT=600  # 10 minutos para debugging
MAX_CONCURRENT_TASKS=3   # Poucos recursos locais
MAX_TASK_DURATION=1800   # 30 minutos
TOOL_EXECUTION_TIMEOUT=600  # 10 minutos

# WebSocket
WEBSOCKET_TIMEOUT=600
SESSION_TTL=7200  # 2 horas

# Segurança (relaxada para desenvolvimento)
SECRET_KEY=dev-secret-key-not-for-production
CORS_ORIGINS=http://localhost:3000,http://localhost:8080
SAFEGUARDS_ENABLED=false  # Desabilita para testes
RATE_LIMIT_REQUESTS=1000  # Sem limite local

# Features de desenvolvimento
MOCK_LLM_RESPONSES=false  # true para testes sem custo
ENABLE_DEBUG_ENDPOINTS=true
HOT_RELOAD=true
```

### 🧪 Staging (.env.staging)

```bash
# ==============================================
# CodeGen - Configuration: STAGING
# ==============================================

# Ambiente
ENVIRONMENT=staging
DEBUG=false
LOG_LEVEL=INFO

# Database (Staging RDS/PostgreSQL)
DATABASE_URL=postgresql+asyncpg://codegen:staging-secure-password@staging-db.internal:5432/codegen_staging
DATABASE_POOL_SIZE=10
DATABASE_MAX_OVERFLOW=20

# Redis (ElastiCache/Managed)
REDIS_URL=redis://staging-redis.internal:6379/0
REDIS_TASK_STREAM_TTL=43200  # 12 horas

# LLM API (mesmo da produção para testes reais)
OPENAI_API_KEY=sk-proj-staging-key
LLM_MODEL=gpt-4-turbo-preview
MAX_COST_PER_TASK=3.00
DAILY_COST_LIMIT=50.00

# Performance (similar à produção)
VM_CREATION_TIMEOUT=300
MAX_CONCURRENT_TASKS=5
MAX_TASK_DURATION=3600
TOOL_EXECUTION_TIMEOUT=300

# WebSocket
WEBSOCKET_TIMEOUT=300
SESSION_TTL=3600

# Segurança (próxima à produção)
SECRET_KEY=staging-secret-key-256-bits-strong
CORS_ORIGINS=https://staging.codegen.com,https://staging-admin.codegen.com
SAFEGUARDS_ENABLED=true
RATE_LIMIT_REQUESTS=200

# Auditoria e monitoramento
AUDIT_LOGS_ENABLED=true
COST_TRACKING_ENABLED=true
METRICS_ENABLED=true
JAEGER_ENDPOINT=http://jaeger:14268/api/traces

# Features específicas de staging
ENABLE_DEBUG_ENDPOINTS=true  # Para debugging em staging
MOCK_EXTERNAL_APIS=false
```

### 🏭 Production (.env.production)

```bash
# ==============================================
# CodeGen - Configuration: PRODUCTION
# ==============================================

# Ambiente
ENVIRONMENT=production
DEBUG=false
LOG_LEVEL=WARNING

# Database (Production RDS com replica)
DATABASE_URL=postgresql+asyncpg://codegen:super-secure-prod-password@prod-db-cluster.amazonaws.com:5432/codegen_prod
DATABASE_POOL_SIZE=20
DATABASE_MAX_OVERFLOW=50
DATABASE_READ_REPLICA_URL=postgresql+asyncpg://codegen:read-replica-password@prod-db-replica.amazonaws.com:5432/codegen_prod

# Redis (ElastiCache Cluster)
REDIS_URL=redis://prod-redis-cluster.amazonaws.com:6379/0
REDIS_CLUSTER_MODE=true
REDIS_TASK_STREAM_TTL=86400  # 24 horas

# LLM API (produção)
OPENAI_API_KEY=${OPENAI_API_KEY_FROM_VAULT}  # From AWS Secrets Manager
LLM_MODEL=gpt-4
MAX_COST_PER_TASK=5.00
DAILY_COST_LIMIT=100.00
HOURLY_COST_LIMIT=20.00

# Performance (otimizada)
VM_CREATION_TIMEOUT=300
MAX_CONCURRENT_TASKS=20
MAX_TASK_DURATION=3600
TOOL_EXECUTION_TIMEOUT=300
WORKER_PROCESSES=4

# WebSocket
WEBSOCKET_TIMEOUT=300
SESSION_TTL=3600
MAX_WEBSOCKET_CONNECTIONS=1000

# Segurança (máxima)
SECRET_KEY=${SECRET_KEY_FROM_VAULT}  # From Vault/Secrets Manager
CORS_ORIGINS=https://app.codegen.com
SAFEGUARDS_ENABLED=true
RATE_LIMIT_REQUESTS=100
ENABLE_RATE_LIMITING=true
ENABLE_IP_WHITELIST=true
REQUIRE_API_KEY=true

# SSL/TLS
SSL_CERT_PATH=/etc/ssl/certs/codegen.pem
SSL_KEY_PATH=/etc/ssl/private/codegen.key
FORCE_HTTPS=true

# Monitoramento e observabilidade
AUDIT_LOGS_ENABLED=true
COST_TRACKING_ENABLED=true
METRICS_ENABLED=true
JAEGER_ENDPOINT=https://jaeger-prod.internal:443/api/traces
PROMETHEUS_METRICS_ENABLED=true
SENTRY_DSN=${SENTRY_DSN_FROM_VAULT}

# Backup e disaster recovery
DATABASE_BACKUP_ENABLED=true
REDIS_PERSISTENCE_ENABLED=true
LOG_RETENTION_DAYS=90

# Features (produção)
ENABLE_DEBUG_ENDPOINTS=false
MOCK_EXTERNAL_APIS=false
HOT_RELOAD=false
HEALTH_CHECK_INTERVAL=30
```

:::warning Configuração de Produção
Em **produção**, use sempre:

- 🔐 **Secrets Manager** (AWS/GCP) ou **Vault** para credenciais
- 🚫 **Nunca** arquivos `.env` commitados
- ✅ **Kubernetes Secrets** ou **Docker Secrets**
- 🔍 **Auditoria** habilitada sempre
  :::

---

##  Segredos e Segurança

### 🛡️ Boas Práticas de Segredos

:::danger Nunca Faça Isso

```bash
# ❌ NUNCA commitar credenciais
OPENAI_API_KEY=sk-proj-abc123def456...
DATABASE_URL=postgresql://user:PASSWORD@host/db

# ❌ NUNCA usar credenciais simples em produção
SECRET_KEY=simple-password
DATABASE_URL=postgresql://admin:admin@localhost/db
```

:::

:::tip Faça Assim

```bash
# ✅ Usar referências para secrets managers
OPENAI_API_KEY=${OPENAI_API_KEY_FROM_VAULT}
DATABASE_URL=${DATABASE_URL_FROM_AWS_SECRETS}
SECRET_KEY=${SECRET_KEY_FROM_KUBERNETES_SECRET}

# ✅ Credenciais complexas e rotacionadas
SECRET_KEY=generated-256-bit-key-from-secrets-manager
DATABASE_URL=postgresql://user:complex-rotated-password@rds-cluster/db
```

:::

