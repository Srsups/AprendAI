from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import hash_password, verify_password, create_access_token
from app.core.dependencies import get_current_user
from app.db.database import get_db
from app.db.repositories import UserRepository
from app.db.models import User
from app.models.auth_schemas import RegisterRequest, LoginRequest, TokenResponse, UserResponse

router = APIRouter(prefix="/auth", tags=["Autenticação"])


@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=201,
    summary="Cria uma conta nova e retorna o token JWT",
)
async def register(body: RegisterRequest, db: AsyncSession = Depends(get_db)):
    repo = UserRepository(db)

    if await repo.exists(body.email):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="E-mail já cadastrado.",
        )

    user = await repo.create(
        email=body.email,
        name=body.name,
        hashed_pw=hash_password(body.password),
        is_teacher=body.is_teacher,
    )

    token = create_access_token(user.id, user.email)
    return TokenResponse(access_token=token)


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Autentica e retorna o token JWT",
)
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db)):
    repo = UserRepository(db)
    user = await repo.get_by_email(body.email)

    if not user or not verify_password(body.password, user.hashed_pw):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-mail ou senha incorretos.",
        )

    token = create_access_token(user.id, user.email)
    return TokenResponse(access_token=token)


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Retorna os dados do usuário autenticado",
)
async def me(current_user: User = Depends(get_current_user)):
    return current_user