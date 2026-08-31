import logging

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from openai import APIConnectionError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user
from app.db.database import get_db
from app.db.models import User
from app.db.repositories import LessonRepository, StudyPlanRepository
from app.models.schemas import LessonRequest, LessonResponse, DifficultyLevel, ToneStyle
from app.services.lesson_service import generate_lesson, generate_lesson_stream

router = APIRouter(prefix="/plans", tags=["Aulas (Persistência)"])
logger = logging.getLogger(__name__)


@router.post("/{plan_id}/lessons/{lesson_number}/generate", response_model=LessonResponse)
async def get_or_generate_lesson(
    plan_id: str,
    lesson_number: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    plan_repo   = StudyPlanRepository(db)
    lesson_repo = LessonRepository(db)

    plan = await plan_repo.get_by_id(plan_id, load_lessons=True)
    if not plan or plan.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Plano não encontrado.")

    lesson = await lesson_repo.get_by_plan_and_number(plan_id, lesson_number)
    if not lesson:
        raise HTTPException(status_code=404, detail=f"Aula {lesson_number} não encontrada.")

    # Cache hit
    if lesson.generated and lesson.content_json:
        await lesson_repo.mark_viewed(lesson.id)
        return LessonResponse(**lesson.content_json)

    # Cache miss — chama a IA
    previous_lessons = [l.title for l in plan.lessons if l.number < lesson_number]

    try:
        request = LessonRequest(
            subject=plan.subject,
            lesson_number=lesson_number,
            lesson_title=lesson.title,
            level=DifficultyLevel(plan.level),
            tone=ToneStyle(plan.tone),
            previous_lessons=previous_lessons,
        )
    except ValueError as e:
        logger.exception(
            "[LessonsDB] Dados inválidos para gerar aula | plan_id=%s lesson_number=%s level=%s tone=%s",
            plan_id,
            lesson_number,
            plan.level,
            plan.tone,
        )
        raise HTTPException(status_code=422, detail=f"Configuração inválida do plano: {str(e)}")

    try:
        result = await generate_lesson(request)
    except APIConnectionError:
        logger.exception(
            "[LessonsDB] Falha de conexão com provedor de IA | plan_id=%s lesson_number=%s lesson_id=%s",
            plan_id,
            lesson_number,
            lesson.id,
        )
        raise HTTPException(
            status_code=503,
            detail="Serviço de IA indisponível no momento (falha de conexão de rede/DNS). Tente novamente em instantes.",
        )
    except Exception as e:
        logger.exception(
            "[LessonsDB] Falha ao gerar conteúdo da aula | plan_id=%s lesson_number=%s lesson_id=%s",
            plan_id,
            lesson_number,
            lesson.id,
        )
        raise HTTPException(status_code=500, detail=f"Erro ao gerar conteúdo: {str(e)}")

    try:
        await lesson_repo.save_content(lesson.id, result.model_dump())
        await lesson_repo.mark_viewed(lesson.id)
    except Exception:
        logger.exception(
            "[LessonsDB] Falha ao salvar conteúdo da aula | plan_id=%s lesson_number=%s lesson_id=%s",
            plan_id,
            lesson_number,
            lesson.id,
        )
        raise HTTPException(status_code=500, detail="Erro ao salvar conteúdo da aula.")

    if lesson_number > plan.current_lesson:
        await plan_repo.update_progress(
            plan_id, lesson_number, lesson_number >= plan.num_lessons
        )

    return result


@router.post("/{plan_id}/lessons/{lesson_number}/generate/stream")
async def stream_lesson(
    plan_id: str,
    lesson_number: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    plan_repo   = StudyPlanRepository(db)
    lesson_repo = LessonRepository(db)

    plan   = await plan_repo.get_by_id(plan_id, load_lessons=True)
    lesson = await lesson_repo.get_by_plan_and_number(plan_id, lesson_number)

    if not plan or plan.user_id != current_user.id or not lesson:
        raise HTTPException(status_code=404, detail="Plano ou aula não encontrados.")

    previous_lessons = [l.title for l in plan.lessons if l.number < lesson_number]

    try:
        request = LessonRequest(
            subject=plan.subject,
            lesson_number=lesson_number,
            lesson_title=lesson.title,
            level=DifficultyLevel(plan.level),
            tone=ToneStyle(plan.tone),
            previous_lessons=previous_lessons,
        )
    except ValueError as e:
        logger.exception(
            "[LessonsDB] Dados inválidos para stream de aula | plan_id=%s lesson_number=%s level=%s tone=%s",
            plan_id,
            lesson_number,
            plan.level,
            plan.tone,
        )
        raise HTTPException(status_code=422, detail=f"Configuração inválida do plano: {str(e)}")

    return StreamingResponse(
        generate_lesson_stream(request),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )