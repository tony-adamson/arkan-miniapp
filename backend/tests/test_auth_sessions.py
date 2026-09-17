"""Сессии гостя, cookie D19 и создание user по согласию (фаза 3)."""

from datetime import UTC, datetime

import httpx
from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.sessions import SESSION_COOKIE, SESSION_MAX_AGE
from app.models import Event, Session, User

PAST = datetime(2020, 1, 1, tzinfo=UTC)


def session_id(client: httpx.AsyncClient) -> int:
    value = client.cookies.get(SESSION_COOKIE)
    assert value is not None
    return int(value)


async def session_count(db_session: AsyncSession) -> int:
    return await db_session.scalar(select(func.count()).select_from(Session)) or 0


async def test_first_request_issues_session_cookie(client: httpx.AsyncClient) -> None:
    response = await client.post("/auth/anonymous", json={})

    assert response.status_code == 200
    header = response.headers["set-cookie"]
    assert header.startswith(f"{SESSION_COOKIE}=")
    assert "HttpOnly" in header
    assert "Secure" in header
    assert "SameSite=None" in header
    assert "Partitioned" in header
    assert f"Max-Age={SESSION_MAX_AGE}" in header
    assert "Path=/" in header


async def test_first_request_creates_guest_session_row(
    client: httpx.AsyncClient, db_session: AsyncSession
) -> None:
    response = await client.post("/auth/anonymous", json={})
    sid = int(response.cookies[SESSION_COOKIE])

    count = await db_session.scalar(
        select(func.count()).select_from(Session).where(Session.id == sid)
    )
    assert count == 1
    assert await db_session.scalar(select(Session.user_id).where(Session.id == sid)) is None


async def test_second_request_reuses_session(
    client: httpx.AsyncClient, db_session: AsyncSession
) -> None:
    first = await client.post("/auth/anonymous", json={})
    sid = int(first.cookies[SESSION_COOKIE])
    sessions_before = await session_count(db_session)

    second = await client.post("/auth/anonymous", json={})

    assert second.status_code == 200
    assert "set-cookie" not in second.headers
    assert session_id(client) == sid
    assert await session_count(db_session) == sessions_before


async def test_last_seen_is_refreshed(client: httpx.AsyncClient, db_session: AsyncSession) -> None:
    await client.post("/auth/anonymous", json={})
    sid = session_id(client)
    await db_session.execute(update(Session).where(Session.id == sid).values(last_seen=PAST))
    await db_session.commit()

    await client.post("/auth/anonymous", json={})

    last_seen = await db_session.scalar(select(Session.last_seen).where(Session.id == sid))
    assert last_seen is not None and last_seen > PAST


async def test_service_paths_create_no_session(
    client: httpx.AsyncClient, db_session: AsyncSession
) -> None:
    before = await session_count(db_session)

    for path in ("/healthz", "/metrics"):
        response = await client.get(path)
        assert response.status_code == 200
        assert "set-cookie" not in response.headers

    assert await session_count(db_session) == before


async def test_consent_creates_user_and_transfers_source(
    client: httpx.AsyncClient, db_session: AsyncSession
) -> None:
    await client.post("/events", json={"type": "app_open", "source": "tg_channel"})
    sid = session_id(client)

    response = await client.post("/auth/consent", json={})

    assert response.status_code == 200
    public_ref = response.json()["public_ref"]
    assert len(public_ref) == 8
    user_id = await db_session.scalar(select(Session.user_id).where(Session.id == sid))
    assert user_id is not None
    user = await db_session.get(User, user_id)
    assert user is not None
    assert user.public_ref == public_ref
    assert user.consent_at is not None
    assert user.first_source == "tg_channel"


async def test_repeat_consent_keeps_user_and_writes_no_events(
    client: httpx.AsyncClient, db_session: AsyncSession
) -> None:
    await client.post("/events", json={"type": "app_open", "source": "source_a"})
    sid = session_id(client)
    first = await client.post("/auth/consent", json={})
    events_before = await db_session.scalar(
        select(func.count()).select_from(Event).where(Event.session_id == sid)
    )

    second = await client.post("/auth/consent", json={})

    assert first.status_code == 200 and second.status_code == 200
    public_ref = first.json()["public_ref"]
    assert second.json()["public_ref"] == public_ref
    users = await db_session.scalar(
        select(func.count()).select_from(User).where(User.public_ref == public_ref)
    )
    assert users == 1
    events_after = await db_session.scalar(
        select(func.count()).select_from(Event).where(Event.session_id == sid)
    )
    assert events_after == events_before


async def test_second_app_open_does_not_overwrite_first_source(
    client: httpx.AsyncClient, db_session: AsyncSession
) -> None:
    await client.post("/events", json={"type": "app_open", "source": "source_a"})
    consent = await client.post("/auth/consent", json={})

    await client.post("/events", json={"type": "app_open", "source": "source_b"})
    repeat = await client.post("/auth/consent", json={})

    public_ref = consent.json()["public_ref"]
    assert repeat.json()["public_ref"] == public_ref
    first_source = await db_session.scalar(
        select(User.first_source).where(User.public_ref == public_ref)
    )
    assert first_source == "source_a"
