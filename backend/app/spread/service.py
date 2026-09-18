"""Машина раскладов без генерации: PG, идемпотентность, лимит D18.

Карты предвытянуты сидом (`D3`); категория пока `choice` (фаза 7); сутки — `app.msk`.
"""

from __future__ import annotations

from redis.exceptions import RedisError
from sqlalchemy import func, select
from sqlalchemy.exc import DBAPIError
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.errors import api_error
from app.config import settings
from app.db import is_lock_timeout
from app.engine.deck import ask_variant, draw, new_seed
from app.events.writer import write_event
from app.expert import base as expert_base
from app.models import Spread, SpreadPosition, User
from app.msk import msk_now
from app.redis import get_redis

# Классификатор вопросов появится в фазе 7; до него все вопросы обслуживает
# расклад темы `choice` (ASM-7).
CATEGORY = "choice"
IDEMPOTENCY_TTL_S = 600  # §9.5: ключ живёт 10 минут
PENDING = "pending"

LIMIT_MESSAGE = (
    "На сегодня лимит раскладов исчерпан. Прежние можно продолжить, а новый спросим завтра."
)
PENDING_MESSAGE = "Такой расклад уже создаётся. Секунда — и он появится."
NOT_FOUND_MESSAGE = "Расклад не найден. Возможно, ссылка устарела."
ANSWER_WINDOW_MESSAGE = "Сейчас нельзя ответить на эту позицию. Продолжим по порядку."


async def count_today_spreads(db: AsyncSession, user_id: int) -> int:
    """Сколько раскладов user создал за текущие сутки МСК (D18, подсчёт в PG)."""
    start_of_day = msk_now().replace(hour=0, minute=0, second=0, microsecond=0)
    count = await db.scalar(
        select(func.count())
        .select_from(Spread)
        .where(Spread.user_id == user_id, Spread.created_at >= start_of_day)
    )
    return count or 0


async def create_spread(
    db: AsyncSession,
    user: User,
    question: str,
    idempotency_key: str | None = None,
) -> Spread:
    """Создаёт расклад `active`; порядок: повтор ключа → лимит → резерв → INSERT."""
    key = _idempotency_key(user.id, idempotency_key)
    if key is not None:
        replay = await _replayed(db, user, key)
        if replay is not None:
            return replay

    # Подсчёт и вставку одного пользователя нельзя разносить: два параллельных
    # запроса видели бы одно и то же число и оба прошли бы лимит (D18).
    await _lock_user_spreads(db, user.id)

    if await count_today_spreads(db, user.id) >= settings.spreads_per_day:
        api_error(429, "rate_limited", LIMIT_MESSAGE)

    if key is not None and not await _redis_claim(key):
        # Ключ появился между чтением и резервом: конкурент уже создал расклад.
        replay = await _replayed(db, user, key)
        if replay is not None:
            return replay

    try:
        spread = await _insert_spread(db, user, question)
    except Exception:
        # Сначала откат: иначе упавшая транзакция и блокировка лимита держатся
        # ещё и на время обращения к Redis.
        await db.rollback()
        # Иначе ключ остаётся `pending` до конца TTL и повтор получает 409,
        # хотя расклада нет.
        if key is not None:
            await _redis_release(key)
        raise
    if key is not None:
        await _redis_store(key, spread.id)
    return spread


async def _lock_user_spreads(db: AsyncSession, user_id: int) -> None:
    """Advisory-блокировка лимита раскладов пользователя до конца транзакции.

    Ключ — сам `users.id`: других advisory-блокировок в приложении нет, а второй
    сценарий обязан взять себе своё пространство (например, парный вариант
    `pg_advisory_xact_lock(int4, int4)`). Ожидание ограничено `lock_timeout`
    соединения (`app/db.py`): дольше него запрос не держит соединение пула, а
    получает 409 — расклад этого пользователя уже создаётся.
    """
    try:
        await db.execute(select(func.pg_advisory_xact_lock(user_id)))
    except DBAPIError as error:
        if not is_lock_timeout(error):
            raise
        await db.rollback()
        api_error(409, "conflict", PENDING_MESSAGE)


async def _replayed(db: AsyncSession, user: User, key: str) -> Spread | None:
    """Повтор ключа: прежний расклад владельца или `None`; `pending` — 409."""
    stored = await _redis_get(key)
    if stored == PENDING:
        api_error(409, "conflict", PENDING_MESSAGE)
    if stored is None or not stored.isdigit():
        return None
    replay = await db.get(Spread, int(stored))
    if replay is None or replay.user_id != user.id:
        return None
    return replay


