# redis_client.py
import redis
from config import settings

redis_client = redis.StrictRedis.from_url(settings.REDIS_URL)
