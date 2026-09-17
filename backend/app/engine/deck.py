"""Движок колоды: сид, вытягивание карт, вариант уточняющего вопроса (SOLUTION §10.4).

Модуль чистый: результат целиком определяется аргументами. Ни БД, ни сети, ни
времени, ни глобального изменяемого состояния (D3, NFR-3) — иначе расклад нельзя
воспроизвести по сохранённому сиду.
"""

from __future__ import annotations

import datetime
import hmac
import secrets
from collections.abc import Iterator

from app.engine.cards import CARDS, MAJOR_CARDS

SEED_BYTES = 32
_WORD_BYTES = 4
_WORD_SPACE = 1 << (8 * _WORD_BYTES)


def new_seed() -> bytes:
    """Свежий сид расклада: 32 байта OS CSPRNG."""
    return secrets.token_bytes(SEED_BYTES)


def daily_seed(secret: bytes, user_id: int, date: datetime.date) -> bytes:
    """Сид карты дня: HMAC(secret, "<user_id>:<date>") — одна карта на сутки МСК.

    Дата приходит уже в МСК (`app/msk.py`): движок время не читает.
    """
    return hmac.digest(secret, f"{user_id}:{date.isoformat()}".encode(), "sha256")


def ask_variant(seed: bytes, position: int) -> int:
    """Формулировка уточняющего вопроса позиции: 1 или 2.

    Ключ `variant:<position>` не пересекается с потоком `draw`, поэтому вариант не
    зависит от числа вытянутых карт. Младший бит равновероятен.
    """
    if position < 1:
        raise ValueError(f"position must be >= 1, got {position}")
    digest = hmac.digest(seed, b"variant:" + position.to_bytes(8, "big"), "sha256")
    return 1 + (digest[0] & 1)


def draw(seed: bytes, n: int, major_only: bool) -> list[str]:
    """Первые `n` карт колоды в порядке позиций: элемент 0 — карта позиции 1.

    Тасование Фишера–Йетса поверх HMAC-потока сида: повторный вызов с тем же сидом
    даёт тот же расклад, повторов карт внутри расклада нет. `major_only` сужает
    колоду до 22 старших арканов (`MAJOR_ONLY`, D12), поэтому `n > 22` — ошибка.
    """
    deck = list(MAJOR_CARDS if major_only else CARDS)
    if not 1 <= n <= len(deck):
        raise ValueError(f"n must be in [1, {len(deck)}], got {n}")
    stream = _hmac_stream(seed)
    drawn: list[str] = []
    # Тасование идёт с конца колоды: после шага i карта deck[i] уже выбрана,
    # поэтому достаточно n шагов, а не перемешивания всей колоды.
    for i in range(len(deck) - 1, len(deck) - 1 - n, -1):
        j = _uniform_below(stream, i + 1)
        deck[i], deck[j] = deck[j], deck[i]
        drawn.append(deck[i])
    return drawn


def _hmac_stream(seed: bytes) -> Iterator[bytes]:
    """Бесконечный поток блоков HMAC-SHA256(seed, counter.to_bytes(8, "big"))."""
    counter = 0
    while True:
        yield hmac.digest(seed, counter.to_bytes(8, "big"), "sha256")
        counter += 1


def _uniform_below(stream: Iterator[bytes], bound: int) -> int:
    """Равномерное целое из [0, bound) без смещения по модулю.

    2^32 не делится на `bound` нацело, поэтому `% bound` без отбраковки давал бы
    часть индексов чаще остальных; значения из хвоста диапазона отбрасываются.
    """
    limit = _WORD_SPACE - (_WORD_SPACE % bound)
    for block in stream:
        for offset in range(0, len(block), _WORD_BYTES):
            value = int.from_bytes(block[offset : offset + _WORD_BYTES], "big")
            if value < limit:
                return value % bound
    raise AssertionError("unreachable: HMAC-поток бесконечен")
