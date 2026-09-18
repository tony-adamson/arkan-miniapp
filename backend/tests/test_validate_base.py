"""Валидатор экспертной базы: фикстура, порчи, YAML (CON-5, D12)."""

from __future__ import annotations

import csv
import re
import shutil
from pathlib import Path

import pytest
import yaml

from tools import validate_base

FIXTURE_DIR = Path(__file__).resolve().parent / "fixtures" / "expert_csv"
EXPERT_BASE = Path(__file__).resolve().parents[1] / "expert_base"
YAML_SHEETS = ("cards", "spreads", "positions", "refusals", "crisis_resources", "checkin_texts")


def _run(csv_dir: Path, out_dir: Path, capsys: pytest.CaptureFixture[str]) -> tuple[int, str]:
    code = validate_base.main([str(csv_dir), str(out_dir)])
    return code, capsys.readouterr().out


def _update(
    csv_dir: Path, sheet: str, match: dict[str, str] | None, field: str, new_value: str
) -> None:
    """Портит поле строк листа: `match=None` — всех, иначе только подходящих.

    Тест играет роль невнимательного эксперта.
    """
    path = csv_dir / f"{sheet}.csv"
    with path.open(encoding="utf-8", newline="") as handle:
        reader = csv.DictReader(handle)
        fieldnames = list(reader.fieldnames or [])
        rows = list(reader)
    changed = 0
    for row in rows:
        if match is None or all(row.get(key) == value for key, value in match.items()):
            row[field] = new_value
            changed += 1
    assert changed >= 1, f"{sheet}: под условие {match} не подошло ни одной строки"
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


@pytest.fixture
def wave(tmp_path: Path) -> Path:
    """Копия фикстуры, которую портит тест."""
    target = tmp_path / "wave"
    shutil.copytree(FIXTURE_DIR, target)
    return target


def test_clean_fixture_passes(capsys: pytest.CaptureFixture[str], tmp_path: Path) -> None:
    code, out = _run(FIXTURE_DIR, tmp_path / "out", capsys)
    assert code == 0, out
    assert out == ""


def test_yaml_matches_expert_base(capsys: pytest.CaptureFixture[str], tmp_path: Path) -> None:
    out_dir = tmp_path / "out"
    assert _run(FIXTURE_DIR, out_dir, capsys)[0] == 0
    for sheet in YAML_SHEETS:
        generated = (out_dir / f"{sheet}.yaml").read_text(encoding="utf-8")
        assert generated == (EXPERT_BASE / f"{sheet}.yaml").read_text(encoding="utf-8"), sheet


def test_draft_row_not_in_yaml(capsys: pytest.CaptureFixture[str], tmp_path: Path) -> None:
    out_dir = tmp_path / "out"
    assert _run(FIXTURE_DIR, out_dir, capsys)[0] == 0
    cards = yaml.safe_load((out_dir / "cards.yaml").read_text(encoding="utf-8"))
    assert len(cards) == 22
    assert all(card["card_id"] != "ace_of_wands" for card in cards)


@pytest.mark.parametrize(
    ("sheet", "match", "field", "value", "code"),
    [
        # неизвестный card_id
        ("cards", {"card_id": "fool"}, "card_id", "not_a_card", "E_CARD_UNKNOWN"),
        # пустое обязательное поле
        ("cards", {"card_id": "moon"}, "meaning_work", "", "E_REQUIRED"),
        # дубль позиции
        (
            "positions",
            {"spread_id": "three_threads", "position_number": "3"},
            "position_number",
            "2",
            "E_DUPLICATE",
        ),
        # ask_2 без вариантов
        (
            "positions",
            {"spread_id": "three_threads", "position_number": "3"},
            "ask_2",
            "Другая формулировка вопроса?",
            "E_ASK2_OPTIONS",
        ),
    ],
)
def test_corrupted_row_fails(
    capsys: pytest.CaptureFixture[str],
    tmp_path: Path,
    wave: Path,
    sheet: str,
    match: dict[str, str],
    field: str,
    value: str,
    code: str,
) -> None:
    _update(wave, sheet, match, field, value)
    code_exit, out = _run(wave, tmp_path / "out", capsys)
    assert code_exit == 1
    assert re.search(rf"^{sheet}:\d+: {code}: ", out, re.MULTILINE)


def test_long_sentence_is_error(
    capsys: pytest.CaptureFixture[str], tmp_path: Path, wave: Path
) -> None:
    long_sentence = " ".join(["слово"] * 30) + ". Второе предложение шаблона."
    _update(wave, "cards", {"card_id": "tower"}, "meaning_general", long_sentence)
    code, out = _run(wave, tmp_path / "out", capsys)
    assert code == 1
    assert re.search(r"^cards:\d+: E_SENTENCE: ", out, re.MULTILINE)


@pytest.mark.parametrize(
    ("sheet", "match"),
    [
        ("checkin_texts", None),
        ("crisis_resources", None),
        ("spreads", {"spread_id": "work_axis"}),
        # граница: в листе одна `ready`-строка при минимуме 2
        ("checkin_texts", {"text": "ТЕСТОВЫЕ ДАННЫЕ: что из утренней карты проявилось за день?"}),
    ],
)
def test_incomplete_sheet_fails(
    capsys: pytest.CaptureFixture[str],
    tmp_path: Path,
    wave: Path,
    sheet: str,
    match: dict[str, str] | None,
) -> None:
    """Пустой лист или потерянная тема — ошибка, а не пустой YAML (F3)."""
    _update(wave, sheet, match, "status", "draft")
    code, out = _run(wave, tmp_path / "out", capsys)
    assert code == 1
    assert re.search(rf"^{sheet}:1: E_ROWS: ", out, re.MULTILINE)


def test_errors_skip_yaml(capsys: pytest.CaptureFixture[str], tmp_path: Path, wave: Path) -> None:
    out_dir = tmp_path / "out"
    _update(wave, "cards", {"card_id": "fool"}, "card_id", "not_a_card")
    assert _run(wave, out_dir, capsys)[0] == 1
    assert not (out_dir / "cards.yaml").exists()


def test_prediction_stop_word_is_warning(
    capsys: pytest.CaptureFixture[str], tmp_path: Path, wave: Path
) -> None:
    _update(
        wave, "cards", {"card_id": "sun"}, "meaning_general", "Ситуация будет меняться. Это шаблон."
    )
    out_dir = tmp_path / "out"
    code, out = _run(wave, out_dir, capsys)
    assert code == 0, out
    assert re.search(r"^cards:\d+: W_PREDICTION: ", out, re.MULTILINE)
    assert (out_dir / "cards.yaml").exists()


def test_prediction_words_come_from_yaml(
    capsys: pytest.CaptureFixture[str],
    monkeypatch: pytest.MonkeyPatch,
    tmp_path: Path,
    wave: Path,
) -> None:
    """Стоп-слова предсказаний читаются из `stop_patterns.yaml`, а не из кода."""
    base_dir = tmp_path / "expert_base"
    base_dir.mkdir()
    (base_dir / "stop_patterns.yaml").write_text(
        "crisis: []\npredictions:\n  - обязательно\n", encoding="utf-8"
    )
    monkeypatch.setattr(validate_base, "EXPERT_BASE_DIR", base_dir)
    validate_base._prediction_re.cache_clear()
    try:
        _update(
            wave,
            "cards",
            {"card_id": "sun"},
            "meaning_general",
            "Ситуация будет меняться, это обязательно для вас. Шаблон поля.",
        )
        code, out = _run(wave, tmp_path / "out", capsys)
    finally:
        validate_base._prediction_re.cache_clear()
    assert code == 0, out
    assert "«обязательно»" in out
    assert "«будет»" not in out


@pytest.mark.parametrize("content", ["predictions: []\n", "crisis: []\n"])
def test_empty_predictions_is_error(
    capsys: pytest.CaptureFixture[str],
    monkeypatch: pytest.MonkeyPatch,
    tmp_path: Path,
    content: str,
) -> None:
    """Пустой список стоп-слов — ошибка, а не молча выключенная проверка (O2)."""
    base_dir = tmp_path / "expert_base"
    base_dir.mkdir()
    (base_dir / "stop_patterns.yaml").write_text(content, encoding="utf-8")
    monkeypatch.setattr(validate_base, "EXPERT_BASE_DIR", base_dir)
    validate_base._prediction_re.cache_clear()
    try:
        code, out = _run(FIXTURE_DIR, tmp_path / "out", capsys)
    finally:
        validate_base._prediction_re.cache_clear()
    assert code == 1, out
    assert re.search(r"^stop_patterns:1: E_CONFIG: ", out, re.MULTILINE)
    assert not (tmp_path / "out").exists()


def test_two_spreads_on_one_category(
    capsys: pytest.CaptureFixture[str], tmp_path: Path, wave: Path
) -> None:
    """Вторая тема-дубль потерялась бы в индексе базы — это ошибка волны (O31/F8)."""
    _update(wave, "spreads", {"spread_id": "two_voices"}, "category", "choice")

    code, out = _run(wave, tmp_path / "out", capsys)

    assert code == 1
    assert re.search(r"^spreads:\d+: E_ROWS: тема «choice» уже занята", out, re.MULTILINE)
