from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user
from app.db.database import get_db
from app.db.models import User
from app.db.repositories import (
    QuizAttemptRepository, LessonRepository,
    PlanRatingRepository, StudyPlanRepository,
)
from app.models.db_schemas import (
    QuizAttemptCreate, QuizAttemptResponse,
    RatingCreate, RatingStatsResponse,
)

router = APIRouter(tags=["Avaliação (Persistência)"])


@router.post(
    "/plans/{plan_id}/lessons/{lesson_number}/attempts",
    response_model=QuizAttemptResponse,
    status_code=201,
)
async def save_quiz_attempt(
    plan_id: str,
    lesson_number: int,
    body: QuizAttemptCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    lesson_repo  = LessonRepository(db)
    attempt_repo = QuizAttemptRepository(db)

    lesson = await lesson_repo.get_by_plan_and_number(plan_id, lesson_number)
    if not lesson:
        raise HTTPException(status_code=404, detail="Aula não encontrada.")

    attempt = await attempt_repo.create(
        user_id=current_user.id,
        lesson_id=lesson.id,
        score=body.score,
        total=body.total,
        answers=[a.model_dump() for a in body.answers],
    )

    if attempt.passed:
        await lesson_repo.mark_quiz_passed(lesson.id)

    return QuizAttemptResponse(
        id=attempt.id, score=attempt.score, total=attempt.total,
        percentage=attempt.percentage, passed=attempt.passed,
        created_at=attempt.created_at,
    )


@router.get(
    "/plans/{plan_id}/lessons/{lesson_number}/attempts",
    response_model=list[QuizAttemptResponse],
)
async def list_attempts(
    plan_id: str,
    lesson_number: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    lesson_repo  = LessonRepository(db)
    attempt_repo = QuizAttemptRepository(db)

    lesson = await lesson_repo.get_by_plan_and_number(plan_id, lesson_number)
    if not lesson:
        raise HTTPException(status_code=404, detail="Aula não encontrada.")

    attempts = await attempt_repo.list_by_lesson(current_user.id, lesson.id)
    return [
        QuizAttemptResponse(
            id=a.id, score=a.score, total=a.total,
            percentage=a.percentage, passed=a.passed,
            created_at=a.created_at,
        )
        for a in attempts
    ]


@router.post("/plans/{plan_id}/rating", response_model=RatingStatsResponse)
async def rate_plan(
    plan_id: str,
    body: RatingCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    plan = await StudyPlanRepository(db).get_by_id(plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail="Plano não encontrado.")

    await PlanRatingRepository(db).upsert(current_user.id, plan_id, body.rating)
    stats = await PlanRatingRepository(db).get_plan_stats(plan_id)
    return RatingStatsResponse(plan_id=plan_id, **stats)


@router.get("/plans/{plan_id}/rating", response_model=RatingStatsResponse)
async def get_rating_stats(plan_id: str, db: AsyncSession = Depends(get_db)):
    plan = await StudyPlanRepository(db).get_by_id(plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail="Plano não encontrado.")

    stats = await PlanRatingRepository(db).get_plan_stats(plan_id)
    return RatingStatsResponse(plan_id=plan_id, **stats)