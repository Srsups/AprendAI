"""
Rotas de autenticação:
  POST /register           — cadastro com email/senha
  POST /login              — login com email/senha
  GET  /me                 — dados do usuário logado
  POST /forgot-password    — solicita email de recuperação
  POST /reset-password     — redefine a senha com o token
  GET  /google             — inicia o fluxo OAuth Google
  GET  /google/callback    — callback do Google OAuth
"""
import httpx
from urllib.parse import urlencode

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.dependencies import get_current_user
from app.core.security import hash_password, verify_password, create_access_token
from app.db.database import get_db
from app.db.models import User
from app.db.repositories import UserRepository, PasswordResetRepository
from app.models.auth_schemas import (
    RegisterRequest, LoginRequest, TokenResponse, UserResponse,
    ForgotPasswordRequest, ResetPasswordRequest,
)
from app.services.email_service import send_password_reset_email, send_welcome_email

router   = APIRouter(prefix="/auth", tags=["Autenticação"])
settings = get_settings()

GOOGLE_AUTH_URL  = "https://accounts.google.com/o/oauth2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USER_URL  = "https://www.googleapis.com/oauth2/v2/userinfo"
GOOGLE_SCOPES    = "openid email profile"


# ─── Email/senha ──────────────────────────────────────────────────────────────

@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(body: RegisterRequest, db: AsyncSession = Depends(get_db)):
    repo = UserRepository(db)

    if await repo.exists(body.email):
        raise HTTPException(status_code=409, detail="E-mail já cadastrado.")

    user = await repo.create(
        email      = body.email,
        name       = body.name,
        hashed_pw  = hash_password(body.password),
        is_teacher = body.is_teacher,
    )

    # Email de boas-vindas (não bloqueia o cadastro se falhar)
    await send_welcome_email(user.email, user.name)

    return TokenResponse(access_token=create_access_token(user.id, user.email))


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db)):
    repo = UserRepository(db)
    user = await repo.get_by_email(body.email)

    if not user or not user.hashed_pw or not verify_password(body.password, user.hashed_pw):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-mail ou senha incorretos.",
        )

    return TokenResponse(access_token=create_access_token(user.id, user.email))


@router.get("/me", response_model=UserResponse)
async def me(current_user: User = Depends(get_current_user)):
    return current_user


# ─── Recuperação de senha ─────────────────────────────────────────────────────

@router.post("/forgot-password", status_code=200)
async def forgot_password(body: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    repo       = UserRepository(db)
    reset_repo = PasswordResetRepository(db)
    user       = await repo.get_by_email(body.email)

    # Resposta genérica — não revela se o email existe (segurança)
    if not user:
        return {"message": "Se o e-mail estiver cadastrado, você receberá as instruções."}

    # Usuários que só têm Google OAuth não têm senha para redefinir
    if not user.hashed_pw:
        return {"message": "Se o e-mail estiver cadastrado, você receberá as instruções."}

    token     = await reset_repo.create_token(user.id)
    reset_url = f"{settings.frontend_url}/reset-password?token={token.token}"

    await send_password_reset_email(user.email, user.name, reset_url)

    return {"message": "Se o e-mail estiver cadastrado, você receberá as instruções."}


@router.post("/reset-password", status_code=200)
async def reset_password(body: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    reset_repo = PasswordResetRepository(db)
    user_repo  = UserRepository(db)

    record = await reset_repo.get_by_token(body.token)

    if not record or not record.is_valid:
        raise HTTPException(
            status_code=400,
            detail="Link inválido ou expirado. Solicite um novo.",
        )

    user = await user_repo.get_by_id(record.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")

    # Atualiza a senha
    user.hashed_pw = hash_password(body.new_password)
    await reset_repo.mark_used(record.id)

    return {"message": "Senha redefinida com sucesso."}


# ─── Google OAuth ─────────────────────────────────────────────────────────────

@router.get("/google")
async def google_login():
    """Redireciona para a página de autorização do Google."""
    params = {
        "client_id"    : settings.google_client_id,
        "redirect_uri" : settings.google_redirect_uri,
        "response_type": "code",
        "scope"        : GOOGLE_SCOPES,
        "access_type"  : "offline",
        "prompt"       : "select_account",
    }
    return RedirectResponse(f"{GOOGLE_AUTH_URL}?{urlencode(params)}")


@router.get("/google/callback")
async def google_callback(code: str, db: AsyncSession = Depends(get_db)):
    """
    Recebe o código do Google, troca por token,
    busca/cria o usuário e redireciona para o frontend com o JWT.
    """
    async with httpx.AsyncClient() as client:

        # 1. Troca o código pelo access token
        token_res = await client.post(GOOGLE_TOKEN_URL, data={
            "code"         : code,
            "client_id"    : settings.google_client_id,
            "client_secret": settings.google_client_secret,
            "redirect_uri" : settings.google_redirect_uri,
            "grant_type"   : "authorization_code",
        })

        if token_res.status_code != 200:
            return RedirectResponse(
                f"{settings.frontend_url}/login?error=google_auth_failed"
            )

        access_token = token_res.json().get("access_token")

        # 2. Busca os dados do usuário no Google
        user_res = await client.get(
            GOOGLE_USER_URL,
            headers={"Authorization": f"Bearer {access_token}"},
        )

        if user_res.status_code != 200:
            return RedirectResponse(
                f"{settings.frontend_url}/login?error=google_user_failed"
            )

        google_data = user_res.json()

    google_id = google_data.get("id")
    email     = google_data.get("email")
    name      = google_data.get("name") or email.split("@")[0]

    if not email:
        return RedirectResponse(f"{settings.frontend_url}/login?error=no_email")

    repo = UserRepository(db)
    user = await repo.get_by_email(email)

    if user:
        # Usuário já existe — atualiza o google_id se ainda não tem
        if not user.google_id:
            user.google_id = google_id
    else:
        # Cria o usuário sem senha (só pode logar via Google)
        user = await repo.create(
            email      = email,
            name       = name,
            hashed_pw  = "",     # sem senha — login só via Google
            is_teacher = False,
            google_id  = google_id,
        )
        await send_welcome_email(email, name)

    jwt = create_access_token(user.id, user.email)

    # Redireciona para o frontend com o token na URL
    return RedirectResponse(f"{settings.frontend_url}/google-callback?token={jwt}")