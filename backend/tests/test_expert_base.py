"""Загрузчик экспертной базы: YAML, темы, отказы, вопросы позиций (фаза 5)."""

from __future__ import annotations

import shutil
from collections.abc import Callable
from pathlib import Path

import pytest

from app.engine.cards import MAJOR_CARDS
from app.expert import base


def test_all_majors_are_loaded() -> None:
    for card_id in MAJOR_CARDS:
        assert base.get_card(card_id)["name_ru"]


def test_card_from_brief() -> None:
    tower = base.get_card("tower")
    assert tower["name_ru"] == "Башня"
    assert tower["not_to_say"]
    assert tower["reflection_question"].endswith("?")


def test_categories_have_own_spreads() -> None:
    assert base.get_spread_for_category("relationships")["category"] == "relationships"
    assert base.get_spread_for_category("work")["category"] == "work"
    assert base.get_spread_for_category("choice")["spread_id"] == "three_threads"


def test_unknown_category_falls_back_to_choice() -> None:
    # ASM-7: четвёртой темы нет, неизвестная тема обслуживается раскладом choice.
    assert base.get_spread_for_category("general")["spread_id"] == "three_threads"


def _patched_base(
    monkeypatch: pytest.MonkeyPatch, tmp_path: Path
) -> tuple[Path, Callable[[], None]]:
    """Копия базы во временном каталоге и очистка кэша — для тестов про битые файлы."""
    base_dir = tmp_path / "expert_base"
    shutil.copytree(base.BASE_DIR, base_dir)
    monkeypatch.setattr(base, "BASE_DIR", base_dir)
    base._base.cache_clear()
    return base_dir, base._base.cache_clear


def test_two_spreads_for_one_category_fail(monkeypatch: pytest.MonkeyPatch, tmp_path: Path) -> None:
    """Второй расклад на ту же тему — ошибка загрузки, а не молчаливая потеря."""
    base_dir, clear_cache = _patched_base(monkeypatch, tmp_path)
    with (base_dir / "spreads.yaml").open("a", encoding="utf-8") as handle:
        handle.write(
            "- spread_id: extra\n  name: Ещё один\n  category: choice\n"
            "  when_to_use: Второй шаблонный расклад темы choice.\n"
            "  positions_count: 3\n"
        )
    try:
        with pytest.raises(ValueError, match="тема «choice»"):
            base.get_spread_for_category("choice")
    finally:
        clear_cache()


@pytest.mark.parametrize(
    ("name", "getter"),
    [
        ("crisis_resources", base.get_crisis_resources),
        ("checkin_texts", lambda: base.get_checkin_text(1)),
    ],
)
def test_empty_base_list_fails_loud(
    monkeypatch: pytest.MonkeyPatch,
    tmp_path: Path,
    name: str,
    getter: Callable[[], object],
) -> None:
    """Пустой лист базы — ошибка загрузки, а не пустой экран и не деление на ноль."""
    base_dir, clear_cache = _patched_base(monkeypatch, tmp_path)
    (base_dir / f"{name}.yaml").write_text("[]\n", encoding="utf-8")
    try:
        with pytest.raises(ValueError, match=name):
            getter()
    finally:
        clear_cache()


def test_empty_ask2_falls_back_to_ask1() -> None:
    position = base.get_spread_for_category("choice")["positions"][1]  # позиция 2
    assert position["ask_2"] == ""
    assert base.position_question(position, 2) == (position["ask_1"], position["ask_1_options"])


def test_ask2_used_when_filled() -> None:
    position = base.get_spread_for_category("choice")["positions"][0]
    assert base.position_question(position, 2) == (position["ask_2"], position["ask_2_options"])


def test_refusal_by_type() -> None:
    refusal = base.get_refusal("medical")
    assert refusal["follow_up"]
    with pytest.raises(KeyError):
        base.get_refusal("unknown")


def test_crisis_resources() -> None:
    assert len(base.get_crisis_resources()) == 2


def test_checkin_texts() -> None:
    first = base.get_checkin_text(1)
    second = base.get_checkin_text(2)
    assert first["options"] and first["closing"].endswith(".")
    assert first != second
