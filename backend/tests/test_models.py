"""Схема SOLUTION.md §9.4: модели, каскады §11, откат миграции."""

from datetime import UTC, date, datetime

import pytest
from sqlalchemy import func, select, text
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import (
    FRAUD_FLAGS,
    DailyCard,
    Event,
    FraudFlag,
    LlmCall,
    Session,
    Spread,
    SpreadPosition,
    User,
)
from tests.conftest import downgrade, migrate

NOW = datetime(2026, 9, 17, 12, 0, tzinfo=UTC)


def make_user(public_ref: str, telegram_id: int | None = None) -> User:
    return User(public_ref=public_ref, consent_at=NOW, telegram_id=telegram_id)


def test_migration_rolls_back_to_base_and_forward_again() -> None:
    """Критерий выхода фазы: миграция накатывается и откатывается."""
    downgrade("base")
    migrate("head")


async def test_create_each_entity(db_session: AsyncSession) -> None:
    user = make_user("ref00001")
    db_session.add(user)
    await db_session.flush()

    session = Session(user_id=user.id, last_seen=NOW)
    spread = Spread(
        user_id=user.id,
        structure_type="three_threads",
        question="Что мне делать с работой?",
        category="work",
        seed=b"seed" * 8,
    )
    db_session.add_all([session, spread])
    await db_session.flush()

    position = SpreadPosition(
        spread_id=spread.id, position_number=1, card_id="tower", ask_variant=2
    )
    daily = DailyCard(user_id=user.id, date=date(2026, 9, 17), card_id="star", checkin_variant=1)
    event = Event(
        type="crisis_shown", user_id=user.id, session_id=session.id, layer="daily", payload={}
    )
    call = LlmCall(
        user_id=user.id,
        spread_id=spread.id,
        step="checkin",
        model="fake",
        status="ok",
        tokens_in=0,
        tokens_out=0,
        cost_usd=0,
    )
    flag = FraudFlag(user_id=user.id, flag=FRAUD_FLAGS[0], reason="всплеск регистраций")
    db_session.add_all([position, daily, event, call, flag])
    await db_session.commit()

    assert user.id is not None
    assert spread.id is not None and event.id is not None and call.id is not None
    assert user.push_enabled is True
    assert spread.status == "active" and spread.summary_status is None
    assert position.position_number == 1 and position.revealed_at is None
    assert daily.checked_at is None and daily.checkin_answer is None
    assert flag.flag == FRAUD_FLAGS[0]


async def test_push_enabled_default_is_true_in_database(db_session: AsyncSession) -> None:
    """D5: opt-out по умолчанию задан и на стороне БД, а не только в модели."""
    await db_session.execute(
        text("INSERT INTO users (public_ref, consent_at) VALUES ('ref00010', now())")
    )
    assert (
        await db_session.scalar(
            text("SELECT push_enabled FROM users WHERE public_ref = 'ref00010'")
        )
        is True
    )


async def test_duplicate_telegram_id_rejected(db_session: AsyncSession) -> None:
    db_session.add(make_user("ref00020", telegram_id=100500))
    await db_session.commit()

    db_session.add(make_user("ref00021", telegram_id=100500))
    with pytest.raises(IntegrityError):
        await db_session.commit()
    await db_session.rollback()


async def test_llm_call_requires_token_counts(db_session: AsyncSession) -> None:
    """NFR-2/REQ-16: без токенов и стоимости INSERT падает, а не пишет нули."""
    user = make_user("ref00040")
    db_session.add(user)
    await db_session.flush()

    db_session.add(LlmCall(user_id=user.id, step="classification", model="fake", status="ok"))
    with pytest.raises(IntegrityError):
        await db_session.commit()
    await db_session.rollback()


async def test_delete_user_cascades_and_detaches(db_session: AsyncSession) -> None:
    """§11: расклады, позиции, карты дня и логи удаляются; сессия и события — нет."""
    user = make_user("ref00030")
    db_session.add(user)
    await db_session.flush()

    session = Session(user_id=user.id, last_seen=NOW)
    spread = Spread(
        user_id=user.id,
        structure_type="choice",
        question="Выбрать ли вариант A?",
        category="choice",
        seed=b"seed" * 8,
    )
    db_session.add_all([session, spread])
    await db_session.flush()
    db_session.add_all(
        [
            SpreadPosition(spread_id=spread.id, position_number=1, card_id="tower"),
            DailyCard(user_id=user.id, date=date(2026, 9, 17), card_id="star"),
            Event(
                type="card_revealed",
                user_id=user.id,
                session_id=session.id,
                layer="spread",
                payload={},
            ),
            LlmCall(
                user_id=user.id,
                spread_id=spread.id,
                step="interpretation",
                model="fake",
                status="ok",
                tokens_in=0,
                tokens_out=0,
                cost_usd=0,
            ),
            FraudFlag(user_id=user.id, flag=FRAUD_FLAGS[1], reason="всплеск запросов"),
        ]
    )
    await db_session.commit()
    user_id, spread_id, session_id = user.id, spread.id, session.id

    await db_session.delete(user)
    await db_session.commit()

    assert await db_session.scalar(select(Spread.id).where(Spread.user_id == user_id)) is None
    positions = select(SpreadPosition.card_id).where(SpreadPosition.spread_id == spread_id)
    assert await db_session.scalar(positions) is None
    cards = select(DailyCard.card_id).where(DailyCard.user_id == user_id)
    assert await db_session.scalar(cards) is None
    assert await db_session.scalar(select(LlmCall.id).where(LlmCall.user_id == user_id)) is None
    flags = select(FraudFlag.flag).where(FraudFlag.user_id == user_id)
    assert await db_session.scalar(flags) is None

    events = select(func.count()).select_from(Event).where(Event.session_id == session_id)
    assert await db_session.scalar(events) == 1
    event_user = select(Event.user_id).where(Event.session_id == session_id)
    assert await db_session.scalar(event_user) is None
    assert await db_session.scalar(select(Session.user_id).where(Session.id == session_id)) is None
