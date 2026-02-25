from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.config import settings
from app.models.embedding_model import EmbeddingModel
from app.api.v1.router import api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: load the sentence-transformer model
    EmbeddingModel.load(settings.model_name)
    yield
    # Shutdown: cleanup if needed


app = FastAPI(
    title="Job Portal ML Service",
    description="AI microservice for resume/JD vectorization and semantic search",
    version="1.0.0",
    lifespan=lifespan,
)

app.include_router(api_router, prefix="/api/v1")
