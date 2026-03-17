from datetime import datetime, timezone
from enum import Enum

from sqlalchemy import DateTime, Enum as SAEnum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class EnvironmentStatus(str, Enum):
    pending = "pending"
    ready = "ready"
    failed = "failed"
    deleting = "deleting"


class DeployStatus(str, Enum):
    queued = "queued"
    running = "running"
    succeeded = "succeeded"
    failed = "failed"


class AuditType(str, Enum):
    project_created = "project_created"
    create_environment = "create_environment"
    request_deploy = "request_deploy"
    approve_deploy = "approve_deploy"
    simulate_incident = "simulate_incident"


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    description: Mapped[str] = mapped_column(Text, default="")
    owner: Mapped[str] = mapped_column(String(120), default="platform-team")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

    environments: Mapped[list["Environment"]] = relationship(back_populates="project")


class Environment(Base):
    __tablename__ = "environments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"))
    name: Mapped[str] = mapped_column(String(120))
    namespace: Mapped[str] = mapped_column(String(120), unique=True)
    status: Mapped[EnvironmentStatus] = mapped_column(SAEnum(EnvironmentStatus), default=EnvironmentStatus.pending)
    cpu: Mapped[int] = mapped_column(Integer, default=1)
    memory_gb: Mapped[int] = mapped_column(Integer, default=2)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

    project: Mapped[Project] = relationship(back_populates="environments")
    deploys: Mapped[list["Deploy"]] = relationship(back_populates="environment")


class Deploy(Base):
    __tablename__ = "deploys"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    environment_id: Mapped[int] = mapped_column(ForeignKey("environments.id"))
    version: Mapped[str] = mapped_column(String(80))
    status: Mapped[DeployStatus] = mapped_column(SAEnum(DeployStatus), default=DeployStatus.queued)
    change_reason: Mapped[str] = mapped_column(Text, default="")
    approved_by: Mapped[str] = mapped_column(String(120), default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

    environment: Mapped[Environment] = relationship(back_populates="deploys")


class AuditEvent(Base):
    __tablename__ = "audit_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    actor: Mapped[str] = mapped_column(String(120))
    action: Mapped[AuditType] = mapped_column(SAEnum(AuditType))
    subject: Mapped[str] = mapped_column(String(160))
    details: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
