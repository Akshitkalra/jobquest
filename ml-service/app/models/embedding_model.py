from sentence_transformers import SentenceTransformer


class EmbeddingModel:
    _model: SentenceTransformer | None = None

    @classmethod
    def load(cls, model_name: str) -> None:
        cls._model = SentenceTransformer(model_name)

    @classmethod
    def get_model(cls) -> SentenceTransformer:
        if cls._model is None:
            raise RuntimeError("Embedding model not loaded. Call load() first.")
        return cls._model

    @classmethod
    def encode(cls, texts: list[str]) -> list[list[float]]:
        model = cls.get_model()
        embeddings = model.encode(texts, normalize_embeddings=True)
        return embeddings.tolist()

    @classmethod
    def dimension(cls) -> int:
        return cls.get_model().get_sentence_embedding_dimension()
