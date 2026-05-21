import asyncio
from logging.config import fileConfig

from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config

from alembic import context

# ── Importa todos os modelos para o Alembic detectar as mudanças ──────────────
# IMPORTANTE: toda vez que criar um novo modelo, adicione o import aqui
from app.db.database import Base
from app.db.models import (          # noqa: F401
    User,
    StudyPlan,
    Lesson,
    QuizAttempt,
    PlanRating,
    LessonComment,
)
from app.core.config import get_settings

# ─────────────────────────────────────────────────────────────────────────────

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Metadados de todos os modelos — o Alembic usa isso para gerar as migrações
target_metadata = Base.metadata


def get_url() -> str:
    """Lê a URL do banco das Settings — única fonte da verdade."""
    return get_settings().database_url


# ─── Modo offline (gera SQL sem conectar) ────────────────────────────────────

def run_migrations_offline() -> None:
    context.configure(
        url=get_url(),
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        render_as_batch=True,   # necessário para SQLite (ALTER TABLE)
    )
    with context.begin_transaction():
        context.run_migrations()


# ─── Modo online (conecta e migra) ────────────────────────────────────────────

def do_run_migrations(connection: Connection) -> None:
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
        render_as_batch=True,   # necessário para SQLite (ALTER TABLE)
    )
    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    """Cria o engine async e roda as migrações."""
    config_section = config.get_section(config.config_ini_section, {})
    config_section["sqlalchemy.url"] = get_url()

    connectable = async_engine_from_config(
        config_section,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()


def run_migrations_online() -> None:
    asyncio.run(run_async_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()