"""
Repositórios — camada de acesso a dados.

Cada repositório encapsula as queries de uma entidade.
Os serviços chamam os repositórios; as rotas chamam os serviços.
Isso mantém a lógica de negócio separada do SQL.
"""
from datetime import datetime, timezone
from sqlalchemy import select, update, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db.models import User, StudyPlan, Lesson, QuizAttempt, PlanRating, LessonComment


# ─── UserRepository ───────────────────────────────────────────────────────────

class UserRepository:

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, email: str, name: str, hashed_pw: str, is_teacher: bool = False) -> User:
        user = User(email=email, name=name, hashed_pw=hashed_pw, is_teacher=is_teacher)
        self.db.add(user)
        await self.db.flush()   # Gera o ID sem commitar ainda
        return user

    async def get_by_id(self, user_id: str) -> User | None:
        result = await self.db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()

    async def get_by_email(self, email: str) -> User | None:
        result = await self.db.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()

    async def exists(self, email: str) -> bool:
        result = await self.db.execute(
            select(func.count()).where(User.email == email)
        )
        return result.scalar_one() > 0


# ─── StudyPlanRepository ──────────────────────────────────────────────────────

class StudyPlanRepository:

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(
        self,
        user_id: str,
        subject: str,
        original_prompt: str,
        num_lessons: int,
        level: str,
        tone: str,
        tags: list[str],
    ) -> StudyPlan:
        plan = StudyPlan(
            user_id=user_id,
            subject=subject,
            original_prompt=original_prompt,
            num_lessons=num_lessons,
            level=level,
            tone=tone,
            tags=tags,
        )
        self.db.add(plan)
        await self.db.flush()
        return plan

    async def get_by_id(self, plan_id: str, load_lessons: bool = False) -> StudyPlan | None:
        q = select(StudyPlan).where(StudyPlan.id == plan_id)
        q = q.options(selectinload(StudyPlan.ratings))
        if load_lessons:
            q = q.options(selectinload(StudyPlan.lessons))
        result = await self.db.execute(q)
        return result.scalar_one_or_none()

    async def list_by_user(self, user_id: str) -> list[StudyPlan]:
        result = await self.db.execute(
            select(StudyPlan)
            .options(selectinload(StudyPlan.ratings))
            .where(StudyPlan.user_id == user_id)
            .order_by(StudyPlan.created_at.desc())
        )
        return list(result.scalars().all())

    async def update_progress(self, plan_id: str, current_lesson: int, completed: bool = False):
        await self.db.execute(
            update(StudyPlan)
            .where(StudyPlan.id == plan_id)
            .values(
                current_lesson=current_lesson,
                completed=completed,
                updated_at=datetime.now(timezone.utc),
            )
        )

    async def get_trending(self, limit: int = 8) -> list[dict]:
        """
        Retorna os temas mais gerados com média de avaliação.
        Agrupa por subject e conta planos + média de rating.
        """
        result = await self.db.execute(
            select(
                StudyPlan.subject,
                func.count(StudyPlan.id).label("total"),
                func.avg(PlanRating.rating).label("avg_rating"),
            )
            .outerjoin(PlanRating, PlanRating.plan_id == StudyPlan.id)
            .group_by(StudyPlan.subject)
            .order_by(func.count(StudyPlan.id).desc())
            .limit(limit)
        )
        return [
            {
                "subject": row.subject,
                "total_generations": row.total,
                "avg_rating": round(row.avg_rating, 1) if row.avg_rating else None,
            }
            for row in result
        ]

    async def delete(self, plan_id: str):
        plan = await self.get_by_id(plan_id)
        if plan:
            await self.db.delete(plan)


# ─── LessonRepository ─────────────────────────────────────────────────────────

