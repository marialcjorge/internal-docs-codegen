# Contract-Based Tools

O CodeGen utiliza um **contrato dinâmico de ferramentas** (*contract-based tools*) para garantir que a orquestração feita pelo Backend seja **segura, controlada e alinhada às capacidades reais do Executor**.

Esse contrato não define apenas **quais ferramentas existem**, mas também **como, quando e até onde** elas podem ser utilizadas durante uma execução.

Em termos práticos:
> o Backend decide *o que* fazer, mas **só pode agir dentro dos limites explicitamente declarados pelo Executor**.


### Como Funciona o Contrato

O contrato de ferramentas é estabelecido **dinamicamente no handshake inicial** e segue as etapas abaixo:

1. **Executor** envia, no handshake, a lista de tools que suporta
2. **Backend** valida essa lista e constrói um **Toolbelt** apenas com tools disponíveis
3. **LLM** só pode invocar tools que fazem parte desse Toolbelt
4. O sistema permanece **agnóstico à implementação concreta** das tools

Esse modelo garante que:
- o Backend nunca assuma a existência de uma tool
- diferentes executores possam ter capacidades distintas
- o LLM opere sempre dentro de um **ambiente controlado por contrato**

---

### Vantagens do Modelo

- **Flexibilidade**  
  Diferentes executores (CLI local, VM, sandbox, cloud executor) podem expor conjuntos distintos de tools.

- **Segurança**  
  O Backend não precisa — e não pode — acessar diretamente o filesystem do usuário.

- **Extensibilidade**  
  Novas tools podem ser adicionadas dinamicamente sem alterar o backend central.

- **Robustez**  
  Falhas ou indisponibilidade de tools não comprometem a estabilidade do backend.

---

### Exemplo de Contrato (Implementação de Referência)

O trecho abaixo ilustra uma **implementação de referência** do contrato de ferramentas no Backend.  
Outras implementações são possíveis, desde que respeitem as mesmas regras de validação e escopo.

```python
# Backend: Toolbelt valida tools declaradas no handshake

class Toolbelt:
    def __init__(self, handshake: HandshakePayload):
        self.tools = []

        # Tools conhecidas
        for tool_name in handshake.known_tools:
            schema = KNOWN_TOOLS_SCHEMAS.get(tool_name)
            if schema:
                self.tools.append(schema)

        # Custom tools também são suportadas
        self.tools.extend([
            tool.model_dump() for tool in handshake.custom_tools
        ])


## 🛡️ Safeguards e Error Handling

### 🔄 Loop Detection

```python
class Safeguards:
    def is_repeated_tool_call(
        self, 
        tool_name: str, 
        tool_input: dict,
        min_repetition: int = 4
    ) -> bool:
        call_to_check = {"tool_name": tool_name, "tool_input": tool_input}
        count = self._tool_calls_history.count(call_to_check)
        return count >= min_repetition
```

###  Timeout Handling
Define limites temporais explícitos para a execução do contrato, evitando bloqueios indefinidos.
No lado do Executor, falhas de conexão são tratadas com reconexão controlada:

```python
# Backend: Message timeout
message = await self.communicator.receive_message(timeout=1200)  # 20 min

# Executor: Reconnection logic
private async reconnectWithBackoff() {
    const maxRetries = 5;
    const baseDelay = 1000; // 1s
  
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        const delay = baseDelay * Math.pow(2, attempt - 1);
        await this.delay(delay);
      
        try {
            await this.connect();
            break;
        } catch (error) {
            console.log(`Reconnection attempt ${attempt} failed`);
        }
    }
}
```

###  Max Steps Protection
Define um limite superior explícito para o número de passos da execução, evitando runs infinitas.
```python
class Safeguards:
    def __init__(self, max_steps: int = 100):
        self.max_steps = max_steps
  
    def is_exceeding_max_steps(self, current_step: int) -> bool:
        return current_step >= self.max_steps
```
Esse limite:
- protege o sistema contra execuções descontroladas
- torna o custo da execução previsível
- reforça o contrato como um processo finito