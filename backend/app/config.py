"""Application configuration via environment variables."""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Database
    database_url: str = (
        "postgresql+psycopg://discipleship:discipleship@localhost:5432/discipleship"
    )

    # Auth
    secret_key: str = "change-me-in-production"
    jwt_algo: str = "HS256"
    jwt_expire_minutes: int = 60 * 24 * 7  # 7 days

    # ML
    embedding_model: str = "sentence-transformers/all-MiniLM-L6-v2"
    embedding_dim: int = 384

    # CORS
    cors_origins: list[str] = [
        "http://localhost:5173",
        "http://localhost:8081",
    ]


settings = Settings()
