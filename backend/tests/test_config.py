import pytest
from pydantic import ValidationError

from app.config import Settings, settings


def test_defaults_come_from_environment() -> None:
    assert settings.db_pool_size == 20
    assert settings.db_max_overflow == 20
    assert settings.spreads_per_day == 5
    assert settings.major_only is True
    assert settings.llm_fake is False
    assert settings.llm_fake_delay_ms == 0
    assert settings.reranker_enabled is True
    assert settings.bot_enabled is False
    assert settings.telegram_api_base == "https://api.telegram.org"
    assert settings.fraud_signups_per_source_hour == 20
    assert settings.fraud_min_interval_ms == 1500


def test_fake_llm_is_rejected_in_prod(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("ENV", "prod")
    monkeypatch.setenv("LLM_FAKE", "true")

    with pytest.raises(ValidationError):
        Settings()


def test_fake_llm_is_allowed_outside_prod(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("ENV", "test")
    monkeypatch.setenv("LLM_FAKE", "true")

    assert Settings().llm_fake is True
