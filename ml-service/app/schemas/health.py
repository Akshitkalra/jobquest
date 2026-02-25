from pydantic import BaseModel


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    model_dimension: int | None = None
    pinecone_connected: bool
