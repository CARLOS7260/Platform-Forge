from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "Platform Forge API"
    api_version: str = "v1"
    database_url: str = "sqlite:///./platformforge.db"
    redis_url: str = "redis://localhost:6379/0"
    cors_origins: str = "http://localhost:3000"
    internal_token: str = "dev-internal-token"


settings = Settings()
