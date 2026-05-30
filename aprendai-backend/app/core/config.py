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
    database_url: str = "sqlite+aiosqlite:///./aprendai.db"

    # JWT
    secret_key: str = "troque-isso-em-producao"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7

    # Resend (email) ← NOVO
    resend_api_key: str = ""
    resend_from_email: str = "onboarding@resend.dev"

    # Google OAuth ← NOVO
    google_client_id: str = ""
    google_client_secret: str = ""
    google_redirect_uri: str = "http://localhost:8000/api/v1/auth/google/callback"

    # URL do frontend ← NOVO (para redirects após OAuth)
    frontend_url: str = "http://localhost:3000"

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