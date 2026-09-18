"""Фабрики тестов: согласованный user с сессией и раскрытие позиции в БД.

Reveal-эндпоинт появится в фазе 9, поэтому тесты фазы 6 помечают позицию
раскрытой напрямую — так проверяется окно ответа без генерации.
"""

from __future__ import annotations

import httpx
from sqlalchemy import update
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.sessions import SESSION_COOKIE, parse_session_cookie
from app.models import Session, SpreadPosition, User
from app.msk import msk_now


async def consented_user(client: httpx.AsyncClient, db: AsyncSession) -> User:
    """Создаёт сессию и user через API, возвращает строку `users`."""
    await client.post("/auth/anonymous", json={})
    await client.post("/auth/consent", json={})
    session_id = parse_session_cookie(client.cookies.get(SESSION_COOKIE))
    assert session_id is not None
    session = await db.get(Session, session_id)
    assert session is not None and session.user_id is not None
    user = await db.get(User, session.user_id)
    assert user is not None
    return user


async def reveal_position(db: AsyncSession, spread_id: int, position_number: int) -> None:
    """Помечает позицию раскрытой напрямую в БД (без генерации толкования)."""
    await db.execute(
        update(SpreadPosition)
        .where(
            SpreadPosition.spread_id == spread_id,
            SpreadPosition.position_number == position_number,
        )
        .values(revealed_at=msk_now())
    )
    await db.commit()
