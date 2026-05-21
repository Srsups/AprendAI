"""
Endpoint de uso e limites do plano do usuário.

GET /api/v1/usage   → retorna uso atual e limites do plano
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user
from app.core.plans_config import get_limits, is_within_limit
from app.db.database import get_db
from app.db.models import User
from app.db.repositories import UsageRepository
from app.models.db_schemas import UsageResponse

router = APIRouter(tags=["Uso e Limites"])


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

    within  = is_within_limit(current_user.subscription_plan, plans_this_month)
    limit   = limits["plans_per_month"]
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