"""Shared helpers for Celery jobs: async bridge, locking, metrics, logging."""
import asyncio
import functools
import time
from collections.abc import Callable, Coroutine
from typing import Any

from prometheus_client import Counter, Histogram

from app.core.database import async_session_factory
from app.core.logging import configure_logging, get_logger

configure_logging()
logger = get_logger("jobs")

JOB_RUNS = Counter("job_runs_total", "Background job executions", ["job", "status"])
JOB_DURATION = Histogram("job_duration_seconds", "Background job duration", ["job"])


def run_async(coro: Coroutine) -> Any:
    """Run an async coroutine from a synchronous Celery task."""
    return asyncio.run(coro)


def job_wrapper(job_name: str) -> Callable:
    """Decorator adding start/end/failure logging and metrics to a job."""

    def decorator(fn: Callable) -> Callable:
        @functools.wraps(fn)
        def wrapper(*args: Any, **kwargs: Any) -> Any:
            start = time.perf_counter()
            logger.info("job_started", job=job_name)
            try:
                result = fn(*args, **kwargs)
            except Exception as exc:
                JOB_RUNS.labels(job_name, "failure").inc()
                logger.error("job_failed", job=job_name, error=str(exc))
                raise
            duration = time.perf_counter() - start
            JOB_RUNS.labels(job_name, "success").inc()
            JOB_DURATION.labels(job_name).observe(duration)
            logger.info("job_finished", job=job_name, duration_s=round(duration, 2),
                        result=result)
            return result

        return wrapper

    return decorator


async def with_lock(lock_name: str, ttl_seconds: int, coro: Coroutine) -> Any:
    """Run a coroutine under a Redis lock to avoid duplicate processing."""
    from app.core.redis import get_redis

    redis = get_redis()
    acquired = await redis.set(f"joblock:{lock_name}", "1", nx=True, ex=ttl_seconds)
    if not acquired:
        logger.info("job_skipped_lock_held", lock=lock_name)
        return {"skipped": True, "reason": "lock_held"}
    try:
        return await coro
    finally:
        await redis.delete(f"joblock:{lock_name}")


def get_session():
    """Async session context manager for job code."""
    return async_session_factory()
