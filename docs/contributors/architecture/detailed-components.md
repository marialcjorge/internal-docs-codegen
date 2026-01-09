# Componentes

### 🎯 Backend Components

| Componente                     | Responsabilidade                                        | Arquivo Principal                   |
| ------------------------------ | ------------------------------------------------------- | ----------------------------------- |
| **Maestro**              | Orquestrador principal, gerencia ciclo de vida completo | `maestro/maestro.py`              |
| **ExecutorCommunicator** | Gerencia protocolo WebSocket com Executor               | `maestro/communicator.py`         |
| **BootstrapRunner**      | Executa comandos iniciais para contexto                 | `maestro/bootstrap.py`            |
| **Toolbelt**             | Gerencia ferramentas disponíveis do Executor           | `maestro/toolbelt.py`             |
| **Safeguards**           | Proteção contra loops e comportamentos indesejados    | `maestro/safeguards.py`           |
| **TaskService**          | Business logic para tasks e logs                        | `app/services/task_service.py`    |
| **SessionService**       | Gerencia sessões persistentes no Redis                 | `app/services/session_service.py` |

### ⚡ Executor Components

| Componente                  | Responsabilidade                                      | Arquivo Principal           |
| --------------------------- | ----------------------------------------------------- | --------------------------- |
| **WebSocketClient**   | Cliente WebSocket + reconnection logic                | `websocketClient.ts`      |
| **State Reducer**     | Gerencia estado global da aplicação (Redux pattern) | `reducer.ts`              |
| **Tools Suite**       | Ferramentas locais disponíveis para o LLM            | `tools/*.ts`              |
| **Clipboard Handler** | Gerencia imagens da área de transferência           | `clipboardImage.ts`       |
| **Version Check**     | Validação de compatibilidade com backend            | `versionCheck.ts`         |
| **Event System**      | Sistema de eventos interno                            | `events.ts`, `types.ts` |

### 🔧 Tools Disponíveis (Executor)

| Tool                 | Funcionalidade                 | Casos de Uso                                |
| -------------------- | ------------------------------ | ------------------------------------------- |
| **Shell**      | Executa comandos no terminal   | `npm install`, `git commit`, `pytest` |
| **ReadFile**   | Lê conteúdo de arquivos      | Analisar código existente                  |
| **WriteFile**  | Cria/modifica arquivos         | Gerar novos arquivos de código             |
| **Edit**       | Edita arquivos existentes      | Aplicar mudanças pontuais                  |
| **FindFiles**  | Busca arquivos por padrão     | Encontrar arquivos de configuração        |
| **SearchText** | Busca texto dentro de arquivos | Encontrar funções, variáveis             |
| **ReadFolder** | Lista conteúdo de diretórios | Explorar estrutura do projeto               |
| **WebFetch**   | Faz requisições HTTP         | Buscar documentação externa               |