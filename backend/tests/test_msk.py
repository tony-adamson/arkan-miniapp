from datetime import date, datetime, timedelta

import pytest

from app import msk


def test_msk_now_is_moscow_time() -> None:
    now = msk.msk_now()

    assert now.tzinfo is msk.MSK
    assert now.utcoffset() == timedelta(hours=3)


@pytest.mark.parametrize(
    ("utc_iso", "expected"),
    [
        ("2026-01-01T20:59:59+00:00", date(2026, 1, 1)),
        ("2026-01-01T21:00:00+00:00", date(2026, 1, 2)),
    ],
)
def test_msk_today_switches_at_21_utc(
    monkeypatch: pytest.MonkeyPatch, utc_iso: str, expected: date
) -> None:
    frozen = datetime.fromisoformat(utc_iso)

    class FrozenDatetime(datetime):
        @classmethod
        def now(cls, tz=None):
            return frozen

    monkeypatch.setattr(msk, "datetime", FrozenDatetime)

    assert msk.msk_today() == expected
