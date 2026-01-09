# Contract-Based Tools

O sistema utiliza um **contrato dinâmico** de ferramentas:

### 📋 Como Funciona

1. **Executor** envia lista de tools suportadas no handshake
2. **Backend** cria `Toolbelt` apenas com tools disponíveis
3. **LLM** só pode invocar tools que o Executor suporta
4. **Sistema** é agnóstico à implementação das tools

### 🎯 Vantagens

- ✅ **Flexibilidade**: Executors diferentes podem ter tools diferentes
- ✅ **Segurança**: Backend não precisa acesso direto ao filesystem
- ✅ **Extensibilidade**: Novas tools podem ser adicionadas dinamicamente
- ✅ **Robustez**: Falhas de tools não afetam o backend

### 📝 Exemplo de Contract

```python
# Backend: Toolbelt valida tools do handshake
class Toolbelt:
    def __init__(self, handshake: HandshakePayload):
        self.tools = []
      
        for tool_name in handshake.known_tools:
            schema = KNOWN_TOOLS_SCHEMAS.get(tool_name)
            if schema:
                self.tools.append(schema)
      
        # Custom tools também suportadas
        self.tools.extend([
            tool.model_dump() for tool in handshake.custom_tools
        ])
```

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

### ⏱️ Timeout Handling

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

### 🚨 Max Steps Protection

```python
class Safeguards:
    def __init__(self, max_steps: int = 100):
        self.max_steps = max_steps
  
    def is_exceeding_max_steps(self, current_step: int) -> bool:
        return current_step >= self.max_steps
```