async def get_spread(db: AsyncSession, user: User, spread_id: int) -> Spread:
    """Расклад владельца; чужой и несуществующий неотличимы (404)."""
    spread = await db.get(Spread, spread_id)
    if spread is None or spread.user_id != user.id:
        api_error(404, "not_found", NOT_FOUND_MESSAGE)
    return spread


async def list_spreads(db: AsyncSession, user: User) -> list[Spread]:
    """История user: свежие расклады первыми (незакрытых может быть несколько, D11)."""
    result = await db.scalars(
        select(Spread)
        .where(Spread.user_id == user.id)
        .order_by(Spread.created_at.desc(), Spread.id.desc())
    )
    return list(result)


async def positions_of(db: AsyncSession, spread_id: int) -> list[SpreadPosition]:
    """Позиции расклада по возрастанию номера."""
    result = await db.scalars(
        select(SpreadPosition)
        .where(SpreadPosition.spread_id == spread_id)
        .order_by(SpreadPosition.position_number)
    )
    return list(result)


async def answer_position(
    db: AsyncSession,
    spread: Spread,
    position_number: int,
    answer: str,
) -> None:
    """Сохраняет ответ в окне §10; событие `clarifying_answer` — только при первом ответе."""
    positions = await positions_of(db, spread.id)
    position = next((item for item in positions if item.position_number == position_number), None)
    if position is None:
        api_error(404, "not_found", NOT_FOUND_MESSAGE)
    if not _in_answer_window(spread, positions, position):
        api_error(409, "conflict", ANSWER_WINDOW_MESSAGE)

    first_answer = position.ask_answer is None
    position.ask_answer = answer
    if first_answer:
        await write_event(
            db,
            "clarifying_answer",
            user_id=spread.user_id,
            layer="spread",
            payload={"spread_id": spread.id, "position": position_number},
        )
    await db.commit()


def _in_answer_window(
    spread: Spread,
    positions: list[SpreadPosition],
    position: SpreadPosition,
) -> bool:
    """Порядок reveal 1 → answer 1 → reveal 2 … → answer N → summary (§7, §10)."""
    if spread.status != "active" or position.revealed_at is None:
        return False
    following = next(
        (item for item in positions if item.position_number == position.position_number + 1),
        None,
    )
    if following is not None:
        return following.revealed_at is None
    return spread.summary is None


async def _insert_spread(db: AsyncSession, user: User, question: str) -> Spread:
    """Структура из экспертной базы, карты из сида, событие `question_sent`."""
    structure = expert_base.get_spread_for_category(CATEGORY)
    seed = new_seed()
    cards = draw(seed, len(structure["positions"]), settings.major_only)

    spread = Spread(
        user_id=user.id,
        structure_type=str(structure["spread_id"]),
        question=question,
        category=CATEGORY,
        status="active",
        seed=seed,
    )
    db.add(spread)
    await db.flush()
    for index, card_id in enumerate(cards, start=1):
        db.add(
            SpreadPosition(
                spread_id=spread.id,
                position_number=index,
                card_id=card_id,
                ask_variant=ask_variant(seed, index),
            )
        )
    await write_event(
        db,
        "question_sent",
        user_id=user.id,
        layer="spread",
        payload={"spread_id": spread.id, "category": CATEGORY},
    )
    await db.commit()
    return spread


def _idempotency_key(user_id: int, idempotency_key: str | None) -> str | None:
    if not idempotency_key:
        return None
    return f"spread:idem:{user_id}:{idempotency_key}"


async def _redis_get(key: str) -> str | None:
    """Значение ключа или `None`, если Redis недоступен (fail-open, §9.6)."""
    try:
        value = await get_redis().get(key)
    except (RedisError, OSError):
        return None
    return value if isinstance(value, str) else None


async def _redis_claim(key: str) -> bool:
    """`SET NX pending EX 600`. `True` — ключ за нами или Redis недоступен."""
    try:
        claimed = await get_redis().set(key, PENDING, nx=True, ex=IDEMPOTENCY_TTL_S)
    except (RedisError, OSError):
        return True
    return bool(claimed)


async def _redis_release(key: str) -> None:
    """Снимает резерв после неудачной вставки: повтор не должен ждать TTL."""
    try:
        await get_redis().delete(key)
    except (RedisError, OSError):
        return


async def _redis_store(key: str, spread_id: int) -> None:
    """Заменяет `pending` на id расклада; недоступность Redis не отменяет создание."""
    try:
        await get_redis().set(key, str(spread_id), ex=IDEMPOTENCY_TTL_S)
    except (RedisError, OSError):
        return
