from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models import AuditEvent, AuditType, Deploy, Environment, Project
from app.schemas import ApproveDeploy, AuditOut, DeployCreate, DeployOut, EnvironmentCreate, EnvironmentOut, IncidentCreate
from app.services.queue import enqueue_job
from app.services.store import snapshot
from app.services.workflows import approve_deploy, create_deploy, create_environment, simulate_incident

router = APIRouter(tags=["platform"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/overview")
def overview(db: Session = Depends(get_db)):
    return {
        "projects": db.query(Project).count(),
        "environments": db.query(Environment).count(),
        "deploys": db.query(Deploy).count(),
        "audits": db.query(AuditEvent).count(),
        "metrics": snapshot.metrics,
    }


@router.get("/environments", response_model=list[EnvironmentOut])
def list_environments(db: Session = Depends(get_db)):
    return db.query(Environment).order_by(Environment.id.desc()).all()


@router.post("/environments", response_model=EnvironmentOut, status_code=201)
def add_environment(payload: EnvironmentCreate, db: Session = Depends(get_db)):
    project = db.get(Project, payload.project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    env = create_environment(payload)
    db.add(env)
    db.add(AuditEvent(actor="platform-operator", action=AuditType.create_environment, subject=env.namespace, details="Environment requested"))
    db.commit()
    db.refresh(env)
    snapshot.logs.insert(0, {"timestamp": env.created_at.isoformat(), "message": f"Environment {env.namespace} created"})
    enqueue_job({"type": "provision_env", "environment_id": env.id})
    return env


@router.get("/deploys", response_model=list[DeployOut])
def list_deploys(db: Session = Depends(get_db)):
    return db.query(Deploy).order_by(Deploy.id.desc()).all()


@router.post("/deploys", response_model=DeployOut, status_code=201)
def add_deploy(payload: DeployCreate, db: Session = Depends(get_db)):
    if not db.get(Environment, payload.environment_id):
        raise HTTPException(status_code=404, detail="Environment not found")
    deploy = create_deploy(payload)
    db.add(deploy)
    db.add(AuditEvent(actor="release-manager", action=AuditType.request_deploy, subject=payload.version, details=payload.change_reason))
    db.commit()
    db.refresh(deploy)
    snapshot.logs.insert(0, {"timestamp": deploy.created_at.isoformat(), "message": f"Deploy {deploy.version} queued"})
    return deploy


@router.post("/deploys/{deploy_id}/approve", response_model=DeployOut)
def approve(deploy_id: int, payload: ApproveDeploy, db: Session = Depends(get_db)):
    deploy = db.get(Deploy, deploy_id)
    if not deploy:
        raise HTTPException(status_code=404, detail="Deploy not found")
    deploy = approve_deploy(deploy, payload.approved_by)
    db.add(AuditEvent(actor=payload.approved_by, action=AuditType.approve_deploy, subject=deploy.version, details="Deploy approved"))
    db.commit()
    db.refresh(deploy)
    snapshot.logs.insert(0, {"timestamp": deploy.created_at.isoformat(), "message": f"Deploy {deploy.version} approved by {payload.approved_by}"})
    enqueue_job({"type": "finalize_deploy", "deploy_id": deploy.id})
    return deploy


@router.get("/audits", response_model=list[AuditOut])
def audits(db: Session = Depends(get_db)):
    return db.query(AuditEvent).order_by(AuditEvent.id.desc()).all()


@router.post("/incidents")
def incident(payload: IncidentCreate, db: Session = Depends(get_db)):
    event = simulate_incident(payload)
    db.add(event)
    db.commit()
    return {"status": "recorded", "reason": payload.reason}
