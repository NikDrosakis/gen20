import asyncio
from aioredis.exceptions import RedisError

class AioredisTimeoutError(asyncio.TimeoutError, RedisError):
    pass