from fastapi import APIRouter, Depends

from app.core.security import verify_service_key
from app.schemas.search import (
    SearchMatch,
    SearchRequest,
    SearchResponse,
    SkillExtractionRequest,
    SkillExtractionResponse,
    ExtractedSkill,
)
from app.services.embedding_service import EmbeddingService
from app.services.pinecone_service import PineconeService

router = APIRouter(prefix="/search", dependencies=[Depends(verify_service_key)])

# Common technical skills for keyword-based extraction
KNOWN_SKILLS = {
    "java", "python", "javascript", "typescript", "c++", "c#", "go", "rust", "ruby",
    "php", "swift", "kotlin", "scala", "r", "matlab", "sql", "html", "css",
    "react", "angular", "vue", "next.js", "nuxt", "svelte", "node.js", "express",
    "spring boot", "spring", "django", "flask", "fastapi", "rails", "laravel",
    "asp.net", ".net", "hibernate", "jpa",
    "aws", "azure", "gcp", "docker", "kubernetes", "terraform", "ansible",
    "jenkins", "github actions", "ci/cd", "linux", "nginx",
    "postgresql", "mysql", "mongodb", "redis", "elasticsearch", "cassandra",
    "dynamodb", "firebase", "supabase",
    "git", "rest", "graphql", "grpc", "microservices", "kafka", "rabbitmq",
    "machine learning", "deep learning", "nlp", "computer vision", "tensorflow",
    "pytorch", "scikit-learn", "pandas", "numpy",
    "figma", "adobe xd", "sketch", "tailwind", "bootstrap", "sass",
    "agile", "scrum", "jira", "confluence",
    "communication", "leadership", "teamwork", "problem solving",
}


@router.post("/jobs-by-resume", response_model=SearchResponse)
async def search_jobs_by_resume(request: SearchRequest):
    """Find similar jobs for a resume/query text."""
    embedding = EmbeddingService.generate_embedding(request.query_text)

    results = PineconeService.query_vectors(
        query_vector=embedding,
        namespace="jobs",
        top_k=request.top_k,
        filter_dict=request.filter,
    )

    matches = [
        SearchMatch(id=r["id"], score=r["score"], metadata=r["metadata"])
        for r in results
    ]

    return SearchResponse(results=matches, total=len(matches))


@router.post("/candidates-by-job", response_model=SearchResponse)
async def search_candidates_by_job(request: SearchRequest):
    """Find similar candidates for a job description/query text."""
    embedding = EmbeddingService.generate_embedding(request.query_text)

    results = PineconeService.query_vectors(
        query_vector=embedding,
        namespace="resumes",
        top_k=request.top_k,
        filter_dict=request.filter,
    )

    matches = [
        SearchMatch(id=r["id"], score=r["score"], metadata=r["metadata"])
        for r in results
    ]

    return SearchResponse(results=matches, total=len(matches))


@router.post("/extract-skills", response_model=SkillExtractionResponse)
async def extract_skills(request: SkillExtractionRequest):
    """Extract skills from text using keyword matching."""
    text_lower = request.text.lower()
    found_skills = []

    for skill in KNOWN_SKILLS:
        if skill in text_lower:
            # Simple confidence based on frequency
            count = text_lower.count(skill)
            confidence = min(0.5 + (count * 0.15), 1.0)
            found_skills.append(ExtractedSkill(name=skill, confidence=round(confidence, 2)))

    # Sort by confidence descending
    found_skills.sort(key=lambda s: s.confidence, reverse=True)

    return SkillExtractionResponse(skills=found_skills)
