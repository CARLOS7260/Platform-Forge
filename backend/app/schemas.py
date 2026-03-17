from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class ProjectCreate(BaseModel):
    name: str
    description: str = ""
    owner: str = "platform-team"


class EnvironmentCreate(BaseModel):
    project_id: int
    name: str
    namespace: str
    cpu: int = 1
    memory_gb: int = 2


class DeployCreate(BaseModel):
    environment_id: int
    version: str
    change_reason: str = ""


class ApproveDeploy(BaseModel):
    approved_by: str = Field(default="reviewer@company.com")


class IncidentCreate(BaseModel):
    actor: str = "platform-operator"
    reason: str


class ProjectOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    description: str
    owner: str
    created_at: datetime


class EnvironmentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    project_id: int
    name: str
    namespace: str
    status: str
    cpu: int
    memory_gb: int
    created_at: datetime


class DeployOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    environment_id: int
    version: str
    status: str
    change_reason: str
    approved_by: str
    created_at: datetime


class AuditOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    actor: str
    action: str
    subject: str
    details: str
    created_at: datetime
