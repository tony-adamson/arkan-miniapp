"""`users` и `sessions` (SOLUTION.md §9.4)."""

from datetime import date, datetime

from sqlalchemy import BigInteger, Boolean, Date, DateTime, ForeignKey, String, func, true
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    # короткая ссылка для шеринга (8 символов base32), создаётся при согласии (REQ-15)
    public_ref: Mapped[str] = mapped_column(String(8), unique=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    consent_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    first_source: Mapped[str | None] = mapped_column(String(64))
    # opt-out (D5): напоминания включены, пока пользователь не выключил их
    push_enabled: Mapped[bool] = mapped_column(
        Boolean, default=True, server_default=true(), nullable=False
    )
    last_reminder_date: Mapped[date | None] = mapped_column(Date)
    telegram_id: Mapped[int | None] = mapped_column(BigInteger, unique=True)


class Session(Base):
    __tablename__ = "sessions"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    # гость: user_id появляется при согласии; удаление user отвязывает сессию (§11)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    last_seen: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
