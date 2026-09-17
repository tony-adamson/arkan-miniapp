"""Общие фикстуры тестов.

Настройки читаются из `infra/env.test` (его подставляет `make test`). Фикстура
`test_database` пересоздаёт тестовую базу и накатывает миграции: Postgres нужен
всем фазам начиная с этой.
"""

import asyncio
from collections.abc import AsyncIterator, Iterator
from pathlib import Path

import pytest
from alembic import command
from alembic.config import Config
from sqlalchemy import text
from sqlalchemy.engine import make_url
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.pool import NullPool

from app.config import settings

BACKEND_DIR = Path(__file__).resolve().parents[1]


def _alembic_config() -> Config:
    return Config(str(BACKEND_DIR / "alembic.ini"))


def migrate(revision: str = "head") -> None:
    """Накатывает миграции до ревизии (по умолчанию `head`)."""
    command.upgrade(_alembic_config(), revision)


def downgrade(revision: str = "base") -> None:
    """Откатывает миграции до ревизии (по умолчанию `base`)."""
    command.downgrade(_alembic_config(), revision)


def _db_name() -> str:
    name = make_url(settings.database_url).database or ""
    if not name.endswith("_test"):
        raise RuntimeError(f"тестовая база должна называться *_test, а не {name!r}")
    return name


def _admin_engine() -> AsyncEngine:
    """Подключение к служебной базе `postgres`: CREATE/DROP DATABASE идут из неё."""
    url = make_url(settings.database_url).set(database="postgres")
    return create_async_engine(
        url.render_as_string(hide_password=False),
        isolation_level="AUTOCOMMIT",
        poolclass=NullPool,
    )


async def _recreate_database() -> None:
    name = _db_name()
    engine = _admin_engine()
    async with engine.connect() as conn:
        await conn.execute(text(f'DROP DATABASE IF EXISTS "{name}" WITH (FORCE)'))
        await conn.execute(text(f'CREATE DATABASE "{name}"'))
    await engine.dispose()


async def _drop_database() -> None:
    name = _db_name()
    engine = _admin_engine()
    async with engine.connect() as conn:
        await conn.execute(text(f'DROP DATABASE IF EXISTS "{name}" WITH (FORCE)'))
    await engine.dispose()


@pytest.fixture(scope="session", autouse=True)
def test_database() -> Iterator[None]:
    """Создаёт `arkan_test`, накатывает `head`, удаляет базу по завершении сессии."""
    asyncio.run(_recreate_database())
    migrate()
    yield
    asyncio.run(_drop_database())


@pytest.fixture
async def db_session() -> AsyncIterator[AsyncSession]:
    """Сессия к тестовой базе.

    Свой engine на тест: pytest-asyncio даёт каждому тесту свой event loop, а
    пул соединений переиспользовать между loop'ами нельзя.
    """
    engine = create_async_engine(settings.database_url, poolclass=NullPool)
    maker = async_sessionmaker(engine, expire_on_commit=False)
    async with maker() as session:
        yield session
    await engine.dispose()
