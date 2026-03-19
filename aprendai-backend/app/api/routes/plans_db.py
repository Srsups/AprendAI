from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user
from app.db.database import get_db
from app.db.models import User
from app.db.repositories import StudyPlanRepository, LessonRepository
from app.models.db_schemas import (
    StudyPlanCreate, StudyPlanResponse, StudyPlanListItem,
    ProgressUpdate, LessonSummaryDB,
)

router = APIRouter(prefix="/plans", tags=["Planos (Persistência)"])


@router.post("", response_model=StudyPlanResponse, status_code=201)
async def save_plan(
    body: StudyPlanCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    plan_repo   = StudyPlanRepository(db)
    lesson_repo = LessonRepository(db)

    plan = await plan_repo.create(
        user_id=current_user.id,
        subject=body.subject,
        original_prompt=body.original_prompt,
        num_lessons=body.num_lessons,
        level=body.level,
        tone=body.tone,
        tags=body.tags,
    )
    await lesson_repo.bulk_create(plan.id, body.lessons)
    plan = await plan_repo.get_by_id(plan.id, load_lessons=True)
    return _to_response(plan)


@router.get("", response_model=list[StudyPlanListItem])
async def list_plans(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    plans = await StudyPlanRepository(db).list_by_user(current_user.id)
    return [
        StudyPlanListItem(
            id=p.id, subject=p.subject, num_lessons=p.num_lessons,
            level=p.level, current_lesson=p.current_lesson,
            completed=p.completed, avg_rating=p.avg_rating,
            created_at=p.created_at,
        )
        for p in plans
    ]


@router.get("/trending/list", response_model=list[dict])
async def get_trending(db: AsyncSession = Depends(get_db)):
    # Trending é público — não exige autenticação
    return await StudyPlanRepository(db).get_trending(limit=8)


@router.get("/{plan_id}", response_model=StudyPlanResponse)
async def get_plan(
    plan_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    plan = await StudyPlanRepository(db).get_by_id(plan_id, load_lessons=True)
    if not plan or plan.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Plano não encontrado.")
    return _to_response(plan)


@router.patch("/{plan_id}/progress", response_model=StudyPlanResponse)
async def update_progress(
    plan_id: str,
    body: ProgressUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    repo = StudyPlanRepository(db)
    plan = await repo.get_by_id(plan_id, load_lessons=True)
    if not plan or plan.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Plano não encontrado.")
    await repo.update_progress(plan_id, body.current_lesson, body.completed)
    plan = await repo.get_by_id(plan_id, load_lessons=True)
    return _to_response(plan)


@router.delete("/{plan_id}", status_code=204)
async def delete_plan(
    plan_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    repo = StudyPlanRepository(db)
    plan = await repo.get_by_id(plan_id)
    if not plan or plan.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Plano não encontrado.")
    await repo.delete(plan_id)


def _to_response(plan) -> StudyPlanResponse:
    return StudyPlanResponse(
        id=plan.id, subject=plan.subject, original_prompt=plan.original_prompt,
        num_lessons=plan.num_lessons, level=plan.level, tone=plan.tone,
        tags=plan.tags or [], current_lesson=plan.current_lesson,
        completed=plan.completed, avg_rating=plan.avg_rating,
        created_at=plan.created_at,
        lessons=[
            LessonSummaryDB(
                id=l.id, number=l.number, title=l.title,
                description=l.description, generated=l.generated,
                viewed=l.viewed, quiz_passed=l.quiz_passed,
            )
            for l in plan.lessons
        ],
    )