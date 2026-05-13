"""
Endpoint de exportação de aulas.

POST /api/v1/plans/{plan_id}/lessons/{lesson_number}/export

Body JSON:
{
  "format": "pdf" | "markdown" | "pptx" | "csv",
  "include_quiz": true,
  "include_flashcards": true,
  "include_methodology": false,   // apenas professores
  "quiz_num_questions": 5,
  "flashcards_num_cards": 10
}
"""
import logging
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import Literal

from app.core.dependencies import get_current_user
from app.db.database import get_db
from app.db.models import User
from app.db.repositories import LessonRepository, StudyPlanRepository
from app.models.schemas import (
    LessonResponse, LessonRequest, DifficultyLevel, ToneStyle,
    QuizRequest, FlashcardsRequest,
)
from app.services.lesson_service import generate_lesson
from app.services.assessment_service import generate_quiz, generate_flashcards
from app.services.export_service import (
    ExportOptions, export_pdf, export_markdown, export_pptx, export_csv,
    generate_methodology,
)

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Exportação"])

MIME_TYPES = {
    "pdf":      ("application/pdf",                                  ".pdf"),
    "markdown": ("text/markdown; charset=utf-8",                     ".md"),
    "pptx":     ("application/vnd.openxmlformats-officedocument.presentationml.presentation", ".pptx"),
    "csv":      ("text/csv; charset=utf-8",                          ".csv"),
}


class ExportRequest(BaseModel):
    format: Literal["pdf", "markdown", "pptx", "csv"] = "pdf"
    include_quiz: bool = False
    include_flashcards: bool = False
    include_methodology: bool = False
    quiz_num_questions: int = 5
    flashcards_num_cards: int = 10


@router.post(
    "/plans/{plan_id}/lessons/{lesson_number}/export",
    summary="Exporta uma aula em PDF, Markdown, PPTX ou CSV",
    description="""
Gera e baixa o arquivo da aula no formato escolhido.
Módulos opcionais: quiz, flashcards e metodologias (professor).
O conteúdo é buscado do cache do banco — se ainda não gerado, gera na hora.
    """,
)
async def export_lesson(
    plan_id: str,
    lesson_number: int,
    body: ExportRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    plan_repo   = StudyPlanRepository(db)
    lesson_repo = LessonRepository(db)

    plan   = await plan_repo.get_by_id(plan_id, load_lessons=True)
    lesson = await lesson_repo.get_by_plan_and_number(plan_id, lesson_number)

    if not plan or plan.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Plano não encontrado.")
    if not lesson:
        raise HTTPException(status_code=404, detail="Aula não encontrada.")

    # ── Valida permissão de metodologia ───────────────────────────────────────
    if body.include_methodology and not current_user.is_teacher:
        raise HTTPException(
            status_code=403,
            detail="Metodologias de ensino são exclusivas para professores.",
        )

    # ── Busca ou gera o conteúdo da aula ──────────────────────────────────────
    if lesson.generated and lesson.content_json:
        lesson_content = LessonResponse(**lesson.content_json)
    else:
        previous = [l.title for l in plan.lessons if l.number < lesson_number]
        request  = LessonRequest(
            subject=plan.subject,
            lesson_number=lesson_number,
            lesson_title=lesson.title,
            level=DifficultyLevel(plan.level),
            tone=ToneStyle(plan.tone),
            previous_lessons=previous,
        )
        lesson_content = await generate_lesson(request)
        await lesson_repo.save_content(lesson.id, lesson_content.model_dump())

    # ── Monta o texto completo para quiz/flashcards ────────────────────────────
    full_text = "\n\n".join(
        f"{s.heading}\n{s.body}" for s in lesson_content.sections
    )

    # ── Gera módulos opcionais em paralelo ────────────────────────────────────
    quiz_data         = None
    flashcards_data   = None
    methodology_data  = None

    if body.include_quiz:
        quiz_data = await generate_quiz(QuizRequest(
            lesson_content=full_text,
            num_questions=body.quiz_num_questions,
            level=DifficultyLevel(plan.level),
        ))

    if body.include_flashcards:
        flashcards_data = await generate_flashcards(FlashcardsRequest(
            lesson_content=full_text,
            num_cards=body.flashcards_num_cards,
        ))

    if body.include_methodology and current_user.is_teacher:
        methodology_data = await generate_methodology(
            subject=plan.subject,
            lesson_title=lesson.title,
            level=plan.level,
            tone=plan.tone,
        )

    # ── Monta as opções e exporta ──────────────────────────────────────────────
    opts = ExportOptions(
        format=body.format,
        include_quiz=body.include_quiz,
        include_flashcards=body.include_flashcards,
        include_methodology=body.include_methodology,
        quiz=quiz_data,
        flashcards=flashcards_data,
        methodology=methodology_data,
    )

    exporters = {
        "pdf":      export_pdf,
        "markdown": export_markdown,
        "pptx":     export_pptx,
        "csv":      export_csv,
    }

    try:
        file_bytes = exporters[body.format](lesson_content, opts)
    except Exception as e:
        logger.error(f"[Export] Erro ao gerar {body.format}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Erro ao gerar exportação: {str(e)}")

    mime, ext = MIME_TYPES[body.format]
    filename  = f"aprendai-aula-{lesson_number}{ext}"

    return Response(
        content=file_bytes,
        media_type=mime,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )