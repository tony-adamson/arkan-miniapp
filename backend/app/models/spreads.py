"""`spreads` и `spread_positions` (SOLUTION.md §9.4)."""

from datetime import datetime

from sqlalchemy import BigInteger, DateTime, ForeignKey, Integer, LargeBinary, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class Spread(Base):
    __tablename__ = "spreads"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    structure_type: Mapped[str] = mapped_column(String(32))
    question: Mapped[str] = mapped_column(Text)
    category: Mapped[str] = mapped_column(String(32))
    # active | completed | abandoned; abandoned ставится только при кризисе (§11)
    status: Mapped[str] = mapped_column(String(16), default="active", server_default="active")
    # 32 байта: расклад воспроизводим из сида (D3)
    seed: Mapped[bytes] = mapped_column(LargeBinary(32))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    summary: Mapped[str | None] = mapped_column(Text)
    # passed | fallback; null до итога
    summary_status: Mapped[str | None] = mapped_column(String(16))


class SpreadPosition(Base):
    __tablename__ = "spread_positions"

    spread_id: Mapped[int] = mapped_column(
        ForeignKey("spreads.id", ondelete="CASCADE"), primary_key=True
    )
    position_number: Mapped[int] = mapped_column(Integer, primary_key=True)
    card_id: Mapped[str] = mapped_column(String(32))
    revealed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    interpretation: Mapped[str | None] = mapped_column(Text)
    # passed | fallback
    verify_status: Mapped[str | None] = mapped_column(String(16))
    # 1 | 2 — вариант уточняющего вопроса позиции (D2)
    ask_variant: Mapped[int | None] = mapped_column(Integer)
    ask_answer: Mapped[str | None] = mapped_column(Text)
