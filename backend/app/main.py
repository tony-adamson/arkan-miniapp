"""FastAPI-приложение: точка входа api-процесса (один uvicorn-воркер)."""

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI, Response
from prometheus_client import CONTENT_TYPE_LATEST, generate_latest

from app.api.errors import register_error_handlers
from app.api.routes_auth import router as auth_router
from app.api.routes_events import router as events_router
from app.auth.sessions import SessionMiddleware


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncIterator[None]:
    """Место для старта фоновых задач (бот, напоминания) в поздних фазах."""
    yield


app = FastAPI(title="Arkan API", lifespan=lifespan)
register_error_handlers(app)
app.add_middleware(SessionMiddleware)
app.include_router(auth_router)
app.include_router(events_router)


@app.get("/healthz")
async def healthz() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/metrics")
async def metrics() -> Response:
    return Response(content=generate_latest(), media_type=CONTENT_TYPE_LATEST)
