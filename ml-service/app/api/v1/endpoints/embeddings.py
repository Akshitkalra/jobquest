import logging
import traceback

from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse

from app.core.security import verify_service_key
from app.schemas.embedding import (
    EmbedJobRequest,
    EmbedResumeRequest,
    EmbedTextRequest,
    EmbedTextResponse,
    EmbedUpsertResponse,
)
from app.services.embedding_service import EmbeddingService
from app.services.pinecone_service import PineconeService
from app.services.text_processor import prepare_job_text, prepare_resume_text

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/embeddings", dependencies=[Depends(verify_service_key)])


@router.post("/text", response_model=EmbedTextResponse)
async def embed_text(request: EmbedTextRequest):
    """Generate embedding for arbitrary text."""
    embedding = EmbeddingService.generate_embedding(request.text)
    return EmbedTextResponse(embedding=embedding, dimensions=len(embedding))


@router.post("/job", response_model=EmbedUpsertResponse)
async def embed_job(request: EmbedJobRequest):
    """Vectorize job description and upsert to Pinecone."""
    try:
        text = prepare_job_text(
            title=request.title,
            description=request.description,
            requirements=request.requirements,
            skills=request.skills,
        )
        embedding = EmbeddingService.generate_embedding(text)

        vector_id = f"job_{request.job_id}"
        metadata = {
            "job_id": request.job_id,
            "title": request.title,
            "type": "job",
            **request.metadata,
        }

        PineconeService.upsert_vector(
            vector_id=vector_id,
            values=embedding,
            metadata=metadata,
            namespace="jobs",
        )

        return EmbedUpsertResponse(
            vector_id=vector_id, dimensions=len(embedding), status="upserted"
        )
    except Exception as e:
        logger.error(f"Failed to embed job: {e}\n{traceback.format_exc()}")
        return JSONResponse(status_code=500, content={"error": str(e), "type": type(e).__name__})


@router.post("/resume", response_model=EmbedUpsertResponse)
async def embed_resume(request: EmbedResumeRequest):
    """Vectorize resume text and upsert to Pinecone."""
    try:
        text = prepare_resume_text(
            parsed_text=request.parsed_text,
            headline=request.headline,
            skills=request.skills,
        )
        embedding = EmbeddingService.generate_embedding(text)

        vector_id = f"resume_{request.resume_id}"
        metadata = {
            "candidate_id": request.candidate_id,
            "resume_id": request.resume_id,
            "type": "resume",
            **request.metadata,
        }

        PineconeService.upsert_vector(
            vector_id=vector_id,
            values=embedding,
            metadata=metadata,
            namespace="resumes",
        )

        return EmbedUpsertResponse(
            vector_id=vector_id, dimensions=len(embedding), status="upserted"
        )
    except Exception as e:
        logger.error(f"Failed to embed resume: {e}\n{traceback.format_exc()}")
        return JSONResponse(status_code=500, content={"error": str(e), "type": type(e).__name__})


@router.delete("/{vector_id}")
async def delete_embedding(vector_id: str, namespace: str = "jobs"):
    """Delete a vector from Pinecone."""
    PineconeService.delete_vector(vector_id=vector_id, namespace=namespace)
    return {"status": "deleted", "vector_id": vector_id}
