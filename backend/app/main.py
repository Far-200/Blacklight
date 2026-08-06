from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.core.database import Base, engine
from app.routers import scope_gate


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Phase 0: create tables directly for local dev. Once the schema stabilizes,
    # switch to Alembic migrations instead of relying on create_all.
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield


app = FastAPI(
    title="Blacklight Orchestrator",
    description="AI-Augmented Multi-Surface Penetration Testing & Bug Bounty Automation Platform",
    version="0.1.0",
    lifespan=lifespan,
)

app.include_router(scope_gate.router)


@app.get("/health")
async def health():
    return {"status": "ok"}
