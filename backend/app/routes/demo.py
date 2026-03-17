from fastapi import APIRouter

from app.core.database import SessionLocal
from app.seed_demo import seed_demo
from app.services.store import snapshot

router = APIRouter(prefix="/demo", tags=["demo"])


@router.post("/seed")
def seed() -> dict:
    with SessionLocal() as db:
        seed_demo(db)
    snapshot.push_log("Demo data seeded")
    return {"status": "seeded"}


@router.post("/simulate/cpu-spike")
def cpu_spike() -> dict:
    snapshot.metrics["api_requests"] += 1
    snapshot.push_log("Simulated incident: CPU spike")
    return {"status": "incident-created", "type": "cpu-spike"}


@router.post("/simulate/deploy-storm")
def deploy_storm() -> dict:
    snapshot.metrics["deploys_running"] += 3
    snapshot.push_log("Simulated incident: deploy storm")
    return {"status": "incident-created", "type": "deploy-storm"}
