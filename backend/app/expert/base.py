"""Загрузчик экспертной базы: YAML из `backend/expert_base` (CON-5, D12).

Схема — `docs/expert-brief.md` §4, файлы `*.yaml` собраны валидатором из CSV
эксперта (`tools/validate_base.py`). Позиции расклада вкладываются в его запись
ключом `positions`: движку расклада достаточно одной выборки на расклад.
"""

from __future__ import annotations

from collections.abc import Mapping
from functools import lru_cache
from pathlib import Path
from typing import Any, NamedTuple

import yaml

BASE_DIR = Path(__file__).resolve().parents[2] / "expert_base"
# ASM-7: темы `general` нет — неизвестная тема обслуживается раскладом `choice`.
CATEGORY_FALLBACK = "choice"


def _require_rows(name: str, rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Пустой лист — ошибка загрузки: молча отдать `[]` — это пустой кризисный
    экран (REQ-4) и деление на ноль в `get_checkin_text`."""
    if not rows:
        raise ValueError(f"{BASE_DIR / f'{name}.yaml'}: нет строк")
    return rows


def _load(name: str) -> list[dict[str, Any]]:
    path = BASE_DIR / f"{name}.yaml"
    with path.open(encoding="utf-8") as handle:
        data = yaml.safe_load(handle)
    if not isinstance(data, list):
        raise ValueError(f"{path}: ожидался список строк")
    return data


class _Base(NamedTuple):
    """Загруженные файлы базы: словари по ключам, плоские списки и индекс тем."""

    cards: dict[str, dict[str, Any]]
    spreads: dict[str, dict[str, Any]]
    spreads_by_category: dict[str, str]
    refusals: dict[str, dict[str, Any]]
    crisis_resources: list[dict[str, Any]]
    checkin_texts: list[dict[str, Any]]


@lru_cache(maxsize=1)
def _base() -> _Base:
    cards: dict[str, dict[str, Any]] = {}
    for row in _load("cards"):
        cards[str(row["card_id"])] = row
    positions: dict[str, list[dict[str, Any]]] = {}
    for row in _load("positions"):
        positions.setdefault(str(row["spread_id"]), []).append(row)
    spreads: dict[str, dict[str, Any]] = {}
    spreads_by_category: dict[str, str] = {}
    for row in _load("spreads"):
        spread_id = str(row["spread_id"])
        category = str(row["category"])
        # ASM-7: на тему — один расклад. Второй молча потерялся бы в индексе,
        # поэтому падаем на загрузке, а не на первом запросе.
        if category in spreads_by_category:
            raise ValueError(
                f"тема «{category}»: расклад «{spread_id}» конфликтует "
                f"с «{spreads_by_category[category]}»"
            )
        spreads_by_category[category] = spread_id
        rows = sorted(positions.get(spread_id, []), key=lambda item: item["position_number"])
        spreads[spread_id] = {**row, "positions": rows}
    refusals: dict[str, dict[str, Any]] = {}
    for row in _load("refusals"):
        refusals[str(row["type"])] = row
    return _Base(
        cards=cards,
        spreads=spreads,
        spreads_by_category=spreads_by_category,
        refusals=refusals,
        crisis_resources=_require_rows("crisis_resources", _load("crisis_resources")),
        checkin_texts=_require_rows("checkin_texts", _load("checkin_texts")),
    )


def get_card(card_id: str) -> dict[str, Any]:
    """Карта по `card_id`. Неизвестный id — `KeyError` (D14: выборка точная)."""
    return _base().cards[card_id]


def get_spread_for_category(category: str) -> dict[str, Any]:
    """Расклад темы с его позициями. Неизвестная тема → `choice` (ASM-7)."""
    base = _base()
    spread_id = (
        base.spreads_by_category.get(category) or base.spreads_by_category[CATEGORY_FALLBACK]
    )
    return base.spreads[spread_id]


def get_spread(spread_id: str) -> dict[str, Any]:
    """Расклад по его id вместе с позициями. Неизвестный id — `KeyError`."""
    return _base().spreads[spread_id]


def get_refusal(refusal_type: str) -> dict[str, Any]:
    """Текст отказа и `follow_up` по типу (REQ-3)."""
    return _base().refusals[refusal_type]


def get_crisis_resources() -> list[dict[str, Any]]:
    """Контакты служб помощи (REQ-4)."""
    return list(_base().crisis_resources)


def get_checkin_text(variant: int) -> dict[str, Any]:
    """Текст вечерней сверки по номеру варианта (1..N, с циклом)."""
    texts = _base().checkin_texts
    return texts[(variant - 1) % len(texts)]


def position_question(position: Mapping[str, Any], variant: int) -> tuple[str, list[str]]:
    """Вопрос позиции и варианты ответа (REQ-7).

    `variant=2` берёт `ask_2`; пустой `ask_2` → `ask_1` с его вариантами
    (brief §4.3). Вариант выбирает детерминированно движок колоды.
    """
    if variant == 2 and position.get("ask_2"):
        return str(position["ask_2"]), list(position["ask_2_options"])
    return str(position["ask_1"]), list(position["ask_1_options"])
