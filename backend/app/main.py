from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import Base, engine
from app.core.database import SessionLocal
from app.routes.auth import router as auth_router
from app.routes.catalog import router as catalog_router
from app.routes.health import router as health_router
from app.routes.internal import router as internal_router
from app.routes.demo import router as demo_router
from app.routes.platform import router as platform_router
from app.routes.policies import router as policies_router
from app.routes.scorecard import router as scorecard_router
from app.routes.projects import router as projects_router
from app.routes.timeline import router as timeline_router
from app.routes.topology import router as topology_router
from app.services.store import snapshot
from app.seed_demo import seed_demo

Base.metadata.create_all(bind=engine)
with SessionLocal() as db:
    seed_demo(db)

app = FastAPI(title=settings.app_name, version=settings.api_version)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in settings.cors_origins.split(",")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(auth_router)
app.include_router(catalog_router)
app.include_router(demo_router)
app.include_router(policies_router)
app.include_router(scorecard_router)
app.include_router(projects_router)
app.include_router(timeline_router)
app.include_router(topology_router)
app.include_router(platform_router)
app.include_router(internal_router)


@app.get("/")
def root():
    snapshot.metrics["api_requests"] += 1
    return {
        "name": settings.app_name,
        "version": settings.api_version,
        "message": "Platform Forge API is running",
    }
