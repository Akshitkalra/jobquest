from app.models.embedding_model import EmbeddingModel
from app.services.text_processor import clean_text


class EmbeddingService:
    @staticmethod
    def generate_embedding(text: str) -> list[float]:
        """Generate a single embedding for the given text."""
        cleaned = clean_text(text)
        embeddings = EmbeddingModel.encode([cleaned])
        return embeddings[0]

    @staticmethod
    def generate_embeddings(texts: list[str]) -> list[list[float]]:
        """Generate embeddings for multiple texts."""
        cleaned = [clean_text(t) for t in texts]
        return EmbeddingModel.encode(cleaned)
