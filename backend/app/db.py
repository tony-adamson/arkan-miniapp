"""Async-подключение к Postgres: один engine на процесс, сессии через sessionmaker."""

from collections.abc import AsyncIterator

from sqlalchemy.exc import DBAPIError
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.config import settings

LOCK_TIMEOUT_SQLSTATE = "55P03"  # PG: ожидание блокировки оборвано `lock_timeout`

engine = create_async_engine(
    settings.database_url,
    pool_size=settings.db_pool_size,
    max_overflow=settings.db_max_overflow,
    # `lock_timeout` на соединении: ожидание чужой блокировки (advisory-ключ лимита,
    # `FOR UPDATE` на сессии) обрывается ошибкой, а не держит соединение пула вечно.
    connect_args={"server_settings": {"lock_timeout": str(settings.db_lock_timeout_ms)}},
)

SessionLocal: async_sessionmaker[AsyncSession] = async_sessionmaker(engine, expire_on_commit=False)


async def get_session() -> AsyncIterator[AsyncSession]:
    async with SessionLocal() as session:
        yield session


def is_lock_timeout(error: DBAPIError) -> bool:
    """Ошибка от `lock_timeout`, а не настоящий сбой базы."""
    return getattr(error.orig, "sqlstate", None) == LOCK_TIMEOUT_SQLSTATE
