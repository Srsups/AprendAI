from fastapi import APIRouter, HTTPException
from app.models.schemas import PlanRequest, PlanResponse
from app.services.plan_service import generate_plan

router = APIRouter(prefix="/plan", tags=["Plano de Estudos"])


@router.post(
    "/generate",
    response_model=PlanResponse,
    summary="Gera um plano de estudos estruturado",
    description="""
Recebe o pedido livre do usuário e retorna um plano com N aulas,
cada uma com título e descrição. Este é o ponto de entrada principal
do motor de aprendizado.
    """,
)
async def create_plan(request: PlanRequest) -> PlanResponse:
    try:
        return await generate_plan(request)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao gerar plano: {str(e)}")
