"""`daily_cards` (SOLUTION.md §9.4)."""

from datetime import date, datetime

from sqlalchemy import BigInteger, Date, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class DailyCard(Base):
    __tablename__ = "daily_cards"

    # одна карта на пользователя в сутки МСК: PK (user_id, date)
    user_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )
    date: Mapped[date] = mapped_column(Date, primary_key=True)
    card_id: Mapped[str] = mapped_column(String(32))
    morning_text: Mapped[str | None] = mapped_column(Text)
    drawn_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    # вариант текста сверки выбирается детерминированно по дате (фаза 14)
    checkin_variant: Mapped[int | None] = mapped_column(Integer)
    checkin_answer: Mapped[str | None] = mapped_column(Text)
    checkin_reply: Mapped[str | None] = mapped_column(Text)
    checked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
