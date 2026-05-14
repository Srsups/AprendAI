from pydantic import AliasChoices, Field
from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache
from pathlib import Path


class Settings(BaseSettings):
    # GitHub Models
    github_token: str
    github_models_endpoint: str = "https://models.inference.ai.azure.com"
    github_model: str = "gpt-4o"

    # App
    app_env: str = "development"
    app_port: int = 8000

    # CORS
    cors_origins_raw: str = "http://localhost:3000"

    # Banco de dados
    database_url: str = "sqlite+aiosqlite:///./edumotor.db"

    # JWT  ← estas três estavam faltando
    secret_key: str = Field(
        default="05a1964bf58b2624e66dd10a24b04b82d62a61c89d14191fd79316d57f5d2536",
        validation_alias=AliasChoices("JWT_SECRET_KEY", "SECRET_KEY"),
    )
    algorithm: str = Field(
        default="HS256",
        validation_alias=AliasChoices("JWT_ALGORITHM", "ALGORITHM"),
    )
    access_token_expire_minutes: int = Field(
        default=60 * 24 * 7,
        validation_alias=AliasChoices("JWT_EXPIRE_MINUTES", "ACCESS_TOKEN_EXPIRE_MINUTES"),
    )

    @property
    def cors_origins(self) -> list[str]:
        return [o.strip() for o in self.cors_origins_raw.split(",") if o.strip()]

    model_config = SettingsConfigDict(
        env_file=str(Path(__file__).resolve().parents[3] / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )


@lru_cache()
def get_settings() -> Settings:
    return Settings()