class LessonRepository:

    def __init__(self, db: AsyncSession):
        self.db = db

    async def bulk_create(self, plan_id: str, lessons_data: list[dict]) -> list[Lesson]:
        """Cria todas as aulas de um plano de uma vez."""
        lessons = [
            Lesson(
                plan_id=plan_id,
                number=data["number"],
                title=data["title"],
                description=data.get("description", ""),
            )
            for data in lessons_data
        ]
        self.db.add_all(lessons)
        await self.db.flush()
        return lessons

    async def get_by_id(self, lesson_id: str) -> Lesson | None:
        result = await self.db.execute(
            select(Lesson).where(Lesson.id == lesson_id)
        )
        return result.scalar_one_or_none()

    async def get_by_plan_and_number(self, plan_id: str, number: int) -> Lesson | None:
        result = await self.db.execute(
            select(Lesson)
            .where(Lesson.plan_id == plan_id, Lesson.number == number)
        )
        return result.scalar_one_or_none()

    async def save_content(self, lesson_id: str, content_json: dict):
        """Salva o conteúdo gerado pela IA em uma aula."""
        await self.db.execute(
            update(Lesson)
            .where(Lesson.id == lesson_id)
            .values(content_json=content_json, generated=True)
        )

    async def mark_viewed(self, lesson_id: str):
        await self.db.execute(
            update(Lesson).where(Lesson.id == lesson_id).values(viewed=True)
        )

    async def mark_quiz_passed(self, lesson_id: str):
        await self.db.execute(
            update(Lesson).where(Lesson.id == lesson_id).values(quiz_passed=True)
        )


# ─── QuizAttemptRepository ────────────────────────────────────────────────────

class QuizAttemptRepository:

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(
        self,
        user_id: str,
        lesson_id: str,
        score: int,
        total: int,
        answers: list[dict],
    ) -> QuizAttempt:
        passed = (score / total) >= 0.6 if total > 0 else False
        attempt = QuizAttempt(
            user_id=user_id,
            lesson_id=lesson_id,
            score=score,
            total=total,
            passed=passed,
            answers=answers,
        )
        self.db.add(attempt)
        await self.db.flush()
        return attempt

    async def list_by_lesson(self, user_id: str, lesson_id: str) -> list[QuizAttempt]:
        result = await self.db.execute(
            select(QuizAttempt)
            .where(QuizAttempt.user_id == user_id, QuizAttempt.lesson_id == lesson_id)
            .order_by(QuizAttempt.created_at.desc())
        )
        return list(result.scalars().all())

    async def best_score(self, user_id: str, lesson_id: str) -> QuizAttempt | None:
        result = await self.db.execute(
            select(QuizAttempt)
            .where(QuizAttempt.user_id == user_id, QuizAttempt.lesson_id == lesson_id)
            .order_by(QuizAttempt.score.desc())
            .limit(1)
        )
        return result.scalar_one_or_none()


# ─── PlanRatingRepository ─────────────────────────────────────────────────────

class PlanRatingRepository:

    def __init__(self, db: AsyncSession):
        self.db = db

    async def upsert(self, user_id: str, plan_id: str, rating: float) -> PlanRating:
        """Cria ou atualiza a avaliação do usuário para um plano."""
        result = await self.db.execute(
            select(PlanRating)
            .where(PlanRating.user_id == user_id, PlanRating.plan_id == plan_id)
        )
        existing = result.scalar_one_or_none()

        if existing:
            existing.rating = rating
            return existing

        new_rating = PlanRating(user_id=user_id, plan_id=plan_id, rating=rating)
        self.db.add(new_rating)
        await self.db.flush()
        return new_rating

    async def get_plan_stats(self, plan_id: str) -> dict:
        result = await self.db.execute(
            select(
                func.count(PlanRating.id).label("total_ratings"),
                func.avg(PlanRating.rating).label("avg_rating"),
            ).where(PlanRating.plan_id == plan_id)
        )
        row = result.one()
        return {
            "total_ratings": row.total_ratings or 0,
            "avg_rating": round(row.avg_rating, 1) if row.avg_rating else None,
        }

# ─── CommentRepository ────────────────────────────────────────────────────────

class CommentRepository:

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, lesson_id: str, user_id: str, content: str) -> "LessonComment":
        from app.db.models import LessonComment
        comment = LessonComment(lesson_id=lesson_id, user_id=user_id, content=content)
        self.db.add(comment)
        await self.db.flush()
        return comment

    async def list_by_lesson(self, lesson_id: str) -> list:
        from app.db.models import LessonComment
        result = await self.db.execute(
            select(LessonComment)
            .where(LessonComment.lesson_id == lesson_id)
            .order_by(LessonComment.created_at.asc())
        )
        return list(result.scalars().all())

    async def get_by_id(self, comment_id: str):
        from app.db.models import LessonComment
        result = await self.db.execute(
            select(LessonComment).where(LessonComment.id == comment_id)
        )
        return result.scalar_one_or_none()

    async def delete(self, comment_id: str):
        comment = await self.get_by_id(comment_id)
        if comment:
            await self.db.delete(comment)