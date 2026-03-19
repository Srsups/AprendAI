"""
Serviço de avaliação: geração de Quiz e Flashcards.

IMPORTANTE: Ambos os agentes usam EXCLUSIVAMENTE o conteúdo fornecido
como base — isso evita alucinações da IA ao criar questões.
"""
import logging

from app.models.schemas import (
    QuizRequest, QuizResponse, QuizQuestion, QuizOption,
    FlashcardsRequest, FlashcardsResponse, Flashcard,
)
from app.prompts.agents import (
    get_quiz_system_prompt, get_quiz_user_prompt,
    get_flashcards_system_prompt, get_flashcards_user_prompt,
)
from app.services.llm_client import call_model

logger = logging.getLogger(__name__)

VALID_LETTERS = {"A", "B", "C", "D"}


# ─── Quiz ─────────────────────────────────────────────────────────────────────

async def generate_quiz(request: QuizRequest) -> QuizResponse:
    """
    Gera um quiz baseado exclusivamente no conteúdo da aula fornecido.
    """
    system_prompt = get_quiz_system_prompt()
    user_prompt   = get_quiz_user_prompt(
        lesson_content=request.lesson_content,
        num_questions=request.num_questions,
        level=request.level.value,
    )

    logger.info(f"[QuizService] Gerando {request.num_questions} perguntas")

    raw = await call_model(
        system_prompt=system_prompt,
        user_prompt=user_prompt,
        max_tokens=3000,
        temperature=0.3,  # Baixo: precisamos de respostas determinísticas
    )

    return _parse_quiz_response(raw)


def _parse_quiz_response(raw: dict) -> QuizResponse:
    questions_raw = raw.get("questions", [])
    questions = []

    for i, q in enumerate(questions_raw):
        options = [
            QuizOption(
                letter=opt["letter"],
                text=opt["text"],
            )
            for opt in q.get("options", [])
            if opt.get("letter") in VALID_LETTERS
        ]

        correct = q.get("correct_letter", "A")
        if correct not in VALID_LETTERS:
            correct = "A"  # Fallback seguro

        questions.append(QuizQuestion(
            number=q.get("number", i + 1),
            question=q.get("question", ""),
            options=options,
            correct_letter=correct,
            explanation=q.get("explanation", ""),
        ))

    return QuizResponse(
        total_questions=len(questions),
        questions=questions,
    )


# ─── Flashcards ───────────────────────────────────────────────────────────────

async def generate_flashcards(request: FlashcardsRequest) -> FlashcardsResponse:
    """
    Gera flashcards de spaced repetition baseados no conteúdo da aula.
    """
    system_prompt = get_flashcards_system_prompt()
    user_prompt   = get_flashcards_user_prompt(
        lesson_content=request.lesson_content,
        num_cards=request.num_cards,
    )

    logger.info(f"[FlashcardsService] Gerando {request.num_cards} flashcards")

    raw = await call_model(
        system_prompt=system_prompt,
        user_prompt=user_prompt,
        max_tokens=2000,
        temperature=0.3,
    )

    return _parse_flashcards_response(raw)


def _parse_flashcards_response(raw: dict) -> FlashcardsResponse:
    cards = [
        Flashcard(
            front=card.get("front", ""),
            back=card.get("back", ""),
        )
        for card in raw.get("cards", [])
        if card.get("front") and card.get("back")
    ]

    return FlashcardsResponse(
        total_cards=len(cards),
        cards=cards,
    )
