"""Append-only `llm_calls` (SOLUTION.md §9.4)."""

from datetime import datetime
from decimal import Decimal

from sqlalchemy import BigInteger, DateTime, ForeignKey, Index, Integer, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base

# Шаги по §9.4; `checkin` — сверка карты дня (фаза 14).
LLM_STEPS = ("classification", "interpretation", "verification", "summary", "daily", "checkin")
CALL_STATUSES = ("ok", "error")


class LlmCall(Base):
    __tablename__ = "llm_calls"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    # FK нет: у шагов daily и checkin расклада нет, а стоимость живёт до удаления user
    spread_id: Mapped[int | None] = mapped_column(BigInteger)
    step: Mapped[str] = mapped_column(String(16))
    model: Mapped[str] = mapped_column(String(64))
    # NOT NULL без дефолтов: писатель обязан передать значения, иначе ошибка вместо
    # тихого нуля в метрике стоимости (NFR-2, REQ-16).
    tokens_in: Mapped[int] = mapped_column(Integer)
    tokens_out: Mapped[int] = mapped_column(Integer)
    cost_usd: Mapped[Decimal] = mapped_column(Numeric(12, 6))
    status: Mapped[str] = mapped_column(String(16))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (Index("ix_llm_calls_user_id_created_at", "user_id", "created_at"),)
