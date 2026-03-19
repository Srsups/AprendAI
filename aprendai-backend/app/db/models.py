"""
Modelos ORM (tabelas do banco de dados).

Tabelas:
  users          — usuários do sistema
  study_plans    — planos de estudo gerados
  lessons        — conteúdo de cada aula dentro de um plano
  quiz_attempts  — tentativas de quiz por usuário/aula
  plan_ratings   — avaliação (0–5 estrelas) de um plano pelo usuário
"""
import uuid
from datetime import datetime, timezone

from sqlalchemy import (
    String, Text, Integer, Float, Boolean,
    DateTime, ForeignKey, UniqueConstraint,
    JSON,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _uuid() -> str:
    return str(uuid.uuid4())


# ─── User ─────────────────────────────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    id         : Mapped[str]      = mapped_column(String(36), primary_key=True, default=_uuid)
    email      : Mapped[str]      = mapped_column(String(255), unique=True, nullable=False, index=True)
    name       : Mapped[str]      = mapped_column(String(255), nullable=False)
    hashed_pw  : Mapped[str]      = mapped_column(String(255), nullable=False)
    is_teacher : Mapped[bool]     = mapped_column(Boolean, default=False)
    created_at : Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)

    # Relacionamentos
    plans   : Mapped[list["StudyPlan"]]   = relationship(back_populates="user", cascade="all, delete-orphan")
    ratings : Mapped[list["PlanRating"]]  = relationship(back_populates="user", cascade="all, delete-orphan")
    attempts: Mapped[list["QuizAttempt"]] = relationship(back_populates="user", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<User {self.email}>"


# ─── StudyPlan ────────────────────────────────────────────────────────────────

class StudyPlan(Base):
    __tablename__ = "study_plans"

    id            : Mapped[str]      = mapped_column(String(36), primary_key=True, default=_uuid)
    user_id       : Mapped[str]      = mapped_column(ForeignKey("users.id"), nullable=False, index=True)

    # Dados do plano
    subject       : Mapped[str]      = mapped_column(String(500), nullable=False)
    original_prompt: Mapped[str]     = mapped_column(Text, nullable=False)
    num_lessons   : Mapped[int]      = mapped_column(Integer, nullable=False)
    level         : Mapped[str]      = mapped_column(String(50), nullable=False)   # iniciante | intermediario | especialista
    tone          : Mapped[str]      = mapped_column(String(50), nullable=False)
    tags          : Mapped[list]     = mapped_column(JSON, default=list)            # ["História", "Séc. XX"]

    # Progresso
    current_lesson: Mapped[int]      = mapped_column(Integer, default=0)           # índice 0-based da aula atual
    completed     : Mapped[bool]     = mapped_column(Boolean, default=False)

    created_at    : Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
    updated_at    : Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now, onupdate=_now)

    # Relacionamentos
    user    : Mapped["User"]          = relationship(back_populates="plans")
    lessons : Mapped[list["Lesson"]]  = relationship(back_populates="plan", cascade="all, delete-orphan", order_by="Lesson.number")
    ratings : Mapped[list["PlanRating"]] = relationship(back_populates="plan", cascade="all, delete-orphan")

    @property
    def avg_rating(self) -> float | None:
        if not self.ratings:
            return None
        return round(sum(r.rating for r in self.ratings) / len(self.ratings), 1)

    def __repr__(self) -> str:
        return f"<StudyPlan '{self.subject}' ({self.num_lessons} aulas)>"


# ─── Lesson ───────────────────────────────────────────────────────────────────

class Lesson(Base):
    __tablename__ = "lessons"

    id          : Mapped[str]      = mapped_column(String(36), primary_key=True, default=_uuid)
    plan_id     : Mapped[str]      = mapped_column(ForeignKey("study_plans.id"), nullable=False, index=True)

    number      : Mapped[int]      = mapped_column(Integer, nullable=False)        # 1-based
    title       : Mapped[str]      = mapped_column(String(500), nullable=False)
    description : Mapped[str]      = mapped_column(Text, default="")               # summary do plano

    # Conteúdo gerado (None = ainda não gerado)
    content_json: Mapped[dict | None] = mapped_column(JSON, nullable=True)         # LessonResponse serializado
    generated   : Mapped[bool]     = mapped_column(Boolean, default=False)

    # Progresso do usuário
    viewed      : Mapped[bool]     = mapped_column(Boolean, default=False)
    quiz_passed : Mapped[bool]     = mapped_column(Boolean, default=False)

    created_at  : Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)

    # Relacionamentos
    plan     : Mapped["StudyPlan"]       = relationship(back_populates="lessons")
    attempts : Mapped[list["QuizAttempt"]] = relationship(back_populates="lesson", cascade="all, delete-orphan")

    __table_args__ = (
        UniqueConstraint("plan_id", "number", name="uq_plan_lesson_number"),
    )

    def __repr__(self) -> str:
        return f"<Lesson {self.number}: {self.title}>"


# ─── QuizAttempt ──────────────────────────────────────────────────────────────

class QuizAttempt(Base):
    """
    Registra cada vez que um usuário faz um quiz.
    Permite rastrear histórico e calcular melhora ao longo do tempo.
    """
    __tablename__ = "quiz_attempts"

    id         : Mapped[str]      = mapped_column(String(36), primary_key=True, default=_uuid)
    user_id    : Mapped[str]      = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    lesson_id  : Mapped[str]      = mapped_column(ForeignKey("lessons.id"), nullable=False, index=True)

    score      : Mapped[int]      = mapped_column(Integer, nullable=False)         # nº de acertos
    total      : Mapped[int]      = mapped_column(Integer, nullable=False)         # nº total de perguntas
    passed     : Mapped[bool]     = mapped_column(Boolean, nullable=False)         # score >= 60%
    answers    : Mapped[list]     = mapped_column(JSON, default=list)              # [{question, chosen, correct}]

    created_at : Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)

    # Relacionamentos
    user   : Mapped["User"]   = relationship(back_populates="attempts")
    lesson : Mapped["Lesson"] = relationship(back_populates="attempts")

    @property
    def percentage(self) -> float:
        if self.total == 0:
            return 0.0
        return round((self.score / self.total) * 100, 1)

    def __repr__(self) -> str:
        return f"<QuizAttempt {self.score}/{self.total} ({self.percentage}%)>"


# ─── PlanRating ───────────────────────────────────────────────────────────────

class PlanRating(Base):
    """
    Avaliação de 0–5 estrelas de um plano por um usuário.
    Cada usuário pode avaliar um plano apenas uma vez (upsert).
    """
    __tablename__ = "plan_ratings"

    id         : Mapped[str]      = mapped_column(String(36), primary_key=True, default=_uuid)
    user_id    : Mapped[str]      = mapped_column(ForeignKey("users.id"), nullable=False)
    plan_id    : Mapped[str]      = mapped_column(ForeignKey("study_plans.id"), nullable=False)

    rating     : Mapped[float]    = mapped_column(Float, nullable=False)           # 0.0 – 5.0
    created_at : Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)

    # Relacionamentos
    user : Mapped["User"]      = relationship(back_populates="ratings")
    plan : Mapped["StudyPlan"] = relationship(back_populates="ratings")

    __table_args__ = (
        UniqueConstraint("user_id", "plan_id", name="uq_user_plan_rating"),
    )

    def __repr__(self) -> str:
        return f"<PlanRating {self.rating}★ plan={self.plan_id[:8]}>"
