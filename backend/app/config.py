"""Настройки приложения: единственный источник переменных окружения.

Полный список переменных всего плана живёт здесь, чтобы поздние фазы их не
добавляли. Значения читаются из окружения (в тестах — из `infra/env.test`,
в контейнере — из `infra/env.compose.test`, в проде — из `.env`).
"""

from typing import Literal

from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(case_sensitive=False, extra="ignore")

    env: Literal["dev", "test", "prod"] = "dev"
    app_origin: str
    database_url: str
    db_pool_size: int = 20
    db_max_overflow: int = 20
    redis_url: str
    qdrant_url: str
    qdrant_collection: str
    daily_secret: str
    # Подпись cookie сессии (D19); смена секрета разлогинивает всех гостей.
    session_secret: str
    spreads_per_day: int = 5
    major_only: bool = False

    llm_base_url: str
    llm_api_key: str
    llm_model: str
    llm_thinking: bool = False
    llm_timeout_s: int = 30
    llm_price_in_per_m: float
    llm_price_out_per_m: float
    llm_fake: bool = False
    llm_fake_delay_ms: int = 0

    models_dir: str
    reranker_enabled: bool = True

    bot_enabled: bool = False
    bot_token: str
    bot_username: str
    mini_app_url: str
    telegram_api_base: str = "https://api.telegram.org"
    telegram_proxy: str = ""

    fraud_signups_per_source_hour: int = 20
    fraud_min_interval_ms: int = 1500

    @model_validator(mode="after")
    def _forbid_fake_llm_in_prod(self) -> "Settings":
        """Подделка LLM — только для тестов и локальной разработки."""
        if self.env == "prod" and self.llm_fake:
            raise ValueError("LLM_FAKE must be false when ENV=prod")
        return self


# mypy видит поля обязательными, но их значения приходят из окружения.
settings = Settings()  # type: ignore[call-arg]
