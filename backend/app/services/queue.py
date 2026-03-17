import json
from typing import Any

import redis

from app.core.config import settings


_redis = redis.from_url(settings.redis_url, decode_responses=True)
JOBS_KEY = "platformforge:jobs"


def enqueue_job(payload: dict[str, Any]) -> None:
    _redis.rpush(JOBS_KEY, json.dumps(payload))

