"""HTTP-контракты расклада: создание, история, детали, ответ позиции (§9.5).

Карты нераскрытых позиций не покидают сервер: в JSON нераскрытая позиция — это
только номер и название (утечка будущего расклада закрыта).
"""

from __future__ import annotations

from typing import Annotated, Any

from fastapi import APIRouter, Depends, Header
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import current_user, require_json_same_origin
from app.db import get_session
from app.expert import base as expert_base
from app.models import Spread, SpreadPosition, User
from app.spread import service

router = APIRouter(prefix="/spreads", tags=["spreads"])


class SpreadIn(BaseModel):
    """Вопрос расклада: 10–500 символов (REQ-1)."""

    question: str = Field(min_length=10, max_length=500)


class AnswerIn(BaseModel):
    """Ответ на уточняющий вопрос позиции (REQ-7)."""

    position: int = Field(ge=1)
    # Верхняя граница как у вопроса: свободный текст ответа идёт в промпт
    # толкования (фаза 9), и его длину нельзя оставлять на клиента.
    answer: str = Field(min_length=1, max_length=500)


@router.post("", status_code=201, dependencies=[Depends(require_json_same_origin)])
async def create_spread(
    body: SpreadIn,
    user: Annotated[User, Depends(current_user)],
    db: Annotated[AsyncSession, Depends(get_session)],
    idempotency_key: Annotated[str | None, Header(alias="Idempotency-Key")] = None,
) -> dict[str, Any]:
    """Создаёт расклад; повтор `Idempotency-Key` возвращает тот же расклад."""
    spread = await service.create_spread(db, user, body.question, idempotency_key)
    return await _spread_detail(db, spread)


@router.get("")
async def list_spreads(
    user: Annotated[User, Depends(current_user)],
    db: Annotated[AsyncSession, Depends(get_session)],
) -> dict[str, Any]:
    """История: по `created_at` убыв.; у каждой строки — карты раскрытых позиций."""
    spreads = await service.list_spreads(db, user)
    items = []
    for spread in spreads:
        positions = await service.positions_of(db, spread.id)
        items.append(_spread_summary(spread, positions))
    return {"spreads": items}


@router.get("/{spread_id}")
async def get_spread(
    spread_id: int,
    user: Annotated[User, Depends(current_user)],
    db: Annotated[AsyncSession, Depends(get_session)],
) -> dict[str, Any]:
    """Детали расклада: раскрытые позиции полностью, остальные — номер и название."""
    spread = await service.get_spread(db, user, spread_id)
    return await _spread_detail(db, spread)


@router.post("/{spread_id}/answer", dependencies=[Depends(require_json_same_origin)])
async def answer(
    spread_id: int,
    body: AnswerIn,
    user: Annotated[User, Depends(current_user)],
    db: Annotated[AsyncSession, Depends(get_session)],
) -> dict[str, Any]:
    """Сохраняет ответ позиции в её окне (§10); иначе 409."""
    spread = await service.get_spread(db, user, spread_id)
    await service.answer_position(db, spread, body.position, body.answer)
    return await _spread_detail(db, spread)


async def _spread_detail(db: AsyncSession, spread: Spread) -> dict[str, Any]:
    """Карточка расклада: полный список позиций и следующий шаг."""
    positions = await service.positions_of(db, spread.id)
    names = _position_names(spread)
    return {
        "id": spread.id,
        "question": spread.question,
        "status": spread.status,
        "created_at": spread.created_at.isoformat(),
        "category": spread.category,
        "structure_type": spread.structure_type,
        "next_action": _next_action(spread, positions),
        "positions": [_position_view(item, names) for item in positions],
    }


def _spread_summary(spread: Spread, positions: list[SpreadPosition]) -> dict[str, Any]:
    """Строка истории: статус, вопрос и карты только раскрытых позиций."""
    revealed = [item for item in positions if item.revealed_at is not None]
    names = _position_names(spread)
    return {
        "id": spread.id,
        "question": spread.question,
        "status": spread.status,
        "created_at": spread.created_at.isoformat(),
        "positions": [_position_view(item, names) for item in revealed],
    }


def _position_view(position: SpreadPosition, names: dict[int, str]) -> dict[str, Any]:
    """Форма позиции §7: номер/название/`revealed` всегда, карта и тексты — у раскрытой."""
    view: dict[str, Any] = {
        "position_number": position.position_number,
        "position_name": names.get(position.position_number, ""),
        "revealed": position.revealed_at is not None,
    }
    if position.revealed_at is None:
        return view
    # interpretation/verify_status/вопрос и варианты заполнит фаза 9 (reveal).
    view.update(
        {
            "card_id": position.card_id,
            "revealed_at": position.revealed_at.isoformat(),
            "ask_variant": position.ask_variant,
            "interpretation": position.interpretation,
            "verify_status": position.verify_status,
            "ask_answer": position.ask_answer,
            "question": None,
            "options": None,
        }
    )
    return view


def _position_names(spread: Spread) -> dict[int, str]:
    """Названия позиций той структуры, по которой расклад создан.

    Тема расклада могла с тех пор переехать на другую структуру, поэтому имена
    берём по сохранённому `structure_type`; если база его больше не знает —
    остаётся структура темы, номера позиций в ней те же.
    """
    try:
        structure = expert_base.get_spread(spread.structure_type)
    except KeyError:
        structure = expert_base.get_spread_for_category(spread.category)
    return {
        int(item["position_number"]): str(item["position_name"]) for item in structure["positions"]
    }


def _next_action(spread: Spread, positions: list[SpreadPosition]) -> str:
    """Следующий шаг клиента: `reveal <N>` | `answer <N>` | `summary` | `done`."""
    if spread.status != "active":
        return "done"
    answered = {item.position_number for item in positions if item.ask_answer is not None}
    for position in positions:
        if position.revealed_at is None:
            previous = position.position_number - 1
            if previous >= 1 and previous not in answered:
                return f"answer {previous}"
            return f"reveal {position.position_number}"
    if spread.summary is not None:
        return "done"
    unanswered = next((item for item in positions if item.ask_answer is None), None)
    if unanswered is not None:
        return f"answer {unanswered.position_number}"
    return "summary"
