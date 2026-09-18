"""`fraud_flags` (SOLUTION.md §9.4).

PK (user_id, flag) — один флаг на тип: повторная установка не дублирует запись
(REQ-17), снятие — удалением строки вручную (§11).
"""

from datetime import datetime

from sqlalchemy import BigInteger, DateTime, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base

# Хранимые флаги (SOLUTION §9.4). `idle` не хранится — вычисляется вьюхой
# `v_flagged_users` в фазе 17.
FRAUD_FLAGS = ("signup_burst", "fast_requests", "duplicate_question")


class FraudFlag(Base):
    __tablename__ = "fraud_flags"

    user_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )
    flag: Mapped[str] = mapped_column(String(32), primary_key=True)
    reason: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
