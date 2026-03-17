# Platform Forge

[![CI](https://github.com/CARLOS7260/Autonomous-Infrastructure-Control-Platform/actions/workflows/ci.yml/badge.svg)](https://github.com/CARLOS7260/Autonomous-Infrastructure-Control-Platform/actions/workflows/ci.yml)

Platform Forge é um **Internal Developer Platform** de referência, com foco em self-service de infraestrutura, deploy governado, auditoria e observabilidade. A proposta é se aproximar de um produto interno real usado por times de engenharia para criar ambientes, aprovar mudanças e operar aplicações com segurança.

## Visão geral

- Explora conceitos de **Platform Engineering** e **DevOps**.
- Integra **portal**, **API**, **worker** e **banco de dados** em um fluxo único.
- Inclui RBAC simplificado, trilha de auditoria e cenários de demonstração.
- Mostra fluxo de produto (ambientes, deploys, incidentes), não apenas CRUD isolado.

## Destaques visuais

- **Platform Score** para leitura executiva do estado da plataforma.
- **Golden Paths** para mostrar templates aprovados de entrega.
- **Topology** da plataforma para explicar a arquitetura rapidamente.
- **Timeline** e **Audit Trail** para dar sensação de sistema vivo.

## Stack

- **Frontend:** Next.js, TypeScript, Tailwind CSS
- **Backend:** Python, FastAPI, SQLAlchemy, Pydantic
- **Dados:** PostgreSQL e Redis
- **Infra:** Docker e Docker Compose
- **CI:** GitHub Actions

## Funcionalidades

- Portal self-service com visão de projetos, ambientes, deploys e auditoria.
- API com endpoints para saúde, métricas, identidade, catálogo, políticas, topologia, scorecard e incidentes.
- Worker assíncrono para simular jobs de infraestrutura.
- Seed automático com dados de demo para apresentação rápida.
- Interface executiva com scorecard, golden paths, timeline e trilha de auditoria.

## Arquitetura

Veja o diagrama em [docs/architecture.md](docs/architecture.md).

## Como rodar

```bash
cd "D:\Platform Forge"
docker compose -f infra/docker-compose.yml up --build
```

Serviços principais:
- Portal: http://localhost:3000
- API: http://localhost:8000
- Health: http://localhost:8000/health
- Métricas: http://localhost:8000/metrics
- Demo seed: `POST http://localhost:8000/demo/seed`

## Cenários de apresentação

1. Abrir o portal e mostrar o catálogo da plataforma.
2. Exibir os ambientes seedados e a auditoria.
3. Mostrar o Platform Score e a topologia.
4. Criar um deploy e aprovar a mudança.
5. Simular um incidente e mostrar o impacto operacional.

Os passos detalhados estão em [docs/demo-scenarios.md](docs/demo-scenarios.md).

## Estrutura

- `frontend/` - portal em Next.js
- `backend/` - API FastAPI e domínio
- `worker/` - processador assíncrono
- `infra/` - Docker e ambiente local
- `docs/` - arquitetura e cenários
- `.github/` - CI do projeto

## Próximas evoluções

- Autenticação real com OIDC.
- RBAC por times e namespaces.
- GitOps com Kubernetes.
- Aprovações multi-stage e policy engine.
- Observabilidade completa com métricas e logs centralizados.
