"""Единственный путь записи событий: append-only INSERT (SOLUTION §9.4, §11).

Модуль намеренно умеет только вставлять строки: события не обновляются и не
удаляются, поэтому UPDATE/DELETE здесь отсутствуют.
"""

from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Event


async def write_event(
    db: AsyncSession,
    type: str,
    session_id: int | None = None,
    user_id: int | None = None,
    layer: str | None = None,
    payload: dict[str, Any] | None = None,
) -> Event:
    """Вставляет событие и возвращает его. Коммит — на вызывающем коде."""
    event = Event(
        type=type,
        session_id=session_id,
        user_id=user_id,
        layer=layer,
        payload=payload if payload is not None else {},
    )
    db.add(event)
    await db.flush()
    return event
