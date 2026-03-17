from app.models import AuditEvent, AuditType, Deploy, DeployStatus, Environment, EnvironmentStatus, Project
from app.schemas import DeployCreate, EnvironmentCreate, IncidentCreate, ProjectCreate
from app.services.store import snapshot


def create_project(payload: ProjectCreate) -> Project:
    return Project(name=payload.name, description=payload.description, owner=payload.owner)


def create_environment(payload: EnvironmentCreate) -> Environment:
    env = Environment(
        project_id=payload.project_id,
        name=payload.name,
        namespace=payload.namespace,
        cpu=payload.cpu,
        memory_gb=payload.memory_gb,
        status=EnvironmentStatus.pending,
    )
    snapshot.push_log(f"Environment requested: {payload.namespace}")
    return env


def create_deploy(payload: DeployCreate) -> Deploy:
    snapshot.metrics["deploys_running"] += 1
    return Deploy(environment_id=payload.environment_id, version=payload.version, change_reason=payload.change_reason, status=DeployStatus.queued)


def approve_deploy(deploy: Deploy, approved_by: str) -> Deploy:
    deploy.status = DeployStatus.running
    deploy.approved_by = approved_by
    snapshot.push_log(f"Deploy approved by {approved_by}")
    return deploy


def simulate_incident(payload: IncidentCreate) -> AuditEvent:
    snapshot.push_log(f"Incident simulated: {payload.reason}")
    return AuditEvent(
        actor=payload.actor,
        action=AuditType.simulate_incident,
        subject="platform",
        details=payload.reason,
    )
