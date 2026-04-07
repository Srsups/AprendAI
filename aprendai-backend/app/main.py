"""
AprendAI — Backend FastAPI
Motor de criação de conteúdo educacional com IA (GitHub Models)
"""
import logging
import time
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import get_settings
from app.db.database import create_tables
from app.api.routes import plan, lesson, assessment, auth
from app.api.routes import plans_db, lessons_db, assessment_db

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s — %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    logger.info("=" * 60)
    logger.info("  AprendAI Backend iniciando...")
    logger.info(f"  Ambiente : {settings.app_env}")
    logger.info(f"  Modelo   : {settings.github_model}")
    logger.info(f"  Database : {settings.database_url}")
    logger.info("=" * 60)

    # Cria tabelas no banco (idempotente — não recria se já existem)
    await create_tables()
    logger.info("  Tabelas do banco verificadas/criadas.")

    yield
    logger.info("AprendAI Backend encerrando.")


settings = get_settings()

app = FastAPI(
    title="AprendAI API",
    description="""
## Motor de Aprendizado com IA

### Agentes de IA:
- **POST /api/v1/plan/generate** — Gera plano de N aulas (sem persistir)
- **POST /api/v1/lesson/generate** — Gera conteúdo de aula (sem persistir)
- **POST /api/v1/assessment/quiz** — Gera quiz baseado no conteúdo
- **POST /api/v1/assessment/flashcards** — Gera flashcards

### Com Persistência:
- **POST /api/v1/plans** — Salva um plano no banco
- **GET  /api/v1/plans** — Lista planos do usuário
- **GET  /api/v1/plans/{id}** — Detalhe do plano com aulas
- **POST /api/v1/plans/{id}/lessons/{n}/generate** — Gera aula com cache
- **POST /api/v1/plans/{id}/lessons/{n}/attempts** — Salva tentativa de quiz
- **POST /api/v1/plans/{id}/rating** — Avalia um plano (0–5 ★)
- **GET  /api/v1/plans/trending/list** — Temas mais gerados
    """,
    version="0.2.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def log_requests(request: Request, call_next):
    start    = time.perf_counter()
    response = await call_next(request)
    ms       = (time.perf_counter() - start) * 1000
    logger.info(f"{request.method} {request.url.path} → {response.status_code} ({ms:.0f}ms)")
    return response


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Erro não tratado: {exc}", exc_info=True)
    return JSONResponse(status_code=500, content={"detail": "Erro interno. Tente novamente."})


# ─── Routers ──────────────────────────────────────────────────────────────────

# Agentes de IA puros (sem banco)
app.include_router(plan.router,       prefix="/api/v1")
app.include_router(lesson.router,     prefix="/api/v1")
app.include_router(assessment.router, prefix="/api/v1")
app.include_router(auth.router,       prefix="/api/v1")

# Endpoints com persistência
app.include_router(plans_db.router,      prefix="/api/v1")
app.include_router(lessons_db.router,    prefix="/api/v1")
app.include_router(assessment_db.router, prefix="/api/v1")


@app.get("/health", tags=["Sistema"])
async def health_check():
    return {"status": "ok", "model": settings.github_model, "env": settings.app_env}


@app.get("/", tags=["Sistema"])
async def root():
    return {"message": "AprendAI API", "docs": "/docs"}
