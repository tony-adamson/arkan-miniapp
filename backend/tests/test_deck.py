"""Свойства движка колоды: детерминизм, отсутствие повторов и смещения (D3, NFR-3).

Ожидания взяты из `docs/expert-brief.md` §8 и `SOLUTION.md` §10.4, а не из
реализации: константы в тесте — независимый источник для проверок.
"""

from __future__ import annotations

import datetime

import pytest
from hypothesis import given, settings
from hypothesis import strategies as st

from app.engine import cards, deck

MAJOR_CARDS = (
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
SUITS = ("wands", "cups", "swords", "pentacles")
RANKS = (
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

SEEDS = st.binary(min_size=1, max_size=64)


def test_deck_is_78_unique_cards_in_brief_order() -> None:
    assert cards.MAJOR_CARDS == MAJOR_CARDS
    assert cards.CARDS[:22] == MAJOR_CARDS
    assert cards.CARDS[22:] == tuple(f"{rank}_of_{suit}" for suit in SUITS for rank in RANKS)
    assert len(cards.CARDS) == 78
    assert len(set(cards.CARDS)) == 78


def test_is_major() -> None:
    assert cards.is_major("tower") is True
    assert cards.is_major("ace_of_wands") is False
    # неизвестный id не старший аркан: существование проверяет валидатор базы
    assert cards.is_major("ace_of_sticks") is False


def test_new_seed_is_32_bytes_and_random() -> None:
    seeds = {deck.new_seed() for _ in range(32)}

    assert all(len(seed) == deck.SEED_BYTES == 32 for seed in seeds)
    assert len(seeds) == 32


@settings(max_examples=200, deadline=None)
@given(seed=SEEDS, n=st.integers(min_value=1, max_value=78))
def test_draw_is_deterministic_and_without_repeats(seed: bytes, n: int) -> None:
    drawn = deck.draw(seed, n, major_only=False)

    assert drawn == deck.draw(seed, n, major_only=False)
    assert len(drawn) == n
    assert len(set(drawn)) == n
    assert set(drawn) <= set(cards.CARDS)


@settings(max_examples=100, deadline=None)
@given(seed=SEEDS, n=st.integers(min_value=1, max_value=22))
def test_draw_major_only_gives_majors(seed: bytes, n: int) -> None:
    drawn = deck.draw(seed, n, major_only=True)

    assert drawn == deck.draw(seed, n, major_only=True)
    assert len(set(drawn)) == n
    assert set(drawn) <= set(cards.MAJOR_CARDS)


@settings(max_examples=50, deadline=None)
@given(seed=SEEDS, n=st.integers(min_value=23, max_value=1000))
def test_draw_major_only_rejects_more_than_22(seed: bytes, n: int) -> None:
    with pytest.raises(ValueError):
        deck.draw(seed, n, major_only=True)


@pytest.mark.parametrize(
    ("n", "major_only"),
    [(0, False), (-1, False), (79, False), (100, False), (0, True), (-1, True)],
)
def test_draw_rejects_out_of_range_n(n: int, major_only: bool) -> None:
    with pytest.raises(ValueError):
        deck.draw(bytes(32), n, major_only)


def test_draw_snapshot_for_fixed_seed() -> None:
    """Регрессия формата: расклад по сиду `bytes(32)` не меняется между версиями."""
    assert deck.draw(bytes(32), 3, major_only=False) == [
        "five_of_cups",
        "strength",
        "emperor",
    ]


def test_every_card_can_be_first_over_20k_seeds() -> None:
    """Смещение по модулю сделало бы часть карт недостижимой первой."""
    firsts = {deck.draw(seed, 1, major_only=False)[0] for seed in _seeds(20_000)}

    assert firsts == set(cards.CARDS)


def _seeds(count: int) -> list[bytes]:
    return [index.to_bytes(32, "big") for index in range(count)]


@settings(max_examples=50, deadline=None)
@given(
    secret=SEEDS,
    user_id=st.integers(min_value=1, max_value=10**15),
    day=st.dates(),
)
def test_daily_seed_is_deterministic_and_bound_to_user_and_date(
    secret: bytes, user_id: int, day: datetime.date
) -> None:
    seed = deck.daily_seed(secret, user_id, day)

    assert len(seed) == 32
    assert seed == deck.daily_seed(secret, user_id, day)
    assert seed != deck.daily_seed(secret, user_id + 1, day)
    assert seed != deck.daily_seed(secret, user_id, day + datetime.timedelta(days=1))
    assert seed != deck.daily_seed(secret + b"x", user_id, day)


@settings(max_examples=100, deadline=None)
@given(seed=SEEDS, position=st.integers(min_value=1, max_value=100))
def test_ask_variant_is_deterministic_and_binary(seed: bytes, position: int) -> None:
    assert deck.ask_variant(seed, position) in (1, 2)
    assert deck.ask_variant(seed, position) == deck.ask_variant(seed, position)


def test_ask_variant_uses_seed_and_position() -> None:
    seed = bytes(32)

    assert {deck.ask_variant(seed, position) for position in range(1, 40)} == {1, 2}
    assert {deck.ask_variant(bytes([value]) * 32, 1) for value in range(64)} == {1, 2}


def test_ask_variant_rejects_non_positive_position() -> None:
    with pytest.raises(ValueError):
        deck.ask_variant(bytes(32), 0)
