from pydantic import BaseModel, Field
from typing import Literal
from enum import Enum


# ─── Enums ────────────────────────────────────────────────────────────────────

class DifficultyLevel(str, Enum):
    beginner     = "iniciante"
    intermediate = "intermediario"
    expert       = "especialista"


class ToneStyle(str, Enum):
    simple    = "didatico_simples"
    academic  = "academico"
    child     = "para_crianca"
    technical = "tecnico_direto"


# ─── Plan Generation ──────────────────────────────────────────────────────────

class PlanRequest(BaseModel):
    prompt: str = Field(
        ...,
        min_length=10,
        max_length=1000,
        description="Pedido livre do usuário descrevendo o que quer aprender.",
        examples=["Quero 8 aulas sobre a Segunda Guerra Mundial, foco em tratados e relações políticas"]
    )
    num_lessons: int = Field(
        default=8,
        ge=2,
        le=16,
        description="Número de aulas a gerar."
    )
    level: DifficultyLevel = Field(
        default=DifficultyLevel.intermediate,
        description="Nível de profundidade do conteúdo."
    )
    tone: ToneStyle = Field(
        default=ToneStyle.academic,
        description="Estilo de comunicação da IA."
    )


class LessonSummary(BaseModel):
    number: int
    title: str
    description: str  # 1–2 frases de overview


class PlanResponse(BaseModel):
    subject: str           # Tema principal detectado pela IA
    tags: list[str]        # Ex: ["História", "Política", "Séc. XX"]
    lessons: list[LessonSummary]
    total_lessons: int


# ─── Lesson Content ───────────────────────────────────────────────────────────

class LessonRequest(BaseModel):
    subject: str = Field(..., description="Tema geral do plano de estudos.")
    lesson_number: int = Field(..., ge=1, le=16)
    lesson_title: str
    level: DifficultyLevel = DifficultyLevel.intermediate
    tone: ToneStyle = ToneStyle.academic
    previous_lessons: list[str] = Field(
        default=[],
        description="Títulos das aulas anteriores para manter coerência pedagógica."
    )


class LessonSection(BaseModel):
    heading: str
    body: str


class LessonResponse(BaseModel):
    lesson_number: int
    title: str
    estimated_reading_minutes: int
    sections: list[LessonSection]
    key_concepts: list[str]     # Bullets de conceitos-chave ao final
    reflection_question: str    # Pergunta para reflexão


# ─── Quiz Generation ──────────────────────────────────────────────────────────

class QuizRequest(BaseModel):
    lesson_content: str = Field(
        ...,
        min_length=100,
        description="Conteúdo completo da aula (ou do plano) usado como base para as perguntas."
    )
    num_questions: int = Field(default=5, ge=3, le=10)
    level: DifficultyLevel = DifficultyLevel.intermediate


class QuizOption(BaseModel):
    letter: Literal["A", "B", "C", "D"]
    text: str


class QuizQuestion(BaseModel):
    number: int
    question: str
    options: list[QuizOption]
    correct_letter: Literal["A", "B", "C", "D"]
    explanation: str   # Explicação breve da resposta correta


class QuizResponse(BaseModel):
    total_questions: int
    questions: list[QuizQuestion]


# ─── Flashcards ───────────────────────────────────────────────────────────────

class FlashcardsRequest(BaseModel):
    lesson_content: str = Field(..., min_length=100)
    num_cards: int = Field(default=10, ge=5, le=20)


class Flashcard(BaseModel):
    front: str   # Pergunta ou conceito
    back: str    # Resposta ou definição


class FlashcardsResponse(BaseModel):
    total_cards: int
    cards: list[Flashcard]
