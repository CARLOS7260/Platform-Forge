from sqlalchemy.orm import Session

from app.models import AuditEvent, AuditType, DeployStatus, EnvironmentStatus, Project
from app.schemas import DeployCreate, EnvironmentCreate, IncidentCreate, ProjectCreate
from app.services.store import snapshot
from app.services.workflows import create_deploy, create_environment, create_project, simulate_incident


def seed_demo(db: Session) -> None:
    if db.query(Project).count():
        return

    project = create_project(ProjectCreate(name="payments-platform", description="Core payments services", owner="team-platform"))
    db.add(project)
    db.commit()
    db.refresh(project)

    env = create_environment(
        EnvironmentCreate(project_id=project.id, name="Production", namespace="prod-payments", cpu=4, memory_gb=16)
    )
    env.status = EnvironmentStatus.ready
    db.add(env)
    db.commit()
    db.refresh(env)

    deploy = create_deploy(DeployCreate(environment_id=env.id, version="v2.8.0", change_reason="Blue/green release with policy gate"))
    deploy.status = DeployStatus.succeeded
    deploy.approved_by = "release-manager@platformforge.io"
    db.add(deploy)
    db.add(simulate_incident(IncidentCreate(actor="platform-operator", reason="CPU spike detected in checkout service")))
    db.commit()
    snapshot.metrics["environments_ready"] = 1
    snapshot.metrics["deploys_running"] = 0

    db.add_all([
        AuditEvent(actor="team-platform", action=AuditType.project_created, subject=project.name, details="Seeded project"),
        AuditEvent(actor="platform-operator", action=AuditType.create_environment, subject=env.namespace, details="Seeded environment"),
        AuditEvent(actor="release-manager", action=AuditType.approve_deploy, subject=deploy.version, details="Seeded deploy approval"),
    ])
    db.commit()
