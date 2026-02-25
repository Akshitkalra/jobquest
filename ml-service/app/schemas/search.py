from pydantic import BaseModel


class SearchRequest(BaseModel):
    query_text: str
    top_k: int = 20
    filter: dict | None = None


class SearchMatch(BaseModel):
    id: str
    score: float
    metadata: dict


class SearchResponse(BaseModel):
    results: list[SearchMatch]
    total: int


class SkillExtractionRequest(BaseModel):
    text: str


class ExtractedSkill(BaseModel):
    name: str
    confidence: float


class SkillExtractionResponse(BaseModel):
    skills: list[ExtractedSkill]
