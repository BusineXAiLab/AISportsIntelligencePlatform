"""Fixed-window rate limiting backed by Redis."""
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse

from app.core.config import settings
from app.core.logging import get_logger
from app.core.redis import get_redis

logger = get_logger(__name__)

EXEMPT_PATHS = {"/api/v1/health", "/api/v1/health/live", "/api/v1/health/ready", "/metrics"}


class RateLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if request.url.path in EXEMPT_PATHS:
            return await call_next(request)

        client_ip = request.client.host if request.client else "unknown"
        key = f"ratelimit:{client_ip}:{request.url.path.split('/')[3] if len(request.url.path.split('/')) > 3 else 'root'}"
        try:
            redis = get_redis()
            count = await redis.incr(key)
            if count == 1:
                await redis.expire(key, 60)
            if count > settings.RATE_LIMIT_PER_MINUTE:
                return JSONResponse(
                    status_code=429,
                    content={
                        "error_code": "rate_limited",
                        "detail": "Too many requests. Please slow down.",
                    },
                )
        except Exception as exc:  # noqa: BLE001 - fail open if Redis is down
            logger.warning("rate_limit_unavailable", error=str(exc))

        return await call_next(request)
