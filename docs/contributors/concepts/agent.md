# Agent (Maestro)

### O que é o Maestro?

O **Maestro** é o **agente autônomo central** do CodeGen.  
Ele atua como o **cérebro do sistema**, sendo responsável por interpretar pedidos, planejar estratégias, orquestrar ferramentas e decidir quando uma tarefa foi concluída.

O Maestro **não executa ações diretamente**.  
Ele **decide e coordena**, delegando toda execução concreta ao **Executor**, por meio de um loop de raciocínio inspirado no padrão **ReAct (Reason + Act)**.

---

### Papel Arquitetural

Dentro da arquitetura do CodeGen, o Maestro:

- recebe o pedido inicial do usuário
- mantém o **estado global da execução**
- decide **quais ações** devem ser tomadas
- coordena chamadas de tools via Executor
- analisa resultados e ajusta a estratégia
- aplica **Safeguards** para garantir segurança e finitude

Em resumo:

> **O Maestro pensa, o Executor age.**

---

### Loop de Raciocínio (ReAct)

O Maestro opera em um ciclo iterativo composto pelas seguintes fases:

**Thought → Plan → Action → Observation → Reflection**

Cada iteração do loop aproxima o sistema da resolução da tarefa ou leva à decisão de encerramento.

---

### Loop ReAct — Visão Conceitual

```text
[THOUGHT]
    ↓
[PLAN]
    ↓
[ACTION] ──▶ Executor
    ↓
[OBSERVATION]
    ↓
[REFLECTION]
    ↓
[Safeguards?] ── No ──▶ END
        │
       Yes
        │
        ▼
     [Repeat Loop]

```
### Integração com Tools e Executor

Durante a fase **Action**, o Maestro:

- seleciona uma tool disponível no **Toolbelt**
- envia um comando estruturado ao **Executor** via WebSocket
- aguarda o resultado da execução
- valida e interpreta o retorno antes de seguir

O Maestro **nunca acessa diretamente** o filesystem ou o ambiente do usuário.

---

### Safeguards no Loop do Maestro

Os **Safeguards** fazem parte do próprio ciclo de decisão do Maestro e garantem que a execução permaneça segura e previsível.

Eles são verificados **a cada iteração do loop** e podem:

- detectar loops repetitivos de *tool calls*
- interromper execuções longas demais
- impor limites máximos de passos
- evitar consumo excessivo de recursos

> Safeguards não são tratamento de erro isolado —  
> eles são **mecanismos de enforcement do comportamento do agente**.


### Capacidades do Maestro

| Capacidade                | Descrição                                  | Implementação             |
| ------------------------- | -------------------------------------------- | --------------------------- |
| ** Planejamento** | Divide tasks complexas em subtasks           | Chain-of-Thought prompting  |
| ** Execução**   | Orquestra tools do Executor via WebSocket    | ExecutorCommunicator        |
| **Observação** | Analisa resultados e decide próximos passos | Result parsing + validation |
| **Memória**     | Mantém contexto histórico da conversa      | History management          |
| **Proteção** | Detecta loops e limita recursos              | Safeguards integration      |
| **Adaptação**  | Ajusta estratégia com base em feedback      | Dynamic prompting           |

