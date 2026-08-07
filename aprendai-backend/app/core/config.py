from pydantic import AliasChoices, Field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parents[2]
WORKSPACE_ROOT = BASE_DIR.parent


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
    secret_key: str = Field(
        default="troque-isso-em-producao",
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
        env_file=(WORKSPACE_ROOT / ".env", BASE_DIR / ".env"),
        env_file_encoding="utf-8",
    )

    @model_validator(mode="after")
    def validate_google_oauth(self):
        placeholder_client_id = "seu_client_id.apps.googleusercontent.com"
        placeholder_secret = "GOCSPX-seu_secret"

        if self.google_client_id in {"", placeholder_client_id}:
            raise ValueError(
                "GOOGLE_CLIENT_ID não configurado. Substitua o valor de exemplo pelo client ID real do Google Cloud."
            )

        if self.google_client_secret in {"", placeholder_secret}:
            raise ValueError(
                "GOOGLE_CLIENT_SECRET não configurado. Substitua o valor de exemplo pelo secret real do Google Cloud."
            )

        return self


@lru_cache()
def get_settings() -> Settings:
    return Settings()