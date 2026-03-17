from fastapi import APIRouter

from app.services.store import snapshot

router = APIRouter(tags=["health"])


@router.get("/health")
def health() -> dict:
    return {"status": "ok", "service": "platform-forge-api", "logs": len(snapshot.logs)}


@router.get("/metrics")
def metrics() -> dict:
    return {"status": "ok", "metrics": snapshot.metrics}


@router.get("/logs")
def logs() -> dict:
    return {"items": snapshot.logs}
