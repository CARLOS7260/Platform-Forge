from fastapi import APIRouter, Header, HTTPException
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import SessionLocal
from app.models import Deploy, DeployStatus, Environment, EnvironmentStatus
from app.services.store import snapshot

router = APIRouter(prefix="/internal", tags=["internal"])


def require_internal_token(x_internal_token: str | None) -> None:
    if not x_internal_token or x_internal_token != settings.internal_token:
        raise HTTPException(status_code=401, detail="Unauthorized")


@router.post("/environments/{environment_id}/ready")
def mark_environment_ready(environment_id: int, x_internal_token: str | None = Header(default=None)) -> dict:
    require_internal_token(x_internal_token)
    with SessionLocal() as db:
        env = db.get(Environment, environment_id)
        if not env:
            raise HTTPException(status_code=404, detail="Environment not found")
        env.status = EnvironmentStatus.ready
        db.commit()
        snapshot.metrics["environments_ready"] = snapshot.metrics.get("environments_ready", 0) + 1
        snapshot.push_log(f"Environment {env.namespace} is ready")
        return {"status": "ok"}


@router.post("/deploys/{deploy_id}/succeed")
def mark_deploy_succeeded(deploy_id: int, x_internal_token: str | None = Header(default=None)) -> dict:
    require_internal_token(x_internal_token)
    with SessionLocal() as db:
        deploy = db.get(Deploy, deploy_id)
        if not deploy:
            raise HTTPException(status_code=404, detail="Deploy not found")
        deploy.status = DeployStatus.succeeded
        db.commit()
        snapshot.metrics["deploys_running"] = max(snapshot.metrics.get("deploys_running", 0) - 1, 0)
        snapshot.push_log(f"Deploy {deploy.version} succeeded")
        return {"status": "ok"}

