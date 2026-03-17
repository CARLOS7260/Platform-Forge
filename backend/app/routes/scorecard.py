from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models import AuditEvent, Deploy, Environment, Project
from app.services.store import snapshot

router = APIRouter(tags=["scorecard"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/scorecard")
def scorecard(db: Session = Depends(get_db)) -> dict:
    projects = db.query(Project).count()
    environments = db.query(Environment).count()
    deploys = db.query(Deploy).count()
    audits = db.query(AuditEvent).count()
    readiness = min(100, 40 + projects * 8 + environments * 6 + deploys * 4 + audits * 2)
    return {
        "readiness": readiness,
        "signals": [
            {"name": "Golden paths", "value": "3 aprovados"},
            {"name": "Approval latency", "value": "1.2 min"},
            {"name": "Audit coverage", "value": f"{audits} eventos"},
            {"name": "Platform health", "value": "operacional"},
        ],
        "metrics": snapshot.metrics,
    }
