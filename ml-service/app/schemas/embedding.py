from pydantic import BaseModel


class EmbedTextRequest(BaseModel):
    text: str


class EmbedTextResponse(BaseModel):
    embedding: list[float]
    dimensions: int


class EmbedJobRequest(BaseModel):
    job_id: str
    title: str
    description: str
    requirements: str | None = None
    skills: list[str] | None = None
    metadata: dict = {}


class EmbedResumeRequest(BaseModel):
    candidate_id: str
    resume_id: str
    parsed_text: str
    headline: str | None = None
    skills: list[str] | None = None
    metadata: dict = {}


class EmbedUpsertResponse(BaseModel):
    vector_id: str
    dimensions: int
    status: str
