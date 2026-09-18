"""Сессия гостя до согласия (SOLUTION §9.7, §11; D19).

Middleware выдаёт cookie `arkan_sid` на каждый запрос, кроме служебных
`/healthz` и `/metrics`. Заголовок `Set-Cookie` собирается вручную: Starlette
принимает параметр `partitioned` только на Python 3.14, а Telegram Web открывает
Mini App во вложенном iframe, где нужен `SameSite=None; Secure; Partitioned`.

Значение cookie — `<id>.<подпись HMAC-SHA256>`: без подписи клиент подставил бы
соседний номер и получил чужую сессию вместе с её согласием и историей.
"""

import base64
import hmac

from sqlalchemy.exc import DBAPIError
from starlette.datastructures import MutableHeaders
from starlette.requests import Request
from starlette.types import ASGIApp, Message, Receive, Scope, Send

from app.config import settings
from app.db import SessionLocal, is_lock_timeout
from app.models import Session
from app.msk import msk_now

SESSION_COOKIE = "arkan_sid"
SESSION_MAX_AGE = 15552000  # 180 суток (§11)
EXEMPT_PATHS = frozenset({"/healthz", "/metrics"})
# id сессии — bigint, длиннее 19 цифр он не бывает; строку длиннее не разбираем,
# чтобы `int()` не считал мегабайтное число из запроса.
MAX_ID_DIGITS = 19


def _signature(session_id: int) -> str:
    digest = hmac.digest(settings.session_secret.encode(), str(session_id).encode(), "sha256")
    return base64.urlsafe_b64encode(digest).decode().rstrip("=")


def session_cookie_value(session_id: int) -> str:
    """Значение cookie: номер сессии и его подпись."""
    return f"{session_id}.{_signature(session_id)}"


def parse_session_cookie(value: str | None) -> int | None:
    """id сессии из подписанной cookie; подделка, мусор и пустота — `None`."""
    if not value:
        return None
    raw_id, _, signature = value.partition(".")
    # `str.isdigit` пропускает юникодные цифры («٣»), на которых `int()` падает.
    if not signature or not raw_id.isascii() or not raw_id.isdigit():
        return None
    if len(raw_id) > MAX_ID_DIGITS:
        return None
    session_id = int(raw_id)
    if not hmac.compare_digest(signature, _signature(session_id)):
        return None
    return session_id


def session_cookie_header(session_id: int) -> str:
    """Заголовок Set-Cookie с атрибутами D19."""
    return (
        f"{SESSION_COOKIE}={session_cookie_value(session_id)}; HttpOnly; Secure; "
        f"SameSite=None; Partitioned; Max-Age={SESSION_MAX_AGE}; Path=/"
    )


async def resolve_session(cookie: str | None) -> tuple[int, bool]:
    """Возвращает `(session_id, created)` и обновляет `last_seen` валидной сессии.

    Невалидная или отсутствующая cookie — гостевая строка `sessions` с
    `user_id=NULL`: сессия существует до согласия (REQ-18).
    """
    session_id = parse_session_cookie(cookie)
    async with SessionLocal() as db:
        session = await db.get(Session, session_id) if session_id is not None else None
        if session is None:
            session = Session(user_id=None, last_seen=msk_now())
            db.add(session)
            await db.commit()
            return session.id, True
        session.last_seen = msk_now()
        # id снимаем до коммита: откат разворачивает объект, и чтение поля
        # после него ушло бы в базу уже за пределами async-контекста.
        resolved_id = session.id
        try:
            await db.commit()
        except DBAPIError as error:
            if not is_lock_timeout(error):
                raise
            # `last_seen` — мягкая отметка: строку держит чужая транзакция
            # (например, согласие той же сессии), и ронять из-за неё запрос нельзя.
            await db.rollback()
        return resolved_id, False


class SessionMiddleware:
    """Проставляет id сессии в `request.state` и выдаёт cookie новому гостю."""

    def __init__(self, app: ASGIApp) -> None:
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http" or scope["path"] in EXEMPT_PATHS:
            await self.app(scope, receive, send)
            return

        cookie = Request(scope, receive).cookies.get(SESSION_COOKIE)
        session_id, created = await resolve_session(cookie)
        scope.setdefault("state", {})["session_id"] = session_id

        async def send_with_cookie(message: Message) -> None:
            if created and message["type"] == "http.response.start":
                headers = MutableHeaders(scope=message)
                headers.append("set-cookie", session_cookie_header(session_id))
            await send(message)

        await self.app(scope, receive, send_with_cookie)
