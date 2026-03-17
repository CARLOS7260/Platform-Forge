# Arquitetura

```mermaid
flowchart LR
  Dev[Developer] --> Portal[Next.js Portal]
  Portal --> Api[FastAPI API]
  Api --> Db[(PostgreSQL)]
  Api --> Redis[(Redis Queue)]
  Redis --> Worker[Async Worker]
  Worker --> Provider[Mock Provider Layer]
  Api --> Audit[Audit Trail]
  Api --> Obs[Metrics and Health]
  Obs --> Dash[Operational Dashboard]
```

## Fluxo
1. O usuário entra no portal e escolhe um serviço.
2. A API valida permissões, grava auditoria e cria o deploy.
3. O worker consome a fila e simula provisionamento.
4. O dashboard mostra estado, métricas e histórico.
