"""
Configuração do banco de dados.

Desenvolvimento : SQLite  (sqlite+aiosqlite:///./aprendai.db)
Produção        : PostgreSQL (postgresql+asyncpg://user:pass@host/db)

Migrações gerenciadas pelo Alembic — use:
  alembic revision --autogenerate -m "descrição"
  alembic upgrade head
"""
from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase

from app.core.config import get_settings


class Base(DeclarativeBase):
    pass


def _build_engine():
    settings    = get_settings()
    url         = settings.database_url
    connect_args = {"check_same_thread": False} if url.startswith("sqlite") else {}

    return create_async_engine(
        url,
        echo=settings.app_env == "development",
        connect_args=connect_args,
    )


engine = _build_engine()

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise