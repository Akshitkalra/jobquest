from pinecone import Pinecone, ServerlessSpec

from app.config import settings


class PineconeService:
    _client: Pinecone | None = None
    _index = None

    @classmethod
    def get_client(cls) -> Pinecone:
        if cls._client is None:
            cls._client = Pinecone(api_key=settings.pinecone_api_key)
        return cls._client

    @classmethod
    def get_index(cls):
        if cls._index is None:
            client = cls.get_client()
            index_name = settings.pinecone_index_name

            # Create index if it doesn't exist
            existing_indexes = [idx.name for idx in client.list_indexes()]
            if index_name not in existing_indexes:
                client.create_index(
                    name=index_name,
                    dimension=384,
                    metric="cosine",
                    spec=ServerlessSpec(
                        cloud=settings.pinecone_cloud,
                        region=settings.pinecone_region,
                    ),
                )

            cls._index = client.Index(index_name)
        return cls._index

    @classmethod
    def upsert_vector(
        cls,
        vector_id: str,
        values: list[float],
        metadata: dict,
        namespace: str,
    ) -> None:
        index = cls.get_index()
        index.upsert(
            vectors=[{"id": vector_id, "values": values, "metadata": metadata}],
            namespace=namespace,
        )

    @classmethod
    def query_vectors(
        cls,
        query_vector: list[float],
        namespace: str,
        top_k: int = 20,
        filter_dict: dict | None = None,
    ) -> list[dict]:
        index = cls.get_index()
        results = index.query(
            vector=query_vector,
            namespace=namespace,
            top_k=top_k,
            filter=filter_dict,
            include_metadata=True,
        )
        return [
            {
                "id": match.id,
                "score": match.score,
                "metadata": match.metadata,
            }
            for match in results.matches
        ]

    @classmethod
    def delete_vector(cls, vector_id: str, namespace: str) -> None:
        index = cls.get_index()
        index.delete(ids=[vector_id], namespace=namespace)

    @classmethod
    def is_healthy(cls) -> bool:
        try:
            index = cls.get_index()
            index.describe_index_stats()
            return True
        except Exception:
            return False
