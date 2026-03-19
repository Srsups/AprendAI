"""
Configuração do banco de dados.

Desenvolvimento : SQLite  (sqlite+aiosqlite:///./aprendai.db)
Produção        : PostgreSQL (postgresql+asyncpg://user:pass@host/db)

Para trocar basta alterar DATABASE_URL no .env — o resto do código não muda.
"""
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase

from app.core.config import get_settings


class Base(DeclarativeBase):
    """Base para todos os modelos ORM do projeto."""
    pass


def _build_engine():
    settings = get_settings()
    url = settings.database_url

    # SQLite precisa de connect_args para permitir uso em múltiplas threads/corrotinas
    connect_args = {"check_same_thread": False} if url.startswith("sqlite") else {}

    return create_async_engine(
        url,
        echo=settings.app_env == "development",   # Loga SQL no terminal em dev
        connect_args=connect_args,
    )


engine = _build_engine()

# Fábrica de sessões — usada via dependency injection nas rotas
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,   # Evita lazy-load após commit em contexto async
)


async def get_db() -> AsyncSession:
    """
    Dependency do FastAPI. Fornece uma sessão por request e fecha automaticamente.

    Uso nas rotas:
        async def minha_rota(db: AsyncSession = Depends(get_db)):
            ...
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


async def create_tables():
    """Cria todas as tabelas no banco (usado no startup da aplicação)."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
