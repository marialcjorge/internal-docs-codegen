## Tratamento de Erros

### 📊 Códigos de Status HTTP

| Código | Descrição       | Ação Recomendada                     |
| ------- | --------------- | -------------------------------------- |
| `200` | Sucesso         | Continue normalmente                   |
| `201` | Recurso criado  | Sucesso na criação                   |
| `400` | Bad Request     | Verifique parâmetros                  |
| `401` | Unauthorized    | Verifique API key                      |
| `403` | Forbidden      | Permissões insuficientes              |
| `404` | Not Found     | Recurso não encontrado                |
| `429` | Too Many Requests | Aguarde rate limit                     |
| `500` | Internal Server Error | Tente novamente ou contate suporte     |
| `503` | Service Unavailable | Serviço temporariamente indisponível |

### 🔧 Formato de Erros

```json
{
  "error": {
    "code": "INVALID_PROMPT",
    "message": "O prompt fornecido é muito curto. Mínimo de 10 caracteres.",
    "details": {
      "field": "prompt",
      "provided_length": 5,
      "minimum_length": 10
    },
    "request_id": "req-12345",
    "timestamp": "2024-01-15T11:00:00Z"
  }
}
```

### 📋 Códigos de Erro Específicos

| Código                         | Descrição                                 | HTTP Status |
| ------------------------------- | ------------------------------------------- | ----------- |
| `INVALID_PROMPT`              | Prompt inválido ou muito curto             | 400         |
| `INVALID_REPO_URL`            | URL do repositório inválida               | 400         |
| `TASK_NOT_FOUND`              | Task não encontrada                        | 404         |
| `TASK_ALREADY_COMPLETED`      | Não é possível modificar task finalizada | 409         |
| `RATE_LIMIT_EXCEEDED`         | Muitas requisições por minuto             | 429         |
| `INSUFFICIENT_CREDITS`        | Créditos insuficientes                     | 402         |
| `WEBSOCKET_CONNECTION_FAILED` | Falha na conexão WebSocket                 | 500         |
| `LLM_SERVICE_UNAVAILABLE`     | Serviço de IA indisponível                | 503         |

