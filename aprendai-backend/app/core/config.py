from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


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
    secret_key: str = "05a1964bf58b2624e66dd10a24b04b82d62a61c89d14191fd79316d57f5d2536"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7  # 7 dias

    @property
    def cors_origins(self) -> list[str]:
        return [o.strip() for o in self.cors_origins_raw.split(",") if o.strip()]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
    )


@lru_cache()
def get_settings() -> Settings:
    return Settings()