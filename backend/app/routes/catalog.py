from fastapi import APIRouter

router = APIRouter(tags=["catalog"])


@router.get("/catalog")
def catalog() -> dict:
    return {
        "golden_paths": [
            {
                "name": "Web App Starter",
                "owner": "platform",
                "template": "nextjs-fastapi",
                "sla": "99.9%",
                "status": "approved",
                "description": "Caminho rápido para novos produtos com deploy padronizado e observabilidade pronta.",
            },
            {
                "name": "Data Service",
                "owner": "data-platform",
                "template": "api-worker-postgres",
                "sla": "99.95%",
                "status": "approved",
                "description": "Serviço backend com fila, jobs e banco gerenciado.",
            },
            {
                "name": "Internal Tooling",
                "owner": "platform",
                "template": "internal-tools",
                "sla": "99.8%",
                "status": "controlled",
                "description": "Aplicações internas com RBAC e trilha de auditoria por padrão.",
            },
        ]
    }
