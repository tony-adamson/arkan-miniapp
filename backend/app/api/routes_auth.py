"""Вход гостя и создание аккаунта по согласию (REQ-18, §11, D19)."""

import base64
import secrets
from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.exc import DBAPIError
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import current_session, require_json_same_origin
from app.api.errors import api_error
from app.db import get_session, is_lock_timeout
from app.models import Event, Session, User
from app.msk import msk_now

router = APIRouter(prefix="/auth", tags=["auth"])

BUSY_SESSION = "Согласие уже сохраняется. Секунда — и всё готово."

# 5 случайных байт → ровно 8 символов base32 без padding (REQ-15).
PUBLIC_REF_BYTES = 5


def _new_public_ref() -> str:
    return base64.b32encode(secrets.token_bytes(PUBLIC_REF_BYTES)).decode()


def _consent_response(user: User) -> dict[str, str]:
    consent_at = user.consent_at.isoformat() if user.consent_at is not None else ""
    return {"public_ref": user.public_ref, "consent_at": consent_at}


async def _first_source(db: AsyncSession, session_id: int) -> str | None:
    """Первый непустой источник сессии — first touch для `users.first_source`."""
    source = func.jsonb_extract_path_text(Event.payload, "source")
    return await db.scalar(
        select(source)
        .where(Event.session_id == session_id, source.is_not(None), source != "")
        .order_by(Event.id)
        .limit(1)
    )


@router.post("/anonymous", dependencies=[Depends(require_json_same_origin)])
async def anonymous(_session: Annotated[Session, Depends(current_session)]) -> dict[str, str]:
    """Гость получает сессию до согласия; повтор идемпотентен (D4)."""
    return {"status": "ok"}


@router.post("/consent", dependencies=[Depends(require_json_same_origin)])
async def consent(
    session: Annotated[Session, Depends(current_session)],
    db: Annotated[AsyncSession, Depends(get_session)],
) -> dict[str, str]:
    """Согласие создаёт user, привязывает его к сессии и пишет first_source.

    Повтор — тот же user, без новой строки и без события (идемпотентность §9.5).
    """
    # Строка сессии блокируется до конца транзакции: два одновременных согласия
    # иначе создают двух user, и один остаётся без сессии навсегда. Ожидание
    # ограничено `lock_timeout` соединения — дольше него клиент получает 409.
    try:
        await db.refresh(session, with_for_update=True)
    except DBAPIError as error:
        if not is_lock_timeout(error):
            raise
        await db.rollback()
        api_error(409, "conflict", BUSY_SESSION)
    if session.user_id is not None:
        user = await db.get(User, session.user_id)
        if user is not None:
            return _consent_response(user)

    user = User(
        public_ref=_new_public_ref(),
        consent_at=msk_now(),
        first_source=await _first_source(db, session.id),
    )
    db.add(user)
    await db.flush()
    session.user_id = user.id
    await db.commit()
    return _consent_response(user)
