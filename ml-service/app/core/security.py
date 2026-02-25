from fastapi import HTTPException, Security, status
from fastapi.security import APIKeyHeader

from app.config import settings

api_key_header = APIKeyHeader(name="X-Service-Key", auto_error=False)


async def verify_service_key(
    api_key: str | None = Security(api_key_header),
) -> str:
    if not settings.ml_service_api_key:
        # No key configured, allow all (development mode)
        return "dev"
    if api_key != settings.ml_service_api_key:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid or missing service API key",
        )
    return api_key
