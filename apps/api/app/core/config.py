from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "AgentKart AI"
    environment: str = "development"
    database_url: str = "sqlite:///./agentkart.db"
    jwt_secret_key: str = "development-only-change-this-to-a-strong-secret-key"
    jwt_algorithm: str = "HS256"
    access_token_minutes: int = 30
    allowed_origins: str = "http://localhost:5173"
    openai_api_key: str | None = None
    upload_directory: str = "./uploads"
    max_upload_bytes: int = 10 * 1024 * 1024

    model_config = SettingsConfigDict(env_file=".env", env_prefix="AGENTKART_")

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.allowed_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
