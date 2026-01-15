# Spec-Driven Development

### O que é Spec-Driven?

**Spec-Driven Development** é uma abordagem em que mudanças complexas são **guiadas por uma especificação técnica explícita**, criada **antes da implementação**.

No CodeGen, a Spec funciona como:
- fonte única de verdade da mudança
- contrato técnico de implementação
- base para revisão humana
- referência para geração de código e testes

Em vez de “codar e corrigir”, o sistema **pensa, especifica, valida e só então executa**.

---

### Quando o Spec-Driven é Aplicado?

O fluxo Spec-Driven é utilizado quando a solicitação:

- envolve múltiplos arquivos ou camadas
- exige decisões arquiteturais
- altera contratos públicos (APIs, schemas, eventos)
- possui alto risco de regressão
- requer validação humana antes da execução

Solicitações simples podem seguir um fluxo direto, sem geração de Spec.

---

### Fluxo Spec-Driven (Visão Geral)

```ascii
[User Request]
      |
      v
[Analyze Complexity]
      |
      +-- Simple?
      |      |
      |      v
      |  [Direct Implementation]
      |          |
      |        [Done]
      |
      +-- Complex?
             |
             v
        [Generate Spec]
             |
             v
        [Human Review]
          |         |
       Reject     Approve
          |         |
          v         v
      [Refine]  [Implement from Spec]
                       |
                       v
                    [Tests]
                       |
                       v
                     [Done]

```
### Estrutura de uma Spec

A Spec é representada por um arquivo estruturado (CODEGEN.md) que descreve o que deve ser construído, não como o código interno funciona.

Exemplo de estrutura:

```yaml
# CODEGEN.md - Especificação do projeto
spec_version: "1.0"
project_name: "API de E-commerce"
description: "API REST para sistema de e-commerce"

architecture:
  pattern: "Clean Architecture"
  layers:
    - presentation
    - business
    - data
  
technologies:
  backend: "FastAPI + SQLAlchemy"
  database: "PostgreSQL"
  cache: "Redis"
  
endpoints:
  - path: "/api/users"
    methods: ["GET", "POST"]
    authentication: "required"
  
  - path: "/api/products"
    methods: ["GET", "POST", "PUT", "DELETE"]  
    authentication: "admin_only"

database:
  tables:
    - name: "users"
      fields:
        - {name: "id", type: "UUID", primary_key: true}
        - {name: "email", type: "VARCHAR(255)", unique: true}
        - {name: "created_at", type: "TIMESTAMP"}
      
    - name: "products"
      fields:
        - {name: "id", type: "UUID", primary_key: true}
        - {name: "name", type: "VARCHAR(100)"}
        - {name: "price", type: "DECIMAL(10,2)"}

tests:
  coverage_minimum: 80
  types: ["unit", "integration", "e2e"]
  
deployment:
  environment: "docker"
  ci_cd: "GitHub Actions"
```
A Spec descreve intenção, estrutura e critérios, não detalhes de implementação.
### Fluxo Spec-Driven

```ascii
[User Request]
      |
      v
[Analyze Complexity]
      |
      +-- Simple?
      |      |
      |      v
      |  [Direct Implementation]
      |          |
      |        [Done]
      |
      +-- Complex?
             |
             v
        [Generate Spec]
             |
             v
        [Human Review]
          |         |
       Reject     Approve
          |         |
          v         v
      [Refine]  [Implement from Spec]
                       |
                       v
                    [Tests]
                       |
                       v
                     [Done]
```


### Vantagens do Spec-Driven

| Vantagem                     | Descrição                                    | Benefício              |
| ---------------------------- | ---------------------------------------------- | ----------------------- |
| **Clareza**         | Especificação clara antes da implementação | Reduz retrabalho        |
| **Colaboração**   | Humanos podem revisar e ajustar specs          | Melhor alinhamento      |
| **Rastreabilidade** | Histórico completo de decisões               | Facilita manutenção   |
| **Iteração**      | Specs podem ser refinadas antes do código     | Menor custo de mudança |
| **Testabilidade**   | Critérios de aceite claros desde o início    | Testes mais eficazes    |

---