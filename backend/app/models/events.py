"""Append-only `events` (SOLUTION.md §9.4)."""

from datetime import datetime
from typing import Any

from sqlalchemy import BigInteger, DateTime, ForeignKey, Index, String, func, text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base

# Типы по §9.4; `crisis_shown` — исход кризис-проверки любого свободного текста (D13).
EVENT_TYPES = (
    "app_open",
    "question_sent",
    "card_revealed",
    "clarifying_answer",
    "summary_viewed",
    "daily_drawn",
    "daily_checkin",
    "shared",
    "push_opened",
    "refusal_shown",
    "crisis_shown",
)
LAYERS = ("spread", "daily")


class Event(Base):
    __tablename__ = "events"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    # события переживают удаление user (§11): user_id обнуляется, session_id без FK
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
    session_id: Mapped[int | None] = mapped_column(BigInteger)
    type: Mapped[str] = mapped_column(String(32))
    layer: Mapped[str | None] = mapped_column(String(16))
    payload: Mapped[dict[str, Any]] = mapped_column(
        JSONB, default=dict, server_default=text("'{}'::jsonb")
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (Index("ix_events_user_id_created_at", "user_id", "created_at"),)
