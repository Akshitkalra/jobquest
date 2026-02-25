from fastapi import APIRouter

from app.api.v1.endpoints import embeddings, health, search

api_router = APIRouter()

api_router.include_router(health.router, tags=["health"])
api_router.include_router(embeddings.router, tags=["embeddings"])
api_router.include_router(search.router, tags=["search"])
