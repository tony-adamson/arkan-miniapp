"""Валидатор экспертной базы: CSV эксперта → построчный отчёт → YAML (CON-5, D12).

Схема листов — `docs/expert-brief.md` §4. Строки со `status != ready` в YAML не
попадают. При ошибках YAML не пишется вовсе: волна должна уехать в работу
целиком. Отчёт печатается построчно в формате `лист:строка: код: сообщение`.

Запуск: `make validate-base CSV=<csv_dir> OUT=<out_dir>` либо
`python -m tools.validate_base <csv_dir> <out_dir>`.
"""

from __future__ import annotations

import argparse
import csv
import re
import sys
from collections import defaultdict
from dataclasses import dataclass, field
from functools import lru_cache
from pathlib import Path
from typing import Any

import yaml

from app.engine.cards import CARDS

CATEGORIES = ("relationships", "work", "choice")
REFUSAL_TYPES = ("medical", "psychotherapy", "legal", "financial", "crisis")
MAX_SENTENCE_WORDS = 25
CHIP_WORDS = (1, 4)
SPREAD_ID_RE = re.compile(r"^[a-z][a-z0-9_]*$")
SENTENCE_RE = re.compile(r"[^.!?]+")
WORD_RE = re.compile(r"[\w'’-]+")
# База репозитория: здесь живёт единственный источник стоп-слов предсказаний.
EXPERT_BASE_DIR = Path(__file__).resolve().parents[1] / "expert_base"

# Порядок листов — он же порядок колонок CSV и ключей YAML.
SHEETS: dict[str, tuple[str, ...]] = {
    "cards": (
        "card_id",
        "name_ru",
        "arcana",
        "suit",
        "numeral",
        "keywords",
        "meaning_general",
        "meaning_relationships",
        "meaning_work",
        "meaning_choice",
        "meaning_daily",
        "not_to_say",
        "reflection_question",
        "status",
    ),
    "spreads": ("spread_id", "name", "category", "when_to_use", "positions_count", "status"),
    "positions": (
        "spread_id",
        "position_number",
        "position_name",
        "position_focus",
        "interpretation_angle",
        "ask_1",
        "ask_1_options",
        "ask_2",
        "ask_2_options",
        "status",
    ),
    "refusals": ("type", "text", "follow_up", "status"),
    "crisis_resources": ("contact", "name", "description", "status"),
    "checkin_texts": ("text", "options", "closing", "status"),
}

# Обязательные значения строки `ready`. Префилл (`suit`, `numeral`) заполняется
# только у младших арканов, `ask_2` необязателен (brief §4.1, §4.3).
REQUIRED: dict[str, tuple[str, ...]] = {
    "cards": (
        "card_id",
        "name_ru",
        "arcana",
        "keywords",
        "meaning_general",
        "meaning_relationships",
        "meaning_work",
        "meaning_choice",
        "meaning_daily",
        "not_to_say",
        "reflection_question",
    ),
    "spreads": ("spread_id", "name", "category", "when_to_use", "positions_count"),
    "positions": (
        "spread_id",
        "position_number",
        "position_name",
        "position_focus",
        "interpretation_angle",
        "ask_1",
        "ask_1_options",
    ),
    "refusals": ("type", "text", "follow_up"),
    "crisis_resources": ("contact", "name", "description"),
    "checkin_texts": ("text", "options", "closing"),
}

# Размеры листов из брифа §4.5–4.6: (минимум, максимум) строк `ready`.
# `refusals` не здесь — полноту пяти типов проверяет `_check_refusals`. `cards`
# приходит волнами (брифа §4.1 — 78 строк к концу A4), `positions` — по
# `positions_count`, поэтому их число здесь не фиксируется.
ROW_LIMITS: dict[str, tuple[int, int]] = {
    "crisis_resources": (2, 4),
    "checkin_texts": (2, 3),
}

Row = dict[str, str]
# Поля YAML списком (значения через `;`) и числами; остальные — строки.
LIST_FIELDS = frozenset({"keywords", "not_to_say", "ask_1_options", "ask_2_options", "options"})
INT_FIELDS = frozenset({"positions_count", "position_number"})


def _items(value: str) -> list[str]:
    """Значения через `;` (brief §4): ключевые слова, чипы, «чего карта не говорит»."""
    return [item.strip() for item in value.split(";") if item.strip()]


def _number(value: str) -> int | str:
    return int(value) if value.isdigit() else value


def _prediction_words() -> list[str]:
    """Стоп-слова предсказаний: единственный список — `expert_base/stop_patterns.yaml`."""
    path = EXPERT_BASE_DIR / "stop_patterns.yaml"
    data = yaml.safe_load(path.read_text(encoding="utf-8")) or {}
    return [str(word) for word in (data.get("predictions") or [])]


