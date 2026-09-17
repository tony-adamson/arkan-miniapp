"""FastAPI-приложение: точка входа api-процесса (один uvicorn-воркер)."""

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI, Response
from prometheus_client import CONTENT_TYPE_LATEST, generate_latest


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncIterator[None]:
    """Место для старта фоновых задач (бот, напоминания) в поздних фазах."""
    yield


app = FastAPI(title="Arkan API", lifespan=lifespan)


@app.get("/healthz")
async def healthz() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/metrics")
async def metrics() -> Response:
    return Response(content=generate_latest(), media_type=CONTENT_TYPE_LATEST)
