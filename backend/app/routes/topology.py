from fastapi import APIRouter

router = APIRouter(tags=["topology"])


@router.get("/topology")
def topology() -> dict:
    return {
        "nodes": [
            {"id": "portal", "label": "Portal", "kind": "frontend"},
            {"id": "api", "label": "API", "kind": "control-plane"},
            {"id": "worker", "label": "Worker", "kind": "runtime"},
            {"id": "postgres", "label": "PostgreSQL", "kind": "database"},
            {"id": "redis", "label": "Redis", "kind": "queue"},
            {"id": "audit", "label": "Audit Trail", "kind": "governance"},
        ],
        "edges": [
            {"from": "portal", "to": "api", "label": "self-service"},
            {"from": "api", "to": "postgres", "label": "state"},
            {"from": "api", "to": "redis", "label": "jobs"},
            {"from": "redis", "to": "worker", "label": "consume"},
            {"from": "worker", "to": "audit", "label": "events"},
            {"from": "api", "to": "audit", "label": "audit"},
        ],
    }
