"""Машина раскладов без генерации: карты из сида, окно ответа, история (фаза 6).

Ожидания независимы от реализации: карты пересчитываются `draw(seed, n, True)`
из `engines/deck.py` (§10.4), окно ответа — из `SOLUTION.md` §10.
"""

from __future__ import annotations

import asyncio
from datetime import timedelta

import httpx
import pytest
from redis.asyncio import Redis
from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.pool import NullPool

from app.config import settings
from app.engine.deck import ask_variant, draw
from app.expert import base as expert_base
from app.main import app
from app.models import Event, Spread
from app.redis import get_redis
from app.spread import service
from tests import factories

QUESTION = "Как мне поступить в этой ситуации?"
# §7: раскрытая позиция добавляет карту, тексты и (null до фазы 9) вопрос с вариантами.
UNREVEALED_KEYS = {"position_number", "position_name", "revealed"}
REVEALED_EXTRA = (
    "card_id",
    "revealed_at",
    "ask_variant",
    "interpretation",
    "verify_status",
    "ask_answer",
    "question",
    "options",
)
REVEALED_KEYS = UNREVEALED_KEYS | set(REVEALED_EXTRA)


async def create(client: httpx.AsyncClient, question: str = QUESTION, key: str | None = None):
    headers = {"Idempotency-Key": key} if key is not None else None
    return await client.post("/spreads", json={"question": question}, headers=headers)


async def answer(client: httpx.AsyncClient, spread_id: int, position: int, text: str):
    return await client.post(
        f"/spreads/{spread_id}/answer",
        json={"position": position, "answer": text},
    )


async def spread_count(db: AsyncSession, user_id: int) -> int:
    count = await db.scalar(
        select(func.count()).select_from(Spread).where(Spread.user_id == user_id)
    )
    return count or 0


async def answer_events(db: AsyncSession, user_id: int, position: int) -> int:
    payload_position = Event.payload["position"].as_integer()
    count = await db.scalar(
        select(func.count())
        .select_from(Event)
        .where(
            Event.type == "clarifying_answer",
            Event.user_id == user_id,
            payload_position == position,
        )
    )
    return count or 0


async def test_positions_are_drawn_from_seed(
    client: httpx.AsyncClient, db_session: AsyncSession
) -> None:
    user = await factories.consented_user(client, db_session)

    response = await create(client)

    assert response.status_code == 201
    body = response.json()
    assert body["next_action"] == "reveal 1"
    assert body["status"] == "active"

    spread = await db_session.get(Spread, body["id"])
    positions = await service.positions_of(db_session, body["id"])
    assert spread is not None and spread.category == "choice"
    assert [item.card_id for item in positions] == draw(spread.seed, len(positions), True)
    assert [item.ask_variant for item in positions] == [
        ask_variant(spread.seed, item.position_number) for item in positions
    ]
    assert all(item.revealed_at is None for item in positions)

    event = await db_session.scalar(
        select(Event).where(Event.type == "question_sent", Event.user_id == user.id)
    )
    assert event is not None and event.payload["spread_id"] == spread.id


async def test_idempotency_key_returns_same_spread(
    client: httpx.AsyncClient, db_session: AsyncSession
) -> None:
    user = await factories.consented_user(client, db_session)

    first = await create(client, key="double-click")
    second = await create(client, key="double-click")

    assert first.status_code == 201 and second.status_code == 201
    assert first.json()["id"] == second.json()["id"]
    assert await spread_count(db_session, user.id) == 1


async def test_pending_idempotency_key_conflicts(
    client: httpx.AsyncClient, db_session: AsyncSession
) -> None:
    user = await factories.consented_user(client, db_session)
    # Конкурент успел зарезервировать ключ, но ещё создаёт расклад (fail-open §9.6).
    await get_redis().set(f"spread:idem:{user.id}:inflight", "pending", ex=600)

    response = await create(client, key="inflight")

    assert response.status_code == 409
    assert response.json()["error"] == "conflict"
    assert await spread_count(db_session, user.id) == 0