@lru_cache(maxsize=1)
def _prediction_re() -> re.Pattern[str]:
    """Регулярка стоп-слов предсказаний из `expert_base/stop_patterns.yaml`.

    Источник ровно один — файл базы: валидатор и судья (фаза 7) читают один
    список, поэтому волну и проверку нельзя рассинхронизировать. Пустой список
    — ошибка волны (`E_CONFIG`), здесь — страховка от регулярки, которая
    совпала бы со всем подряд.
    """
    words = _prediction_words()
    if not words:
        return re.compile(r"(?!)")
    return re.compile(r"\b(" + "|".join(re.escape(word) for word in words) + r")", re.IGNORECASE)


def _value(name: str, value: str) -> Any:
    if name in LIST_FIELDS:
        return _items(value)
    if name in INT_FIELDS:
        return _number(value)
    return value


@dataclass
class Finding:
    sheet: str
    line: int
    code: str
    message: str

    @property
    def is_error(self) -> bool:
        return self.code.startswith("E_")

    def __str__(self) -> str:
        return f"{self.sheet}:{self.line}: {self.code}: {self.message}"


@dataclass
class Report:
    findings: list[Finding] = field(default_factory=list)

    def add(self, sheet: str, line: int, code: str, message: str) -> None:
        self.findings.append(Finding(sheet, line, code, message))

    @property
    def failed(self) -> bool:
        return any(finding.is_error for finding in self.findings)


def _sentences(text: str) -> list[str]:
    return [part.strip() for part in SENTENCE_RE.findall(text) if part.strip()]


def _words(text: str) -> list[str]:
    return WORD_RE.findall(text)


def _check_text(
    report: Report,
    sheet: str,
    line: int,
    name: str,
    value: str,
    *,
    sentences: tuple[int, int] = (1, 99),
    question: bool = False,
) -> None:
    """Длины полей по брифу §4 и §5: предложения, их число, знак вопроса."""
    if not value:
        return
    parts = _sentences(value)
    for part in parts:
        count = len(_words(part))
        if count > MAX_SENTENCE_WORDS:
            report.add(sheet, line, "E_SENTENCE", f"{name}: предложение из {count} слов")
    low, high = sentences
    if not low <= len(parts) <= high:
        report.add(
            sheet, line, "E_SENTENCES", f"{name}: предложений {len(parts)}, ожидается {low}–{high}"
        )
    if question and not value.rstrip().endswith("?"):
        report.add(sheet, line, "E_QUESTION", f"{name}: вопрос без «?» в конце")
    for match in sorted({m.group(1) for m in _prediction_re().finditer(value)}):
        report.add(sheet, line, "W_PREDICTION", f"{name}: стоп-слово предсказания «{match}»")


def _check_list(
    report: Report,
    sheet: str,
    line: int,
    name: str,
    value: str,
    *,
    items: tuple[int, int],
    chips: tuple[int, int] | None = None,
) -> None:
    """Поля со значениями через `;`: число элементов и длина чипов-вариантов."""
    if not value:
        return
    parts = _items(value)
    low, high = items
    if not low <= len(parts) <= high:
        report.add(
            sheet, line, "E_ITEMS", f"{name}: элементов {len(parts)}, ожидается {low}–{high}"
        )
    if chips is not None:
        chip_low, chip_high = chips
        for part in parts:
            count = len(_words(part))
            if not chip_low <= count <= chip_high:
                report.add(sheet, line, "E_CHIPS", f"{name}: вариант «{part}» из {count} слов")


def _check_int(
    report: Report, sheet: str, line: int, name: str, value: str, *, low: int, high: int
) -> int | None:
    if not value:
        return None
    if not value.isdigit():
        report.add(sheet, line, "E_FORMAT", f"{name}: «{value}» не целое число")
        return None
    number = int(value)
    if not low <= number <= high:
        report.add(sheet, line, "E_RANGE", f"{name}: {number} вне {low}–{high}")
        return None
    return number


def _read_sheet(report: Report, csv_dir: Path, sheet: str) -> list[tuple[int, Row]]:
    """Строки `ready` листа с номерами строк файла (шапка — строка 1)."""
    path = csv_dir / f"{sheet}.csv"
    if not path.exists():
        report.add(sheet, 0, "E_FILE", f"нет файла {path.name}")
        return []
    rows: list[tuple[int, Row]] = []
    with path.open(encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle)
        header = [(name or "").strip() for name in reader.fieldnames or []]
        missing = [name for name in SHEETS[sheet] if name not in header]
        if missing:
            report.add(sheet, 1, "E_COLUMNS", f"нет колонок: {', '.join(missing)}")
            return []
        for index, raw in enumerate(reader, start=2):
            row = {(key or "").strip(): (value or "").strip() for key, value in raw.items()}
            if row.get("status") != "ready":
                continue
            for name in REQUIRED[sheet]:
                if not row.get(name):
                    report.add(sheet, index, "E_REQUIRED", f"{name}: пустое обязательное поле")
            rows.append((index, row))
    return rows


