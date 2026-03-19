"""
Serviço de geração de planos de estudo.
Orquestra a chamada ao LLM e valida/transforma a resposta.
"""
import logging

from app.models.schemas import PlanRequest, PlanResponse, LessonSummary
from app.prompts.agents import get_plan_system_prompt, get_plan_user_prompt
from app.services.llm_client import call_model

logger = logging.getLogger(__name__)


async def generate_plan(request: PlanRequest) -> PlanResponse:
    """
    Gera um plano de estudos estruturado a partir do pedido do usuário.

    Fluxo:
    1. Monta os prompts com os parâmetros do usuário.
    2. Chama o LLM via call_model.
    3. Valida e transforma o JSON retornado em PlanResponse.
    """
    system_prompt = get_plan_system_prompt()
    user_prompt   = get_plan_user_prompt(
        prompt=request.prompt,
        num_lessons=request.num_lessons,
        level=request.level.value,
        tone=request.tone.value,
    )

    logger.info(f"[PlanService] Gerando plano | aulas={request.num_lessons} | nível={request.level}")

    raw = await call_model(
        system_prompt=system_prompt,
        user_prompt=user_prompt,
        max_tokens=2048,
        temperature=0.5,  # Um pouco mais criativo para os títulos
    )

    return _parse_plan_response(raw, request.num_lessons)


def _parse_plan_response(raw: dict, expected_lessons: int) -> PlanResponse:
    """Valida e converte o dict do LLM em PlanResponse."""

    lessons_raw = raw.get("lessons", [])

    # Garante que temos o número correto de aulas
    if len(lessons_raw) != expected_lessons:
        logger.warning(
            f"[PlanService] LLM retornou {len(lessons_raw)} aulas, esperado {expected_lessons}"
        )

    lessons = [
        LessonSummary(
            number=lesson.get("number", i + 1),
            title=lesson.get("title", f"Aula {i + 1}"),
            description=lesson.get("description", ""),
        )
        for i, lesson in enumerate(lessons_raw)
    ]

    return PlanResponse(
        subject=raw.get("subject", "Tema não identificado"),
        tags=raw.get("tags", []),
        lessons=lessons,
        total_lessons=len(lessons),
    )
