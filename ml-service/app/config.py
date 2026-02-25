from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_env: str = "development"
    app_port: int = 8000
    model_name: str = "sentence-transformers/all-MiniLM-L6-v2"
    pinecone_api_key: str = ""
    pinecone_index_name: str = "job-portal"
    pinecone_cloud: str = "aws"
    pinecone_region: str = "us-east-1"
    ml_service_api_key: str = ""

    class Config:
        env_file = ".env"


settings = Settings()
