"""Зависимости запроса: сессия, пользователь, защита мутаций (D19)."""

from typing import Annotated

from fastapi import Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.errors import api_error
from app.config import settings
from app.db import get_session
from app.models import Session, User

NO_SESSION = "Сессия не найдена. Обновите страницу и попробуйте снова."
NO_CONSENT = "Сначала нужно согласие на обработку данных."
BAD_REQUEST_ORIGIN = "Запрос пришёл не из приложения. Обновите страницу и попробуйте снова."


async def current_session(
    request: Request,
    db: Annotated[AsyncSession, Depends(get_session)],
) -> Session:
    """Сессия из cookie; middleware гарантирует её для всех неслужебных путей."""
    session_id: int | None = getattr(request.state, "session_id", None)
    session = await db.get(Session, session_id) if session_id is not None else None
    if session is None:
        api_error(401, "unauthorized", NO_SESSION)
    return session


async def current_user(
    session: Annotated[Session, Depends(current_session)],
    db: Annotated[AsyncSession, Depends(get_session)],
) -> User:
    """Пользователь согласия; без него — 401 (REQ-18)."""
    if session.user_id is None:
        api_error(401, "unauthorized", NO_CONSENT)
    user = await db.get(User, session.user_id)
    if user is None:
        api_error(401, "unauthorized", NO_CONSENT)
    return user


async def require_json_same_origin(request: Request) -> None:
    """CSRF-защита мутаций: только `application/json` и Origin своего домена."""
    media_type = request.headers.get("content-type", "").partition(";")[0].strip().lower()
    origin = request.headers.get("origin")
    if media_type != "application/json" or origin != settings.app_origin:
        api_error(403, "forbidden", BAD_REQUEST_ORIGIN)
