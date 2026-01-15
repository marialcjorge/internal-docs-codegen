#  Server-Sent Events (SSE)

Para clientes que precisam **apenas receber** atualizações (sem interação), use Server-Sent Events:

### Conexão SSE

```javascript
const eventSource = new EventSource(
  "https://api.codegen.com/v1/sse/tasks/550e8400-e29b-41d4-a716-446655440000/updates",
  {
    headers: {
      "Authorization": "Bearer cgn_1234567890abcdef"
    }
  }
);
```

### Tipos de Eventos

```javascript
// Status updates
eventSource.addEventListener("status", (event) => {
  const data = JSON.parse(event.data);
  console.log("Status:", data.status, `${data.progress.completion_percentage}%`);
});

// Agent messages  
eventSource.addEventListener("message", (event) => {
  const data = JSON.parse(event.data);
  console.log("Maestro:", data.content);
});

// Tool executions
eventSource.addEventListener("tool", (event) => {
  const data = JSON.parse(event.data);
  console.log(`Tool ${data.tool_name}:`, data.success ? "Yes" : "No");
});

// Task completion
eventSource.addEventListener("complete", (event) => {
  const data = JSON.parse(event.data);
  console.log("Task completed:", data.final_status);
  eventSource.close();
});

// Errors
eventSource.addEventListener("error", (event) => {
  const data = JSON.parse(event.data);
  console.error("Error:", data.message);
});
```

### 🔧 Exemplo com cURL

```bash
# Stream de atualizações via SSE
curl -N -H "Authorization: Bearer cgn_1234567890abcdef" \
  "https://api.codegen.com/v1/sse/tasks/550e8400-e29b-41d4-a716-446655440000/updates"

# Output:
# event: status
# data: {"status":"RUNNING","progress":{"completion_percentage":25}}
# 
# event: message  
# data: {"content":"Analisando estrutura do projeto...","message_type":"thinking"}
#
# event: tool
# data: {"tool_name":"ReadFolder","success":true,"execution_time_ms":1200}
```