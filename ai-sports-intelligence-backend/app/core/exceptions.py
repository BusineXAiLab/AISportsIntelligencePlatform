"""Application exception hierarchy mapped to HTTP responses by middleware."""


class AppError(Exception):
    status_code = 500
    error_code = "internal_error"

    def __init__(self, detail: str | None = None) -> None:
        self.detail = detail or self.__class__.__doc__ or "Application error"
        super().__init__(self.detail)


class NotFoundError(AppError):
    """Resource not found."""
    status_code = 404
    error_code = "not_found"


class ConflictError(AppError):
    """Resource conflict."""
    status_code = 409
    error_code = "conflict"


class UnauthorizedError(AppError):
    """Authentication required or invalid."""
    status_code = 401
    error_code = "unauthorized"


class ForbiddenError(AppError):
    """Insufficient permissions."""
    status_code = 403
    error_code = "forbidden"


class ValidationAppError(AppError):
    """Invalid request data."""
    status_code = 422
    error_code = "validation_error"


class EntitlementError(AppError):
    """Subscription plan does not include this feature."""
    status_code = 402
    error_code = "entitlement_required"


class RateLimitError(AppError):
    """Too many requests."""
    status_code = 429
    error_code = "rate_limited"


class ExternalServiceError(AppError):
    """Upstream provider failure."""
    status_code = 502
    error_code = "external_service_error"