def _check_cards(report: Report, rows: list[tuple[int, Row]]) -> None:
    seen: dict[str, int] = {}
    for line, row in rows:
        card_id = row["card_id"]
        if card_id and card_id not in CARDS:
            report.add("cards", line, "E_CARD_UNKNOWN", f"card_id «{card_id}» нет в колоде")
        if card_id in seen:
            report.add(
                "cards",
                line,
                "E_DUPLICATE",
                f"card_id «{card_id}» уже был в строке {seen[card_id]}",
            )
        seen[card_id] = line
        _check_list(report, "cards", line, "keywords", row["keywords"], items=(3, 5))
        for name in ("meaning_general", "meaning_relationships", "meaning_work", "meaning_choice"):
            _check_text(report, "cards", line, name, row[name], sentences=(2, 4))
        _check_text(report, "cards", line, "meaning_daily", row["meaning_daily"], sentences=(1, 2))
        _check_list(report, "cards", line, "not_to_say", row["not_to_say"], items=(1, 3))
        _check_text(
            report,
            "cards",
            line,
            "reflection_question",
            row["reflection_question"],
            sentences=(1, 1),
            question=True,
        )


def _check_spreads(report: Report, rows: list[tuple[int, Row]]) -> dict[str, tuple[int, int]]:
    """Расклады и `spread_id` → (строка, `positions_count`) для проверки позиций."""
    counts: dict[str, tuple[int, int]] = {}
    seen: dict[str, int] = {}
    for line, row in rows:
        spread_id = row["spread_id"]
        if spread_id and not SPREAD_ID_RE.match(spread_id):
            report.add(
                "spreads", line, "E_FORMAT", f"spread_id «{spread_id}»: латиница, цифры, «_»"
            )
        if spread_id in seen:
            report.add(
                "spreads",
                line,
                "E_DUPLICATE",
                f"spread_id «{spread_id}» уже был в строке {seen[spread_id]}",
            )
        seen[spread_id] = line
        if row["category"] and row["category"] not in CATEGORIES:
            report.add("spreads", line, "E_CATEGORY", f"category «{row['category']}» вне трёх тем")
        _check_text(report, "spreads", line, "when_to_use", row["when_to_use"], sentences=(1, 2))
        count = _check_int(
            report, "spreads", line, "positions_count", row["positions_count"], low=2, high=5
        )
        if count is not None:
            counts[spread_id] = (line, count)
    return counts


def _check_positions(
    report: Report, rows: list[tuple[int, Row]], counts: dict[str, tuple[int, int]]
) -> None:
    seen: dict[tuple[str, int], int] = {}
    numbers: dict[str, list[int]] = defaultdict(list)
    for line, row in rows:
        spread_id = row["spread_id"]
        if spread_id and spread_id not in counts:
            report.add(
                "positions",
                line,
                "E_SPREAD_UNKNOWN",
                f"spread_id «{spread_id}» нет в листе spreads",
            )
        number = _check_int(
            report, "positions", line, "position_number", row["position_number"], low=1, high=5
        )
        if number is not None:
            key = (spread_id, number)
            if key in seen:
                report.add(
                    "positions",
                    line,
                    "E_DUPLICATE",
                    f"позиция {number} расклада «{spread_id}» уже была в строке {seen[key]}",
                )
            seen[key] = line
            numbers[spread_id].append(number)
        _check_text(
            report, "positions", line, "position_focus", row["position_focus"], sentences=(1, 2)
        )
        _check_text(
            report,
            "positions",
            line,
            "interpretation_angle",
            row["interpretation_angle"],
            sentences=(1, 2),
        )
        _check_text(
            report, "positions", line, "ask_1", row["ask_1"], sentences=(1, 1), question=True
        )
        _check_list(
            report,
            "positions",
            line,
            "ask_1_options",
            row["ask_1_options"],
            items=(2, 4),
            chips=CHIP_WORDS,
        )
        if row["ask_2"]:
            _check_text(
                report, "positions", line, "ask_2", row["ask_2"], sentences=(1, 1), question=True
            )
            if not row["ask_2_options"]:
                report.add("positions", line, "E_ASK2_OPTIONS", "ask_2 без ask_2_options")
            else:
                _check_list(
                    report,
                    "positions",
                    line,
                    "ask_2_options",
                    row["ask_2_options"],
                    items=(2, 4),
                    chips=CHIP_WORDS,
                )
    for spread_id, (line, count) in counts.items():
        got = sorted(numbers.get(spread_id, []))
        if got != list(range(1, count + 1)):
            report.add(
                "spreads",
                line,
                "E_POSITIONS_COUNT",
                f"«{spread_id}»: positions_count={count}, номера позиций {got}",
            )