async def test_unrevealed_cards_never_leak(
    client: httpx.AsyncClient, db_session: AsyncSession
) -> None:
    await factories.consented_user(client, db_session)
    spread_id = (await create(client, question="Подскажи, как быть с этим решением?")).json()["id"]

    hidden = {
        item.card_id
        for item in await service.positions_of(db_session, spread_id)
        if item.revealed_at is None
    }
    assert hidden

    detail = await client.get(f"/spreads/{spread_id}")
    assert detail.status_code == 200
    for position in detail.json()["positions"]:
        assert set(position) == UNREVEALED_KEYS
        assert position["revealed"] is False
    for card_id in hidden:
        assert card_id not in detail.text

    listing = await client.get("/spreads")
    assert listing.status_code == 200
    for item in listing.json()["spreads"]:
        for position in item["positions"]:
            assert "card_id" not in position


async def test_answer_of_unrevealed_position_conflicts(
    client: httpx.AsyncClient, db_session: AsyncSession
) -> None:
    await factories.consented_user(client, db_session)
    spread_id = (await create(client)).json()["id"]

    response = await answer(client, spread_id, 1, "Уже отвечаю")

    assert response.status_code == 409
    assert response.json()["error"] == "conflict"


async def test_answer_opens_next_position(
    client: httpx.AsyncClient, db_session: AsyncSession
) -> None:
    user = await factories.consented_user(client, db_session)
    spread_id = (await create(client)).json()["id"]
    await factories.reveal_position(db_session, spread_id, 1)

    response = await answer(client, spread_id, 1, "Да, узнаю")

    assert response.status_code == 200
    body = response.json()
    assert body["next_action"] == "reveal 2"
    first = next(item for item in body["positions"] if item["position_number"] == 1)
    assert set(first) == REVEALED_KEYS
    assert first["revealed"] is True and first["card_id"]
    assert first["question"] is None and first["options"] is None
    assert (await service.positions_of(db_session, spread_id))[0].ask_answer == "Да, узнаю"
    assert await answer_events(db_session, user.id, 1) == 1


async def test_repeat_answer_overwrites_until_next_revealed(
    client: httpx.AsyncClient, db_session: AsyncSession
) -> None:
    user = await factories.consented_user(client, db_session)
    spread_id = (await create(client)).json()["id"]
    await factories.reveal_position(db_session, spread_id, 1)

    assert (await answer(client, spread_id, 1, "Первый вариант")).status_code == 200
    overwrite = await answer(client, spread_id, 1, "Второй вариант")

    assert overwrite.status_code == 200
    assert (await service.positions_of(db_session, spread_id))[0].ask_answer == "Второй вариант"
    assert await answer_events(db_session, user.id, 1) == 1

    await factories.reveal_position(db_session, spread_id, 2)

    assert (await answer(client, spread_id, 1, "Третий вариант")).status_code == 409


async def test_foreign_spread_is_hidden(
    client: httpx.AsyncClient, db_session: AsyncSession
) -> None:
    await factories.consented_user(client, db_session)
    spread_id = (await create(client)).json()["id"]

    stranger = httpx.AsyncClient(
        transport=httpx.ASGITransport(app=app),
        base_url="https://testserver",
        headers={"Origin": "https://testserver"},
    )
    async with stranger:
        await factories.consented_user(stranger, db_session)
        assert (await stranger.get(f"/spreads/{spread_id}")).status_code == 404
        assert (await answer(stranger, spread_id, 1, "Чужой ответ")).status_code == 404

    assert (await client.get("/spreads/999999")).status_code == 404


