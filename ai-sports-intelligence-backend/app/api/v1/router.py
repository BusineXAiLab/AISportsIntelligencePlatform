from fastapi import APIRouter

from app.api.v1 import (
    admin,
    analytics,
    auth,
    health,
    matches,
    notifications,
    predictions,
    reports,
    subscriptions,
    telegram,
    users,
)

api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(subscriptions.router)
api_router.include_router(matches.router)
api_router.include_router(predictions.router)
api_router.include_router(reports.router)
api_router.include_router(telegram.router)
api_router.include_router(notifications.router)
api_router.include_router(admin.router)
api_router.include_router(analytics.router)
