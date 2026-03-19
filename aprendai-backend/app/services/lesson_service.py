"""
Serviço de geração de conteúdo de aulas.
Suporta geração normal e streaming (SSE).
"""
import json
import logging

from app.models.schemas import (
    LessonRequest, LessonResponse, LessonSection
)
from app.prompts.agents import get_lesson_system_prompt, get_lesson_user_prompt
from app.services.llm_client import call_model, call_model_stream

logger = logging.getLogger(__name__)


async def generate_lesson(request: LessonRequest) -> LessonResponse:
    """
    Gera o conteúdo completo de uma aula (resposta normal, não streaming).
    """
    system_prompt = get_lesson_system_prompt()
    user_prompt   = get_lesson_user_prompt(
        subject=request.subject,
        lesson_number=request.lesson_number,
        lesson_title=request.lesson_title,
        level=request.level.value,
        tone=request.tone.value,
        previous_lessons=request.previous_lessons,
    )

    logger.info(f"[LessonService] Gerando aula {request.lesson_number}: {request.lesson_title}")

    raw = await call_model(
        system_prompt=system_prompt,
        user_prompt=user_prompt,
        max_tokens=4096,
        temperature=0.4,
    )

    return _parse_lesson_response(raw, request.lesson_number)


async def generate_lesson_stream(request: LessonRequest):
    """
    Versão streaming: retorna um async generator de Server-Sent Events (SSE).
    O frontend recebe chunks de texto em tempo real.

    Nota: No modo streaming, o conteúdo é texto corrido, não JSON estruturado.
    Usado para dar feedback visual imediato ao usuário.
    """
    system_prompt = get_lesson_system_prompt()
    user_prompt   = get_lesson_user_prompt(
        subject=request.subject,
        lesson_number=request.lesson_number,
        lesson_title=request.lesson_title,
        level=request.level.value,
        tone=request.tone.value,
        previous_lessons=request.previous_lessons,
    )

    logger.info(f"[LessonService STREAM] Aula {request.lesson_number}: {request.lesson_title}")

    accumulated = ""

    async for chunk in call_model_stream(
        system_prompt=system_prompt,
        user_prompt=user_prompt,
        max_tokens=4096,
        temperature=0.4,
    ):
        accumulated += chunk
        # Formata como SSE
        yield f"data: {json.dumps({'chunk': chunk})}\n\n"

    # Ao final, emite o evento de conclusão
    yield f"data: {json.dumps({'done': True})}\n\n"


def _parse_lesson_response(raw: dict, lesson_number: int) -> LessonResponse:
    """Valida e converte o dict do LLM em LessonResponse."""

    sections = [
        LessonSection(
            heading=s.get("heading", ""),
            body=s.get("body", ""),
        )
        for s in raw.get("sections", [])
    ]

    return LessonResponse(
        lesson_number=raw.get("lesson_number", lesson_number),
        title=raw.get("title", ""),
        estimated_reading_minutes=raw.get("estimated_reading_minutes", 10),
        sections=sections,
        key_concepts=raw.get("key_concepts", []),
        reflection_question=raw.get("reflection_question", ""),
    )