def _check_refusals(report: Report, rows: list[tuple[int, Row]]) -> None:
    seen: dict[str, int] = {}
    for line, row in rows:
        refusal_type = row["type"]
        if refusal_type and refusal_type not in REFUSAL_TYPES:
            report.add("refusals", line, "E_REFUSAL_TYPE", f"type «{refusal_type}» вне пяти типов")
        if refusal_type in seen:
            report.add(
                "refusals",
                line,
                "E_DUPLICATE",
                f"type «{refusal_type}» уже был в строке {seen[refusal_type]}",
            )
        seen[refusal_type] = line
        _check_text(report, "refusals", line, "text", row["text"], sentences=(2, 4))
        _check_text(report, "refusals", line, "follow_up", row["follow_up"], sentences=(1, 1))
    missing = [name for name in REFUSAL_TYPES if name not in seen]
    if missing:
        report.add("refusals", 1, "E_REFUSAL_TYPE", f"нет типов: {', '.join(missing)}")


def _check_resources(report: Report, rows: list[tuple[int, Row]]) -> None:
    for line, row in rows:
        _check_text(
            report, "crisis_resources", line, "description", row["description"], sentences=(1, 1)
        )


def _check_checkins(report: Report, rows: list[tuple[int, Row]]) -> None:
    for line, row in rows:
        _check_text(
            report, "checkin_texts", line, "text", row["text"], sentences=(1, 2), question=True
        )
        _check_list(
            report, "checkin_texts", line, "options", row["options"], items=(2, 4), chips=CHIP_WORDS
        )
        _check_text(report, "checkin_texts", line, "closing", row["closing"], sentences=(1, 1))


def _check_row_counts(report: Report, rows: dict[str, list[tuple[int, Row]]]) -> None:
    """Полнота листов по брифу: размеры и все три темы.

    Лист без строк `ready` уехал бы в YAML пустым, а приложение получило бы
    пустой кризисный экран (REQ-4) и деление на ноль в `get_checkin_text`.
    """
    for sheet, (low, high) in ROW_LIMITS.items():
        count = len(rows[sheet])
        if not low <= count <= high:
            report.add(sheet, 1, "E_ROWS", f"строк {count}, ожидается {low}–{high}")
    categories = {row["category"] for _, row in rows["spreads"]}
    missing = [name for name in CATEGORIES if name not in categories]
    if missing:
        report.add("spreads", 1, "E_ROWS", f"нет тем: {', '.join(missing)}")


def _records(sheet: str, rows: list[tuple[int, Row]]) -> list[dict[str, Any]]:
    """Строки YAML в порядке колонок листа, без `status`: в базе только `ready`."""
    names = [name for name in SHEETS[sheet] if name != "status"]
    return [{name: _value(name, row.get(name, "")) for name in names} for _, row in rows]


def _write_yaml(out_dir: Path, records: dict[str, list[dict[str, Any]]]) -> None:
    out_dir.mkdir(parents=True, exist_ok=True)
    for sheet, rows in records.items():
        text = yaml.safe_dump(
            rows, allow_unicode=True, sort_keys=False, default_flow_style=False, width=200
        )
        (out_dir / f"{sheet}.yaml").write_text(text, encoding="utf-8")


def validate(csv_dir: Path, out_dir: Path) -> Report:
    """Проверяет волну и (если ошибок нет) пишет YAML в `out_dir`."""
    report = Report()
    if not _prediction_words():
        # Иначе проверка стоп-слов молча выключилась бы (W_PREDICTION не бывает).
        report.add("stop_patterns", 1, "E_CONFIG", "пустой список predictions в stop_patterns.yaml")
    rows = {sheet: _read_sheet(report, csv_dir, sheet) for sheet in SHEETS}
    counts = _check_spreads(report, rows["spreads"])
    _check_cards(report, rows["cards"])
    _check_positions(report, rows["positions"], counts)
    _check_refusals(report, rows["refusals"])
    _check_resources(report, rows["crisis_resources"])
    _check_checkins(report, rows["checkin_texts"])
    _check_row_counts(report, rows)
    if not report.failed:
        _write_yaml(out_dir, {sheet: _records(sheet, rows[sheet]) for sheet in SHEETS})
    return report


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Валидатор экспертной базы (CSV → YAML)")
    parser.add_argument("csv_dir", type=Path, help="каталог с CSV-волной")
    parser.add_argument("out_dir", type=Path, help="каталог YAML (backend/expert_base)")
    args = parser.parse_args(argv)
    report = validate(args.csv_dir, args.out_dir)
    for finding in report.findings:
        print(finding)
    return 1 if report.failed else 0


if __name__ == "__main__":
    sys.exit(main())