async def test_daily_limit_and_next_day(
    client: httpx.AsyncClient, db_session: AsyncSession
) -> None:
    user = await factories.consented_user(client, db_session)
    for index in range(5):
        assert (await create(client, question=f"Вопрос номер {index} про дело")).status_code == 201

    blocked = await create(client, question="Шестой вопрос за эти сутки")

    assert blocked.status_code == 429
    assert blocked.json()["error"] == "rate_limited"
    assert await spread_count(db_session, user.id) == 5

    await db_session.execute(
        update(Spread)
        .where(Spread.user_id == user.id)
        .values(created_at=Spread.created_at - timedelta(days=1))
    )
    await db_session.commit()

    assert (await create(client, question="Первый вопрос новых суток")).status_code == 201


async def test_second_spread_keeps_first(
    client: httpx.AsyncClient, db_session: AsyncSession
) -> None:
    """Второй расклад не трогает первый; история — по `created_at` убыв. (D11)."""
    await factories.consented_user(client, db_session)
    first = (await create(client, question="Первый вопрос о моей ситуации")).json()
    snapshot = [
        (item.position_number, item.card_id)
        for item in await service.positions_of(db_session, first["id"])
    ]

    second = (await create(client, question="Второй вопрос о другом деле")).json()
    await db_session.execute(
        update(Spread)
        .where(Spread.id == first["id"])
        .values(created_at=Spread.created_at - timedelta(hours=1))
    )
    await db_session.commit()

    assert second["id"] != first["id"]
    db_session.expire_all()
    assert [
        (item.position_number, item.card_id)
        for item in await service.positions_of(db_session, first["id"])
    ] == snapshot
    detail = (await client.get(f"/spreads/{first['id']}")).json()
    assert detail["question"] == "Первый вопрос о моей ситуации"
    assert detail["status"] == "active"
    listing = (await client.get("/spreads")).json()["spreads"]
    assert [item["id"] for item in listing] == [second["id"], first["id"]]


async def test_question_length_bounds(client: httpx.AsyncClient, db_session: AsyncSession) -> None:
    await factories.consented_user(client, db_session)

    short = await create(client, question="q" * 9)
    long = await create(client, question="q" * 501)

    assert short.status_code == 422 and short.json()["error"] == "validation"
    assert long.status_code == 422 and long.json()["error"] == "validation"
    assert (await create(client, question="q" * 10)).status_code == 201
    assert (await create(client, question="q" * 500)).status_code == 201


async def test_redis_unavailable_still_creates(
    client: httpx.AsyncClient, db_session: AsyncSession, monkeypatch
) -> None:
    user = await factories.consented_user(client, db_session)
    dead = Redis.from_url(
        "redis://127.0.0.1:56380/1", decode_responses=True, socket_connect_timeout=0.2
    )
    monkeypatch.setattr("app.spread.service.get_redis", lambda: dead)
    try:
        response = await create(client, key="redis-down")
    finally:
        await dead.aclose()

    assert response.status_code == 201
    assert await spread_count(db_session, user.id) == 1


async def test_next_action_reaches_summary_and_done(
    client: httpx.AsyncClient, db_session: AsyncSession
) -> None:
    await factories.consented_user(client, db_session)
    spread_id = (await create(client)).json()["id"]

    for number in (1, 2, 3):
        await factories.reveal_position(db_session, spread_id, number)
        response = await answer(client, spread_id, number, f"Ответ {number}")
        assert response.status_code == 200

    assert response.json()["next_action"] == "summary"

    await db_session.execute(
        update(Spread)
        .where(Spread.id == spread_id)
        .values(status="completed", summary="Итог расклада")
    )
    await db_session.commit()

    assert (await client.get(f"/spreads/{spread_id}")).json()["next_action"] == "done"


async def test_parallel_creates_do_not_exceed_daily_limit(
    client: httpx.AsyncClient, db_session: AsyncSession
) -> None:
    """Шесть одновременных запросов при лимите 5 создают ровно 5 (O31/F4)."""
    user = await factories.consented_user(client, db_session)

    responses = await asyncio.gather(
        *[create(client, question=f"Одновременный вопрос {index} про дело") for index in range(6)]
    )

    codes = sorted(response.status_code for response in responses)
    assert codes == [201, 201, 201, 201, 201, 429]
    assert await spread_count(db_session, user.id) == 5


