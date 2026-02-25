from fastapi import APIRouter

from app.models.embedding_model import EmbeddingModel
from app.schemas.health import HealthResponse
from app.services.pinecone_service import PineconeService

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
async def health_check():
    model_loaded = EmbeddingModel._model is not None
    model_dim = EmbeddingModel.dimension() if model_loaded else None
    pinecone_ok = PineconeService.is_healthy()

    return HealthResponse(
        status="ok" if model_loaded else "degraded",
        model_loaded=model_loaded,
        model_dimension=model_dim,
        pinecone_connected=pinecone_ok,
    )
