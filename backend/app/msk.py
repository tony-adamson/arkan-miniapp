"""Сутки и время МСК — единственный источник даты в приложении (SOLUTION §11)."""

from datetime import UTC, date, datetime
from zoneinfo import ZoneInfo

MSK = ZoneInfo("Europe/Moscow")


def msk_now() -> datetime:
    """Текущий момент в Europe/Moscow (UTC+3, переходов на летнее время нет)."""
    return datetime.now(UTC).astimezone(MSK)


def msk_today() -> date:
    """Календарная дата МСК: по ней считаются лимиты раскладов и карта дня."""
    return msk_now().date()
