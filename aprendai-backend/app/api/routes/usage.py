"""
Endpoints de uso e limites do plano do usuário.

GET  /api/v1/usage         → retorna uso atual e limites
POST /api/v1/usage/upgrade → simula upgrade de plano
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Literal

from app.core.dependencies import get_current_user
from app.core.plans_config import get_limits, is_within_limit, PLAN_LIMITS
from app.db.database import get_db
from app.db.models import User
from app.db.repositories import UsageRepository
from app.models.db_schemas import UsageResponse

router = APIRouter(tags=["Uso e Limites"])


class UpgradeRequest(BaseModel):
    plan: Literal["free", "pro", "teacher", "institutional"]


@router.get(
    "/usage",
    response_model=UsageResponse,
    summary="Retorna o uso atual e limites do plano do usuário",
)
async def get_usage(
    db          : AsyncSession = Depends(get_db),
    current_user: User         = Depends(get_current_user),
):
    repo   = UsageRepository(db)
    limits = get_limits(current_user.subscription_plan)

    plans_this_month = await repo.count_plans_this_month(current_user.id)
    within    = is_within_limit(current_user.subscription_plan, plans_this_month)
    limit     = limits["plans_per_month"]
    remaining = (limit - plans_this_month) if limit is not None else None

    return UsageResponse(
        subscription_plan = current_user.subscription_plan,
        plan_label        = limits["label"],
        plan_description  = limits["description"],
        plans_this_month  = plans_this_month,
        plans_limit       = limit,
        is_within_limit   = within,
        remaining         = remaining,
        max_lessons       = limits["max_lessons"],
        has_flashcards    = limits["flashcards"],
        has_export_pptx   = limits["export_pptx"],
        has_methodology   = limits["methodology"],
    )


@router.post(
    "/usage/upgrade",
    response_model=UsageResponse,
    summary="Atualiza o plano de assinatura do usuário",
    description="""
Simula o processo de upgrade de plano (sem processamento de pagamento real).
Em produção, este endpoint seria chamado pelo webhook da plataforma de pagamento.
    """,
)
async def upgrade_plan(
    body        : UpgradeRequest,
    db          : AsyncSession = Depends(get_db),
    current_user: User         = Depends(get_current_user),
):
    # Não permite "downgrade" para free via este endpoint
    # (seria feito pelo sistema de cancelamento)
    if body.plan == "free" and current_user.subscription_plan != "free":
        raise HTTPException(
            status_code=400,
            detail="Para cancelar a assinatura, entre em contato com o suporte.",
        )

    current_user.subscription_plan = body.plan
    await db.flush()

    repo   = UsageRepository(db)
    limits = get_limits(body.plan)
    plans_this_month = await repo.count_plans_this_month(current_user.id)
    limit     = limits["plans_per_month"]
    remaining = (limit - plans_this_month) if limit is not None else None

    return UsageResponse(
        subscription_plan = current_user.subscription_plan,
        plan_label        = limits["label"],
        plan_description  = limits["description"],
        plans_this_month  = plans_this_month,
        plans_limit       = limit,
        is_within_limit   = is_within_limit(body.plan, plans_this_month),
        remaining         = remaining,
        max_lessons       = limits["max_lessons"],
        has_flashcards    = limits["flashcards"],
        has_export_pptx   = limits["export_pptx"],
        has_methodology   = limits["methodology"],
    )