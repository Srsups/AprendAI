from fastapi import APIRouter, HTTPException
from app.models.schemas import (
    QuizRequest, QuizResponse,
    FlashcardsRequest, FlashcardsResponse,
)
from app.services.assessment_service import generate_quiz, generate_flashcards

router = APIRouter(prefix="/assessment", tags=["Avaliação"])


@router.post(
    "/quiz",
    response_model=QuizResponse,
    summary="Gera um quiz baseado no conteúdo da aula",
    description="""
Agente separado que gera perguntas de múltipla escolha EXCLUSIVAMENTE
com base no conteúdo fornecido — sem alucinações.

Envie o texto completo da aula no campo `lesson_content`.
    """,
)
async def create_quiz(request: QuizRequest) -> QuizResponse:
    try:
        return await generate_quiz(request)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao gerar quiz: {str(e)}")


@router.post(
    "/flashcards",
    response_model=FlashcardsResponse,
    summary="Gera flashcards para spaced repetition",
    description="""
Gera flashcards (frente/verso) baseados exclusivamente no conteúdo
da aula. Otimizados para técnicas de memorização espaçada.
    """,
)
async def create_flashcards(request: FlashcardsRequest) -> FlashcardsResponse:
    try:
        return await generate_flashcards(request)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao gerar flashcards: {str(e)}")
