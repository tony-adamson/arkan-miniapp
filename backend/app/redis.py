"""Общий async-клиент Redis: идемпотентность и счётчики (SOLUTION §9.4, §9.6).

Redis эфемерен: его недоступность не ломает продукт, а лишь отключает
идемпотентность и антифрод-лимиты (fail-open). Клиент создаётся лениво, чтобы
импорт не требовал живого Redis, и живёт один на процесс.
"""

from redis.asyncio import Redis

from app.config import settings

# Без таймаутов «живой, но медленный» Redis подвешивает запрос навсегда, и
# заявленный fail-open не наступает: исключения, которое его включает, нет.
SOCKET_TIMEOUT_S = 2.0

_client: Redis | None = None


def get_redis() -> Redis:
    """Клиент Redis, общий для процесса. Создаётся при первом обращении."""
    global _client
    if _client is None:
        _client = Redis.from_url(
            settings.redis_url,
            decode_responses=True,
            socket_timeout=SOCKET_TIMEOUT_S,
            socket_connect_timeout=SOCKET_TIMEOUT_S,
        )
    return _client


async def close_redis() -> None:
    """Закрывает клиент и сбрасывает ссылку.

    Нужно тестам: pytest-asyncio даёт каждому тесту свой event loop, а пул
    соединений redis-py к чужому loop'у не привязан.
    """
    global _client
    if _client is not None:
        await _client.aclose()
        _client = None
