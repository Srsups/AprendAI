"""
Schemas Pydantic para os endpoints que envolvem persistência.
Separados dos schemas de IA (schemas.py) para manter responsabilidades claras.
"""
from pydantic import BaseModel, Field, field_validator
from datetime import datetime


# ─── Plan ─────────────────────────────────────────────────────────────────────

class LessonSummaryDB(BaseModel):
    id         : str
    number     : int
    title      : str
    description: str
    generated  : bool
    viewed     : bool
    quiz_passed: bool


class StudyPlanCreate(BaseModel):
    """Body do POST /plans — recebido após a IA gerar o plano."""
    subject        : str
    original_prompt: str
    num_lessons    : int
    level          : str
    tone           : str
    tags           : list[str]
    lessons        : list[dict]   # [{number, title, description}]


class StudyPlanResponse(BaseModel):
    id             : str
    subject        : str
    original_prompt: str
    num_lessons    : int
    level          : str
    tone           : str
    tags           : list[str]
    current_lesson : int
    completed      : bool
    avg_rating     : float | None
    lessons        : list[LessonSummaryDB]
    created_at     : datetime

    model_config = {"from_attributes": True}


class StudyPlanListItem(BaseModel):
    id            : str
    subject       : str
    num_lessons   : int
    level         : str
    current_lesson: int
    completed     : bool
    avg_rating    : float | None
    created_at    : datetime

    model_config = {"from_attributes": True}


class ProgressUpdate(BaseModel):
    current_lesson: int = Field(..., ge=0)
    completed     : bool = False


# ─── Quiz Attempt ─────────────────────────────────────────────────────────────

class AnswerRecord(BaseModel):
    question     : str
    chosen_letter: str
    correct_letter: str
    is_correct   : bool


class QuizAttemptCreate(BaseModel):
    score  : int = Field(..., ge=0)
    total  : int = Field(..., ge=1)
    answers: list[AnswerRecord]


class QuizAttemptResponse(BaseModel):
    id        : str
    score     : int
    total     : int
    percentage: float
    passed    : bool
    created_at: datetime

    model_config = {"from_attributes": True}


# ─── Rating ───────────────────────────────────────────────────────────────────

class RatingCreate(BaseModel):
    rating: float = Field(..., ge=0.0, le=5.0)

    @field_validator("rating")
    @classmethod
    def round_half(cls, v: float) -> float:
        # Aceita apenas múltiplos de 0.5 (★, ★½, ★★, ...)
        return round(v * 2) / 2


class RatingStatsResponse(BaseModel):
    plan_id      : str
    avg_rating   : float | None
    total_ratings: int


# ─── Trending ─────────────────────────────────────────────────────────────────

class TrendingItem(BaseModel):
    subject           : str
    total_generations : int
    avg_rating        : float | None
