# Session (Execution Context)

## O que é uma Session?

Uma **Session** representa o **contexto persistente de execução** entre o usuário e o CodeGen.  
Ela funciona como a **memória operacional do sistema**, permitindo que o Maestro raciocine de forma contínua, segura e consistente ao longo de uma task.

A Session **não é apenas histórico de conversa** — ela consolida:

- estado da execução
- contexto do projeto
- decisões anteriores
- resultados de tools
- limites temporais e de recursos

Sem Session, o Maestro seria **estateless** e incapaz de executar fluxos iterativos complexos.

---

## Responsabilidades da Session

Uma Session é responsável por:

- Manter o **histórico conversacional estruturado**
- Preservar o **estado da task em execução**
- Armazenar **contexto do projeto/repositório**
- Servir como **fonte única de verdade** para decisões do Maestro
- Garantir **isolamento entre execuções**
- Controlar **tempo de vida (TTL)** e expiração automática

---

## Modelo Conceitual da Session

A Session pode ser entendida logicamente como:

### 1. Identidade
- `session_id`
- `task_id`
- `user_id`

### 2. Estado
- `status`: active | idle | expired
- `created_at`
- `last_activity`

### 3. Contexto Conversacional
- `messages`: histórico estruturado
- `context_summary`: resumo compacto do contexto

### 4. Contexto do Projeto
- `project_context`: estrutura do repositório
- `working_directory`

### 5. Configuração
- `preferences`
- `ttl_seconds`

Esse modelo permite que o Maestro **raciocine sobre o passado**, **entenda o presente** e **decida o próximo passo** de forma determinística.

---

## Ciclo de Vida de uma Session

```text
[Session Created]
       |
       v
     ACTIVE  <----- nova mensagem / tool call
       |
       | (inatividade)
       v
      IDLE
       |
       | (TTL expirado)
       v
    EXPIRED  ----> cleanup automático
```
## Integração da Session com o Maestro

A Session é consultada e atualizada a cada iteração do loop do Maestro.
```text
┌──────────────┐
│   Maestro    │
└──────┬───────┘
│
│ lê contexto
v
┌──────────────┐
│   Session    │◄──────────────┐
└──────┬───────┘               │
│                       │
│ atualiza estado       │
v                       │
┌──────────────┐               │
│  Tool Result │───────────────┘
└──────────────┘
```
O Maestro nunca depende de estado implícito: tudo que ele precisa saber está na Session.

## Estrutura de Mensagens (Visão Conceitual)

Cada mensagem armazenada em uma **Session** segue um modelo estruturado, permitindo rastreabilidade completa da execução.

### Campos de uma Mensagem

Cada mensagem contém:

- **role**: `user` | `assistant` | `system` | `tool`
- **content**: conteúdo textual principal
- **timestamp**: momento da criação
- **metadata** *(opcional)*: dados auxiliares
- **tool_calls** *(quando aplicável)*: tools solicitadas pelo Maestro
- **tool_results** *(quando aplicável)*: resultados retornados pelo Executor

### Encadeamento Lógico das Mensagens

```text
[User Message]
      ↓
[Maestro Thought / Plan]
      ↓
[Tool Call]
      ↓
[Tool Result]
      ↓
[Maestro Observation / Reflection]
```

Esse encadeamento permite:

- auditoria completa da execução
- debugging determinístico
- reexecução segura de fluxos
- rastreamento de decisões do agente

## Armazenamento e Persistência

As Sessions são armazenadas em Redis, utilizando TTL nativo para controle automático do ciclo de vida.

### Princípios Arquiteturais

- Persistência leve e rápida
- Cleanup automático via TTL
- Renovação de TTL baseada em atividade
- Nenhuma dependência de garbage collection manual

Redis atua como um state store efêmero, e não como banco histórico de longo prazo.

## Gestão de TTL e Cleanup
A expiração de uma Session é uma garantia arquitetural, não um detalhe operacional.

```text
Session ativa
|
| atividade recente
v
TTL renovado
|
| sem atividade
v
TTL expira → sessão removida
```