async def test_failed_insert_releases_idempotency_key(
    client: httpx.AsyncClient, db_session: AsyncSession, monkeypatch: pytest.MonkeyPatch
) -> None:
    """Упавшая вставка снимает резерв: повтор не ждёт TTL и не получает 409 (O31/F5)."""
    user = await factories.consented_user(client, db_session)

    async def boom(*args: object, **kwargs: object) -> Spread:
        raise RuntimeError("вставка не дошла до коммита")

    monkeypatch.setattr(service, "_insert_spread", boom)
    with pytest.raises(RuntimeError):
        await create(client, key="retry")

    monkeypatch.undo()
    retry = await create(client, key="retry")

    assert retry.status_code == 201
    assert await spread_count(db_session, user.id) == 1


async def test_position_names_follow_stored_structure(
    client: httpx.AsyncClient, db_session: AsyncSession
) -> None:
    """Имена позиций берутся по `structure_type` расклада, а не по теме (O31/F6)."""
    await factories.consented_user(client, db_session)
    spread_id = (await create(client)).json()["id"]
    await db_session.execute(
        update(Spread).where(Spread.id == spread_id).values(structure_type="two_voices")
    )
    await db_session.commit()

    body = (await client.get(f"/spreads/{spread_id}")).json()

    # Имена выписаны из `expert_base/positions.yaml`, а не вычислены тем же кодом.
    assert {item["position_number"]: item["position_name"] for item in body["positions"]} == {
        1: "Что вы чувствуете",
        2: "Что вы не говорите",
        3: "Куда это движется",
    }


async def test_answer_length_is_bounded(
    client: httpx.AsyncClient, db_session: AsyncSession
) -> None:
    """Ответ длиннее 500 символов не доходит до базы (O31/F7)."""
    await factories.consented_user(client, db_session)
    spread_id = (await create(client)).json()["id"]
    await factories.reveal_position(db_session, spread_id, 1)

    too_long = await answer(client, spread_id, 1, "я" * 501)
    empty = await answer(client, spread_id, 1, "")

    assert too_long.status_code == 422 and too_long.json()["error"] == "validation"
    assert empty.status_code == 422
    assert (await answer(client, spread_id, 1, "я" * 500)).status_code == 200


async def test_unknown_structure_falls_back_to_category(
    client: httpx.AsyncClient, db_session: AsyncSession
) -> None:
    """Расклад, чью структуру база больше не знает, остаётся читаемым (O31/F6)."""
    await factories.consented_user(client, db_session)
    spread_id = (await create(client)).json()["id"]
    await db_session.execute(
        update(Spread).where(Spread.id == spread_id).values(structure_type="ушла_из_базы")
    )
    await db_session.commit()

    response = await client.get(f"/spreads/{spread_id}")

    assert response.status_code == 200
    names = [item["position_name"] for item in response.json()["positions"]]
    assert names == [
        item["position_name"] for item in expert_base.get_spread_for_category("choice")["positions"]
    ]


async def test_lock_timeout_answers_conflict(
    client: httpx.AsyncClient, db_session: AsyncSession
) -> None:
    """Чужая блокировка лимита не подвешивает запрос, а даёт 409 (verify/F1)."""
    user = await factories.consented_user(client, db_session)
    holder = create_async_engine(settings.database_url, poolclass=NullPool)
    async with holder.connect() as connection:
        await connection.execute(select(func.pg_advisory_xact_lock(user.id)))

        response = await create(client, question="Вопрос под чужой блокировкой")

        assert response.status_code == 409
        assert response.json()["error"] == "conflict"
    await holder.dispose()
    assert await spread_count(db_session, user.id) == 0
