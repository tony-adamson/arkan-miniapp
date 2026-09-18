"""События входа: payload гостя, белый список типов, CSRF (фаза 3, D19)."""

import httpx
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.sessions import SESSION_COOKIE
from app.models import Event


def session_id(client: httpx.AsyncClient) -> int:
    value = client.cookies.get(SESSION_COOKIE)
    assert value is not None
    return int(value)


async def event_payload(db_session: AsyncSession, sid: int, type_: str) -> dict[str, object] | None:
    return await db_session.scalar(
        select(Event.payload).where(Event.session_id == sid, Event.type == type_)
    )


async def test_app_open_of_guest_has_no_user(
    client: httpx.AsyncClient, db_session: AsyncSession
) -> None:
    response = await client.post("/events", json={"type": "app_open", "source": "tg_channel"})
    assert response.status_code == 200

    sid = session_id(client)
    user_id = await db_session.scalar(
        select(Event.user_id).where(Event.session_id == sid, Event.type == "app_open")
    )
    assert user_id is None
    assert await event_payload(db_session, sid, "app_open") == {"source": "tg_channel"}


async def test_push_opened_is_accepted(client: httpx.AsyncClient, db_session: AsyncSession) -> None:
    response = await client.post("/events", json={"type": "push_opened", "source": "push"})
    assert response.status_code == 200

    sid = session_id(client)
    assert await event_payload(db_session, sid, "push_opened") == {"source": "push"}


async def test_forbidden_event_type_rejected(client: httpx.AsyncClient) -> None:
    response = await client.post("/events", json={"type": "card_revealed", "source": "x"})

    assert response.status_code == 422
    assert response.json()["error"] == "validation"


async def test_non_json_content_type_rejected(client: httpx.AsyncClient) -> None:
    response = await client.post("/events", content="{}", headers={"Content-Type": "text/plain"})

    assert response.status_code == 403
    assert response.json()["error"] == "forbidden"


async def test_foreign_origin_rejected(client: httpx.AsyncClient) -> None:
    response = await client.post(
        "/events",
        json={"type": "app_open", "source": "x"},
        headers={"Origin": "https://evil.test"},
    )

    assert response.status_code == 403
    assert response.json()["error"] == "forbidden"
