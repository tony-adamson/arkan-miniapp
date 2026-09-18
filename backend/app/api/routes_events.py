"""Приём событий входа `app_open` и `push_opened` (SOLUTION §9.5, D19)."""

from typing import Annotated, Literal

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import current_session, require_json_same_origin
from app.db import get_session
from app.events.writer import write_event
from app.models import Session

router = APIRouter(tags=["events"])


class EventIn(BaseModel):
    """Разрешены только события входа; остальное пишут серверные сервисы."""

    type: Literal["app_open", "push_opened"]
    # Источник входа (start_param, utm_source, ref); пустой — органический вход.
    source: str = Field(default="", max_length=64)


@router.post("/events", dependencies=[Depends(require_json_same_origin)])
async def create_event(
    body: EventIn,
    session: Annotated[Session, Depends(current_session)],
    db: Annotated[AsyncSession, Depends(get_session)],
) -> dict[str, str]:
    """Пишет событие входа; источник гостя живёт в payload до согласия."""
    await write_event(
        db,
        body.type,
        session_id=session.id,
        user_id=session.user_id,
        payload={"source": body.source},
    )
    await db.commit()
    return {"status": "ok"}
