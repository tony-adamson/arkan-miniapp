"""Идентификаторы 78 карт колоды (docs/expert-brief.md §8).

Порядок `CARDS` — контракт: 22 старших аркана, затем младшие по мастям
(wands, cups, swords, pentacles), внутри масти ace…king. На него опираются
движок колоды и валидатор экспертной базы.
"""

MAJOR_CARDS: tuple[str, ...] = (
    "fool",
    "magician",
    "high_priestess",
    "empress",
    "emperor",
    "hierophant",
    "lovers",
    "chariot",
    "strength",
    "hermit",
    "wheel_of_fortune",
    "justice",
    "hanged_man",
    "death",
    "temperance",
    "devil",
    "tower",
    "star",
    "moon",
    "sun",
    "judgement",
    "world",
)

RANKS: tuple[str, ...] = (
    "ace",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
    "ten",
    "page",
    "knight",
    "queen",
    "king",
)

SUITS: tuple[str, ...] = ("wands", "cups", "swords", "pentacles")

MINOR_CARDS: tuple[str, ...] = tuple(f"{rank}_of_{suit}" for suit in SUITS for rank in RANKS)

CARDS: tuple[str, ...] = MAJOR_CARDS + MINOR_CARDS


def is_major(card_id: str) -> bool:
    """True для старших арканов, False для младших и неизвестных id."""
    return card_id in MAJOR_CARDS
